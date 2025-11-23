import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timeline } from '@/components/ui/timeline';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Judges from './judge/Judges';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Result Overview',
        href: '/result',
    },
];

const Result = () => {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Result Overview" />
            <Tabs defaultValue="judging">
                <TabsList>
                    <TabsTrigger value="judging">RESULT</TabsTrigger>
                    <TabsTrigger value="activity">ACTIVITY</TabsTrigger>
                </TabsList>
                <TabsContent value="judging">
                    <Judges />
                </TabsContent>
                <TabsContent value="activity">
                    <Timeline />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
};

export default Result;
