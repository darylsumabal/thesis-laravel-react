import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import CriteriaJudging from './CriteriaJudging';
import CriteriaJudgingTeam from './CriteriaJudgingTeam';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Criteria for Judging',
        href: '/criteria',
    },
];

export default function Judging() {
    const { contestType, individualCriteria, teamCriteria } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criteria" />

            {contestType == 'Individual' && <CriteriaJudging data={individualCriteria ?? []} />}

            {contestType == 'Team' && <CriteriaJudgingTeam data={teamCriteria ?? []} />}
        </AppLayout>
    );
}
