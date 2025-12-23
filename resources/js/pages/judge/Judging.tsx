import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { toast } from 'sonner';
import CriteriaJudging from './CriteriaJudging';
import CriteriaJudgingTeam from './CriteriaJudgingTeam';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Criteria for Judging',
        href: '/criteria',
    },
];

export default function Judging() {
    const { contestType, individualCriteria, teamCriteria, contestId, groupId } = usePage().props;

    useEcho('top-participants', 'TopParticipantsUpdated', (event: { contestId: number; groupId: number }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            toast.promise(
                new Promise((resolve, reject) => {
                    router.reload({
                        only: ['individualCriteria', 'teamCriteria', 'savedCriteria', 'rounds'],
                        onFinish: () => resolve('success'),
                        onError: () => reject('error'),
                    });
                }),
                {
                    loading: 'Refreshing...',
                    success: 'Score tabulated successfully!',
                    error: 'Failed to refresh results',
                },
            );
        }
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criteria" />

            {contestType == 'Individual' && <CriteriaJudging data={individualCriteria ?? []} />}

            {contestType == 'Team' && <CriteriaJudgingTeam data={teamCriteria ?? []} />}
        </AppLayout>
    );
}
