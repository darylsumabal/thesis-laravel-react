import { Event } from '@/api/event';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Action, { ActionArchive } from './Action';

export const columns: ColumnDef<Event>[] = [
    {
        accessorKey: 'name',
        header: 'Event Name',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'venue',
        header: 'Venue',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('venue')}</div>,
    },
    {
        accessorKey: 'date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Date
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => {
            const formattedDated = row.original.date;

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

export const columnsArchive: ColumnDef<Event>[] = [
    {
        accessorKey: 'name',
        header: 'Event Name',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'venue',
        header: 'Venue',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('venue')}</div>,
    },
    {
        accessorKey: 'date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Date
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => {
            const formattedDated = row.original.date;

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
