import { CriteriaInfos, Criterion, MultipleCriterion } from '@/api/criteria';
import { Button } from '@/components/ui/button';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Action, { ActionArchive } from './Action';
import { CellPoint, CellRank } from './Cell';

export const columns: ColumnDef<CriteriaInfos>[] = [
    {
        accessorFn: (r) => r.contest.event.name,
        id: 'name',
        // accessorKey: "contest_id",
        header: 'Event',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_name,
        id: 'contest_name',
        // accessorKey: "contest_id",
        header: 'Contest',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_name')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_scoring_type,
        id: 'contest_scoring_type',
        header: 'Scoring Type',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_scoring_type')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_type,
        id: 'contest_type',
        header: 'Contest Type',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_type')}</div>,
    },
    {
        accessorFn: (r) =>
            r.gender_category === 'maleFemale'
                ? 'Male & Female'
                : r.gender_category.charAt(0).toUpperCase() + r.gender_category.slice(1).toLowerCase(),
        id: 'gender_category',
        header: 'Category',
        cell: ({ row }) => {
            const genderCategory = row.getValue('gender_category');

            return <div className="text-base capitalize">{genderCategory ? String(genderCategory) : 'Team'}</div>;
        },
    },
    {
        accessorFn: (r) => r.scoring_method,
        id: 'scoring_method',
        header: 'Scoring Method',
        cell: ({ row }) => {
            const value = row.getValue('scoring_method');
            return <div className="text-base capitalize">{value ? String(value) : 'Single Scoring Method'}</div>;
        },
    },
    // {
    //   accessorFn: (r) => r.contest.contest_venue,
    //   id: "contest_venue",
    //   header: "Contest Venue",
    //   cell: ({ row }) => (
    //     <div className="capitalize text-base">
    //       {row.getValue("contest_venue")}
    //     </div>
    //   ),
    // },
    {
        accessorFn: (r) => r.contest.contest_date,
        id: 'date',
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

            return <div className="text-base capitalize">{formatted}</div>;
        },
    },

    {
        header: 'Action',
        cell: ({ row }) => {
            return <Action row={row} />;
        },
    },
];

export const columnsArchive: ColumnDef<CriteriaInfos>[] = [
    {
        accessorFn: (r) => r.contest.event.name,
        id: 'name',
        // accessorKey: "contest_id",
        header: 'Event',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_name,
        id: 'contest_name',
        // accessorKey: "contest_id",
        header: 'Contest',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_name')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_scoring_type,
        id: 'contest_scoring_type',
        header: 'Scoring Type',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_scoring_type')}</div>,
    },
    {
        accessorFn: (r) => r.contest.contest_type,
        id: 'contest_type',
        header: 'Contest Type',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_type')}</div>,
    },
    {
        accessorFn: (r) =>
            r.contest.contest_gender_category === 'maleFemale'
                ? 'Male & Female'
                : r.contest.contest_gender_category.charAt(0).toUpperCase() + r.contest.contest_gender_category.slice(1).toLowerCase(),
        id: 'gender_category',
        header: 'Category',
        cell: ({ row }) => {
            const genderCategory = row.getValue('gender_category');

            return <div className="text-base capitalize">{genderCategory ? String(genderCategory) : 'Team'}</div>;
        },
    },
    {
        accessorFn: (r) => r.scoring_method,
        id: 'scoring_method',
        header: 'Scoring Method',
        cell: ({ row }) => {
            const value = row.getValue('scoring_method');
            return <div className="text-base capitalize">{value ? String(value) : 'Single Scoring Method'}</div>;
        },
    },
    {
        accessorFn: (r) => r.contest.contest_date,
        id: 'date',
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

            return <div className="text-base capitalize">{formatted}</div>;
        },
    },

    {
        header: 'Action',
        cell: ({ row }) => {
            return <ActionArchive row={row} />;
        },
    },
];

export const columnsCriteriaRank: ColumnDef<Criterion>[] = [
    {
        accessorFn: (item) => item?.evaluation_criteria,
        accessorKey: 'evaluation_criteria',
        header: 'Criteria',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('evaluation_criteria')}</div>,
    },
    {
        accessorFn: (item) => item?.score,
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('score')}</div>,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            return <CellRank row={row} />;
        },
    },
];

export const columnsCriteriaPoint: ColumnDef<Criterion>[] = [
    {
        accessorFn: (item) => item?.evaluation_criteria,
        accessorKey: 'evaluation_criteria',
        header: 'Criteria',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('evaluation_criteria')}</div>,
    },
    {
        accessorFn: (item) => item?.score,
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('score')}</div>,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            return <CellPoint row={row} />;
        },
    },
];

export const column: ColumnDef<MultipleCriterion>[] = [
    {
        header: 'Criteria',
    },
    {
        header: 'Score',
    },
];
