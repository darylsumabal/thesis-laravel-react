import { CriteriaInfos } from '@/api/criteria';
import CardContent from '@/components/card/CardContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { SCORING_FIELDS } from '@/lib/constant/scoring';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import ViewMultipleRound, { PROPS } from './ViewMultipleRound';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Criteria',
        href: '/criteria',
    },
];

export default function IndexCard() {
    const { criteriaInfo, criteria, contest, judgesCriteria, prelimFinal, qualified, judges, roundScore, participant, prelimMethod } =
        usePage<PROPS>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criteria" />
            <Tabs defaultValue="criteria">
                <TabsList>
                    <TabsTrigger value="criteria">Criteria</TabsTrigger>
                    <TabsTrigger value="contest">Contest Info</TabsTrigger>
                </TabsList>
                <TabsContent value="criteria" className="w-full">
                    <ViewMultipleRound
                        roundScore={roundScore}
                        criteria={criteria}
                        contest={contest}
                        judgesCriteria={judgesCriteria}
                        prelimFinal={prelimFinal}
                        qualified={qualified}
                        judges={judges}
                        participant={participant}
                        prelimMethod={prelimMethod}
                    />
                </TabsContent>
                <TabsContent value="contest">
                    {criteriaInfo?.map((item: CriteriaInfos) => (
                        <CardContent
                            key={item.id}
                            item={{
                                id: item.id,
                                poster: item.contest.contest_poster,
                            }}
                            fullItem={item.contest}
                            fields={SCORING_FIELDS as []}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
