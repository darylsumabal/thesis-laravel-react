import { CriteriaInfos } from '@/api/criteria';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';

const Action = ({ row }: { row: Row<CriteriaInfos> }) => {
    const handleAccountClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;

        router.post(
            `/criteria/${id}/scores/archived`,
            {},
            {
                onSuccess: () => {
                    toast.success('Criteria archived successfully!');
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

export const ActionArchive = ({ row }: { row: Row<CriteriaInfos> }) => {
    const handleRestoreArchive = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;

        router.post(
            `/criteria/${id}/scores/archived/restore`,
            {},
            {
                onSuccess: () => {
                    toast.success('Criteria restore successfully!');
                    router.reload({ only: ['criteria'] });
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
        router.delete(`/criteria/${id}/scores`, {
            onSuccess: () => {
                toast.success('Contest deleted successfully!');
                router.reload({ only: ['criteria'] });
            },
            onError: () => {
                toast.success('An error occurred');
            },
        });
    };

    return (
        <div className="flex gap-2">
            <Button className="cursor-pointer font-normal" onClick={handleRestoreArchive} variant="default">
                Restore
            </Button>
            <Button className="cursor-pointer font-normal" onClick={handleDeleteArchive} variant="destructive">
                Delete
            </Button>
        </div>
    );
};
