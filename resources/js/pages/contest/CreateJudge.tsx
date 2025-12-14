import { Contests } from '@/api/contest';
import ActionDialog from '@/components/ActionDialog';
import { ADD_ACCOUNT, COMBOBOX_INPUT_PANEL, FIELD_NAME_ADD_ACCOUNT } from '@/lib/constant/account';
import { addAccountSchema, defaultValues } from '@/schema/account';
import { router } from '@inertiajs/react';

import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PROPS = { contest: Contests[] };

export default function CreateJudge({ contest }: PROPS) {
    const [isPending, setIsPending] = useState(false);
    const handleCreateJudge = async ({ data }: { data: FormData }) => {
        setIsPending(true);
        router.post('/judging', data, {
            onSuccess: (page) => {
                toast.success(page.props.flash?.success);
                setIsPending(false);
            },
            onError: (error) => {
                setIsPending(false);
                toast.error(error[0]);
            },
        });
        const formValues = Object.fromEntries(data.entries());
        console.log(formValues);
    };

    return (
        <ActionDialog
            useFormData={true}
            buttonSaveTitle="Save"
            buttonTitle="Create Judge"
            dialogTitle="Create an account"
            dialogDescription="Account Info"
            dialogInputLabel={ADD_ACCOUNT}
            comboboxField={COMBOBOX_INPUT_PANEL}
            schema={addAccountSchema}
            defaultValues={{
                ...defaultValues,
                contest_id: String(contest?.[0]?.id),
            }}
            fieldNames={FIELD_NAME_ADD_ACCOUNT}
            mutate={handleCreateJudge}
            showButton={true}
            icon={<UserPlus />}
            isPending={isPending}
        />
    );
}
