import { Contests } from '@/api/contest';
import { Button } from '@/components/ui/button';

import { router } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import React from 'react';
import { toast } from 'sonner';

const Action = ({ row }: { row: Row<Contests> }) => {
    // const { archivedContest } = useArchivedContest();

    const handleAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;
        // await archivedContest({ id: id });
        router.post(
            `/contest/archived/${id}`,
            {},
            {
                onSuccess: () => {
                    toast.success('Contest archived successfully!');
                    router.reload({ only: ['contest'] });
                },
                onError: () => {
                    toast.success('An error occurred');
                },
            },
        );
    };

    return (
        <Button className="cursor-pointer font-normal" onClick={handleAccountClick} variant="destructive">
            Archived
        </Button>
    );
};

export default Action;

export const ActionArchive = ({ row }: { row: Row<Contests> }) => {
    // const { restoreArchivedContest } = useRestoreArchivedContest();

    // const { deleteContest } = useDeleteContest();

    const handleRestoreArchive = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;
        // await restoreArchivedContest({ id: id });
        router.post(
            `/contest/archived/restore/${id}`,
            {},
            {
                onSuccess: () => {
                    toast.success('Contest restore successfully!');
                    router.reload({ only: ['contest'] });
                },
                onError: () => {
                    toast.success('An error occurred');
                },
            },
        );
    };

    const handleDeleteArchive = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;
        // await deleteContest({ id: id });
        router.delete(
            `/contest/${id}`,
            {
                onSuccess: () => {
                    toast.success('Contest deleted successfully!');
                    router.reload({ only: ['contest'] });
                },
                onError: () => {
                    toast.success('An error occurred');
                },
            },
        );
    };

    return (
        <div className="flex gap-2">
            <Button className="cursor-pointer font-normal" onClick={handleRestoreArchive} variant="default">
                Restore
            </Button>
            <Button className="hover:bg-accent-foreground cursor-pointer font-normal" onClick={handleDeleteArchive} variant="destructive">
                Delete
            </Button>
        </div>
    );
};
