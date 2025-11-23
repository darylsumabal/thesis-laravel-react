// import { Button } from '@/components/ui/button';
// import { ColumnDef } from '@tanstack/react-table';
// import { ArrowUpDown } from 'lucide-react';
// import { Account } from '@/api/account';
// import AccountCell from './AccountCell';

// export const columns: ColumnDef<Account>[] = [
//     {
//         accessorKey: 'name',
//         header: 'Name',
//         cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
//     },
//     {
//         accessorKey: 'email',
//         header: ({ column }) => {
//             return (
//                 <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
//                     Email
//                     <ArrowUpDown />
//                 </Button>
//             );
//         },
//         cell: ({ row }) => <div className="text-base">{row.getValue('email')}</div>,
//     },
//     {
//         accessorKey: 'role',
//         header: ({ column }) => {
//             return (
//                 <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
//                     Panel
//                     <ArrowUpDown />
//                 </Button>
//             );
//         },
//         cell: ({ row }) => <div className="text-base">{row.getValue('role')}</div>,
//     },
//     {
//         accessorFn: (r) => r.contest?.contest_name,
//         accessorKey: 'contest_name',
//         header: ({ column }) => {
//             return (
//                 <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
//                     Contest Category
//                     <ArrowUpDown />
//                 </Button>
//             );
//         },
//         cell: ({ row }) => <div className="text-base">{row.getValue('contest_name')}</div>,
//     },

//     {
//         id: 'id',
//         header: 'Action',
//         enableHiding: false,
//         cell: ({ row }) => <AccountCell row={row} />,
//     },
// ];

import { Account } from '@/api/account';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import AccountCell from './AccountCell';

// ✅ Change to a function that accepts the delete handler
export const columns: ColumnDef<Account>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'email',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div className="text-base">{row.getValue('email')}</div>,
    },
    {
        accessorKey: 'role',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Panel
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div className="text-base">{row.getValue('role')}</div>,
    },
    {
        accessorFn: (r) => r.contest?.contest_name,
        accessorKey: 'contest_name',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Contest Category
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => <div className="text-base">{row.getValue('contest_name')}</div>,
    },
    {
        id: 'id',
        header: 'Action',
        enableHiding: false,
        cell: ({ row }) => <AccountCell row={row}  />, // ✅ Pass handler
    },
];
