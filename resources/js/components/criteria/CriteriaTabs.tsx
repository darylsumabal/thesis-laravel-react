import { router, usePage } from '@inertiajs/react';
import { Card } from '../ui/card';

import { useContextUser } from '@/context/ContesxtProvider';
import { useEcho } from '@laravel/echo-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CriteriaGroupWrapper, CriteriaTests } from './CriteriaGroupWrapper';

export function CriteriaTabs({ criteriaGroups }: { criteriaGroups: CriteriaTests[] }) {
    const { participants, poster, rounds, contestId, groupId } = usePage().props;
    const maleParticipants = participants?.filter((p) => p.gender === 'Male');
    const femaleParticipants = participants?.filter((p) => p.gender === 'Female');
    const { pendingSubmitScore } = useContextUser();
    const isPreliminaryFinished = rounds?.preliminary?.is_finished || false;

    useEcho('submit-score', 'JudgeSubmit', (event: { contestId: number; groupId: number }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            router.reload({
                only: ['rounds', 'criteriaGroups', 'participants'],
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
                <div>
                    <div>
                        {poster ? (
                            <img src={`/storage/${poster}`} className="h-96 w-full rounded-md object-cover object-center" alt="poster" />
                        ) : (
                            <img src="photo" className="h-96 w-full rounded-md bg-gray-200 object-cover object-center text-black" alt="poster.img" />
                        )}
                    </div>
                    <div className="flex w-full gap-6 py-4">
                        {maleParticipants && maleParticipants?.length > 0 && (
                            <Card className="w-full p-4">
                                <h2 className="mb-4 text-center text-xl font-bold">Male Candidates</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {maleParticipants && maleParticipants?.length > 0 ? (
                                        maleParticipants?.map((p, index) => (
                                            <div key={index} className="rounded border p-4 text-center shadow-md">
                                                <p className="font-semibold">Candidate No. {p.participant_no}</p>
                                                {p.poster_url ? (
                                                    <img src={`/storage/${p.poster_url}`} className="mx-auto h-48 w-48 rounded-md" alt="" />
                                                ) : (
                                                    <img src="photo" className="mx-auto h-48 w-48 rounded-md bg-white text-black" alt="" />
                                                )}

                                                <p>
                                                    {p.first_name} {p.last_name}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-center text-gray-500">No male candidates</p>
                                    )}
                                </div>
                            </Card>
                        )}
                        {femaleParticipants && femaleParticipants?.length > 0 && (
                            <Card className="w-full p-4">
                                <h2 className="mb-4 text-center text-xl font-bold">Female Candidates</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {femaleParticipants && femaleParticipants?.length > 0 ? (
                                        femaleParticipants?.map((p, index) => (
                                            <div key={index} className="rounded border p-4 text-center shadow-md">
                                                <p className="font-semibold">Candidate No. {p.participant_no}</p>
                                                <img src={`/storage/${poster}`} className="mx-auto h-48 w-48 rounded-md" alt="" />
                                                <p>
                                                    {p.first_name} {p.last_name}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="col-span-2 text-center text-gray-500">No female candidates</p>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </TabsContent>
            {criteriaGroups.map((group, index) => (
                <TabsContent key={index} value={group.criteria}>
                    <CriteriaGroupWrapper group={group} criteriaGroup={group} />
                </TabsContent>
            ))}
        </Tabs>
    );
}
