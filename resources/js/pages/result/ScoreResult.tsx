import { Contests } from '@/api/contest';
import { JudgesGroups } from '@/api/result';
import CriteriaSection from '@/components/criteria/CriteriaSection';
import CriteriaSectionFinalResult from '@/components/criteria/CriteriaSectionFinalResult';
import JudgesResult from '@/components/judge/JudgesResult';
import ResultFooter from '@/components/result/ResultFooter';
import ResultHeader from '@/components/result/ResultHeader';
import Results from '@/components/result/Results';
import ResultSingleRound from '@/components/result/ResultSingleRound';
import ScoreTable, { ParticipantScore } from '@/components/score/ScoreTable';
import TableRankedFinal from '@/components/table/TableRankedFinal';
import { JudgeScore, MajorAward } from '@/components/table/TableResultTest';
import { JudgeScoreTest } from '@/components/table/TableResultType';
import TableResultTypeMultiple from '@/components/table/TableResultTypeMultiple';
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

export default function ScoreResult() {
    const { rounds, contest, final, qualified, result, award, top, finalTopResult, finalResults, scoringMethod, groupId, contestId } =
        usePage<PROPS>().props;

    const finalResult = final?.flatMap((r) => r.judges_score) ?? [];

    const grouped = finalResult.reduce<Record<number, ParticipantScore>>((acc, item) => {
        const { participant_id } = item;

        if (!acc[participant_id]) {
            acc[participant_id] = {
                participant_id,
                participant_no: item.participant_no,
                participant_gender: item.participant_gender,
                total: item.total,
                final_rank: '',
                scores: [],
            };
        }

        acc[participant_id].scores.push({
            criteria: item.criteria,
            score: item.score,
            round_score: item.round_score,
            id: item.id,
        });
        if (item.criteria === 'Final') {
            acc[participant_id].final_rank = item.final_rank;
        }
        return acc;
    }, {});

    const groupedArray = Object.values(grouped);

    const maleParticipants = groupedArray.filter((p) => p.participant_gender === 'Male');

    const femaleParticipants = groupedArray.filter((p) => p.participant_gender === 'Female');

    const sortedUniqueJudges = rounds?.preliminary?.judge_group
        // Remove duplicate
        ?.filter((value, index, self) => index === self.findIndex((j) => j.judges.name === value.judges.name))
        // Assign index first
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
    // Then sort by that assigned index
    // ?.sort((a, b) => a.judgeIndex - b.judgeIndex);

    const data: JudgeScore[] = result?.flatMap((r) => r.judges_score) ?? [];

    const criteria = [...new Set(data?.map((item) => item.criteria))];

    const genders = [...new Set(data?.map((item) => item.gender_category))];

    const sectionRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({ contentRef: sectionRef });

    // const topResult = (pointCardSr || rankCardSr) && finalTopSingleResult;
    const scoringMr = scoreMap[contest.contest_scoring_type] === 'mr';

    const scoringSr = scoreMap[contest.contest_scoring_type] === 'sr';

    const isPointBasedFinal = scoringTypeMap[contest.contest_scoring_type] === 'point_based';

    const topResultMr = scoringMr && scoringMethod === 'Final' ? finalTopResult : finalResults;

    return (
        <Tabs defaultValue="" className="mt-4 w-full">
            <ScrollArea className="rounded-md">
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

                            {sortedUniqueJudges?.map((i) => {
                                const refreshByJudge = () => {
                                    const promise = new Promise((resolve, reject) => {
                                        router.get(
                                            `/result/${contestId}/${groupId}/individual`,
                                            {
                                                judgeId: i.judges.id, // ✅ PASSED TO BACKEND
                                            },
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
                                        loading: `Loading result ${i.judges.name}}`,
                                        success: 'Data loaded!',
                                        error: 'An error occurred.',
                                    });
                                };
                                return (
                                    <TabsTrigger onClick={refreshByJudge} key={i.id} value={i.judges.name}>
                                        <p className="uppercase" key={i.id}>
                                            {i.judges.name}
                                        </p>
                                    </TabsTrigger>
                                );
                            })}
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
                                            `/result/${contestId}/${groupId}/individual`,
                                            { award: 1 },
                                            {
                                                preserveScroll: true,
                                                preserveState: true,
                                                replace: false,
                                                onFinish: (page) => {
                                                    // Dismiss the loading toast when done
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
                                        success: 'Data loaded!',
                                        error: 'An error occurred.',
                                    });
                                }}
                            >
                                MAJOR AWARDS
                            </TabsTrigger>
                            <TabsTrigger value="top_results">TOP {qualified} RESULTS</TabsTrigger>
                            <TabsTrigger value="final_results">FINAL RESULTS</TabsTrigger>
                            {sortedUniqueJudges?.map((i) => {
                                const refreshByJudge = () => {
                                    const promise = new Promise((resolve, reject) => {
                                        router.get(
                                            `/result/${contestId}/${groupId}/individual`,
                                            {
                                                judgeId: i.judges.id, // ✅ PASSED TO BACKEND
                                            },
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
                                        loading: `Loading result ${i.judges.name}`,
                                        success: 'Data loaded!',
                                        error: 'An error occurred.',
                                    });
                                };
                                return (
                                    <TabsTrigger onClick={refreshByJudge} key={i.id} value={i.judges.name}>
                                        <p className="uppercase" key={i.id}>
                                            {i.judges.name}
                                        </p>
                                    </TabsTrigger>
                                );
                            })}
                        </>
                    )}
                </TabsList>
                <ScrollBar orientation="horizontal" className="bg-slate-100" />
            </ScrollArea>
            <TabsContent value="preliminary">
                <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                    PRINT
                </Button>
                <div ref={sectionRef}>
                    {scoringMr && (
                        <TableResultTypeMultiple
                            contest={contest ?? { contest: [], message: '' }}
                            scoringType={`${contest.contest_scoring_type}`}
                            genderCategory={genders}
                        />
                    )}

                    {criteria.map((criteriaName) => (
                        <CriteriaSection key={criteriaName} criteriaName={criteriaName} genders={genders} />
                    ))}
                </div>
            </TabsContent>

            {criteria.map((criteriaName, idx) => {
                const refreshByCriteria = () => {
                    const promise = new Promise((resolve, reject) => {
                        router.get(
                            `/result/${contestId}/${groupId}/individual`,
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
                        loading: `Loading result ${criteriaName}`,
                        success: 'Data loaded!',
                        error: 'An error occurred.',
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
                                        <ResultHeader contest={contest ?? []} />
                                        <div className="mt-14 mb-10 text-center text-3xl font-medium">
                                            <p>CONSOLIDATED RESULT</p>
                                        </div>
                                        <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-medium text-white">
                                            <p className="uppercase">Top {qualified} Finalists</p>
                                            <p className="text-base font-normal uppercase">({contest.contest_scoring_type})</p>
                                            <p className="mt-4">{criteriaName}</p>
                                        </div>
                                    </div>
                                    <CriteriaSectionFinalResult
                                        key={idx}
                                        criteriaName={criteriaName}
                                        genders={genders}
                                        routeCardSr={isPointBasedFinal}
                                    />
                                    <CriteriaSection key={criteriaName} criteriaName={criteriaName} genders={genders} />
                                </div>
                            </TabsContent>
                            <TabsContent value="final-contest">
                                <ResultSingleRound
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
                {maleParticipants.length > 0 || femaleParticipants.length > 0 ? (
                    <>
                        <Button className="mb-4 cursor-pointer" onClick={() => handlePrint()}>
                            PRINT
                        </Button>

                        <div className="flex flex-col items-center justify-center gap-8" ref={sectionRef}>
                            <div className="flex w-full flex-col gap-2">
                                {scoringMethod == 'Final' && <TableRankedFinal contest={contest} scoringType={`${contest.contest_scoring_type}`} />}

                                {scoringMethod == 'PrelimFinal' && (
                                    <>
                                        <TableRankedFinal contest={contest} scoringType={`${contest.contest_scoring_type}`} />
                                        <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-bold text-white">
                                            <p className="uppercase">Final Score</p>
                                        </div>
                                        <div className="flex w-full flex-col gap-4 xl:flex-row">
                                            {maleParticipants.length > 0 && <ScoreTable data={maleParticipants} gender="Male" />}
                                            {femaleParticipants.length > 0 && <ScoreTable data={femaleParticipants} gender="Female" />}
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
                                <p className="font-serif text-2xl font-bold uppercase">Major Awards</p>
                                <div className="w-full border-2 border-b-black" />
                                {award?.map((i, index) => (
                                    <div key={index} className="mt-4 flex w-full flex-col items-center justify-center gap-4">
                                        <div className="w-full text-center">
                                            <p className="text-base font-bold uppercase">Best in {i.criteria}</p>
                                            <p className="text-sm">Category</p>
                                        </div>

                                        <div className="flex w-full justify-evenly">
                                            {i.top_male?.participant?.participant_no?.length > 0 && (
                                                <div>
                                                    <p className="font-bold uppercase">Candidate No. {i.top_male?.participant?.participant_no}</p>
                                                    <p className="text-center">Male</p>
                                                </div>
                                            )}
                                            {i.top_female?.participant?.participant_no?.length > 0 && (
                                                <div>
                                                    <p className="font-bold uppercase">Candidate No. {i.top_female?.participant?.participant_no}</p>
                                                    <p className="text-center">Female</p>
                                                </div>
                                            )}
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
                                <p className="font-serif text-2xl font-bold uppercase">Top {qualified} Results</p>
                                <div className="w-full border-2 border-b-black" />
                                <div className="mt-10 mb-10 text-center">
                                    <p className="font-serif text-2xl font-bold uppercase">Top {qualified} Finalist</p>
                                    <p>Category</p>
                                </div>
                                <div className="flex w-full">
                                    {top?.map((i, idx) => (
                                        <div key={idx} className="mt-4 flex w-full flex-col items-center justify-center gap-8">
                                            {i.top_male?.participant?.participant_no.length > 0 && (
                                                <>
                                                    <div className="flex w-full justify-evenly">
                                                        <div>
                                                            <p className="font-bold uppercase">
                                                                Candidate No. {i.top_male?.participant?.participant_no}
                                                            </p>
                                                            <p className="text-center">Male</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full border-2 border-dashed border-b-black" />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex w-full">
                                    {top?.map((i, index) => (
                                        <div className="mt-4 flex w-full flex-col items-center justify-center gap-8" key={index}>
                                            {i.top_female?.participant?.participant_no.length > 0 && (
                                                <>
                                                    <div className="flex w-full justify-evenly">
                                                        <div>
                                                            <p className="font-bold uppercase">
                                                                Candidate No. {i.top_female?.participant?.participant_no}
                                                            </p>
                                                            <p className="text-center">Female</p>
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
                    <Results
                        contest={contest ?? { contest: [], message: '' }}
                        topResult={topResultMr ?? []}
                        sortedUniqueJudges={sortedUniqueJudges ?? []}
                        pointBasedFinal={isPointBasedFinal}
                    />
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
                        <JudgesResult
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
