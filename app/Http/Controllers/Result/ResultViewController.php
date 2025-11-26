<?php

namespace App\Http\Controllers\Result;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Contest;
use App\Models\Criteria;
use App\Models\CriteriaRoundScore;
use App\Models\FinalScoringMethod;
use App\Models\JudgesGroup;
use App\Models\JudgingScore;
use App\Models\OverallFinalScore;
use App\Models\OverallScoring;
use App\Models\Participants;
use App\Models\Qualified;
use App\Models\Score;
use App\Models\ScoreJudging;
use App\Models\TeamParticipants;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResultViewController extends Controller
{

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

        $contest = Contest::with('event')->find($contestId);

        $qualified = Qualified::where('contest_id', $contestId)->where('group_id', $groupId)->value('qualified');

        $scoring = FinalScoringMethod::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->first(['scoring_method', 'gender_category']);


        $genderCategory = $scoring->gender_category ?? 'mixed';
        $scoringMethod = $scoring->scoring_method;

        return Inertia::render('result/Result', [
            'rounds' => $result,
            'contest' => $contest,
            'contestType' => $contest->contest_type,
            'final' => $this->indexFinal($groupId, $contestId, Participants::class),
            'qualified' => $qualified,
            'result' => $this->indexResult($contestId, $groupId, Participants::class, $genderCategory),
            'award' => $this->indexMajorAward($groupId, $contestId),
            'top' => $this->indexTopResult($groupId, $contestId, $qualified),
            'finalTopResult' => $this->indexFinalResult($groupId, $contestId, $qualified),
            'finalResults' => $this->indexFinalResultsSingleRound($groupId, $contestId, $qualified),
            'scoringMethod' => $this->scoringMethod($contestId, $groupId),
            'judgeData' => $this->indexResultJudge($contestId, $groupId, Participants::class),
            'contestId' => $contestId,
            'groupId' => $groupId,
            'tableResultTypeMultiple' => $this->indexResultTestSystem($contestId, $groupId, Participants::class),
            'tableRankedFinal' => $this->indexResultTestSystemFinalRanked($contestId, $groupId, Participants::class),
            'percentage' => $this->indexRoundScore($contestId, $groupId),
            'activity' => $this->indexActivityLog($groupId),
            'resultSingleRound' => $this->indexFinalResultSingleRound($groupId, $contestId, $qualified, $genderCategory)
        ]);
    }


    public function indexJudgesFinishedTeam($contestId, $groupId)
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

        $contest = Contest::with('event')->find($contestId);

        $qualified = Qualified::where('contest_id', $contestId)->where('group_id', $groupId)->value('qualified');

        $scoring = FinalScoringMethod::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->first(['scoring_method', 'gender_category']);
        // $genderCategory = strtolower($scoring->gender_category ?? 'mixed');
        $scoringMethod = $scoring->scoring_method;
        $genderCategory = $scoring->gender_category ?? 'mixed';
        return Inertia::render('result/Result', [
            'rounds' => $result,
            'contest' => $contest,
            'contestType' => $contest->contest_type,
            'final' => $this->indexFinal($groupId, $contestId, TeamParticipants::class),
            'qualified' => $qualified,
            'result' => $this->indexResult($contestId, $groupId, TeamParticipants::class, $genderCategory),
            'award' => $this->indexMajorAward($groupId, $contestId),
            'top' => $this->indexTopResult($groupId, $contestId, $qualified),
            'finalTopResult' => $this->indexFinalResult($groupId, $contestId, $qualified),
            'finalResults' => $this->indexFinalResultsSingleRound($groupId, $contestId, $qualified),
            'scoringMethod' => $this->scoringMethod($contestId, $groupId),
            'judgeData' => $this->indexResultJudgeTeam($contestId, $groupId),
            'contestId' => $contestId,
            'groupId' => $groupId,
            'tableResultTypeMultiple' => $this->indexResultTestSystem($contestId, $groupId, TeamParticipants::class),
            'tableRankedFinal' => $this->indexResultTestSystemFinalRanked($contestId, $groupId, TeamParticipants::class),
            'resultSingleRound' => $this->indexFinalResultSingleRoundTeam($groupId, $contestId, $qualified),
            'percentage' => $this->indexRoundScore($contestId, $groupId),
            'activity' => $this->indexActivityLog($groupId)
        ]);
    }

    public function indexFinalResultSingleRound($groupId, $contestId, $qualified, $genderCategory)
    {

        $query = OverallScoring::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            // ->where('criteria', $criteria)
            ->where('round', 'Preliminary')
            ->orderBy('final_rank', 'asc');

        // 🔹 Handle filtering by gender category
        if ($genderCategory === 'male') {
            $query->whereHasMorph('participant', Participants::class, fn($q) => $q->where('gender', 'Male'));
        } elseif ($genderCategory === 'female') {
            $query->whereHasMorph('participant', Participants::class, fn($q) => $q->where('gender', 'Female'));
        }

        $top = $query->get();

        $majorAwards = collect();

        if ($genderCategory === 'maleFemale') {
            $grouped = $top->groupBy(fn($item) => $item->participant->gender)
                ->map(fn($g) => $g->unique('participant_id') // ✅ keep one per participant
                    ->sortBy('final_rank')                  // ✅ then sort by final rank
                    ->take($qualified)->reverse()                       // ✅ take top N
                    ->values());

            for ($i = 0; $i < $qualified; $i++) {
                $majorAwards->push([
                    'criteria'   => 'Top ' . ($i + 1),
                    'top_male'   => $grouped['Male'][$i]   ?? null,
                    'top_female' => $grouped['Female'][$i] ?? null,
                ]);
            }
        } else {
            // For Male-only, Female-only, or Mixed (combined)
            $topParticipants = $top->unique('participant_id')->take($qualified)->reverse()->values();
            for ($i = 0; $i < count($topParticipants); $i++) {
                $majorAwards->push([
                    'criteria' => 'Top ' . ($i + 1),
                    'participant' => $topParticipants[$i] ?? null,
                ]);
            }
        }

        return $majorAwards->values();
    }

    public function indexActivityLog($groupId)
    {
        $logs = ActivityLog::latest()->get();

        return $logs->map(function ($log) use ($groupId) {
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
    }


    private function indexRoundScore($contestId, $groupId)
    {
        return CriteriaRoundScore::where('contest_id', $contestId)->where('group_id', $groupId)->get();
    }

    private function scoringMethod($contestId, $groupId)
    {

        return FinalScoringMethod::where('contest_id', $contestId)->where('group_id', $groupId)->value('scoring_method');
    }

    public function indexFinalResultSingleRoundTeam($groupId, $contestId, $qualified)
    {

        // Get all top participants grouped by criteria
        $allScoring = OverallScoring::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('round', 'Preliminary')
            ->orderBy('final_rank', 'asc')
            ->get()
            ->groupBy('criteria');


        $majorAwards = collect();

        foreach ($allScoring as $criteria => $participants) {
            $top = $participants->unique('participant_id')->take($qualified);

            foreach ($top as $i => $participant) {
                $majorAwards->push([
                    'criteria' => $criteria,   // now the real criteria
                    'top_male' => $participant,
                    'rank' => $i + 1,
                ]);
            }
        }

        return $majorAwards->toArray();
    }


    private function indexFinalResultsSingleRound($groupId, $contestId, $qualified)
    {
        // $qualified = Qualified::where('contest_id', $contestId)
        //     ->where('group_id', $groupId)
        //     ->value('qualified');
        // $qualified = (int) $qualified;

        $top = OverallFinalScore::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('criteria', 'Final')
            ->orderBy('final_rank', 'asc')
            ->get()
            ->groupBy(fn($item) => $item->participant->gender)
            ->map(fn($group) => $group->unique('participant_id')->take($qualified)->reverse()->values());
        // 🔁 reverse + reindex

        $majorAwards = collect();

        for ($i = 0; $i < $qualified; $i++) {
            $majorAwards->push([
                'criteria'   => 'Top ' . ($i + 1),
                'top_male'   => $top['Male'][$i] ?? null,
                'top_female' => $top['Female'][$i] ?? null,
            ]);
        }

        return $majorAwards->values();
    }

    private function indexFinalResult($groupId, $contestId, $qualified)
    {

        $top = OverallScoring::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('round', 'Final')
            // ->orderBy('final_rank', 'asc')
            ->orderByRaw('CAST(total AS DECIMAL(10,2)) DESC')
            ->get()
            ->groupBy(fn($item) => $item->participant->gender)
            ->map(fn($group) => $group->unique('participant_id')->take($qualified)->values());
        // ->reverse()

        $majorAwards = collect();

        if ($top->isNotEmpty()) {


            for ($i = 0; $i < $qualified; $i++) {
                $majorAwards->push([
                    'criteria'   => 'Top ' . ($i + 1),
                    'top_male'   => $top['Male'][$i]   ?? null,
                    'top_female' => $top['Female'][$i] ?? null,
                ]);
            }
        }
        return $majorAwards->values();
    }

    private function indexTopResult($groupId, $contestId, $qualified)
    {
        $top = OverallScoring::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('round', 'Preliminary')
            ->orderBy('final_rank', 'asc')
            ->get()
            ->groupBy(fn($item) => $item->participant->gender)
            ->map(fn($group) => $group->unique('participant_id')->take($qualified)->values()); // ✅ reindex

        $majorAwards = collect();

        if ($top->isNotEmpty()) {
            for ($i = 0; $i < $qualified; $i++) {
                $majorAwards->push([
                    'criteria'   => 'Top ' . ($i + 1),
                    'top_male'   => $top['Male'][$i]   ?? null,
                    'top_female' => $top['Female'][$i] ?? null,
                ]);
            }
        }

        return $majorAwards->values();
    }

    private function indexMajorAward($groupId, $contestId)
    {
        // Get all final scores for this group and contest
        $scores = ScoreJudging::with('participant')
            ->where('group_id', $groupId)
            ->where('contest_id', $contestId)->where('round', 'preliminary')
            ->get();

        // Group scores by criteria
        return $scores->groupBy('criteria')->map(function ($group) {
            // Top male per criteria
            $topMale = $group->filter(fn($score) => $score->participant?->gender === 'Male')
                ->sortBy('final_rank')
                ->first();

            // Top female per criteria
            $topFemale = $group->filter(fn($score) => $score->participant?->gender === 'Female')
                ->sortBy('final_rank')
                ->first();

            return [
                'criteria'   => $group->first()->criteria,
                'top_male'   => $topMale,
                'top_female' => $topFemale,
            ];
        })->values();
    }

    // private function indexResult($contestId, $groupId, $participantModel, $genderCategory)
    // {
    //     $participants = $participantModel::where('contest_id', $contestId)
    //         ->with(['scoreJudgings.judges', 'scoreJudgings.participant','scoreJudgings.teamParticipant'])
    //         ->get();

    //     foreach ($participants as $participant) {
    //         $judge = $participant->scoreJudgings->where('group_id', $groupId);

    //         $results[] = [
    //             // 'overall_scores' => $overall,
    //             'judges_score' => $judge->map(function ($scoreJudge) use ($genderCategory) {
    //                 return [
    //                     'id' => $scoreJudge->id,
    //                     'gender_category' => $genderCategory,
    //                     'criteria' => $scoreJudge->criteria,
    //                     'rank' => $scoreJudge->rank,
    //                     'total' => $scoreJudge->total,
    //                     'participant_no' => $scoreJudge->participant?->participant_no,
    //                     'team_participant_no' => $scoreJudge->participant?->team_participant_no,
    //                     'participant_gender' => $scoreJudge->participant->gender,
    //                     'total_score' => $scoreJudge->total_score,
    //                     'total_rank' => $scoreJudge->total_rank,
    //                     'final_rank' => $scoreJudge->final_rank,
    //                     'judge_name' => $scoreJudge->judges->name,
    //                 ];
    //             }),
    //         ];
    //     }

    //     return $results ?? [];
    // }






    private function indexResult($contestId, $groupId, $participantModel, $genderCategory)
    {
        $participants = $participantModel::where('contest_id', $contestId)
            ->with(['scoreJudgings.judges', 'scoreJudgings.participant', 'scoreJudgings.teamParticipant'])
            ->get();

        $results = [];

        foreach ($participants as $participant) {
            $judgeScores = $participant->scoreJudgings
                ->where('group_id', $groupId)
                ->map(function ($scoreJudge) use ($genderCategory) {
                    // Determine if it's a team participant
                    $teamParticipant = $scoreJudge->teamParticipant;
                    $individualParticipant = $scoreJudge->participant;

                    return [
                        'id' => $scoreJudge->id,
                        'gender_category' => $genderCategory,
                        'criteria' => $scoreJudge->criteria,
                        'rank' => $scoreJudge->rank,
                        'total' => $scoreJudge->total,
                        'participant_no' => $individualParticipant?->participant_no,
                        'team_participant_no' => $teamParticipant?->team_participant_no,
                        'participant_gender' => $individualParticipant?->gender,
                        'total_score' => $scoreJudge->total_score,
                        'total_rank' => $scoreJudge->total_rank,
                        'final_rank' => $scoreJudge->final_rank,
                        'judge_name' => $scoreJudge->judges?->name,
                    ];
                })
                ->values() // Ensure it’s a plain indexed array
                ->toArray();

            $results[] = [
                'judges_score' => $judgeScores,
            ];
        }

        return $results;
    }


    private function indexFinal($groupId, $contestId, $participantModel)
    {
        $results = [];

        $participants = $participantModel::where('contest_id', $contestId)
            ->with(['scoreJudgings.judges', 'scoreJudgings.participant'])
            ->get();

        foreach ($participants as $participant) {

            $judge = OverallFinalScore::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('participant_id', $participant->id)
                ->get();

            if ($judge->isEmpty()) {
                continue; // skip if no scores
            }

            $results[] = [
                'judges_score' => $judge->map(function ($scoreJudge, $participant) {
                    return [
                        'id' => $scoreJudge->id,
                        'criteria' => $scoreJudge->criteria,
                        'score' => $scoreJudge->score,
                        'rank' => $scoreJudge->rank,
                        'round_score' => $scoreJudge->round_score,
                        'participant_id' => $scoreJudge->participant_id,
                        'team_participant_no' =>
                        $scoreJudge->participant->team_participant_no,
                        'participant_no' => $scoreJudge->participant->participant_no,
                        'participant_gender' => $scoreJudge->participant->gender,
                        'total' => $scoreJudge->total,
                        // 'final_rank' => $scoreJudge->final_rank,
                        'final_rank' => $scoreJudge->criteria === 'Final'
                            ? $scoreJudge->final_rank   // ✅ only attach rank for Final
                            : null,                     // ✅ keep null for others
                    ];
                }),
            ];
        }
        return $results;
    }

    private function indexResultTestSystem($contestId, $groupId, $participantModel)
    {
        $participants = $participantModel::where('contest_id', $contestId)->get();

        foreach ($participants as $participant) {

            $judge = OverallScoring::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('participant_id', $participant->id)->where('round', 'preliminary')
                ->with('judges')
                ->get();
            $isTeam = $participant instanceof TeamParticipants;

            $results[] = [
                // 'overall_scores' => $overall,
                'judges_score' => $judge->map(function ($scoreJudge) use ($isTeam) {
                    return [
                        'id' => $scoreJudge->id,
                        'criteria' => $scoreJudge->criteria,
                        'score' => $scoreJudge->score,
                        'rank' => $scoreJudge->rank,
                        'total' => $scoreJudge->total,
                        'participant_id' => $scoreJudge->participant_id,
                        // 'participant_no' => $scoreJudge->participant->team_participant_no,

                        'participant_no' => $isTeam
                            ? $scoreJudge->participant->team_participant_no
                            : $scoreJudge->participant->participant_no,
                        'participant_gender' =>
                        $scoreJudge->participant->gender,
                        'round' => $scoreJudge->round,
                        // 'total_score' => $scoreJudge->total_score,
                        'total_points' => $scoreJudge->total_points,
                        'total_rank' => $scoreJudge->total_rank,
                        'final_rank' => $scoreJudge->final_rank,
                        'judge_name' => $scoreJudge->judges->name,
                    ];
                }),
            ];
        }
        return $results;
    }

    public function indexResultJudge($contestId, $groupId, $modelParticipant)
    {

        $participants = $modelParticipant::where('contest_id', $contestId)->get();

        $groupedResults = [];

        foreach ($participants as $participant) {
            $judgeScores = JudgingScore::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('participant_id', $participant->id)
                ->with(['judges', 'participant'])
                ->get();

            foreach ($judgeScores as $scoreJudge) {
                // Try to match criteria + evaluation_criteria
                $criteria = Criteria::where('criteria', $scoreJudge->criteria)
                    ->where('evaluation_criteria', $scoreJudge->evaluation_criteria)
                    ->first();

                $groupedResults[$scoreJudge->criteria][] = [
                    'id' => $scoreJudge->id,
                    'judge_name' => $scoreJudge->judges->name,
                    'participant_no' => $scoreJudge->participant?->participant_no,
                    'judgeId' => $scoreJudge->judges_id,
                    'participant_gender' => $scoreJudge->participant?->gender,
                    'evaluation_criteria' => $scoreJudge->evaluation_criteria,
                    'score' => $scoreJudge->score,
                    'criteria_over' => $criteria?->score,
                ];
            }
        }

        // Convert into array with explicit "criteria" field
        $results = [];
        foreach ($groupedResults as $criteria => $scores) {
            $results[] = [
                'criteria' => $criteria,
                'scores'  => $scores,
            ];
        }


        return $results;
    }


    public function indexResultJudgeTeam($contestId, $groupId)
    {

        $participants = TeamParticipants::where('contest_id', $contestId)->get();

        $groupedResults = [];

        foreach ($participants as $participant) {
            $judgeScores = JudgingScore::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('participant_id', $participant->id)
                // ->where('judges_id', $judgeId)
                ->with(['judges', 'participant'])
                ->get();

            foreach ($judgeScores as $scoreJudge) {
                // Try to match criteria + evaluation_criteria
                $criteria = Criteria::where('criteria', $scoreJudge->criteria)
                    ->where('evaluation_criteria', $scoreJudge->evaluation_criteria)
                    ->first();

                $groupedResults[$scoreJudge->criteria][] = [
                    'id' => $scoreJudge->id,
                    'judge_name' => $scoreJudge->judges->name,
                    'participant_no' => $participant->team_participant_no,
                    'evaluation_criteria' => $scoreJudge->evaluation_criteria,
                    'score' => $scoreJudge->score,
                    'judgeId' => $scoreJudge->judges_id,
                    'criteria_over' => $criteria?->score,
                ];
            }
        }

        // Convert into array with explicit "criteria" field
        $results = [];
        foreach ($groupedResults as $criteria => $scores) {
            $results[] = [
                'criteria' => $criteria,
                'scores'  => $scores,
            ];
        }


        return $results;
    }


    public function indexResultTestSystemFinalRanked($contestId, $groupId, $participantModel)
    {

        $participants = $participantModel::where('contest_id', $contestId)->get();

        $contest = Score::where('contest_id', $contestId)->where('group_id', $groupId)->with('contest')->get();

        foreach ($participants as $participant) {

            $judge = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('participant_id', $participant->id)->where('round', 'Final')->with('judges')
                ->get();

            $results[] = [
                'contest' => $contest,
                'judges_score' => $judge->map(function ($scoreJudge) {
                    return [
                        'id' => $scoreJudge->id,
                        'criteria' => $scoreJudge->criteria,
                        'rank' => $scoreJudge->rank,
                        'total' => $scoreJudge->total,
                        'participant_no' => $scoreJudge->participant?->participant_no,
                        'participant_gender' => $scoreJudge->participant->gender,
                        'total_score' => $scoreJudge->total_score,
                        'total_rank' => $scoreJudge->total_rank,
                        'final_rank' => $scoreJudge->final_rank,
                        'judge_name' => $scoreJudge->judges->name,
                    ];
                }),
            ];
        }
        return $results;
    }
}
