import { Event } from '@/api/event';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { toast } from 'sonner';


const Action = ({ row }: { row: Row<Event> }) => {


    const handleArchiveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;

        router.post(
            `/event/archived/${id}`,
            {},
            {
                onSuccess: () => {
                    toast.success('Event archived successfully!');
                    router.reload({ only: ['event'] });
                },
                onError: () => {
                    toast.success('An error occurred');
                },
            },
        );
    };

    return (
        <Button className="cursor-pointer font-normal" onClick={handleArchiveClick} variant="destructive">
            Archive
        </Button>
    );
};

export default Action;

export const ActionArchive = ({ row }: { row: Row<Event> }) => {
    const handleRestoreArchiveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;
        router.post(
            `/event/archived/restore/${id}`,
            {},
            {
                onSuccess: () => {
                    toast.success('Event archived restore successfully!');
                    router.reload({ only: ['event'] });
                },
                onError: () => {
                    toast.success('An error occurred');
                },
            },
        );
    };

    const handleDeleteArchiveClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const id = row.original.id;
        router.delete(`/event/${id}`, {
            onSuccess: () => {
                toast.success('Event deleted successfully!');
                router.reload({ only: ['event'] });
            },
            onError: () => {
                toast.success('An error occurred');
            },
        });
    };

    return (
        <div className="flex gap-2">
            <Button className="cursor-pointer font-normal" onClick={handleRestoreArchiveClick} variant="default">
                Restore
            </Button>
            <Button className="cursor-pointer font-normal" onClick={handleDeleteArchiveClick} variant="destructive">
                Delete
            </Button>
        </div>
    );
};
