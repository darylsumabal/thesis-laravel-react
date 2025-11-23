import { CriteriaInfos } from '@/api/criteria';
import TableAction from '@/components/ActionTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { columnResultTable } from './column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Result List',
        href: '/result',
    },
];

type PROPS = {
    criteria: CriteriaInfos[];
    archivedCriteria: CriteriaInfos[];
};

export default function IndexResultTable() {
    const { criteria, archivedCriteria } = usePage<PROPS>().props;

    const [archive, setArchived] = useState(false);

    const handleClick = (
        id: string,
        _contest_scoring_type?: string,
        contest_id?: string,
        group_id?: string,
        contest?: {
            contest_scoring_type: string;
            contest_type: string;
        },
    ) => {
        router.visit(`/result/${contest_id}/${group_id}/${contest?.contest_type.toLocaleLowerCase()}`);
    };

    const handleArchive = () => {
        setArchived(!archive);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Result List" />
            {/* {!archive ? (
               
            ) : (
                <TableAction
                    placeholder="Search contest..."
                    data={archivedCriteria || []}
                    columns={columnResultTableArchive}
                    handleClick={handleClick}
                    searchInput="contest_name"
                    enableArchive={false}
                    isArchive={archive}
                    handleArchive={handleArchive}
                />
            )}
             */}
            <TableAction
                placeholder="Search contest..."
                data={criteria || []}
                columns={columnResultTable}
                handleClick={handleClick}
                searchInput="contest_name"
                enableArchive={false}
                isArchive={archive}
                handleArchive={handleArchive}
            />
        </AppLayout>
    );
}
