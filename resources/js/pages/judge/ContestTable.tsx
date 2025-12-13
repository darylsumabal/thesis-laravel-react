import TableAction from '@/components/ActionTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { columns } from './column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contest List',
        href: '/contest',
    },
];

export default function JudgeContestTable() {
    const { criteria } = usePage().props;

    const handleClick = (_id: string, _contest_scoring_type?: string, contest_id?: string, group_id?: string) => {
        router.visit(`/judging/criteria-list/${contest_id}/${group_id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contest List" />
            <TableAction
                data={criteria.data || []}
                handleClick={handleClick}
                searchInput="contest_name"
                columns={columns}
                links={criteria.links}
                pagination={{
                    currentPage: criteria.current_page,
                    lastPage: criteria.last_page,
                    perPage: criteria.per_page,
                    total: criteria.total,
                }}
            />
        </AppLayout>
    );
}
