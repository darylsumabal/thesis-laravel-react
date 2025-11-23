import { useContextUser } from '@/context/ContesxtProvider';
import { CriteriaTestsTeam } from '@/pages/judge/CriteriaJudgingTeam';
import { usePage } from '@inertiajs/react';
import { Card } from '../ui/card';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CriteriaGroupWrapperTeam } from './CriteriaGroupWrapperTeam';

export function CriteriaTabsTeam({ criteriaGroups }: { criteriaGroups: CriteriaTestsTeam[] }) {
    const { teamParticipants, poster } = usePage().props;

    const { pendingSubmitScore } = useContextUser();
    return (
        <Tabs defaultValue={criteriaGroups[0]?.criteria} className="mt-4 w-full">
            <ScrollArea className="flex w-full items-center justify-center">
                <TabsList className="mx-auto flex w-fit items-center justify-center">
                    <TabsTrigger value="candidates" disabled={pendingSubmitScore}>
                        CANDIDATES
                    </TabsTrigger>
                    {criteriaGroups.map((group, index) => {
                        return (
                            <TabsTrigger key={index} value={group.criteria} className="uppercase" disabled={pendingSubmitScore}>
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
                            <img src={`/storage/${poster}`} className="h-96 w-full rounded-md object-cover object-center" alt="poster" />
                        ) : (
                            <img src="photo" className="h-96 w-full rounded-md bg-gray-200 object-cover object-center text-black" alt="poster.img" />
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
                                                <img src={`/storage/${p.poster_url}`} className="mx-auto h-48 w-48 rounded-md" alt="photo.img" />
                                            ) : (
                                                <img src="photo" className="mx-auto h-48 w-48 rounded-md bg-white text-black" alt="photo.img" />
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
