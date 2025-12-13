import { Contests } from '@/api/contest';
import { Participant, TeamParticipant } from '@/api/result';
import CardContent from '@/components/card/CardContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { CONTEST_FIELDS } from '@/lib/constant/contest';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Individual from './Individual';
import Team from './Team';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contest',
        href: '/dashboard',
    },
];

type PROPS = { contestType: 'Team' | 'Individual'; contest: Contests[]; participants: Participant[] | TeamParticipant[]; poster: string };

export default function IndexContestCard({ contestType, contest, participants, poster }: PROPS) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contest" />

            <Tabs defaultValue="contest">
                <TabsList>
                    <TabsTrigger value="contest">Contest</TabsTrigger>
                    <TabsTrigger value="contest-info">Contest Info</TabsTrigger>
                </TabsList>
                {contestType === 'Individual' && (
                    <TabsContent value="contest">
                        <Individual poster={poster} contest={contest} participant={participants as Participant[]} />
                    </TabsContent>
                )}
                {contestType === 'Team' && (
                    <TabsContent value="contest">
                        <Team poster={poster} contest={contest} participant={participants as TeamParticipant[]} />
                    </TabsContent>
                )}
                <TabsContent value="contest-info">
                    {contest?.map((item) => (
                        <CardContent
                            key={item.id}
                            contestEdit={true}
                            item={{
                                id: item.id,
                                poster: item.contest_poster,
                            }}
                            className="w-full"
                            fullItem={item}
                            fields={CONTEST_FIELDS as []}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
