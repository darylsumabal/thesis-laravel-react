import { Contests } from '@/api/contest';
import { JudgesGroups } from '@/api/result';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { scoreMap, scoringTypeMap } from '@/lib/constant/contest';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Loader2, NotebookPen } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ScoreResult from '../ScoreResult';
import ScoreResultTeam from '../ScoreResultTeam';

type JudgeData = {
    judge: {
        id: number;
        name: string;
        judge_number: string;
    };
    scores: Record<string, JudgeItem>; // ✅ if it's just Finished/Unfinished
};

type JudgeItem = {
    judges: { id: number; name: string; judge_number: string };
    criteria: string;
    is_finished: boolean;
    can_edit: boolean | number;
};

export type PROPS = {
    rounds: JudgesGroups;
    contest: Contests;
};

export default function Judges() {
    const { rounds, contest, contestType, contestId, groupId } = usePage<PROPS>().props;

    const scoringType = scoreMap[contest.contest_scoring_type || ''];
    const resultType = scoringTypeMap[contest.contest_scoring_type || ''];
    const [loadingTabulate, setLoadingTabulate] = useState(false);
    const [loadingTabulateFinal, setLoadingTabulateFinal] = useState(false);

    // const isJudgePreliminary = rounds?.preliminary?.is_finished;
    // const isJudgeFinal = rounds?.final?.is_finished;

    useEcho('submit-score', 'JudgeSubmit', (event: { contestId: number; groupId: number; judgeName: string }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.reload({
                        only: ['rounds'],
                        onFinish: () => resolve('success'),
                        onError: () => reject('error'),
                    });
                }),
                {
                    loading: 'Refreshing...',
                    success: `Judge ${event.judgeName} submitted a score!`,
                    error: 'Failed to refresh results',
                },
            );
        }
    });

    useEcho('request-edit', 'RequestEdit', (event: { contestId: number; groupId: number; judgeId: number; judgeName: string; action: string }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            if (event.action === 'request') {
                toast.success(`Judge ${event.judgeName} requested to edit scores`);
            }

            router.reload({
                only: ['judge', 'rounds'],
            });
        }
    });

    const judgesData = rounds?.preliminary?.judge_group.sort((a, b) => {
        const judgeNumA = parseInt(a.judges.judge_number) || 999;
        const judgeNumB = parseInt(b.judges.judge_number) || 999;
        return judgeNumA - judgeNumB;
    });

    const inertiaPost = (url: string, data = {}) =>
        new Promise((resolve, reject) => {
            router.post(url, data, {
                preserveScroll: true,
                onSuccess: resolve,
                onError: reject,
            });
        });

    const judgesDataFinal = rounds?.final?.judge_group.sort((a, b) => {
        const judgeNumA = parseInt(a.judges.judge_number) || 999;
        const judgeNumB = parseInt(b.judges.judge_number) || 999;
        return judgeNumA - judgeNumB;
    });

    const handleTabulate = () => {
        const roundType = 'Preliminary';
        setLoadingTabulate(true);
        const url =
            scoringType === 'mr' && contestType === 'Individual'
                ? `/result/multiple-round/individual/${contestId}/${groupId}/${resultType}`
                : scoringType === 'sr' && contestType === 'Individual'
                  ? `/result/single-round/individual/${contestId}/${groupId}/${resultType}`
                  : scoringType === 'mr' && contestType === 'Team'
                    ? `/result/multiple-round/team/${contestId}/${groupId}/${resultType}`
                    : `/result/single-round/team/${contestId}/${groupId}/${resultType}`;

        return toast.promise(
            inertiaPost(url, { roundType }).finally(() => setLoadingTabulate(false)),
            {
                loading: 'Score is being tabulated...',
                success: 'Score Tabulated',
                error: 'Failed to tabulate score.',
            },
        );
    };

    const handleTabulateFinal = () => {
        const roundType = 'Final';
        setLoadingTabulateFinal(true);
        return toast.promise(
            (async () => {
                // MR + Individual
                if (scoringType === 'mr' && contestType === 'Individual') {
                    await inertiaPost(`/result/multiple-round/individual/${contestId}/${groupId}/${resultType}`, { roundType });
                }

                // MR + Team
                if (scoringType === 'mr' && contestType === 'Team') {
                    await inertiaPost(`/result/multiple-round/team/${contestId}/${groupId}/${resultType}`, { roundType });
                }

                // Always run final
                await inertiaPost(`/result/final/${contestId}/${groupId}/${resultType}`);

                return 'Score Tabulated successfully!';
            })().finally(() => setLoadingTabulateFinal(false)),
            {
                loading: 'Score is being tabulated...',
                success: 'Score tabulated successfully',
                error: 'Failed to tabulate score.',
            },
        );
    };

    const grouped = judgesData?.reduce<{ preliminary: JudgeItem[] }>(
        (acc, item) => {
            acc.preliminary.push(item as unknown as JudgeItem);
            return acc;
        },
        { preliminary: [] },
    );
    const sortedPreliminaryJudges = Object.values(
        grouped?.preliminary?.reduce<Record<number, JudgeData>>((acc, item) => {
            const judgeId = item.judges.id;
            if (!acc[judgeId]) {
                acc[judgeId] = { judge: item.judges, scores: {} };
            }
            acc[judgeId].scores[item.criteria] = {
                judges: item.judges,
                criteria: item.criteria,
                is_finished: item.is_finished,
                can_edit: item.can_edit,
            };
            return acc;
        }, {}) || {},
    ).sort((a, b) => {
        const judgeNumA = parseInt(a.judge.judge_number) || 999;
        const judgeNumB = parseInt(b.judge.judge_number) || 999;
        return judgeNumA - judgeNumB;
    });

    const groupedFinal = judgesDataFinal?.reduce<{ final: JudgeItem[] }>(
        (acc, item) => {
            acc.final.push(item as unknown as JudgeItem);
            return acc;
        },
        { final: [] },
    );

    const sortedFinalJudges = Object.values(
        groupedFinal?.final?.reduce<Record<number, JudgeData>>((acc, item) => {
            const judgeId = item.judges.id;
            if (!acc[judgeId]) {
                acc[judgeId] = { judge: item.judges, scores: {} };
            }
            acc[judgeId].scores[item.criteria] = {
                judges: item.judges,
                criteria: item.criteria,
                is_finished: item.is_finished,
                can_edit: item.can_edit,
            };
            return acc;
        }, {}) || {},
    ).sort((a, b) => {
        const judgeNumA = parseInt(a.judge.judge_number) || 999;
        const judgeNumB = parseInt(b.judge.judge_number) || 999;
        return judgeNumA - judgeNumB;
    });

    const [loadingButton, setLoadingButton] = useState<string | null>(null);

    const handleEnabled = (judgeId: number, criteria: string) => {
        const id = `${judgeId}-${criteria}`;
        setLoadingButton(id);

        const promise = new Promise((resolve, reject) => {
            router.post(
                `/judging/edit-score/${contestId}/${groupId}/${judgeId}`,
                { criteria, approved: 0 },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        resolve(page);
                        setLoadingButton(null);
                    },
                    onError: (errors) => {
                        reject(errors);
                        setLoadingButton(null);
                    },
                },
            );
        });

        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Judge enabled',
            error: 'Judge enabled failed',
        });
    };

    return (
        <div className="w-full">
            <Card className="p-4">
                <h2 className="mb-4 text-lg font-bold">JUDGES OVERVIEW</h2>
                <div>
                    <h3 className="text-md mb-2 font-semibold uppercase">{scoringType === 'mr' && 'Preliminary Round Judges'}</h3>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-t uppercase">
                                <TableHead>JUDGES</TableHead>
                                {grouped?.preliminary
                                    ?.map((i) => i.criteria)
                                    .filter((v, i, a) => a.indexOf(v) === i)
                                    .map((criteria, index) => (
                                        <React.Fragment key={index}>
                                            <TableHead>{criteria}</TableHead>
                                            <TableHead className="w-1/12">ACTION</TableHead>
                                        </React.Fragment>
                                    ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="border-b">
                            {sortedPreliminaryJudges.map((judgeData) => (
                                <TableRow key={judgeData.judge.id}>
                                    <TableCell className="uppercase">{judgeData.judge.name}</TableCell>
                                    {grouped?.preliminary
                                        ?.map((i) => i.criteria)
                                        .filter((v, i, a) => a.indexOf(v) === i)
                                        .map((criteria, index) => {
                                            const buttonId = `${judgeData.judge.id}-${criteria}`;
                                            const isThisButtonLoading = loadingButton === buttonId;
                                            const scoreData = judgeData.scores[criteria];
                                            return (
                                                <React.Fragment key={index}>
                                                    <TableCell key={index}>
                                                        <div className="flex items-center justify-between uppercase">
                                                            <p>{scoreData?.is_finished ? 'Submitted' : 'Pending'}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            className={`relative cursor-pointer ${
                                                                scoreData?.is_finished ? 'border-l bg-emerald-600' : 'bg-destructive border-l'
                                                            }`}
                                                            onClick={() => handleEnabled(judgeData.judge.id, criteria)}
                                                            disabled={!scoreData?.is_finished}
                                                        >
                                                            {isThisButtonLoading && <Loader2 className="animate-spin" />}
                                                            {scoreData?.can_edit === 1 && (
                                                                <Badge className="absolute -top-2.5 -right-2.5 min-w-5 bg-[#45226b] px-1">
                                                                    <NotebookPen color="white" />
                                                                </Badge>
                                                            )}
                                                            ENABLED
                                                        </Button>
                                                    </TableCell>
                                                </React.Fragment>
                                            );
                                        })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button disabled={loadingTabulate} className="mt-2 w-full cursor-pointer" onClick={handleTabulate}>
                        {loadingTabulate && <Loader2 className="mr-2 animate-spin" />}
                        TABULATE
                    </Button>
                </div>

                {scoringType === 'mr' && (
                    <div className="mb-6">
                        <h3 className="text-md mb-2 font-semibold uppercase">Final Round Judges</h3>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-t uppercase">
                                    <TableHead>JUDGE</TableHead>
                                    {groupedFinal?.final
                                        ?.map((i) => i.criteria)
                                        .filter((v, i, a) => a.indexOf(v) === i)
                                        .map((criteria, index) => (
                                            <React.Fragment key={index}>
                                                <TableHead>{criteria}</TableHead>
                                                <TableHead className="w-1/12">ACTION</TableHead>
                                            </React.Fragment>
                                        ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody className="border-b">
                                {sortedFinalJudges.map((judgeData) => (
                                    <TableRow key={judgeData.judge.id}>
                                        <TableCell className="uppercase">{judgeData.judge.name}</TableCell>
                                        {groupedFinal?.final
                                            ?.map((i) => i.criteria)
                                            .filter((v, i, a) => a.indexOf(v) === i)
                                            .map((criteria, index) => {
                                                const buttonId = `${judgeData.judge.id}-${criteria}`;
                                                const isThisButtonLoading = loadingButton === buttonId;
                                                const scoreData = judgeData.scores[criteria];
                                                return (
                                                    <React.Fragment key={index}>
                                                        <TableCell key={index}>
                                                            <div className="flex items-center justify-between uppercase">
                                                                <p>{scoreData?.is_finished ? 'Submitted' : 'Pending'}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                className={`relative cursor-pointer ${
                                                                    scoreData?.is_finished ? 'border-l bg-emerald-600' : 'bg-destructive border-l'
                                                                }`}
                                                                onClick={() => handleEnabled(judgeData.judge.id, criteria)}
                                                                disabled={!scoreData?.is_finished}
                                                            >
                                                                {isThisButtonLoading && <Loader2 className="animate-spin" />}
                                                                {scoreData?.can_edit === 1 && (
                                                                    <Badge className="absolute -top-2.5 -right-2.5 min-w-5 bg-[#45226b] px-1">
                                                                        <NotebookPen color="white" />
                                                                    </Badge>
                                                                )}
                                                                ENABLED
                                                            </Button>
                                                        </TableCell>
                                                    </React.Fragment>
                                                );
                                            })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button disabled={loadingTabulateFinal} className="mt-2 w-full cursor-pointer" onClick={handleTabulateFinal}>
                            {loadingTabulateFinal && <Loader2 className="mr-2 animate-spin" />}
                            TABULATE
                        </Button>
                    </div>
                )}
            </Card>
            {contestType === 'Individual' && <ScoreResult />}
            {contestType === 'Team' && <ScoreResultTeam />}
        </div>
    );
}
