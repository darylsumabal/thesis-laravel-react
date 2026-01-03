import { Account } from '@/api/account';
import ActionDialog from '@/components/ActionDialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { COMBOBOX_INPUT_PANEL, EDIT_ACCOUNT, FIELD_NAME_EDIT_ACCOUNT } from '@/lib/constant/account';
import { editAccountSchema } from '@/schema/account';
import { router, usePage } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const AccountCell = ({ row }: { row: Row<Account> }) => {
    const accountId = row.original.id;

    const [isPending, setPending] = useState(false);

    const handleDelete = async () => {
        setPending(true);
        return router.delete(`account/${accountId}`, {
            onSuccess: () => {
                toast.success('Account deleted successfully');
                setPending(false);
                router.reload({ only: ['account'] });
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    const defaultEditValues = {
        name: '',
        panelRole: '',
        judgeNumber: '',
    };

    const handleEdit = async ({ data }: { data: FormData }) => {
        return router.post(`account/${accountId}`, data, {
            onSuccess: () => {
                toast.success('Account updated successfully');
                setPending(false);
                router.reload({ only: ['account'] });
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };
    return (
        <div className="space-x-2">
            <ActionDialog
                id={accountId}
                useFormData={true}
                buttonSaveTitle="Save"
                buttonTitle="Edit"
                dialogTitle="Edit an account"
                dialogDescription="Account Info"
                dialogInputLabel={EDIT_ACCOUNT}
                comboboxField={COMBOBOX_INPUT_PANEL}
                schema={editAccountSchema}
                defaultValues={defaultEditValues}
                fieldNames={FIELD_NAME_EDIT_ACCOUNT}
                mutate={handleEdit}
                showButton={true}
                isPending={isPending}
            />
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive" className="hover:bg-accent-foreground cursor-pointer font-normal">
                        Delete
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete judges</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this judge?</DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            className="hover:bg-accent-foreground cursor-pointer font-normal"
                            onClick={handleDelete}
                            variant="destructive"
                            disabled={isPending}
                        >
                            {isPending && <Loader2 className="animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AccountCell;
