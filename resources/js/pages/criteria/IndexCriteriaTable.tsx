import { CriteriaInfos } from '@/api/criteria';
import TableAction from '@/components/ActionTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { columns, columnsArchive } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Criteria List',
        href: '/criteria',
    },
];

type PROPS = {
    criteria: CriteriaInfos[];
    archivedCriteria: CriteriaInfos[];
};

export default function IndexCriteriaTable() {
    const { criteria, archivedCriteria } = usePage<PROPS>().props;

    const [archive, setArchived] = useState(false);

    const handleClick = (id: string, contest_scoring_type?: string, contest_id?: string, group_id?: string) => {
        router.visit(`/criteria/criteria-list/${contest_id}/${group_id}`);
    };

    const handleArchive = () => {
        setArchived(!archive);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Criteria" />
            {!archive ? (
                <TableAction
                    // isPending={isPending}
                    data={criteria || []}
                    columns={columns}
                    handleClick={handleClick}
                    placeholder="Search contest..."
                    searchInput="contest_name"
                    enableArchive={true}
                    isArchive={archive}
                    handleArchive={handleArchive}
                />
            ) : (
                <TableAction
                    // isPending={pendingArchive}
                    data={archivedCriteria || []}
                    columns={columnsArchive}
                    handleClick={handleClick}
                    placeholder="Search archive contest..."
                    searchInput="contest_name"
                    enableArchive={true}
                    isArchive={archive}
                    handleArchive={handleArchive}
                />
            )}
        </AppLayout>
    );
}
