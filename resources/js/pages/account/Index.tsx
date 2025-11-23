import { AccountType } from '@/api/account';
import ActionDialog from '@/components/ActionDialog';
import TableAction from '@/components/ActionTable';
import AppLayout from '@/layouts/app-layout';
import { ADD_ACCOUNT, COMBOBOX_INPUT_PANEL, FIELD_NAME_ADD_ACCOUNT } from '@/lib/constant/account';
import { addAccountSchema, defaultValues } from '@/schema/account';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './column';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account',
        href: '/account',
    },
];

export default function Index({ account }: { account: AccountType }) {
    const [isPending, setIsPending] = useState(false);

    const handleCreateJudge = async ({ data }: { id: string | null; data: FormData }) => {
        setIsPending(true);

        router.post('/accounts', data, {
            onSuccess: () => {
                setIsPending(false);
                toast.success('Account created');
                router.reload({ only: ['account'] });
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Account" />
            <div className="flex items-center justify-end">
                <div>
                    <ActionDialog
                        isPending={isPending}
                        useFormData={true}
                        buttonSaveTitle="Save"
                        buttonTitle="Create Account"
                        dialogTitle="Create an account"
                        dialogDescription="Account Info"
                        dialogInputLabel={ADD_ACCOUNT}
                        comboboxField={COMBOBOX_INPUT_PANEL}
                        schema={addAccountSchema}
                        defaultValues={defaultValues}
                        fieldNames={FIELD_NAME_ADD_ACCOUNT}
                        mutate={handleCreateJudge}
                        showButton={true}
                        icon={<UserPlus />}
                    />
                </div>
            </div>
            <div>
                <TableAction
                    // isPending={pendingAccount}
                    data={account || []}
                    columns={columns}
                    placeholder="Search email..."
                    isFilter={false}
                    searchInput="email"
                />
            </div>
        </AppLayout>
    );
}
