import { CriteriaInfos } from '@/api/criteria';
import { Button } from '@/components/ui/button';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<CriteriaInfos>[] = [
    {
        //if using accessorFN must have the id
        //if using accessorKey must use the get value directly
        accessorFn: (r) => r.contest.event.name,
        id: 'name',
        header: 'Event',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_name,
        id: 'contest_name',
        header: 'Contest',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_name')}</div>,
    },
    {
        accessorFn: (r) => r.contest.event.date,
        id: 'date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Event Date
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => {
            const formattedDated = row.original.contest.event.date;

            const formatted = new Date(formattedDated).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            return <div className="text-base">{formatted}</div>;
        },
    },
    {
        accessorFn: (r) => r.contest.contest_date,
        id: 'contest_date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Contest Date
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => {
            const formattedDated = row.original.contest.contest_date;

            const formatted = new Date(formattedDated).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            return <div className="text-base">{formatted}</div>;
        },
    },
];
