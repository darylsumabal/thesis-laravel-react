import { Contests } from '@/api/contest';
import { JudgesGroups } from '@/api/result';
import CriteriaSectionFinalResultTeam from '@/components/criteria/CriteriaSectionFinalResultTeam';
import CriteriaSectionTeam from '@/components/criteria/CriteriaSectionTeam';
import JudgesResultTeam, { JudgeScore } from '@/components/judge/JudgesResultTeam';
import ResultFooter from '@/components/result/ResultFooter';
import ResultHeader from '@/components/result/ResultHeader';
import ResultsTeam from '@/components/result/ResultTeam';
import ResultsTeamSingleRound from '@/components/result/ResultTeamSingleRound';
import ScoreTableTeam, { TeamParticipantScore } from '@/components/score/ScoreTableTeam';
import TableRankedFinalTeam, { JudgeScoreTest } from '@/components/table/TableRankedFinalTeam';
import TableResultTypeTeamMultiple from '@/components/table/TableResultMultipleTeam';
import { JudgeScoreTeam, MajorAward } from '@/components/table/TableResultTestTeam';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { scoreMap, scoringTypeMap } from '@/lib/constant/contest';
import { router, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export type PROPS = {
    rounds: JudgesGroups;
    contest: Contests;
    final: JudgeScoreTest[];
    qualified: number;
    result: JudgeScore[];
    award: MajorAward[];
    top: MajorAward[];
    finalTopResult: MajorAward[];
    finalResults: MajorAward[];
    scoringMethod: string;
};

export default function ScoreResultTeam() {
    const { rounds, contest, final, qualified, result, award, top, finalTopResult, finalResults, scoringMethod, contestId, groupId } =
        usePage<PROPS>().props;

    const finalResult = final?.flatMap((r) => r.judges_score) ?? [];

    const grouped = finalResult.reduce<Record<number, TeamParticipantScore>>((acc, item) => {
        const { participant_id } = item;

        if (!acc[participant_id]) {
            acc[participant_id] = {
                participant_id,
                participant_no: item.team_participant_no,
                total: item.total,
                final_rank: item.final_rank,
                scores: [],
            };
        }

        acc[participant_id].scores.push({
            criteria: item.criteria,
            score: item.score,
            round_score: item.round_score,
            id: item.id,
        });

        return acc;
    }, {});

    const groupedArray = Object.values(grouped);

    const sortedUniqueJudges = rounds?.preliminary?.judge_group
        // Remove duplicates based on judge ID
        ?.filter((value, index, self) => index === self.findIndex((j) => j.judges.name === value.judges.name))
        ?.map((j, index) => ({
            ...j,
            judgeIndex: index + 1, // 1-based index
        }))
        ?.sort((a, b) => {
            const numA = parseInt(a.judges.judge_number);
            const numB = parseInt(b.judges.judge_number);

            if (isNaN(numA) && isNaN(numB)) return 0;
            if (isNaN(numA)) return 1;
            if (isNaN(numB)) return -1;

            return numA - numB;
        });
    // Sort by judge number, non-numbered roles go to the end
    // ?.sort((a, b) => a.judgeIndex - b.judgeIndex);

    const data: JudgeScoreTeam[] = result?.flatMap((r) => r.judges_score) ?? [];

    const criteria = [...new Set(data?.map((item) => item.criteria))];

    const sectionRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({ contentRef: sectionRef });

    // const topResult = (pointCardSr || rankCardSr) && finalTopSingleResult;
    const scoringMr = scoreMap[contest.contest_scoring_type] === 'mr';

    const scoringSr = scoreMap[contest.contest_scoring_type] === 'sr';

    const topResultMr = scoringMr && scoringMethod === 'Final' ? finalTopResult : finalResults;

    const isPointBasedFinal = scoringTypeMap[contest.contest_scoring_type] === 'point_based';
    return (
        <Tabs defaultValue={''} className="mt-4 w-full">
            <ScrollArea>
                <TabsList>
                    {scoringMr && (
                        <TabsTrigger value="preliminary" className="uppercase">
                            Preliminary
                        </TabsTrigger>
                    )}

                    {scoringSr && (
                        <>
                            {criteria.map((criteriaName) => (
                                <TabsTrigger value={criteriaName} key={criteriaName} className="uppercase">
                                    {criteriaName}
                                </TabsTrigger>
                            ))}

                            {sortedUniqueJudges?.map((i) => (
                                <TabsTrigger key={i.id} value={i.judges.name}>
                                    <p className="uppercase" key={i.id}>
                                        {i.judges.name}
                                    </p>
                                </TabsTrigger>
                            ))}
                        </>
                    )}

                    {scoringMr && (
                        <>
                            <TabsTrigger value="final">FINAL</TabsTrigger>
                            <TabsTrigger
                                value="major_awards"
                                onClick={() => {
                                    const promise = new Promise((resolve, reject) => {
                                        router.get(
                                            `/result/${contestId}/${groupId}/team`,
                                            { award: 1 },
                                            {
                                                preserveScroll: true,
                                                preserveState: true,
                                                replace: false,
                                                onSuccess: (page) => {
                                                    resolve(page);
                                                },
                                                onError: (error) => {
                                                    reject(error);
                                                },
                                            },
                                        );
                                    });

                                    toast.promise(promise, {
                                        loading: 'Loading Major Awards',
                                        success: 'Data Loaded!',
                                        error: 'An error occurred',
                                    });
                                }}
                            >
                                MAJOR AWARDS
                            </TabsTrigger>
                            <TabsTrigger value="top_results">TOP {qualified} RESULTS</TabsTrigger>
                            <TabsTrigger value="final_results">FINAL RESULTS</TabsTrigger>
                            {sortedUniqueJudges?.map((i) => (
                                <TabsTrigger key={i.id} value={i.judges.name}>
                                    <p className="uppercase" key={i.id}>
                                        {i.judges.name}
                                    </p>
                                </TabsTrigger>
                            ))}
                        </>
                    )}
                </TabsList>

                <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <TabsContent value="preliminary">
                <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                    PRINT
                </Button>
                <div ref={sectionRef}>
                    {scoringMr && (
                        <TableResultTypeTeamMultiple
                            contest={contest ?? { contest: [], message: '' }}
                            scoringType={`${contest.contest_scoring_type}`}
                        />
                    )}

                    {criteria.map((criteriaName) => (
                        <CriteriaSectionTeam key={criteriaName} criteriaName={criteriaName} />
                    ))}
                </div>
            </TabsContent>

            {criteria.map((criteriaName, idx) => {
                const refreshByCriteria = () => {
                    const promise = new Promise((resolve, reject) => {
                        router.get(
                            `/result/${contestId}/${groupId}/team`,
                            {
                                criteria: criteriaName,
                            },
                            {
                                preserveScroll: true,
                                preserveState: true,
                                onSuccess: (page) => {
                                    resolve(page);
                                },
                                onError: (error) => {
                                    reject(error);
                                },
                            },
                        );
                    });

                    toast.promise(promise, {
                        loading: 'Loading Result',
                        success: 'Data Loaded!',
                        error: 'An error occurred',
                    });
                };

                return (
                    <TabsContent value={criteriaName} key={idx}>
                        <Tabs defaultValue="result-contest">
                            <TabsList>
                                <TabsTrigger value="result-contest">RESULT</TabsTrigger>
                                <TabsTrigger value="final-contest" onClick={refreshByCriteria}>
                                    FINAL RESULT
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="result-contest">
                                <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                                    PRINT
                                </Button>

                                <div ref={sectionRef}>
                                    <div className="flex flex-col">
                                        <ResultHeader contest={contest ?? { contest: [], message: '' }} />
                                        <div className="mt-14 mb-10 text-center text-3xl font-medium">
                                            <p>CONSOLIDATED RESULT</p>
                                        </div>
                                        <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-medium text-white">
                                            <p>TOP {qualified} FINALISTS</p>
                                            <p className="text-base font-normal uppercase">({contest.contest_scoring_type})</p>
                                            <p className="mt-4">{criteriaName}</p>
                                        </div>
                                    </div>
                                    <CriteriaSectionFinalResultTeam key={idx} criteriaName={criteriaName} routeCardSr={isPointBasedFinal} />
                                    <CriteriaSectionTeam key={criteriaName} criteriaName={criteriaName} />
                                </div>
                            </TabsContent>
                            <TabsContent value="final-contest">
                                <ResultsTeamSingleRound
                                    contest={contest ?? { contest: [], message: '' }}
                                    // topResult={topResult ?? []}
                                    criteria={criteriaName}
                                    sortedUniqueJudges={sortedUniqueJudges ?? []}
                                />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                );
            })}

            <TabsContent value="final">
                {groupedArray.length > 0 ? (
                    <>
                        <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                            PRINT
                        </Button>
                        <div className="flex flex-col items-center justify-center gap-8" ref={sectionRef}>
                            <div className="flex w-full flex-col gap-2">
                                {scoringMethod == 'Final' && (
                                    <TableRankedFinalTeam
                                        contest={contest ?? { contest: [], message: '' }}
                                        scoringType={`${contest.contest_scoring_type} based`}
                                    />
                                )}

                                {scoringMethod == 'PrelimFinal' && (
                                    <>
                                        <TableRankedFinalTeam
                                            contest={contest ?? { contest: [], message: '' }}
                                            scoringType={`${contest.contest_scoring_type} based`}
                                        />
                                        <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-bold text-white">
                                            <p>Final Score</p>
                                        </div>
                                        <div className="flex w-full gap-2">
                                            <ScoreTableTeam data={groupedArray} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="h-96 text-center text-2xl font-medium">No Result Yet!</p>
                )}
            </TabsContent>
            <TabsContent value="major_awards">
                {(award ?? []).length > 0 ? (
                    <>
                        <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                            PRINT
                        </Button>
                        <div ref={sectionRef}>
                            <ResultHeader contest={contest ?? { contest: [], message: '' }} />
                            <div className="mt-10 flex w-full flex-col items-center justify-center gap-2">
                                <div className="w-full border-2 border-b-black" />
                                <p className="font-serif text-2xl font-bold uppercase">MAJOR AWARDS</p>
                                <div className="w-full border-2 border-b-black" />
                                {award?.map((i, idx) => (
                                    <div key={idx} className="mt-4 flex w-full flex-col items-center justify-center gap-4">
                                        <div className="w-full text-center">
                                            <p className="text-base font-bold">Best in {i.criteria}</p>
                                            <p className="text-sm">Category</p>
                                        </div>

                                        <div className="flex w-full justify-evenly">
                                            <div>
                                                <p className="font-bold uppercase">Team No. {i.top_male?.participant?.participant_no}</p>
                                                <p className="text-center">Team</p>
                                            </div>
                                        </div>

                                        <div className="w-full border-2 border-dashed border-b-black" />
                                    </div>
                                ))}
                                <div>
                                    <ResultFooter sortedUniqueJudges={sortedUniqueJudges ?? []} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="h-96 text-center text-2xl font-medium">No Result Yet!</p>
                )}
            </TabsContent>
            <TabsContent value="top_results">
                {(top ?? []).length > 0 ? (
                    <>
                        <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                            PRINT
                        </Button>
                        <div ref={sectionRef}>
                            <ResultHeader contest={contest ?? { contest: [], message: '' }} />
                            <div className="mt-10 flex w-full flex-col items-center justify-center gap-2">
                                <div className="w-full border-2 border-b-black" />
                                <p className="font-serif text-2xl font-bold uppercase">TOP {qualified} RESULTS</p>
                                <div className="w-full border-2 border-b-black" />
                                <div className="mt-10 mb-10 text-center">
                                    <p className="font-serif text-2xl font-bold uppercase">TOP {qualified} FINALISTS</p>
                                    <p>Category</p>
                                </div>
                                <div className="flex w-full">
                                    {top?.map((i, idx) => (
                                        <div key={idx} className="mt-4 flex w-full flex-col items-center justify-center gap-8">
                                            {i.top_team?.participant?.team_participant_no.length > 0 && (
                                                <>
                                                    <div className="flex w-full justify-evenly">
                                                        <div>
                                                            <p className="font-bold uppercase">
                                                                Team No. {i.top_team?.participant?.team_participant_no}
                                                            </p>
                                                            <p className="text-center">Team</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full border-2 border-dashed border-b-black" />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full">
                                    <ResultFooter sortedUniqueJudges={sortedUniqueJudges ?? []} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="h-96 text-center text-2xl font-medium">No Result Yet!</p>
                )}
            </TabsContent>
            <TabsContent value="final_results">
                {scoringMr && (topResultMr ?? []).length > 0 && (
                    <>
                        <ResultsTeam
                            contest={contest ?? { contest: [], message: '' }}
                            topResult={topResultMr ?? []}
                            sortedUniqueJudges={sortedUniqueJudges ?? []}
                        />
                    </>
                )}
                {(topResultMr?.length ?? 0) < 1 && <p className="h-96 text-center text-2xl font-medium">No Result Yet!</p>}
            </TabsContent>

            {sortedUniqueJudges?.map((i, index) => (
                <TabsContent value={i.judges.name} key={index}>
                    <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                        PRINT
                    </Button>
                    <div className="space-y-10" ref={sectionRef}>
                        <ResultHeader contest={contest ?? { contest: [], message: '' }} />
                        <h2 className="text-center text-4xl">{i.judges?.name}</h2>
                        <JudgesResultTeam
                            judgeId={i.judges.id}
                            judgeName={i.judges.name}
                            judgeRole={i.judges?.role}
                            judgeNumber={i.judges?.judge_number}
                        />
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
}
