import { useContextUser } from '@/context/ContesxtProvider';
import { imageSrc } from '@/lib/src';
import { CriteriaTestsTeam } from '@/pages/judge/CriteriaJudgingTeam';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Card } from '../ui/card';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CriteriaGroupWrapperTeam } from './CriteriaGroupWrapperTeam';

export function CriteriaTabsTeam({ criteriaGroups }: { criteriaGroups: CriteriaTestsTeam[] }) {
    const { teamParticipants, poster, rounds } = usePage().props;

    const { pendingSubmitScore } = useContextUser();
    const isPreliminaryFinished = rounds?.preliminary?.is_finished || false;
    useEcho('submit-score', 'JudgeSubmit', (event: { contestId: number; groupId: number }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            // toast.promise(
            //     new Promise((resolve, reject) => {

            //     }),
            //     {
            //         loading: 'Refreshing...',
            //         success: 'You can now edit',
            //         error: 'Failed to refresh results',
            //     },
            // );
            router.reload({
                only: ['rounds', 'criteriaGroups', 'teamParticipants'],
            });
        }
    });
    return (
        <Tabs defaultValue={criteriaGroups[0]?.criteria} className="mt-4 w-full">
            <ScrollArea className="flex w-full items-center justify-center">
                <TabsList className="mx-auto flex w-fit items-center justify-center">
                    <TabsTrigger value="candidates" disabled={pendingSubmitScore}>
                        CANDIDATES
                    </TabsTrigger>
                    {criteriaGroups.map((group, index) => {
                        const isFinalRound = group.items?.[0]?.round === 'Final';

                        // Disable if:
                        // 1. There's a pending submit
                        // 2. It's Final Round AND preliminary is not finished
                        const isDisabled = pendingSubmitScore || (isFinalRound && !isPreliminaryFinished);
                        return (
                            <TabsTrigger key={index} value={group.criteria} className="uppercase" disabled={pendingSubmitScore || isDisabled}>
                                {group.criteria}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="candidates">
                <div className="space-y-2">
                    <div>
                        {poster ? (
                            <img src={`${imageSrc}/${poster}`} className="h-96 w-full rounded-md object-center" alt="poster" />
                        ) : (
                            <div className="flex h-96 w-full items-center justify-center rounded-md border-[1px] bg-gray-200 text-black">
                                No Poster Available
                            </div>
                        )}
                    </div>

                    <div>
                        <Card className="w-full p-4">
                            <h2 className="mb-4 text-center text-xl font-bold">Team Candidates</h2>
                            <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
                                {teamParticipants && teamParticipants?.length > 0 ? (
                                    teamParticipants?.map((p, index) => (
                                        <div key={index} className="rounded border p-4 text-center shadow-md">
                                            <p className="font-semibold">No. {p.team_participant_no}</p>

                                            {p.poster_url ? (
                                                <img src={`${imageSrc}/${p.poster_url}`} className="mx-auto h-48 w-48 rounded-md" alt="photo.img" />
                                            ) : (
                                                <div className="flex h-48 w-48 items-center justify-center rounded-md border-[1px] bg-gray-200 text-black">
                                                    No Poster Available
                                                </div>
                                            )}

                                            <p>{p.team_captain}</p>
                                            <p>{p.team_name}</p>
                                            <p>{p.team_description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-2 text-center text-gray-500">No female candidates</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            {teamParticipants &&
                teamParticipants.length > 0 &&
                criteriaGroups.map((group, index) => (
                    <TabsContent key={index} value={group.criteria}>
                        <CriteriaGroupWrapperTeam group={group} criteriaGroup={group} />
                    </TabsContent>
                ))}
        </Tabs>
    );
}
