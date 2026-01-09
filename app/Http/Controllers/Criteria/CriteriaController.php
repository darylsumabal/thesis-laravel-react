<?php

namespace App\Http\Controllers\Criteria;

use App\Http\Controllers\Controller;
use App\Models\Contest;
use App\Models\ContestJudges;
use App\Models\Criteria;
use App\Models\CriteriaRoundScore;
use App\Models\FinalScoringMethod;
use App\Models\JudgesGroup;
use App\Models\PrelimScoringMethod;
use App\Models\Qualified;
use App\Models\Score;
use App\Models\User;
use App\Traits\HasParticipants;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CriteriaController extends Controller
{

    use HasParticipants;

    public function indexCreateCriteria($contestId, $contestType, $roundType)
    {
        $judgesCategory = User::with('contest')->where('accountType', 'JUDGE')->where('contest_id', $contestId)->get();

        $judges = User::with('contest')->where('accountType', 'JUDGE')->get();

        return Inertia::render('scoring/IndexCreateCriteria', [
            'judgesCategory' => $judgesCategory,
            'judges' => $judges,
            'participants' => $this->getParticipantsByContest($contestId),
            'contestId' => $contestId,
            'contestType' => $contestType,
            'roundType' => $roundType
        ]);
    }

    public function indexCriteriaTable(Request $request)
    {
        $user = auth()->user();
        $userId = $user->id;
        $role = $user->role;

        /*
    |--------------------------------------------------------------------------
    | ACTIVE (NOT ARCHIVED) SCORES
    |--------------------------------------------------------------------------
    */
        $query = Score::with('contest.event')
            ->where('is_archived', 0);

        if ($role === 'Admin') {
            $query->where('organizer_id', $userId);
        } else {
            $query->whereHas('judges', function ($q) use ($userId) {
                $q->where('judge_id', $userId);
            });
        }

        // ✅ PAGINATE FIRST
        $scores = $query->paginate(10)->withQueryString();

        // Collect group IDs from the paginated collection
        $groupIds = $scores->pluck('group_id')->unique()->values();

        // Fetch final scoring methods in one query
        $finalMethods = FinalScoringMethod::whereIn('group_id', $groupIds)
            ->get()
            ->keyBy('group_id');

        // ✅ USE through() INSTEAD OF map()
        $scores = $scores->through(function ($score) use ($finalMethods) {
            $method = $finalMethods->get($score->group_id);

            $score->scoring_method = $method?->scoring_method;
            $score->gender_category = $method?->gender_category;

            return $score;
        });

        /*
    |--------------------------------------------------------------------------
    | ROUTE-BASED RESPONSES
    |--------------------------------------------------------------------------
    */
        if ($request->routeIs('resultTable')) {
            return Inertia::render('result/IndexTable', [
                'criteria' => $scores,
            ]);
        }

        if ($request->routeIs('judgesTable')) {
            return Inertia::render('judge/ContestTable', [
                'criteria' => $scores,
            ]);
        }

        /*
    |--------------------------------------------------------------------------
    | ARCHIVED SCORES
    |--------------------------------------------------------------------------
    */
        $queryArchived = Score::with('contest.event')
            ->where('is_archived', 1);

        if ($role === 'Admin') {
            $queryArchived->where('organizer_id', $userId);
        } else {
            $queryArchived->whereHas('judges', function ($q) use ($userId) {
                $q->where('judge_id', $userId);
            });
        }

        $archivedCriteria = $queryArchived
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('criteria/IndexCriteriaTable', [
            'criteria' => $scores,
            'archivedCriteria' => $archivedCriteria,
        ]);
    }

    public function indexCriteria($contestId, $groupId)
    {
        $user = auth()->user();
        $userId = $user->id;
        // $role = $user->role ?? '
        // organizer';

        $criteriaInfo = Score::with('contest.event')->where('contest_id', $contestId)->where('group_id', $groupId)->where('organizer_id', $userId)->get();

        $organizerId = auth()->id();

        $contest = Contest::where('organizer_id', $organizerId)->where('id', $contestId)->with('event')->get();

        $judgesCriteria = JudgesGroup::where('group_id', $groupId)
            ->with('judge:id,name,role') // load judge name only
            ->get()
            ->unique('judges_id')
            ->values();

        $prelimFinal = FinalScoringMethod::where('contest_id', $contestId)->where('group_id', $groupId)->value('scoring_method');;


        $roundScore = CriteriaRoundScore::where('contest_id', $contestId)->where('group_id', $groupId)->get();

        $prelimScoringMethod = PrelimScoringMethod::where('contest_id', $contestId)->where('group_id', $groupId)->get();

        $qualified = Qualified::where('contest_id', $contestId)->where('group_id', $groupId)->value('qualified');

        $judges = User::with('contest')->where('accountType', 'JUDGE')->get();


        $criteria = Score::with(['criteriaTest', 'judges.judge', 'contest.event'])->where('group_id', $groupId)->get();


        $criteria->each(function ($score) {
            $score->groupedCriteria = $score->criteriaTest->groupBy('round')->map(function ($roundData, $round) {
                return [
                    'round' => $round,
                    'criteria' => $roundData->map(fn($c) => [
                        'id' => $c->id,
                        'evaluation_criteria' => $c->evaluation_criteria,
                        'score' => $c->score,
                        'round' => $c->round,
                    ])->values()->all(),
                ];
            })->values()->all();
        });

        return Inertia::render('criteria/IndexCard', [
            'criteriaInfo' => $criteriaInfo,
            'criteria' => $criteria,
            'contest' => $contest,
            'judgesCriteria' => $judgesCriteria,
            'prelimFinal' => $prelimFinal,
            'prelimMethod' => $prelimScoringMethod,
            'roundScore' => $roundScore,
            'qualified' => $qualified,
            'judges' => $judges,
            'contestId' => $contestId,
            'groupId' => $groupId,
            'participant' => $this->getParticipantsByContest($contestId)
        ]);
    }
    public function updateWeight(Request $request, $contestId, $groupId)
    {
        $weights = $request->input('weight', []);

        foreach ($weights as $contestName => $weight) {
            PrelimScoringMethod::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('contest_name', $contestName) // match by contest_name
                ->update([
                    'weight' => $weight,
                ]);
        }

        return redirect()->back()->with('success', 'Weight updated successfully');
    }

    public function store(Request $request, $contestId)
    {
        $organizer = auth()->id();
        $contest = Contest::findOrFail($contestId);
        $genderCategory = Contest::where('id', $contestId)->value('contest_gender_category');
        $request->validate([
            'judges' => 'required|array',
            'judges.*.id' => 'exists:users,id',
        ]);

        $groupId = uniqid();

        $judgeId = $request->input('judges');

        $criteria = $request->input('criteria.criteria');

        //qualified finalist participant or the top
        $qualified = $request->input('qualified');

        //for the percentage of prelim and final
        $preliminary = $request->input('preliminary');
        $final = $request->input('final');

        $scoringMethod = $request->input('scoringMethod');

        $preliminaryScoringMethod = $request->input('preliminaryScoringMethod');



        // $category = $request->input('genderCategory');

        $contestJudges = collect($judgeId)->map(function ($judge) use ($groupId, $contest) {
            return [
                'group_id' => $groupId,
                'judge_id' =>  $judge['id'],
                'contest_id' => $contest->id,
                'created_at' => now(),
                'updated_at' => now()
            ];
        })->toArray();


        $contestCriteria = collect($criteria)->map(function ($criterion) use ($groupId, $contest, $genderCategory) {
            $criteria = $criterion['criteria'];
            $round = $criterion['round'];
            return collect($criterion['criterion'])->map(function ($item) use ($groupId, $contest, $criteria, $genderCategory, $round) {
                return [
                    'criteria' => $criteria,
                    'category' => $genderCategory,
                    'round' => $round,
                    'evaluation_criteria' => $item['evaluationCriterion'],
                    'score' => $item['score'],
                    'group_id' => $groupId,
                    'contest_id' => $contest->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });
        })->flatten(1)->toArray();

        foreach ($criteria as $item) {

            // Only process preliminary round
            if (strtolower($item['round']) !== 'preliminary') {
                continue;
            }

            PrelimScoringMethod::create([
                'group_id'           => $groupId,
                'contest_id'         => $contestId,
                'preliminary_method' => $preliminaryScoringMethod,
                'contest_name'           => $item['criteria'],   // e.g. "Production Number"
                'weight'             => $item['weighted'],   // e.g. 100
            ]);
        }


        Qualified::create([
            'qualified' => $qualified,
            'group_id' => $groupId,
            'contest_id' => $contestId
        ]);


        FinalScoringMethod::create([
            'group_id' => $groupId,
            'contest_id' => $contestId,
            'scoring_method' => $scoringMethod,
            'gender_category' => $genderCategory,
        ]);

        CriteriaRoundScore::insert([
            [
                'round'     => 'Preliminary',
                'percentage'     => $preliminary,
                'group_id'  => $groupId,
                'contest_id' => $contestId,

            ],
            [
                'round'     => 'Final',
                'percentage'     => $final,
                'group_id'  => $groupId,
                'contest_id' => $contestId,
            ]
        ]);


        $judgesGroup = collect($judgeId)->flatMap(function ($judge) use ($groupId, $contestId, $contestCriteria) {
            return collect($contestCriteria)->map(function ($criterion) use ($judge, $groupId, $contestId) {
                return [
                    'contest_id'   => $contestId,
                    'group_id'     => $groupId,
                    'judges_id'    => $judge['id'],
                    'round'        => $criterion['round'],
                    'criteria'     => $criterion['criteria'], // ✅ match judge with specific criteria
                    'is_finished'  => 0,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            });
        })->toArray();

        // MultipleBasedCriteria::insert($contestCriteria);
        Criteria::insert($contestCriteria);

        ContestJudges::insert($contestJudges);

        // JudgesGroupMultiple::insert($judgesGroup);
        JudgesGroup::insert($judgesGroup);

        Score::create([
            'organizer_id' => $organizer,
            'group_id' => $groupId,
            'contest_id' => $contest->id
        ]);

        return redirect()->back()->with('success', 'Criteria created');
    }

    public function storeAddCriteria(Request $request, $contestId, $groupId)
    {
        $contest = Contest::findOrFail($contestId);
        // $genderCategory = Contest::where('id', $contestId);
        $criteria = $request->input('criteria.criteria');
        $genderCategory = $contest->contest_gender_category;
        $contestCriteria = collect($criteria)->map(function ($criterion) use ($groupId, $genderCategory, $contestId) {
            $criteria = $criterion['criteria'];
            $round = $criterion['round'];
            return collect($criterion['criterion'])->map(function ($item) use ($groupId, $criteria, $genderCategory, $round, $contestId) {
                return [
                    'criteria' => $criteria,
                    'category' => $genderCategory,
                    'round' => $round,
                    'evaluation_criteria' => $item['evaluationCriterion'],
                    'score' => $item['score'],
                    'group_id' => $groupId,
                    'contest_id' => $contestId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });
        })->flatten(1)->toArray();

        $judgeId = $request->input('judges');

        $judgesGroup = collect($judgeId)->flatMap(function ($judge) use ($groupId, $contestId, $contestCriteria) {
            return collect($contestCriteria)->map(function ($criterion) use ($judge, $groupId, $contestId) {
                return [
                    'contest_id'   => $contestId,
                    'group_id'     => $groupId,
                    'judges_id'    => $judge['id'],
                    'round'        => $criterion['round'],
                    'criteria'     => $criterion['criteria'], // ✅ match judge with specific criteria
                    'is_finished'  => 0,
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            });
        })->toArray();

        Criteria::insert($contestCriteria);

        JudgesGroup::insert($judgesGroup);

        return redirect()->back()->with('success', 'Criteria added in this contest');
    }

    public function updateQualified(Request $request, $contestId, $groupId)
    {
        $validated = $request->validate([
            'qualified' => 'required|min:1',
        ]);

        Qualified::where('contest_id', $contestId)->where('group_id', $groupId)->update([
            'qualified' => $validated['qualified'],
        ]);


        return redirect()->back()->with('success', 'Qualified participants updated successfully.');
    }


    public function updateRoundPercentage(Request $request, $contestId, $groupId)
    {
        $validated = $request->validate([
            'preliminary' => 'required|numeric|min:1|max:100',
            'final' => 'required|numeric|min:1|max:100',
        ]);

        CriteriaRoundScore::where('contest_id', $contestId)->where('group_id', $groupId)->where('round', 'Preliminary')->update([
            'percentage' => $validated['preliminary'],
            'updated_at' => now(),
        ]);

        CriteriaRoundScore::where('contest_id', $contestId)->where('group_id', $groupId)->where('round', 'Final')->update([
            'percentage' => $validated['final'],
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Round percentages updated successfully.');
    }

    public function destroyCriteria(Request $request, $contestId, $groupId)
    {
        $criteriaData = $request->input('criteria');

        foreach ($criteriaData as $criterion) {
            $criteriaName = $criterion['criteria'];
            $round = $criterion['round'];

            Criteria::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('criteria', $criteriaName)
                ->where('round', $round)
                ->delete();

            JudgesGroup::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('criteria', $criteriaName)
                ->where('round', $round)
                ->delete();
        }

        return redirect()->back()->with('success', 'Criteria added in this contest.');
    }

    public function updateCriteria(Request $request, $contestId, $groupId)
    {
        $contest = Contest::findOrFail($contestId);
        $genderCategory = Contest::where('id', $contestId)->value('contest_gender_category');
        $request->validate([
            'judges' => 'required|array',
            'judges.*' => 'exists:users,id',
        ]);

        $criteria = $request->input('criteria.criteria');

        $contestCriteria = collect($criteria)->map(function ($criterion) use ($groupId, $contest, $genderCategory) {
            $criteria = $criterion['criteria'];
            $round = $criterion['round'];
            return collect($criterion['criterion'])->map(function ($item) use ($groupId, $contest, $criteria, $genderCategory, $round) {
                return [
                    'id' => $item['id'] ?? null,
                    'criteria' => $criteria,
                    'category' => $genderCategory ?? null,
                    'round' => $round,
                    'evaluation_criteria' => $item['evaluationCriterion'],
                    'score' => $item['score'],
                    'group_id' => $groupId,
                    'contest_id' => $contest->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });
        })->flatten(1)->toArray();


        $currentRound = $criteria[0]['round'] ?? null;
        $criteriaName = $criteria[0]['criteria'] ?? null;
        // Collect all existing IDs that are still present
        $existingIds = collect($contestCriteria)
            ->pluck('id')
            ->filter()
            ->toArray();


        Criteria::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->when($currentRound, fn($q) => $q->where('round', $currentRound))
            ->when($criteriaName, fn($q) => $q->where('criteria', $criteriaName))
            ->when(!empty($existingIds), fn($q) => $q->whereNotIn('id', $existingIds))
            ->delete();


        foreach ($contestCriteria as $data) {
            if (!empty($data['id'])) {
                // ✅ Update existing record
                Criteria::where('id', $data['id'])->update([
                    'evaluation_criteria' => $data['evaluation_criteria'],
                    'score' => $data['score'],
                    'criteria' => $data['criteria'],
                    'category' => $data['category'],
                    'round' => $data['round'],
                    'updated_at' => now(),
                ]);
            } else {

                Criteria::create([
                    'criteria' => $data['criteria'],
                    'category' => $data['category'],
                    'round' => $data['round'],
                    'evaluation_criteria' => $data['evaluation_criteria'],
                    'score' => $data['score'],
                    'group_id' => $data['group_id'],
                    'contest_id' => $data['contest_id'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return redirect()->back()->with('success', 'Criteria updated successfully');
    }

    public function storeJudge(Request $request, $contestId, $groupId)
    {

        $judgeId = $request->input('judges');

        // Get all contest criteria for this contest
        $contestCriteria = Criteria::where('contest_id', $contestId)->where('group_id', $groupId)
            ->select('criteria', 'round')
            ->get();

        foreach ($judgeId as $judge) {
            $judgeIdVal = $judge['id'];

            /**
             * --- Handle ContestJudges table ---
             */
            $existingJudge = ContestJudges::withTrashed()
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('judge_id', $judgeIdVal)
                ->first();

            if ($existingJudge) {
                if ($existingJudge->trashed()) {
                    $existingJudge->restore();
                }
            } else {
                ContestJudges::create([
                    'group_id'   => $groupId,
                    'judge_id'   => $judgeIdVal,
                    'contest_id' => $contestId,
                ]);
            }

            /**
             * --- Handle JudgesGroup table ---
             */
            foreach ($contestCriteria as $criterion) {
                $existingGroup = JudgesGroup::withTrashed()
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('judges_id', $judgeIdVal)
                    ->where('criteria', $criterion['criteria'])
                    ->where('round', $criterion['round'])
                    ->first();

                if ($existingGroup) {
                    if ($existingGroup->trashed()) {
                        $existingGroup->restore();
                    }
                } else {
                    JudgesGroup::create([
                        'contest_id'  => $contestId,
                        'group_id'    => $groupId,
                        'judges_id'   => $judgeIdVal,
                        'criteria'    => $criterion['criteria'],
                        'round'       => $criterion['round'],
                        'is_finished' => 0,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', 'Judges added successfully');
    }

    public function deleteJudgesCriteria($judgeId, $contestId, $groupId)
    {

        ContestJudges::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('judge_id', $judgeId)
            ->delete();

        JudgesGroup::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('judges_id', $judgeId)
            ->delete();

        return redirect()->back()->with('success', 'Judges deleted in this contest');
    }


    public function destroy($id)
    {
        $criteria = Score::where('id', $id);
        $criteria->delete();
        return redirect()->back()->with('success', 'Criteria deleted successfully');
    }

    public function archivedCriteria($eventId)
    {
        Score::where('id', $eventId)->update([
            'is_archived' => 1,
        ]);
        return redirect()->back()->with('success', 'Archive successfully!');
    }

    public function restoreArchivedCriteria($eventId)
    {
        Score::where('id', $eventId)->update([
            'is_archived' => 0,
        ]);
        return redirect()->back()->with('success', 'Archive restore successfully!');
    }
}
