import { Criterion } from '@/api/criteria';
import ActionForm from '@/components/ActionForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EDIT_CRITERIA, EDIT_FIELD_CRITERIA } from '@/lib/constant/criteria';
import { editCriteriaDefaultValue, editCriteriaSchema } from '@/schema/criteria';

import { zodResolver } from '@hookform/resolvers/zod';
import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type RowProps = {
    row: Row<Criterion>;
};

export const CellRank = ({ row }: RowProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const accountId = row.original?.id;

    const { updateCriteria, isPending } = useUpdateRankCriteria();

    const form = useForm({
        resolver: zodResolver(editCriteriaSchema),
        defaultValues: editCriteriaDefaultValue,
    });

    const handleEditClick = () => {
        setIsDialogOpen(true);
    };

    const handleOnSubmit = async (data: z.infer<typeof editCriteriaSchema>) => {
        const formData = new FormData();
        try {
            setIsDialogOpen(false);
            formData.append('evaluation_criteria', data.evaluation_criteria);

            updateCriteria({
                evaluation_criteria: data.evaluation_criteria,
                id: String(accountId),
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
                        <MoreHorizontal />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                    <div className="flex w-full flex-col gap-2">
                        <div>
                            <h4 className="leading-none font-medium">Actions</h4>
                        </div>
                        <Button className="cursor-pointer font-normal" variant="default" onClick={handleEditClick}>
                            Edit
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Criteria</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div>
                            <ActionForm
                                isPending={isPending}
                                fields={EDIT_CRITERIA}
                                fieldNames={EDIT_FIELD_CRITERIA}
                                buttonText="Save"
                                onSubmit={handleOnSubmit}
                                form={form}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export const CellPoint = ({ row }: RowProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const accountId = row.original?.id;

    const { updateCriteria, isPending } = useUpdateCriteria();

    const form = useForm({
        resolver: zodResolver(editCriteriaSchema),
        defaultValues: editCriteriaDefaultValue,
    });

    const handleEditClick = () => {
        setIsDialogOpen(true);
    };

    const handleOnSubmit = async (data: z.infer<typeof editCriteriaSchema>) => {
        const formData = new FormData();
        try {
            setIsDialogOpen(false);
            formData.append('evaluation_criteria', data.evaluation_criteria);

            updateCriteria({
                evaluation_criteria: data.evaluation_criteria,
                id: String(accountId),
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 cursor-pointer p-0">
                        <MoreHorizontal />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full">
                    <div className="flex w-full flex-col gap-2">
                        <div>
                            <h4 className="leading-none font-medium">Actions</h4>
                        </div>
                        <Button className="cursor-pointer font-normal" variant="default" onClick={handleEditClick}>
                            Edit
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Criteria</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div>
                            <ActionForm
                                isPending={isPending}
                                fields={EDIT_CRITERIA}
                                fieldNames={EDIT_FIELD_CRITERIA}
                                buttonText="Save"
                                onSubmit={handleOnSubmit}
                                form={form}
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
