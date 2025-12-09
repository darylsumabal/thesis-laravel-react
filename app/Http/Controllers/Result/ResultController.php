<?php

namespace App\Http\Controllers\Result;

use App\Events\TopParticipantsUpdated;
use App\Http\Controllers\Controller;
use App\Models\Contest;
use App\Models\ContestJudges;
use App\Models\Criteria;
use App\Models\CriteriaRoundScore;
use App\Models\FinalScoringMethod;
use App\Models\JudgesGroup;
use App\Models\JudgingScore;
use App\Models\OverallFinalScore;
use App\Models\OverallScoring;
use App\Models\Participants;
use App\Models\PrelimScoringMethod;
use App\Models\Qualified;
use App\Models\ScoreJudging;
use App\Models\TeamParticipants;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{


    public function storeResultMultiple(Request $request, $contestId, $groupId, $resultType)
    {
        // Check finished judges group
        $roundType = $request->input('roundType');
        $prelimScoringType = PrelimScoringMethod::where('group_id', $groupId)->value('preliminary_method');

        // $judgesGroup = JudgesGroup::where('contest_id', $contestId)
        //     ->where('group_id', $groupId)
        //     ->whereNotExists(function ($query) use ($contestId, $groupId, $roundType) {
        //         $query->select(DB::raw(1))
        //             ->from('judges_groups')
        //             ->where('contest_id', $contestId)
        //             ->where('group_id', $groupId)
        //             ->where('round', $roundType)
        //             ->where('is_finished', 0)
        //             ->whereNull('deleted_at');
        //     })
        //     ->get();

        // if ($judgesGroup->isEmpty()) {
        //     return response()->json(['message' => 'No finished judges group'], 400);
        // }

        $participants = Participants::where('contest_id', $contestId)->get();

        $judgingScores = JudgingScore::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->get();

        // Process per participant per judge
        foreach ($participants as $participant) {
            $judgesGrouped = $judgingScores->groupBy('judges_id');

            foreach ($judgesGrouped as $judgeId => $scoresByJudge) {

                $groupedByParticipant = $scoresByJudge->groupBy('participant_id');

                foreach ($groupedByParticipant as $participantId => $participantGroup) {

                    $groupedByCriteria = $participantGroup->groupBy('criteria');


                    foreach ($groupedByCriteria as $criteriaName => $criteriaGroup) {

                        $totalScoreForCriteria = $criteriaGroup->sum('score');
                        $evaluationCriteria = $criteriaGroup->first()->evaluation_criteria;

                        ScoreJudging::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'judges_id' => $judgeId,
                                'contest_id' => $contestId,
                                'participant_id' => $participantId,
                                'criteria' => $criteriaName,
                                'evaluation_criteria' => $evaluationCriteria,
                                'round' => $roundType,
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => null,
                                'total' => $totalScoreForCriteria,
                                'total_score' => null,
                                'total_rank' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }
            }
        }

        $participantsByGender = $participants->groupBy('gender');

        foreach ($participantsByGender as $gender => $participantsGroup) {

            $participantIds = $participantsGroup->pluck('id');

            $participantsScores = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)->where('round', $roundType)
                ->whereIn('participant_id', $participantIds)
                ->get()
                ->groupBy(function ($item) {
                    return $item->judges_id . '|' . $item->criteria . '|' . $item->evaluation_criteria;
                });


            foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                [$judgeId, $criteria, $evaluationCriteria] = explode('|', $criteriaName);

                $participantTotals = $scoresForCriteria
                    ->groupBy('participant_id')
                    ->map(fn($scores) => $scores->sum('total'))
                    ->sortDesc();

                $sorted = $participantTotals->toArray();
                $participantIds = array_keys($sorted);
                $scores = array_values($sorted);

                $currentRank = 1;
                $i = 0;
                $totalCount = count($scores);

                while ($i < $totalCount) {
                    $currentScore = $scores[$i];
                    $tiedParticipants = [$participantIds[$i]];
                    $j = $i + 1;

                    while ($j < $totalCount && $scores[$j] == $currentScore) {
                        $tiedParticipants[] = $participantIds[$j];
                        $j++;
                    }

                    $groupSize = count($tiedParticipants);
                    $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                    foreach ($tiedParticipants as $participantId) {
                        ScoreJudging::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('judges_id', $judgeId)
                            ->where('criteria', $criteria)
                            ->where('evaluation_criteria', $evaluationCriteria)
                            ->update(['rank' => $middleRank]);
                    }

                    $currentRank += $groupSize;
                    $i = $j;
                }
            }

            if ($roundType == 'Preliminary') {

                $participantTotalsByCriteria = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(total) as total_sum'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();

                // compute the total score of each participant from the score judging table
                foreach ($participantTotalsByCriteria as $row) {

                    if ($resultType == 'rank_based') {
                        $average = $row->total_sum / $row->judge_count;
                    } else {
                        $average = $row->judge_count > 0
                            ? round($row->total_sum / $row->judge_count, 1, PHP_ROUND_HALF_UP) : 0;
                    }

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_score' => $average]);
                }

                $participantTotalRank = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(rank) as rank'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();
                //compute the total rank sum all of the rank
                foreach ($participantTotalRank as $row) {

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_rank' => $row->rank]);
                }
            }

            //compute the final rank base on the total rank


            $participantsScores = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)->where('round', $roundType)
                ->whereIn('participant_id', $participantIds)
                ->get()
                ->groupBy(function ($item) {
                    return $item->criteria . '|' . $item->evaluation_criteria;
                });

            foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                [$criteria, $evaluationCriteria] = explode('|', $criteriaName);

                $participantTotals = $scoresForCriteria
                    ->groupBy('participant_id')
                    ->map(fn($scores) => $scores->sum('rank'))
                    ->sort();

                $sorted = $participantTotals->toArray();
                $participantIds = array_keys($sorted);
                $scores = array_values($sorted);

                $currentRank = 1;
                $i = 0;
                $totalCount = count($scores);

                while ($i < $totalCount) {
                    $currentScore = $scores[$i];
                    $tiedParticipants = [$participantIds[$i]];
                    $j = $i + 1;

                    while ($j < $totalCount && $scores[$j] == $currentScore) {
                        $tiedParticipants[] = $participantIds[$j];
                        $j++;
                    }

                    $groupSize = count($tiedParticipants);
                    $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                    foreach ($tiedParticipants as $participantId) {
                        ScoreJudging::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('criteria', $criteria)
                            ->where('evaluation_criteria', $evaluationCriteria)
                            ->update(['final_rank' => $middleRank]);
                    }

                    $currentRank += $groupSize;
                    $i = $j;
                }
            }
        }



        $judgeCounts = ContestJudges::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->distinct()
            ->pluck('judge_id');

        if ($roundType == 'Final') {
            $participantTotalsByCriteria = DB::table('score_judgings')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(total) as judge_total') // sum per judge
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', 'Final')
                ->groupBy('participant_id', 'judges_id') // one row per judge per participant
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    $totalSum = $rows->sum('judge_total');      // sum of each judge's total
                    $judgeCount = $rows->count();               // number of judges
                    $average = $totalSum / $judgeCount;         // final average
                    return [
                        'participant_id' => $participantId,
                        'average' => $average
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_score' => $row['average']]);
            }


            $participantTotalsByCriteria = DB::table('score_judgings')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(rank) as judge_total_rank')
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', $roundType)
                ->groupBy('participant_id', 'judges_id') // ✅ one total per judge
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    return [
                        'participant_id' => $participantId,
                        'rank_sum' => $rows->sum('judge_total_rank'), // ✅ add up per judge totals
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_rank' => $row['rank_sum']]);
            }
        }

        $criteriaCount = Criteria::where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->distinct()
            ->pluck('criteria');

        if ($resultType == 'rank_based') {
            foreach ($participants as $participant) {
                $scoresByJudge = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id'); // group by judge

                foreach ($scoresByJudge as $judgeId => $scoresForJudge) {
                    foreach ($scoresForJudge as $scoreRecord) {
                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'round' => $roundType,
                                'type' => 'rank based',
                                'judges_id' => $judgeId,
                            ],
                            [
                                'rank' => $scoreRecord->final_rank,
                                'participant_type' => get_class($participant),
                                'score' => $scoreRecord->total_score,
                                'total_rank' => $scoreRecord->total_rank,
                                'total' => null,
                                'total_points' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }


                $totalRankSum = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $participant->id)
                    ->sum('total_rank');

                // STEP 2: Update participant-level totals once

                $totalScoreSum = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $participant->id)
                    ->sum('total_score');


                OverallScoring::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->where('round', $roundType)
                    ->where('participant_id', $participant->id)
                    ->update([
                        'total' => round($totalRankSum / $judgeCounts->count(), 2),
                        'total_points' => round($totalScoreSum / ($criteriaCount->count() * $judgeCounts->count()), 2),
                    ]);
            }

            if ($prelimScoringType == 'weighted' && $roundType == 'Preliminary') {

                $criteriaWeights = PrelimScoringMethod::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->get()
                    ->pluck('weight', 'contest_name')
                    ->mapWithKeys(fn($value, $key) => [trim($key) => $value])
                    ->toArray();

                $participantsScores = OverallScoring::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('participant_id');

                foreach ($participantsScores as $participantId => $scores) {

                    $byCriteria = $scores->groupBy('criteria');

                    foreach ($byCriteria as $criteriaName => $criteriaScores) {
                        $criteriaName = trim($criteriaName);

                        // use rank column
                        $rank = (float) ($criteriaScores->first()->rank ?? 0);

                        $weight = (float) ($criteriaWeights[$criteriaName] ?? 0);

                        $totalWeightedRank = 0;

                        if ($weight > 0 && $rank > 0) {
                            $totalWeightedRank = $rank * ($weight / 100.0);
                        }



                        OverallScoring::where('group_id', $groupId)
                            ->where('contest_id', $contestId)
                            ->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('criteria', $criteriaName)   // IMPORTANT FIX
                            ->update([
                                'total_rank' => $totalWeightedRank,
                            ]);
                    }

                    // Step 2: After all criteria updated, compute the total
                    $totalRankSumWeight = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('total_rank');

                    $totalRankSum = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('rank');

                    // $criteriaCount = OverallScoring::where('contest_id', $contestId)
                    //     ->where('group_id', $groupId)
                    //     ->where('round', $roundType)
                    //     ->where('participant_id', $participantId)
                    //     ->distinct('criteria')
                    //     ->count('criteria');

                    // Step 3: Update total_points for ALL rows of the participant
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->update([
                            'total_points' => $totalRankSum /  $judgeCounts->count(),
                            'total' => $totalRankSumWeight /  $judgeCounts->count()
                        ]);
                }
            }

            foreach ($participantsByGender as $gender => $participantsGroup) {
                $participantIds = $participantsGroup->pluck('id');

                $participantsScores = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->get()
                    ->groupBy('criteria');

                foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                    $participantTotals = $scoresForCriteria
                        ->groupBy('participant_id')
                        ->map(fn($scores) => [
                            'participant_id' => $scores->first()->participant_id,
                            'total' => (float)$scores->first()->total,
                            'tieBreaker' => (float)$scores->first()->total_rank,
                        ])
                        ->values();

                    $sorted = $participantTotals->sort(fn($a, $b) => $a['total'] <=> $b['total'])->values();

                    $currentRank = 1;
                    $i = 0;
                    $totalCount = $sorted->count();

                    while ($i < $totalCount) {
                        $currentTotal = $sorted[$i]['total'];
                        $tiedParticipants = [$sorted[$i]['participant_id']];
                        $j = $i + 1;

                        while ($j < $totalCount && $sorted[$j]['total'] == $currentTotal) {
                            $tiedParticipants[] = $sorted[$j]['participant_id'];
                            $j++;
                        }

                        $groupSize = count($tiedParticipants);
                        $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;


                        foreach ($tiedParticipants as $participantId) {


                            OverallScoring::where('contest_id', $contestId)
                                ->where('group_id', $groupId)
                                ->where('round', $roundType)
                                ->where('participant_id', $participantId)
                                ->where('criteria', $criteriaName)
                                ->update(['final_rank' => $middleRank]);
                        }

                        $currentRank += $groupSize;
                        $i = $j;
                    }
                }
            }
        }

        if ($resultType == 'point_based') {
            foreach ($participants as $participant) {

                // Get ScoreJudgingTest rows for this participant, grouped by judge
                $scoreRecords = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id');

                foreach ($scoreRecords as $judgeId => $scoresByJudge) {

                    foreach ($scoresByJudge as $scoreRecord) {

                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'round' => $roundType,
                                'type' => 'point based',
                                'judges_id' => $judgeId,
                                'total_points' => $scoreRecord->total_score,
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => null,
                                'total' => null,
                                // 'total_points' => null,
                                'score' => round($scoreRecord->total_score / max($judgeCounts->count(), 1), 1, PHP_ROUND_HALF_UP),
                                'total_rank' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }
            }

            if ($prelimScoringType == 'weighted' && $roundType == 'Preliminary') {

                $criteriaWeights = PrelimScoringMethod::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->get()
                    ->pluck('weight', 'contest_name')
                    ->mapWithKeys(fn($value, $key) => [trim($key) => $value])
                    ->toArray();

                $participantsScores = OverallScoring::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('participant_id');

                foreach ($participantsScores as $participantId => $scores) {

                    $byCriteria = $scores->groupBy('criteria');

                    foreach ($byCriteria as $criteriaName => $criteriaScores) {

                        $criteriaName = trim($criteriaName);

                        // ✅ Get weight (example: 25)
                        $weight = (float) ($criteriaWeights[$criteriaName] ?? 0);

                        // ✅ Get participant total points for THIS criteria (example: 89.70)
                        $totalPoints = (float) ($criteriaScores->first()->total_points ?? 0);

                        // ✅ Final weighted computation
                        $totalWeighted = 0;
                        if ($weight > 0 && $totalPoints > 0) {
                            $totalWeighted = $totalPoints * ($weight / 100);
                        }

                        // ✅ Save weighted result
                        OverallScoring::where('group_id', $groupId)
                            ->where('contest_id', $contestId)
                            ->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('criteria', $criteriaName)
                            ->update([
                                'total_points' => round($totalWeighted, 3), // ✅ precision safe
                            ]);
                    }
                    // Step 2: After all criteria updated, compute the total
                    $totalRankSumWeight = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('total_rank');

                    $totalSum = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('total_points');

                    // Step 3: Update total_points for ALL rows of the participant
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->update([
                            // 'total_points' => $totalRankSum,
                            'total' => $totalSum / $judgeCounts->count()
                        ]);
                }
            }



            foreach ($participantsByGender as $gender => $participantsGroup) {
                $participantIds = $participantsGroup->pluck('id');

                // Get all overall scores for these participants
                $participantsScores = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->get()
                    ->groupBy(function ($item) {
                        // Group by criteria only
                        return $item->criteria;
                    });

                foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                    // Sum scores per participant for this criteria
                    $participantTotals = $scoresForCriteria
                        ->groupBy('participant_id')
                        ->map(fn($scores) => $scores->sum('score'))
                        ->sortDesc(); // higher score = better rank

                    $sorted = $participantTotals->toArray();
                    $participantIdsSorted = array_keys($sorted);
                    $scores = array_values($sorted);

                    $currentRank = 1;
                    $i = 0;
                    $totalCount = count($scores);

                    while ($i < $totalCount) {
                        $currentScore = $scores[$i];
                        $tiedParticipants = [$participantIdsSorted[$i]];
                        $j = $i + 1;

                        // Collect ties
                        while ($j < $totalCount && $scores[$j] == $currentScore) {
                            $tiedParticipants[] = $participantIdsSorted[$j];
                            $j++;
                        }

                        // Middle rank formula
                        $groupSize = count($tiedParticipants);
                        $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                        // ✅ Update using $criteriaName instead of $criteria
                        OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)
                            ->whereIn('participant_id', $tiedParticipants)
                            ->where('criteria', $criteriaName)
                            ->update(['rank' => $middleRank]);

                        $currentRank += $groupSize;
                        $i = $j;
                    }
                }

                $participantIds = $participantsGroup->pluck('id');

                if ($prelimScoringType != 'weighted') {

                    foreach ($participantIds as $participantId) {
                        // compute total across ALL criteria for this participant
                        $grandTotal = OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->sum('score');

                        // update all rows of this participant with the same grand total
                        OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)

                            ->update([
                                'total' => round($grandTotal / $judgeCounts->count(), 1),
                            ]);
                    }
                }

                $allParticipants = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->select('participant_id', DB::raw('SUM(rank) as total_rank'))
                    ->groupBy('participant_id')
                    ->get();

                // Now update each participant with their total_rank
                foreach ($allParticipants as $participant) {
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)->where('round', $roundType)
                        ->where('participant_id', $participant->participant_id)
                        ->update([
                            'total_rank' => $participant->total_rank / $judgeCounts->count(),
                        ]);
                }

                $rows = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->select('participant_id', 'total', 'total_rank')
                    ->groupBy('participant_id', 'total', 'total_rank')

                    ->orderBy('total', 'desc')
                    ->get();


                $rank = 1;
                $i = 0;
                $totalCount = $rows->count();

                while ($i < $totalCount) {
                    $currentTotalRank = $rows[$i]->total_rank;
                    $currentTotal = $rows[$i]->total;

                    // Collect tied participants
                    $tiedParticipants = [$rows[$i]->participant_id];
                    $j = $i + 1;
                    while (
                        $j < $totalCount &&
                        $rows[$j]->total_rank == $currentTotalRank &&
                        $rows[$j]->total == $currentTotal
                    ) {
                        $tiedParticipants[] = $rows[$j]->participant_id;
                        $j++;
                    }

                    // Middle rank formula
                    $groupSize = count($tiedParticipants);
                    $middleRank = ($rank + ($rank + $groupSize - 1)) / 2;

                    // Update final rank for all tied participants
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->whereIn('participant_id', $tiedParticipants)
                        ->update(['final_rank' => $middleRank]);

                    $rank += $groupSize;
                    $i = $j;
                }
            }
        }

        broadcast(new TopParticipantsUpdated($contestId, $groupId))->toOthers();

        return redirect()->back()->with('success', 'Score tabulated');
    }


    public function storeResultSingleRound(Request $request, $contestId, $groupId, $resultType)
    {
        $roundType = $request->input('roundType');
        $judgesGroup = JudgesGroup::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->whereNotExists(function ($query) use ($contestId, $groupId, $roundType) {
                $query->select(DB::raw(1))
                    ->from('judges_groups')
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('is_finished', 0)
                    ->whereNull('deleted_at');
            })
            ->get();

        // if ($judgesGroup->isEmpty()) {
        //     return response()->json(['message' => 'No finished judges group'], 400);
        // }

        $participants = Participants::where('contest_id', $contestId)->get();

        $judgingScores = JudgingScore::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->get();
        $judgeCounts = ContestJudges::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->distinct()
            ->pluck('judge_id');
        // Process per participant per judge
        foreach ($participants as $participant) {
            $judgesGrouped = $judgingScores->groupBy('judges_id');

            foreach ($judgesGrouped as $judgeId => $scoresByJudge) {

                $groupedByParticipant = $scoresByJudge->groupBy('participant_id');

                foreach ($groupedByParticipant as $participantId => $participantGroup) {

                    $groupedByCriteria = $participantGroup->groupBy('criteria');


                    foreach ($groupedByCriteria as $criteriaName => $criteriaGroup) {

                        $totalScoreForCriteria = $criteriaGroup->sum('score');
                        $evaluationCriteria = $criteriaGroup->first()->evaluation_criteria;

                        ScoreJudging::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'judges_id' => $judgeId,
                                'contest_id' => $contestId,
                                'participant_id' => $participantId,
                                'criteria' => $criteriaName,
                                'evaluation_criteria' => $evaluationCriteria,
                                'round' => $roundType,
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => null,
                                'total' => $totalScoreForCriteria /       $judgeCounts->count(),
                                'total_score' => null,
                                'total_rank' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }
            }
        }



        $participantsByGender = $participants->groupBy('gender');

        foreach ($participantsByGender as $gender => $participantsGroup) {

            $participantIds = $participantsGroup->pluck('id');

            $participantsScores = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)->where('round', $roundType)
                ->whereIn('participant_id', $participantIds)
                ->get()
                ->groupBy(function ($item) {
                    return $item->judges_id . '|' . $item->criteria . '|' . $item->evaluation_criteria;
                });


            foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                [$judgeId, $criteria, $evaluationCriteria] = explode('|', $criteriaName);

                $participantTotals = $scoresForCriteria
                    ->groupBy('participant_id')
                    ->map(fn($scores) => $scores->sum('total'))
                    ->sortDesc();

                $sorted = $participantTotals->toArray();
                $participantIds = array_keys($sorted);
                $scores = array_values($sorted);

                $currentRank = 1;
                $i = 0;
                $totalCount = count($scores);

                while ($i < $totalCount) {
                    $currentScore = $scores[$i];
                    $tiedParticipants = [$participantIds[$i]];
                    $j = $i + 1;

                    while ($j < $totalCount && $scores[$j] == $currentScore) {
                        $tiedParticipants[] = $participantIds[$j];
                        $j++;
                    }

                    $groupSize = count($tiedParticipants);
                    $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                    foreach ($tiedParticipants as $participantId) {
                        ScoreJudging::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('judges_id', $judgeId)
                            ->where('criteria', $criteria)
                            ->where('evaluation_criteria', $evaluationCriteria)
                            ->update(['rank' => $middleRank]);
                    }

                    $currentRank += $groupSize;
                    $i = $j;
                }
            }

            if ($roundType == 'Preliminary') {

                $participantTotalsByCriteria = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(total) as total_sum'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();

                // compute the total score of each participant from the score judging table
                foreach ($participantTotalsByCriteria as $row) {
                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_score' => $row->total_sum / $judgeCounts->count()]);
                }

                $participantTotalRank = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(rank) as rank'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();
                //compute the total rank sum all of the rank
                foreach ($participantTotalRank as $row) {

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_rank' => $row->rank]);
                }
            }

            //compute the final rank base on the total rank


            $participantsScores = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)->where('round', $roundType)
                ->whereIn('participant_id', $participantIds)
                ->get()
                ->groupBy(function ($item) {
                    return $item->criteria . '|' . $item->evaluation_criteria;
                });

            foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                [$criteria, $evaluationCriteria] = explode('|', $criteriaName);

                $participantTotals = $scoresForCriteria
                    ->groupBy('participant_id')
                    ->map(fn($scores) => $scores->sum('rank'))
                    ->sort();

                $sorted = $participantTotals->toArray();
                $participantIds = array_keys($sorted);
                $scores = array_values($sorted);

                $currentRank = 1;
                $i = 0;
                $totalCount = count($scores);

                while ($i < $totalCount) {
                    $currentScore = $scores[$i];
                    $tiedParticipants = [$participantIds[$i]];
                    $j = $i + 1;

                    while ($j < $totalCount && $scores[$j] == $currentScore) {
                        $tiedParticipants[] = $participantIds[$j];
                        $j++;
                    }

                    $groupSize = count($tiedParticipants);
                    $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                    foreach ($tiedParticipants as $participantId) {
                        ScoreJudging::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('criteria', $criteria)
                            ->where('evaluation_criteria', $evaluationCriteria)
                            ->update(['final_rank' => $middleRank]);
                    }

                    $currentRank += $groupSize;
                    $i = $j;
                }
            }
        }



        if ($roundType == 'Final') {
            $participantTotalsByCriteria = DB::table('score_judging_tests')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(total) as judge_total') // sum per judge
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', 'Final')
                ->groupBy('participant_id', 'judges_id') // one row per judge per participant
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    $totalSum = $rows->sum('judge_total');      // sum of each judge's total
                    $judgeCount = $rows->count();               // number of judges
                    $average = $totalSum / $judgeCount;         // final average
                    return [
                        'participant_id' => $participantId,
                        'average' => $average
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_score' => $row['average']]);
            }


            $participantTotalsByCriteria = DB::table('score_judging_tests')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(rank) as judge_total_rank')
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', $roundType)
                ->groupBy('participant_id', 'judges_id') // ✅ one total per judge
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    return [
                        'participant_id' => $participantId,
                        'rank_sum' => $rows->sum('judge_total_rank'), // ✅ add up per judge totals
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_rank' => $row['rank_sum']]);
            }
        }

        $criteriaCount = Criteria::where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->distinct()
            ->pluck('criteria');



        if ($resultType == 'rank_based') {

            foreach ($participants as $participant) {

                // Get ScoreJudgingTest rows for this participant, grouped by judge
                $scoreRecords = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id');

                foreach ($scoreRecords as $judgeId => $scoresByJudge) {
                    $judgeId = (int) $judgeId;
                    // Use sum or average if needed
                    // or avg
                    foreach ($scoresByJudge as $scoreRecord) {

                        $criteria = 1 / $criteriaCount->count(); // 0.25 if count=4

                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'judges_id' => $judgeId,
                                'round' => $roundType,
                                'type' => 'rank based',
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => $scoreRecord->rank,
                                'total' => $scoreRecord->total,
                                'total_points' => $scoreRecord->total_score,
                                'score' => round($scoreRecord->total_score / max($judgeCounts->count(), 1), 1),
                                'total_rank' => $scoreRecord->total_rank,
                                'final_rank' => $scoreRecord->final_rank,
                            ]
                        );
                    }
                }
            }
        }

        if ($resultType == 'point_based') {
            foreach ($participants as $participant) {

                // Get ScoreJudgingTest rows for this participant, grouped by judge
                $scoreRecords = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id');

                foreach ($scoreRecords as $judgeId => $scoresByJudge) {

                    // Use sum or average if needed
                    // or avg
                    foreach ($scoresByJudge as $scoreRecord) {

                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'judges_id' => $judgeId,
                                'round' => $roundType,
                                'type' => 'point based',
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => $scoreRecord->rank,
                                'total' => $scoreRecord->total,
                                'total_points' => $scoreRecord->total_score,
                                'score' => round($scoreRecord->total_score / max($judgeCounts->count(), 1), 1),
                                'total_rank' => $scoreRecord->total_rank,
                                'final_rank' => $scoreRecord->final_rank,
                            ]
                        );
                    }

                    foreach ($participantsByGender as $gender => $participantsGroup) {
                        $participantIds = $participantsGroup->pluck('id');

                        $criteriaList = OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)
                            ->where('round', $roundType)
                            ->whereIn('participant_id', $participantIds)
                            ->distinct()
                            ->pluck('criteria');

                        foreach ($criteriaList as $criteria) {
                            $rows = OverallScoring::where('contest_id', $contestId)
                                ->where('group_id', $groupId)
                                ->where('round', $roundType)
                                ->where('criteria', $criteria)
                                ->whereIn('participant_id', $participantIds)
                                ->select('participant_id', DB::raw('SUM(score) as total_score'))
                                ->groupBy('participant_id')
                                ->orderByDesc('total_score')
                                ->orderBy('participant_id')
                                ->get();

                            $rank = 1;
                            $prevScore = null;
                            $group = [];

                            foreach ($rows as $r) {
                                // If score changed and we have previous ties → assign average rank
                                if ($prevScore !== null && $r->total_score != $prevScore) {
                                    $averageRank = array_sum($group) / count($group);
                                    foreach ($group as $pid => $rankValue) {
                                        OverallScoring::where('contest_id', $contestId)
                                            ->where('group_id', $groupId)
                                            ->where('round', $roundType)
                                            ->where('criteria', $criteria)
                                            ->where('participant_id', $pid)
                                            ->update(['final_rank' => $averageRank]);
                                    }
                                    // reset group for new score block
                                    $group = [];
                                }

                                // Always add current participant to the active tie group
                                $group[$r->participant_id] = $rank;

                                // Update prevScore and increment rank for next loop
                                $prevScore = $r->total_score;
                                $rank++;
                            }

                            // Handle last tie group after loop
                            if (count($group) > 0) {
                                $averageRank = array_sum($group) / count($group);
                                foreach ($group as $pid => $rankValue) {
                                    OverallScoring::where('contest_id', $contestId)
                                        ->where('group_id', $groupId)
                                        ->where('round', $roundType)
                                        ->where('criteria', $criteria)
                                        ->where('participant_id', $pid)
                                        ->update(['final_rank' => $averageRank]);
                                }
                            }
                        }
                    }
                }
            }
        }

        broadcast(new TopParticipantsUpdated($contestId, $groupId))->toOthers();

        return redirect()->back()->with('success', 'Score Tabulated');
    }

    public function storeResultSingleRoundTeam(Request $request, $contestId, $groupId, $resultType)
    {
        $roundType = $request->input('roundType');
        $judgesGroup = JudgesGroup::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->whereNotExists(function ($query) use ($contestId, $groupId, $roundType) {
                $query->select(DB::raw(1))
                    ->from('judges_groups')
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('is_finished', 0)
                    ->whereNull('deleted_at');
            })
            ->get();

        // if ($judgesGroup->isEmpty()) {
        //     return response()->json(['message' => 'No finished judges group'], 400);
        // }

        $participants = TeamParticipants::where('contest_id', $contestId)->get();

        $judgingScores = JudgingScore::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->get();

        $judgeCounts = ContestJudges::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->distinct()
            ->pluck('judge_id');
        // Process per participant per judge
        foreach ($participants as $participant) {

            $judgesGrouped = $judgingScores->groupBy('judges_id');

            foreach ($judgesGrouped as $judgeId => $scoresByJudge) {

                $groupedByParticipant = $scoresByJudge->groupBy('participant_id');

                foreach ($groupedByParticipant as $participantId => $participantGroup) {

                    $groupedByCriteria = $participantGroup->groupBy('criteria');


                    foreach ($groupedByCriteria as $criteriaName => $criteriaGroup) {

                        $totalScoreForCriteria = $criteriaGroup->sum('score');
                        $evaluationCriteria = $criteriaGroup->first()->evaluation_criteria;

                        ScoreJudging::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'judges_id' => $judgeId,
                                'contest_id' => $contestId,
                                'participant_id' => $participantId,
                                'criteria' => $criteriaName,
                                'evaluation_criteria' => $evaluationCriteria,
                                'round' => $roundType,
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => null,
                                'total' => $totalScoreForCriteria,
                                'total_score' => null,
                                'total_rank' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }
            }
            // }
        }

        $participantsByGender = $participants->groupBy('gender');

        foreach ($participantsByGender as $gender => $participantsGroup) {

            $participantIds = $participantsGroup->pluck('id');

            $participantsScores = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)->where('round', $roundType)
                ->whereIn('participant_id', $participantIds)
                ->get()
                ->groupBy(function ($item) {
                    return $item->judges_id . '|' . $item->criteria . '|' . $item->evaluation_criteria;
                });


            foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                [$judgeId, $criteria, $evaluationCriteria] = explode('|', $criteriaName);

                $participantTotals = $scoresForCriteria
                    ->groupBy('participant_id')
                    ->map(fn($scores) => $scores->sum('total'))
                    ->sortDesc();

                $sorted = $participantTotals->toArray();
                $participantIds = array_keys($sorted);
                $scores = array_values($sorted);

                $currentRank = 1;
                $i = 0;
                $totalCount = count($scores);

                while ($i < $totalCount) {
                    $currentScore = $scores[$i];
                    $tiedParticipants = [$participantIds[$i]];
                    $j = $i + 1;

                    while ($j < $totalCount && $scores[$j] == $currentScore) {
                        $tiedParticipants[] = $participantIds[$j];
                        $j++;
                    }

                    $groupSize = count($tiedParticipants);
                    $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                    foreach ($tiedParticipants as $participantId) {
                        ScoreJudging::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('judges_id', $judgeId)
                            ->where('criteria', $criteria)
                            ->where('evaluation_criteria', $evaluationCriteria)
                            ->update(['rank' => $middleRank]);
                    }

                    $currentRank += $groupSize;
                    $i = $j;
                }
            }

            if ($roundType == 'Preliminary') {
                $participantTotalsByCriteria = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(total) as total_sum'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();

                //compute the total score of each participant from the score judging table
                foreach ($participantTotalsByCriteria as $row) {

                    // $average = $row->total_sum / $row->judge_count;

                    // if ($resultType == 'rank_based') {
                    //     $average = $row->total_sum / $row->judge_count;
                    // } else {
                    //     $average = $row->total_sum;
                    // }

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_score' => $row->total_sum / $judgeCounts->count()]);
                }

                $participantTotalsByCriteria = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(rank) as rank'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();
                //compute the total rank sum all of the rank
                foreach ($participantTotalsByCriteria as $row) {

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_rank' => $row->rank]);
                }
            }

            //compute the final rank base on the total rank
            foreach ($participantsByGender as $gender => $participantsGroup) {
                $participantIds = $participantsGroup->pluck('id');

                $participantsScores = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->get()
                    ->groupBy(function ($item) {
                        return $item->criteria . '|' . $item->evaluation_criteria;
                    });

                foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                    [$criteria, $evaluationCriteria] = explode('|', $criteriaName);

                    $participantTotals = $scoresForCriteria
                        ->groupBy('participant_id')
                        ->map(fn($scores) => $scores->sum('rank'))
                        ->sort();

                    $sorted = $participantTotals->toArray();
                    $participantIds = array_keys($sorted);
                    $scores = array_values($sorted);

                    $currentRank = 1;
                    $i = 0;
                    $totalCount = count($scores);

                    while ($i < $totalCount) {
                        $currentScore = $scores[$i];
                        $tiedParticipants = [$participantIds[$i]];
                        $j = $i + 1;

                        while ($j < $totalCount && $scores[$j] == $currentScore) {
                            $tiedParticipants[] = $participantIds[$j];
                            $j++;
                        }

                        $groupSize = count($tiedParticipants);
                        $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                        foreach ($tiedParticipants as $participantId) {
                            ScoreJudging::where('contest_id', $contestId)
                                ->where('group_id', $groupId)->where('round', $roundType)
                                ->where('participant_id', $participantId)
                                ->where('criteria', $criteria)
                                ->where('evaluation_criteria', $evaluationCriteria)
                                ->update(['final_rank' => $middleRank]);
                        }

                        $currentRank += $groupSize;
                        $i = $j;
                    }
                }
            }
        }

        if ($roundType == 'Final') {
            $participantTotalsByCriteria = DB::table('score_judging_tests')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(total) as judge_total') // sum per judge
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', 'Final')
                ->groupBy('participant_id', 'judges_id') // one row per judge per participant
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    $totalSum = $rows->sum('judge_total');      // sum of each judge's total
                    $judgeCount = $rows->count();               // number of judges
                    $average = $totalSum / $judgeCount;         // final average
                    return [
                        'participant_id' => $participantId,
                        'average' => $average
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_score' => $row['average']]);
            }


            $participantTotalsByCriteria = DB::table('score_judging_tests')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(rank) as judge_total_rank')
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', $roundType)
                ->groupBy('participant_id', 'judges_id') // ✅ one total per judge
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    return [
                        'participant_id' => $participantId,
                        'rank_sum' => $rows->sum('judge_total_rank'), // ✅ add up per judge totals
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_rank' => $row['rank_sum']]);
            }
        }

        $criteriaCount = Criteria::where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->distinct()
            ->pluck('criteria');


        if ($resultType == 'rank_based') {

            foreach ($participants as $participant) {
                // Group each participant’s scores by judge
                $scoreRecords = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id');

                foreach ($scoreRecords as $judgeId => $scoresByJudge) {
                    $judgeId = (int) $judgeId;

                    info($judgeId);
                    foreach ($scoresByJudge as $scoreRecord) {
                        $criteria = 1 / $criteriaCount->count(); // weight per criteria

                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'judges_id' => $judgeId,
                                'round' => $roundType,
                                'type' => 'rank based',
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => $scoreRecord->rank,
                                'total' => $scoreRecord->total,
                                'total_points' => $scoreRecord->total_score,
                                'score' => round($scoreRecord->total_score / max($judgeCounts->count(), 1), 1),
                                'total_rank' => $scoreRecord->total_rank,
                                'final_rank' => $scoreRecord->final_rank,
                            ]
                        );
                    }
                }
            }
        }

        if ($resultType == 'point_based') {
            foreach ($participants as $participant) {

                // Get ScoreJudgingTest rows for this participant, grouped by judge
                $scoreRecords = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id');

                foreach ($scoreRecords as $judgeId => $scoresByJudge) {
                    $judgeId = (int) $judgeId;
                    // Use sum or average if needed
                    // or avg
                    foreach ($scoresByJudge as $scoreRecord) {
                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'judges_id' => $judgeId,
                                'round' => $roundType,
                                'type' => 'point based',
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => $scoreRecord->rank,
                                'total' => $scoreRecord->total,
                                'total_points' => $scoreRecord->total_score,
                                'score' => round($scoreRecord->total_score / max($judgeCounts->count(), 1), 1),
                                'total_rank' => $scoreRecord->total_rank,
                                'final_rank' => $scoreRecord->final_rank,
                            ]
                        );
                    }
                }

                foreach ($participantsByGender as $gender => $participantsGroup) {
                    $participantIds = $participantsGroup->pluck('id');

                    $criteriaList = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->whereIn('participant_id', $participantIds)
                        ->distinct()
                        ->pluck('criteria');

                    foreach ($criteriaList as $criteria) {
                        $rows = OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)
                            ->where('round', $roundType)
                            ->where('criteria', $criteria)
                            ->whereIn('participant_id', $participantIds)
                            ->select('participant_id', DB::raw('SUM(score) as total_score'))
                            ->groupBy('participant_id')
                            ->orderByDesc('total_score')
                            ->orderBy('participant_id')
                            ->get();

                        $rank = 1;
                        $prevScore = null;
                        $group = [];

                        foreach ($rows as $r) {
                            // If score changed and we have previous ties → assign average rank
                            if ($prevScore !== null && $r->total_score != $prevScore) {
                                $averageRank = array_sum($group) / count($group);
                                foreach ($group as $pid => $rankValue) {
                                    OverallScoring::where('contest_id', $contestId)
                                        ->where('group_id', $groupId)
                                        ->where('round', $roundType)
                                        ->where('criteria', $criteria)
                                        ->where('participant_id', $pid)
                                        ->update(['final_rank' => $averageRank]);
                                }
                                // reset group for new score block
                                $group = [];
                            }

                            // Always add current participant to the active tie group
                            $group[$r->participant_id] = $rank;

                            // Update prevScore and increment rank for next loop
                            $prevScore = $r->total_score;
                            $rank++;
                        }

                        // Handle last tie group after loop
                        if (count($group) > 0) {
                            $averageRank = array_sum($group) / count($group);
                            foreach ($group as $pid => $rankValue) {
                                OverallScoring::where('contest_id', $contestId)
                                    ->where('group_id', $groupId)
                                    ->where('round', $roundType)
                                    ->where('criteria', $criteria)
                                    ->where('participant_id', $pid)
                                    ->update(['final_rank' => $averageRank]);
                            }
                        }
                    }
                }
            }
        }
        broadcast(new TopParticipantsUpdated($contestId, $groupId))->toOthers();
        return redirect()->back()->with('success', 'Score tabulated');
    }
    public function storeResultMultipleTeam(Request $request, $contestId, $groupId, $resultType)
    {
        $roundType = $request->input('roundType');
        $prelimScoringType = PrelimScoringMethod::where('group_id', $groupId)->value('preliminary_method');
        // $judgesGroup = JudgesGroup::where('contest_id', $contestId)
        //     ->where('group_id', $groupId)
        //     ->whereNotExists(function ($query) use ($contestId, $groupId, $roundType) {
        //         $query->select(DB::raw(1))
        //             ->from('judges_groups')
        //             ->where('contest_id', $contestId)
        //             ->where('group_id', $groupId)
        //             ->where('round', $roundType)
        //             ->where('is_finished', 0)
        //             ->whereNull('deleted_at');
        //     })
        //     ->get();

        // if ($judgesGroup->isEmpty()) {
        //     return response()->json(['message' => 'No finished judges group'], 400);
        // }

        $participants = TeamParticipants::where('contest_id', $contestId)->get();

        $judgingScores = JudgingScore::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->get();

        // Process per participant per judge
        foreach ($participants as $participant) {


            $judgesGrouped = $judgingScores->groupBy('judges_id');

            foreach ($judgesGrouped as $judgeId => $scoresByJudge) {

                $groupedByParticipant = $scoresByJudge->groupBy('participant_id');

                foreach ($groupedByParticipant as $participantId => $participantGroup) {

                    $groupedByCriteria = $participantGroup->groupBy('criteria');

                    foreach ($groupedByCriteria as $criteriaName => $criteriaGroup) {

                        $totalScoreForCriteria = $criteriaGroup->sum('score');
                        $evaluationCriteria = $criteriaGroup->first()->evaluation_criteria;

                        ScoreJudging::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'judges_id' => $judgeId,
                                'contest_id' => $contestId,
                                'participant_id' => $participantId,
                                'criteria' => $criteriaName,
                                'evaluation_criteria' => $evaluationCriteria,
                                'round' => $roundType,
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => null,
                                'total' => $totalScoreForCriteria,
                                'total_score' => null,
                                'total_rank' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }
            }
        }

        $participantsByGender = $participants->groupBy('gender');

        foreach ($participantsByGender as $gender => $participantsGroup) {

            $participantIds = $participantsGroup->pluck('id');

            $participantsScores = ScoreJudging::where('contest_id', $contestId)
                ->where('group_id', $groupId)->where('round', $roundType)
                ->whereIn('participant_id', $participantIds)
                ->get()
                ->groupBy(function ($item) {
                    return $item->judges_id . '|' . $item->criteria . '|' . $item->evaluation_criteria;
                });


            foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                [$judgeId, $criteria, $evaluationCriteria] = explode('|', $criteriaName);

                $participantTotals = $scoresForCriteria
                    ->groupBy('participant_id')
                    ->map(fn($scores) => $scores->sum('total'))
                    ->sortDesc();

                $sorted = $participantTotals->toArray();
                $participantIds = array_keys($sorted);
                $scores = array_values($sorted);

                $currentRank = 1;
                $i = 0;
                $totalCount = count($scores);

                while ($i < $totalCount) {
                    $currentScore = $scores[$i];
                    $tiedParticipants = [$participantIds[$i]];
                    $j = $i + 1;

                    while ($j < $totalCount && $scores[$j] == $currentScore) {
                        $tiedParticipants[] = $participantIds[$j];
                        $j++;
                    }

                    $groupSize = count($tiedParticipants);
                    $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                    foreach ($tiedParticipants as $participantId) {
                        ScoreJudging::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('judges_id', $judgeId)
                            ->where('criteria', $criteria)
                            ->where('evaluation_criteria', $evaluationCriteria)
                            ->update(['rank' => $middleRank]);
                    }

                    $currentRank += $groupSize;
                    $i = $j;
                }
            }

            if ($roundType == 'Preliminary') {
                $participantTotalsByCriteria = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(total) as total_sum'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();

                //compute the total score of each participant from the score judging table
                foreach ($participantTotalsByCriteria as $row) {

                    // $average = $row->total_sum / $row->judge_count;

                    if ($resultType == 'rank_based') {
                        $average = $row->total_sum / $row->judge_count;
                    } else {
                        $average = $row->judge_count > 0
                            ? round($row->total_sum / $row->judge_count, 1, PHP_ROUND_HALF_UP) : 0;
                    }

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_score' => $average]);
                }

                $participantTotalsByCriteria = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->select(
                        'participant_id',
                        'criteria',
                        'evaluation_criteria',
                        DB::raw('SUM(rank) as rank'),
                        DB::raw('COUNT(DISTINCT judges_id) as judge_count')
                    )
                    ->groupBy('participant_id', 'criteria', 'evaluation_criteria')
                    ->get();
                //compute the total rank sum all of the rank
                foreach ($participantTotalsByCriteria as $row) {

                    ScoreJudging::where('contest_id', $contestId)
                        ->where('group_id', $groupId)->where('round', $roundType)
                        ->where('participant_id', $row->participant_id)
                        ->where('criteria', $row->criteria)
                        ->where('evaluation_criteria', $row->evaluation_criteria)
                        ->update(['total_rank' => $row->rank]);
                }
            }

            //compute the final rank base on the total rank
            foreach ($participantsByGender as $gender => $participantsGroup) {
                $participantIds = $participantsGroup->pluck('id');

                $participantsScores = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->get()
                    ->groupBy(function ($item) {
                        return $item->criteria . '|' . $item->evaluation_criteria;
                    });

                foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                    [$criteria, $evaluationCriteria] = explode('|', $criteriaName);

                    $participantTotals = $scoresForCriteria
                        ->groupBy('participant_id')
                        ->map(fn($scores) => $scores->sum('rank'))
                        ->sort();

                    $sorted = $participantTotals->toArray();
                    $participantIds = array_keys($sorted);
                    $scores = array_values($sorted);

                    $currentRank = 1;
                    $i = 0;
                    $totalCount = count($scores);

                    while ($i < $totalCount) {
                        $currentScore = $scores[$i];
                        $tiedParticipants = [$participantIds[$i]];
                        $j = $i + 1;

                        while ($j < $totalCount && $scores[$j] == $currentScore) {
                            $tiedParticipants[] = $participantIds[$j];
                            $j++;
                        }

                        $groupSize = count($tiedParticipants);
                        $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                        foreach ($tiedParticipants as $participantId) {
                            ScoreJudging::where('contest_id', $contestId)
                                ->where('group_id', $groupId)->where('round', $roundType)
                                ->where('participant_id', $participantId)
                                ->where('criteria', $criteria)
                                ->where('evaluation_criteria', $evaluationCriteria)
                                ->update(['final_rank' => $middleRank]);
                        }

                        $currentRank += $groupSize;
                        $i = $j;
                    }
                }
            }
        }

        if ($roundType == 'Final') {
            $participantTotalsByCriteria = DB::table('score_judging_tests')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(total) as judge_total') // sum per judge
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', 'Final')
                ->groupBy('participant_id', 'judges_id') // one row per judge per participant
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    $totalSum = $rows->sum('judge_total');      // sum of each judge's total
                    $judgeCount = $rows->count();               // number of judges
                    $average = $totalSum / $judgeCount;         // final average
                    return [
                        'participant_id' => $participantId,
                        'average' => $average
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_score' => $row['average']]);
            }


            $participantTotalsByCriteria = DB::table('score_judging_tests')
                ->select(
                    'participant_id',
                    'judges_id',
                    DB::raw('AVG(rank) as judge_total_rank')
                )
                ->where('contest_id', $contestId)
                ->where('group_id', $groupId)
                ->where('round', $roundType)
                ->groupBy('participant_id', 'judges_id') // ✅ one total per judge
                ->get()
                ->groupBy('participant_id')
                ->map(function ($rows, $participantId) {
                    return [
                        'participant_id' => $participantId,
                        'rank_sum' => $rows->sum('judge_total_rank'), // ✅ add up per judge totals
                    ];
                });

            foreach ($participantTotalsByCriteria as $row) {
                ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $row['participant_id'])
                    ->update(['total_rank' => $row['rank_sum']]);
            }
        }

        $criteriaCount = Criteria::where('contest_id', $contestId)
            ->where('group_id', $groupId)->where('round', $roundType)
            ->distinct()
            ->pluck('criteria');

        $judgeCounts = ContestJudges::where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->distinct()
            ->pluck('judge_id');

      

        if ($resultType == 'rank_based') {
            foreach ($participants as $participant) {
                $scoresByJudge = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id'); // group by judge

                foreach ($scoresByJudge as $judgeId => $scoresForJudge) {
                    foreach ($scoresForJudge as $scoreRecord) {
                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'round' => $roundType,
                                'type' => 'rank based',
                                'judges_id' => $judgeId,
                            ],
                            [
                                'rank' => $scoreRecord->final_rank,
                                'participant_type' => get_class($participant),
                                'score' => $scoreRecord->total_score,
                                'total_rank' => $scoreRecord->total_rank,
                                'total' => null,
                                'total_points' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }


                $totalRankSum = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $participant->id)
                    ->sum('total_rank');

                // STEP 2: Update participant-level totals once

                $totalScoreSum = ScoreJudging::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->where('participant_id', $participant->id)
                    ->sum('total_score');


                OverallScoring::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->where('round', $roundType)
                    ->where('participant_id', $participant->id)
                    ->update([
                        'total' => round($totalRankSum / $judgeCounts->count(), 2),
                        'total_points' => round($totalScoreSum / ($criteriaCount->count() * $judgeCounts->count()), 2),
                    ]);
            }

            if ($prelimScoringType == 'weighted' && $roundType == 'Preliminary') {

                $criteriaWeights = PrelimScoringMethod::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->get()
                    ->pluck('weight', 'contest_name')
                    ->mapWithKeys(fn($value, $key) => [trim($key) => $value])
                    ->toArray();

                $participantsScores = OverallScoring::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('participant_id');

                foreach ($participantsScores as $participantId => $scores) {

                    $byCriteria = $scores->groupBy('criteria');

                    foreach ($byCriteria as $criteriaName => $criteriaScores) {
                        $criteriaName = trim($criteriaName);

                        // use rank column
                        $rank = (float) ($criteriaScores->first()->rank ?? 0);

                        $weight = (float) ($criteriaWeights[$criteriaName] ?? 0);

                        $totalWeightedRank = 0;

                        if ($weight > 0 && $rank > 0) {
                            $totalWeightedRank = $rank * ($weight / 100.0);
                        }



                        OverallScoring::where('group_id', $groupId)
                            ->where('contest_id', $contestId)
                            ->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('criteria', $criteriaName)   // IMPORTANT FIX
                            ->update([
                                'total_rank' => $totalWeightedRank,
                            ]);
                    }

                    // Step 2: After all criteria updated, compute the total
                    $totalRankSumWeight = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('total_rank');

                    $totalRankSum = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('rank');

                    // $criteriaCount = OverallScoring::where('contest_id', $contestId)
                    //     ->where('group_id', $groupId)
                    //     ->where('round', $roundType)
                    //     ->where('participant_id', $participantId)
                    //     ->distinct('criteria')
                    //     ->count('criteria');

                    // Step 3: Update total_points for ALL rows of the participant
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->update([
                            'total_points' => $totalRankSum /  $judgeCounts->count(),
                            'total' => $totalRankSumWeight /  $judgeCounts->count()
                        ]);
                }
            }

            foreach ($participantsByGender as $gender => $participantsGroup) {
                $participantIds = $participantsGroup->pluck('id');

                $participantsScores = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->get()
                    ->groupBy('criteria');

                foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                    $participantTotals = $scoresForCriteria
                        ->groupBy('participant_id')
                        ->map(fn($scores) => [
                            'participant_id' => $scores->first()->participant_id,
                            'total' => (float)$scores->first()->total,
                            'tieBreaker' => (float)$scores->first()->total_rank,
                        ])
                        ->values();

                    $sorted = $participantTotals->sort(fn($a, $b) => $a['total'] <=> $b['total'])->values();

                    $currentRank = 1;
                    $i = 0;
                    $totalCount = $sorted->count();

                    while ($i < $totalCount) {
                        $currentTotal = $sorted[$i]['total'];
                        $tiedParticipants = [$sorted[$i]['participant_id']];
                        $j = $i + 1;

                        while ($j < $totalCount && $sorted[$j]['total'] == $currentTotal) {
                            $tiedParticipants[] = $sorted[$j]['participant_id'];
                            $j++;
                        }

                        $groupSize = count($tiedParticipants);
                        $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;


                        foreach ($tiedParticipants as $participantId) {


                            OverallScoring::where('contest_id', $contestId)
                                ->where('group_id', $groupId)
                                ->where('round', $roundType)
                                ->where('participant_id', $participantId)
                                ->where('criteria', $criteriaName)
                                ->update(['final_rank' => $middleRank]);
                        }

                        $currentRank += $groupSize;
                        $i = $j;
                    }
                }
            }
        }

        if ($resultType == 'point_based') {
            foreach ($participants as $participant) {

                // Get ScoreJudgingTest rows for this participant, grouped by judge
                $scoreRecords = ScoreJudging::where('participant_id', $participant->id)
                    ->where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->get()
                    ->groupBy('judges_id');

                foreach ($scoreRecords as $judgeId => $scoresByJudge) {

                    foreach ($scoresByJudge as $scoreRecord) {

                        OverallScoring::updateOrCreate(
                            [
                                'group_id' => $groupId,
                                'contest_id' => $contestId,
                                'participant_id' => $participant->id,
                                'criteria' => $scoreRecord->criteria,
                                'round' => $roundType,
                                'type' => 'point based',
                                'judges_id' => $judgeId,
                                'total_points' => $scoreRecord->total_score,
                            ],
                            [
                                'participant_type' => get_class($participant),
                                'rank' => null,
                                'total' => null,
                                // 'total_points' => null,
                                'score' => round($scoreRecord->total_score / max($judgeCounts->count(), 1), 1, PHP_ROUND_HALF_UP),
                                'total_rank' => null,
                                'final_rank' => null,
                            ]
                        );
                    }
                }
            }

            if ($prelimScoringType == 'weighted' && $roundType == 'Preliminary') {

                $criteriaWeights = PrelimScoringMethod::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->get()
                    ->pluck('weight', 'contest_name')
                    ->mapWithKeys(fn($value, $key) => [trim($key) => $value])
                    ->toArray();

                $participantsScores = OverallScoring::where('group_id', $groupId)
                    ->where('contest_id', $contestId)
                    ->where('round', $roundType)
                    ->get()
                    ->groupBy('participant_id');

                foreach ($participantsScores as $participantId => $scores) {

                    $byCriteria = $scores->groupBy('criteria');

                    foreach ($byCriteria as $criteriaName => $criteriaScores) {

                        $criteriaName = trim($criteriaName);

                        // ✅ Get weight (example: 25)
                        $weight = (float) ($criteriaWeights[$criteriaName] ?? 0);

                        // ✅ Get participant total points for THIS criteria (example: 89.70)
                        $totalPoints = (float) ($criteriaScores->first()->total_points ?? 0);

                        // ✅ Final weighted computation
                        $totalWeighted = 0;
                        if ($weight > 0 && $totalPoints > 0) {
                            $totalWeighted = $totalPoints * ($weight / 100);
                        }

                        // ✅ Save weighted result
                        OverallScoring::where('group_id', $groupId)
                            ->where('contest_id', $contestId)
                            ->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->where('criteria', $criteriaName)
                            ->update([
                                'total_points' => round($totalWeighted, 3), // ✅ precision safe
                            ]);
                    }
                    // Step 2: After all criteria updated, compute the total
                    $totalRankSumWeight = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('total_rank');

                    $totalSum = OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->sum('total_points');

                    // Step 3: Update total_points for ALL rows of the participant
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->where('participant_id', $participantId)
                        ->update([
                            // 'total_points' => $totalRankSum,
                            'total' => $totalSum / $judgeCounts->count()
                        ]);
                }
            }



            foreach ($participantsByGender as $gender => $participantsGroup) {
                $participantIds = $participantsGroup->pluck('id');

                // Get all overall scores for these participants
                $participantsScores = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->get()
                    ->groupBy(function ($item) {
                        // Group by criteria only
                        return $item->criteria;
                    });

                foreach ($participantsScores as $criteriaName => $scoresForCriteria) {
                    // Sum scores per participant for this criteria
                    $participantTotals = $scoresForCriteria
                        ->groupBy('participant_id')
                        ->map(fn($scores) => $scores->sum('score'))
                        ->sortDesc(); // higher score = better rank

                    $sorted = $participantTotals->toArray();
                    $participantIdsSorted = array_keys($sorted);
                    $scores = array_values($sorted);

                    $currentRank = 1;
                    $i = 0;
                    $totalCount = count($scores);

                    while ($i < $totalCount) {
                        $currentScore = $scores[$i];
                        $tiedParticipants = [$participantIdsSorted[$i]];
                        $j = $i + 1;

                        // Collect ties
                        while ($j < $totalCount && $scores[$j] == $currentScore) {
                            $tiedParticipants[] = $participantIdsSorted[$j];
                            $j++;
                        }

                        // Middle rank formula
                        $groupSize = count($tiedParticipants);
                        $middleRank = ($currentRank + ($currentRank + $groupSize - 1)) / 2;

                        // ✅ Update using $criteriaName instead of $criteria
                        OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)
                            ->whereIn('participant_id', $tiedParticipants)
                            ->where('criteria', $criteriaName)
                            ->update(['rank' => $middleRank]);

                        $currentRank += $groupSize;
                        $i = $j;
                    }
                }

                $participantIds = $participantsGroup->pluck('id');

                if ($prelimScoringType != 'weighted') {

                    foreach ($participantIds as $participantId) {
                        // compute total across ALL criteria for this participant
                        $grandTotal = OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)
                            ->sum('score');

                        // update all rows of this participant with the same grand total
                        OverallScoring::where('contest_id', $contestId)
                            ->where('group_id', $groupId)->where('round', $roundType)
                            ->where('participant_id', $participantId)

                            ->update([
                                'total' => round($grandTotal / $judgeCounts->count(), 1),
                            ]);
                    }
                }

                $allParticipants = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)->where('round', $roundType)
                    ->select('participant_id', DB::raw('SUM(rank) as total_rank'))
                    ->groupBy('participant_id')
                    ->get();

                // Now update each participant with their total_rank
                foreach ($allParticipants as $participant) {
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)->where('round', $roundType)
                        ->where('participant_id', $participant->participant_id)
                        ->update([
                            'total_rank' => $participant->total_rank / $judgeCounts->count(),
                        ]);
                }

                $rows = OverallScoring::where('contest_id', $contestId)
                    ->where('group_id', $groupId)
                    ->where('round', $roundType)
                    ->whereIn('participant_id', $participantIds)
                    ->select('participant_id', 'total', 'total_rank')
                    ->groupBy('participant_id', 'total', 'total_rank')

                    ->orderBy('total', 'desc')
                    ->get();


                $rank = 1;
                $i = 0;
                $totalCount = $rows->count();

                while ($i < $totalCount) {
                    $currentTotalRank = $rows[$i]->total_rank;
                    $currentTotal = $rows[$i]->total;

                    // Collect tied participants
                    $tiedParticipants = [$rows[$i]->participant_id];
                    $j = $i + 1;
                    while (
                        $j < $totalCount &&
                        $rows[$j]->total_rank == $currentTotalRank &&
                        $rows[$j]->total == $currentTotal
                    ) {
                        $tiedParticipants[] = $rows[$j]->participant_id;
                        $j++;
                    }

                    // Middle rank formula
                    $groupSize = count($tiedParticipants);
                    $middleRank = ($rank + ($rank + $groupSize - 1)) / 2;

                    // Update final rank for all tied participants
                    OverallScoring::where('contest_id', $contestId)
                        ->where('group_id', $groupId)
                        ->where('round', $roundType)
                        ->whereIn('participant_id', $tiedParticipants)
                        ->update(['final_rank' => $middleRank]);

                    $rank += $groupSize;
                    $i = $j;
                }
            }
        }
        broadcast(new TopParticipantsUpdated($contestId, $groupId))->toOthers();
        return redirect()->back()->with('success', 'Score tabulated');
    }


    public function storeResultFinal($contestId, $groupId, $resultType)
    {

        $qualified = Qualified::where('contest_id', $contestId)->where('group_id', $groupId)->value('qualified');
        $qualified = (int) $qualified;

        $topByGender = OverallScoring::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('round', 'Preliminary')
            ->orderBy('final_rank', 'asc')
            ->get()
            ->groupBy(function ($item) {
                return $item->participant->gender;
            })
            ->map(function ($group) use ($qualified) {
                return $group->unique('participant_id')
                    ->take($qualified);
            });


        $preliminaryPercentage = CriteriaRoundScore::where('contest_id', $contestId)->where('group_id', $groupId)->where('round', 'Preliminary')->value('percentage');
        $finalPercentage = CriteriaRoundScore::where('contest_id', $contestId)->where('group_id', $groupId)->where('round', 'Final')->value('percentage');
        // Store preliminary round data
        if ($resultType == 'rank_based') {
            foreach ($topByGender as $gender => $participants) {
                foreach ($participants as $score) {
                    $percentage = $score->round === 'Preliminary'
                        ? $preliminaryPercentage
                        : $finalPercentage;

                    OverallFinalScore::updateOrCreate(
                        [
                            'group_id'       => $groupId,
                            'contest_id'     => $contestId,
                            'participant_id' => $score->participant_id,
                            'criteria'       => $score->round,
                        ],
                        [
                            'participant_type' => $score->participant_type,
                            'score'           => $score->total_points,
                            'round_score'     => ($score->total_points * $percentage) / 100,
                            'total'           => $score->total,
                            'final_rank'      => null,
                        ]
                    );
                }
            }
        }

        if ($resultType == 'point_based') {
            foreach ($topByGender as $gender => $participants) {
                foreach ($participants as $score) {
                    $percentage = $score->round === 'Preliminary'
                        ? $preliminaryPercentage
                        : $finalPercentage;

                    OverallFinalScore::updateOrCreate(
                        [
                            'group_id'       => $groupId,
                            'contest_id'     => $contestId,
                            'participant_id' => $score->participant_id,
                            'criteria'       => $score->round,
                        ],
                        [
                            'participant_type' => $score->participant_type,
                            'score'           => $score->total,
                            'round_score'     => ($score->total * $percentage) / 100,
                            'total'           => $score->total,
                            'final_rank'      => null,
                        ]
                    );
                }
            }
        }

        // Store final round data
        $top = OverallScoring::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('round', 'Final')
            ->orderBy('final_rank', 'asc')
            ->get()
            ->groupBy(function ($item) {
                return $item->participant->gender;
            })
            ->map(function ($group) use ($qualified) {
                return $group->unique('participant_id')
                    ->take($qualified);
            });

        $scoreJudging = ScoreJudging::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->where('round', 'Final')
            ->get()
            ->groupBy('participant_id')
            ->map(function ($group) {
                $participant = $group->first()->participant;
                return (object)[
                    'participant_id'   => $group->first()->participant_id,
                    'gender'           => $participant->gender,
                    'participant_type' => $group->first()->participant_type,
                    'total'            => $group->sum('total'),
                    'total_points'     => $group->sum('total_points'),
                    'judges_id'        => $group->first()->judges_id,
                    'judge_count'      => $group->count(),
                ];
            })
            ->groupBy('gender')
            ->map(function ($group) use ($qualified) {
                return $group->take($qualified);
            });

        foreach ($top as $gender => $participants) {
            if (!isset($scoreJudging[$gender])) {
                continue;
            }

            foreach ($participants as $score) {
                $judging = $scoreJudging[$gender]->firstWhere('participant_id', $score->participant_id);

                if ($judging) {
                    $percentage = $score->round === 'Preliminary'
                        ? $preliminaryPercentage
                        : $finalPercentage;

                    OverallFinalScore::updateOrCreate(
                        [
                            'group_id'       => $groupId,
                            'contest_id'     => $contestId,
                            'participant_id' => $score->participant_id,
                            'criteria'       => $score->round,
                        ],
                        [
                            'participant_type' => $score->participant_type,
                            'score'           => $judging->total / $judging->judge_count,
                            'round_score'     => (($judging->total / $judging->judge_count) * $percentage) / 100,
                            'total'           => null,
                            'final_rank'      => null,
                        ]
                    );
                }
            }
        }

        // Calculate total scores for each participant
        OverallFinalScore::where('group_id', $groupId)
            ->where('contest_id', $contestId)
            ->get()
            ->groupBy('participant_id')
            ->each(function ($participantScores) {
                $totalRoundScore = $participantScores->sum('round_score');

                OverallFinalScore::where('participant_id', $participantScores->first()->participant_id)
                    ->where('group_id', $participantScores->first()->group_id)
                    ->where('contest_id', $participantScores->first()->contest_id)
                    ->update(['total' => $totalRoundScore]);
            });

        // NOW CALCULATE THE CORRECT FINAL RANKING BASED ON TOTAL SCORES
        $finalScores = OverallFinalScore::with('participant')
            ->where('contest_id', $contestId)
            ->where('group_id', $groupId)
            ->get()
            ->groupBy('participant_id')
            ->map(function ($group) {
                $participant = $group->first()->participant;
                return (object)[
                    'participant_id' => $group->first()->participant_id,
                    'gender' => $participant->gender,
                    'total_score' => $group->first()->total, // This is the combined score
                ];
            })
            ->groupBy('gender');

        foreach ($finalScores as $gender => $participants) {
            // Sort descending by total score
            $ranked = $participants->sortByDesc('total_score')->values();

            $ranks = [];
            $i = 0;
            while ($i < $ranked->count()) {
                $currentScore = $ranked[$i]->total_score;

                // Find all participants tied with the same score
                $tied = $ranked->filter(fn($p) => $p->total_score === $currentScore);
                $tieCount = $tied->count();

                // Calculate the middle (average) rank for the tie group
                $startRank = $i + 1;
                $endRank = $i + $tieCount;
                $middleRank = ($startRank + $endRank) / 2;

                // Assign the same rank to all tied participants
                foreach ($tied as $participant) {
                    OverallFinalScore::where('participant_id', $participant->participant_id)
                        ->where('group_id', $groupId)
                        ->where('contest_id', $contestId)
                        ->update(['final_rank' => $middleRank]);
                }

                $i += $tieCount;
            }
        }

        broadcast(new TopParticipantsUpdated($contestId, $groupId))->toOthers();

        return redirect()->back()->with('success', 'Score tabulated');
    }
}
