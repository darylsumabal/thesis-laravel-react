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
import { EDIT_ACCOUNT, FIELD_EDIT_ACCOUNT } from '@/lib/constant/account';
import { editAccountDefaultValue, editAccountSchema } from '@/schema/account';
import { router } from '@inertiajs/react';
import { Row } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateAccount } from '../utils/tanstack/account';

const AccountCell = ({ row }: { row: Row<Account> }) => {
    const accountId = row.original.id;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    const { mutateAsync: mutateEditAccount, isPending } = useUpdateAccount();

    const handleDelete = async () => {
        return await router.delete(`accounts/${accountId}`, {
            onSuccess: () => {
                toast.success('Account deleted successfully');
                setIsDialogOpen(false);
                router.reload({ only: ['account'] });
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    return (
        <>
            <div className="space-x-4">
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
                                // disabled={!isRowSelected}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {isDialogOpen && (
                <ActionDialog
                    isPending={isPending}
                    useFormData={false}
                    buttonSaveTitle="Save"
                    buttonTitle="Edit"
                    dialogTitle="Edit an account"
                    dialogDescription="Account Info"
                    dialogInputLabel={EDIT_ACCOUNT}
                    schema={editAccountSchema}
                    defaultValues={editAccountDefaultValue}
                    fieldNames={FIELD_EDIT_ACCOUNT}
                    mutate={mutateEditAccount}
                    open={isDialogOpen}
                    handleClose={handleClose}
                    showButton={false}
                    id={accountId}
                />
            )}
        </>
    );
};

export default AccountCell;
