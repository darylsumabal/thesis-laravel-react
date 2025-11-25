<?php

namespace App\Http\Controllers\Judging;

use App\Events\JudgeEvent;
use App\Events\JudgeSubmit;
use App\Events\TopParticipantsUpdated;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Contest;
use App\Models\FinalScoringMethod;
use App\Models\JudgesGroup;
use App\Models\JudgingScore;
use App\Models\OverallScoring;
use App\Models\Participants;
use App\Models\Qualified;
use App\Models\Score;
use App\Models\TeamParticipants;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class JudgingController extends Controller
{
    public function indexParticipant($contestId)
    {
        $participants = Participants::where('contest_id', $contestId)->get();

        return response()->json(['participants' => $participants], 200);
    }

    public function indexParticipantTeam($contestId)
    {
        $participants = TeamParticipants::where('contest_id', $contestId)->get();

        return response()->json(['participants' => $participants], 200);
    }

    public function indexJudgesFinished($contestId, $groupId)
    {
        $judgesGroup = JudgesGroup::with('Judges')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->get()
            ->groupBy('round');

        $result = $judgesGroup->mapWithKeys(function ($judges, $round) {
            $unfinished = $judges->where('is_finished', 0)->count();

            return [
                strtolower($round) => [
                    'is_finished' => $unfinished === 0,
                    'judge_group' => $judges,
                ]
            ];
        });

        return response()->json([
            'rounds' => $result
        ]);
    }

    public function updateFinishedUpdate(Request $request, $contestId, $groupId, $judgeId)
    {
        $criteria = $request->input('criteria');
        JudgesGroup::with('Judges')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('judges_id', $judgeId)
            ->where('criteria', $criteria)
            ->update([
                'is_finished' => 0
            ]);

        broadcast(new JudgeSubmit($contestId, $groupId))->toOthers();

        return redirect()->back()->with('success', 'Judge can now edit score');
    }

    public function indexJudgesFinishedMultiple($contestId, $groupId)
    {

        $judges = JudgesGroup::with('Judges')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->get();

        // Group judges by round and format response
        $groupedByRound = $judges->groupBy('round')->map(function ($items, $round) {
            $isRoundFinished = $items->every(function ($item) {
                return $item->is_finished == 1;
            });

            return [
                'round' => $round,
                'isRoundFinished' => $isRoundFinished,
                'judge_group' => $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'judge' => $item->Judges,
                        'isJudgeFinished' => $item->is_finished == 1,
                        'round' => $item->round,
                    ];
                }),
            ];
        })->values();

        return response()->json([
            'rounds' => $groupedByRound
        ]);
    }


    public function storeTest(Request $request, $judgeId, $contestId, $groupId, $roundType)
    {
        $criteria = $request->input('criteria_value');

        try {
            JudgesGroup::where('judges_id', $judgeId)->where('contest_id', $contestId)->where('group_id', $groupId)->where('round', $roundType)->where('criteria', $criteria)->update(['is_finished' => 1]);

            $request->validate([
                'criteria.*.contest_id' => 'required|integer',
                'criteria.*.evaluation_criteria' => 'required|string',
                'criteria.*.group_id' => 'required|string',
                'criteria.*.round' => 'required|string',
                'criteria.*.judges_id' => 'required|integer',
                'criteria.*.score' => 'required|numeric',
                'criteria.*.participant_id' => 'required|integer',
                'criteria.*.participant_type' => 'required|string',
                'criteria.*.criteria' => 'required|string'
            ]);

            $createdScores = collect($request->input('criteria'))->map(function ($score) {
                $typeMap = [
                    'individual' => Participants::class,
                    'team' => TeamParticipants::class,
                ];

                $score['participant_type'] = $typeMap[$score['participant_type']] ?? null;

                $score['created_at'] = now();
                $score['updated_at'] = now();
                return $score;
            })->toArray();

            foreach ($createdScores as $score) {
                JudgingScore::updateOrCreate(
                    [
                        'contest_id' => $score['contest_id'],
                        'group_id' => $score['group_id'],
                        'round' => $score['round'],
                        'judges_id' => $score['judges_id'],
                        'participant_id' => $score['participant_id'],
                        'criteria' => $score['criteria'],
                        'evaluation_criteria' => $score['evaluation_criteria'],
                    ],
                    [
                        'score' => $score['score'],
                        'participant_type' => $score['participant_type'],
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            return response()->json(['message' => 'Score submitted successfully', 'judging_scores' => $createdScores], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'Failed to create judging scores'
            ], 500);
        }
    }

    public function storeJudge(Request $request)
    {
        $validate = $request->validate(
            [
                'name' => 'string|required',
                'email' => 'string|email',
                'accountType' => 'string|required',
                'password' => [
                    'required',
                    'confirmed',
                    Password::min(6)
                ],
                'panelRole' => 'string|required',
                'contest_id' => 'nullable|string',
            ]
        );

        $judgeExist = User::where('email', $validate['email'])->exists();

        if ($judgeExist) {
            return redirect()->back()->with('error', 'Judge already exists');
        }

        User::create([
            'name' => $validate['name'],
            'email' => $validate['email'],
            'role' => $validate['panelRole'],
            'accountType' =>  $validate['accountType'],
            'password' => bcrypt($validate['password']),
            'contest_id' => $validate['contest_id'],
        ]);


        return redirect()->back()->with('success', 'Account created');
    }


    public function indexActivityLog($groupId)
    {
        $logs = ActivityLog::latest()->get();

        $filteredLogs = $logs->map(function ($log) use ($groupId) {
            $modelClass = $log->model;

            if (!class_exists($modelClass)) {
                return null;
            }

            $model = $modelClass::find($log->model_id);

            if (!$model || !isset($model->group_id) || $model->group_id != $groupId) {
                return null;
            }

            // Get the judge data based on judges_id (assuming Judge model exists)
            $judge = null;
            if (isset($model->judges_id)) {
                $judge = User::find($model->judges_id);
            }
            $participant = isset($model->participant_id) ? Participants::find($model->participant_id) : null;
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'action' => $log->action,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at,
                'updated_at' => $log->updated_at,
                'changes' => $log->changes,
                'model' => class_basename($modelClass),
                'model_data' => $model,
                'judge' => $judge, // 👈 Added judge info here
                'participant' => $participant,
            ];
        })->filter()->values();

        return response()->json([
            'activity' => $filteredLogs,
        ]);
    }

    public function indexCriteria($contestId, $groupId)
    {

        // Get the scoring method and gender category for this contest + group
        $genderCategory = FinalScoringMethod::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->value('gender_category'); // make sure this is the column name

        // Build the base query for participants
        $participantQuery = Participants::where('contest_id', $contestId);
        $genderCategory = strtolower($genderCategory ?? 'malefemale');
        // Filter participants based on gender category
        if ($genderCategory === 'male') {
            $participantQuery->where('gender', 'Male');
        } elseif ($genderCategory === 'female') {
            $participantQuery->where('gender', 'Female');
        }
        $contestType = Contest::where('id', $contestId)->value('contest_type');
        // Get filtered participants
        $allParticipants = $participantQuery->get();

        // Get how many are qualified (default to 3)
        $qualified = Qualified::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->value('qualified');
        $qualified = (int) $qualified;

        // Get top male participants
        $topMaleIds = OverallScoring::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->whereHasMorph('participant', Participants::class, function ($q) {
                $q->where('gender', 'Male');
            })
            ->orderBy('final_rank', 'asc')
            ->pluck('participant_id')
            ->unique()
            ->take($qualified);

        // Get top female participants
        $topFemaleIds = OverallScoring::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->whereHasMorph('participant', Participants::class, function ($q) {
                $q->where('gender', 'Female');
            })
            ->orderBy('final_rank', 'asc')
            ->pluck('participant_id')
            ->unique()
            ->take($qualified);

        // Merge based on the gender category
        if ($genderCategory === 'male') {
            $topParticipants = Participants::whereIn('id', $topMaleIds)->get();
        } elseif ($genderCategory === 'female') {
            $topParticipants = Participants::whereIn('id', $topFemaleIds)->get();
        } else { // 'MaleFemale' or others
            $topParticipants = Participants::whereIn('id', $topMaleIds->merge($topFemaleIds))->get();
        }

        // Load all scores with their related data
        $scores = Score::with(['criteriaTest', 'judges.judge', 'contest.event'])
            ->where('group_id', $groupId)
            ->get();

        $individualScores = $scores->transform(function ($score) use ($allParticipants, $topParticipants, $genderCategory) {
            $grouped = collect($score->criteriaTest)
                ->groupBy(fn($item) => $item->criteria . '-' . $item->category)
                ->map(function ($group) use ($allParticipants, $topParticipants, $genderCategory) {
                    $round = $group->first()->round;
                    $participants = $round === 'Final' ? $topParticipants : $allParticipants;

                    return [
                        'gender_category' => $genderCategory,
                        'criteria' => $group->first()->criteria,
                        // 'category' => $group->first()->category,
                        'items' => $group->values(),
                        'participants' => $participants,
                    ];
                })
                ->values();

            $score->setRelation('criteriaTest', $grouped);
            return $score;
        });


        $allTeamParticipants = TeamParticipants::where('contest_id', $contestId)->get();

        // Get top teams based on OverallScoringTest
        $topTeamIds = OverallScoring::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->whereHasMorph('participant', TeamParticipants::class)
            ->orderBy('final_rank', 'asc')
            ->pluck('participant_id')
            ->unique()
            ->take($qualified);

        // Fetch the top team participants
        $topTeams = TeamParticipants::whereIn('id', $topTeamIds)->get();

        $scoreTeam = Score::with(['criteriaTest', 'judges.judge', 'contest.event'])
            ->where('group_id', $groupId)
            ->get();

        $teamScores =   $scoreTeam->transform(function ($score) use ($allTeamParticipants, $topTeams) {
            $grouped = collect($score->criteriaTest)
                ->groupBy(function ($item) {
                    return $item->criteria . '-' . $item->category;
                })
                ->map(function ($group) use ($allTeamParticipants, $topTeams) {
                    $round = $group->first()->round;


                    $participants = $round === 'Final' ? $topTeams : $allTeamParticipants;

                    return [
                        'criteria' => $group->first()->criteria,
                        'category' => $group->first()->category,
                        'items' => $group->values(),
                        'participants' => $participants
                    ];
                })
                ->values();

            $score->setRelation('criteriaTest', $grouped);
            return $score;
        });

        $contest = Contest::find($contestId);

        $judgeCheck = JudgesGroup::where('group_id', $groupId)
            ->get();
        $judgeScore = JudgingScore::where('group_id', $groupId)->where('contest_id', $contestId)->get();


        $judgesGroup = JudgesGroup::with('Judges')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->get()
            ->groupBy('round');
        $result = $judgesGroup->mapWithKeys(function ($judges, $round) {
            $unfinished = $judges->where('is_finished', 0)->count();

            return [
                strtolower($round) => [
                    'is_finished' => $unfinished === 0,
                    'judge_group' => $judges,
                ]
            ];
        });

        return Inertia::render('judge/Judging', [
            'rounds' => $result,
            'individualCriteria' => $individualScores,
            'teamCriteria' => $teamScores,
            'contestType' => $contestType,
            'participants' => $allParticipants,
            'teamParticipants' => $allTeamParticipants,
            'poster' => $contest?->contest_poster,
            'judge' => $judgeCheck,
            'savedCriteria' => $judgeScore,
            'contestId' => $contestId,
            'groupId' => $groupId,
            'qualified' => $qualified
        ]);
    }

    public function storeJudging(Request $request, $judgeId, $contestId, $groupId, $roundType)
    {
        $criteria = $request->input('criteria');
        $criteriaNames = collect($criteria)->pluck('criteria')->unique()->toArray();

        try {
            JudgesGroup::where('judges_id', $judgeId)->where('contest_id', $contestId)->where('group_id', $groupId)->where('round', $roundType)->where('criteria', $criteriaNames)->update(['is_finished' => 1]);

            $request->validate([
                'criteria.*.contest_id' => 'required|integer',
                'criteria.*.evaluation_criteria' => 'required|string',
                'criteria.*.group_id' => 'required|string',
                'criteria.*.round' => 'required|string',
                'criteria.*.judges_id' => 'required|integer',
                'criteria.*.score' => 'required|numeric',
                'criteria.*.participant_id' => 'required|integer',
                'criteria.*.participant_type' => 'required|string',
                'criteria.*.criteria' => 'required|string'
            ]);

            $createdScores = collect($request->input('criteria'))->map(function ($score) {
                $typeMap = [
                    'individual' => Participants::class,
                    'team' => TeamParticipants::class,
                ];

                $score['participant_type'] = $typeMap[$score['participant_type']] ?? null;

                $score['created_at'] = now();
                $score['updated_at'] = now();
                return $score;
            })->toArray();

            foreach ($createdScores as $score) {
                JudgingScore::updateOrCreate(
                    [
                        'contest_id' => $score['contest_id'],
                        'group_id' => $score['group_id'],
                        'round' => $score['round'],
                        'judges_id' => $score['judges_id'],
                        'participant_id' => $score['participant_id'],
                        'criteria' => $score['criteria'],
                        'evaluation_criteria' => $score['evaluation_criteria'],
                    ],
                    [
                        'score' => $score['score'],
                        'participant_type' => $score['participant_type'],
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }

            broadcast(new JudgeSubmit($contestId, $groupId))->toOthers();

            return redirect()->back()->with('success', 'Score submitted successfully');
        } catch (\Exception $e) {

            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
