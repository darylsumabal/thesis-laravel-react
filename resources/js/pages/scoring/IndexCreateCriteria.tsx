import { Participant, TeamParticipant } from '@/api/result';
import { JudgesData } from '@/api/scoring';
import TableCardCriteria from '@/components/table/TableCardCriteria';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import MultipleSelector, { Option } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { CriteriaRound, CriteriaRoundSr, CriteriaSchema, CriteriaSchemaSr } from '@/schema/scoring';
import { type BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

const scoringMethod = [
    {
        value: '',
        label: 'Select',
    },
    {
        value: 'Final',
        label: 'Final',
    },
    {
        value: 'PrelimFinal',
        label: 'Final & Prelim',
    },
];

const preliminaryMethod = [
    {
        value: '',
        label: 'Select',
    },
    {
        value: 'default',
        label: 'Default',
    },
    {
        value: 'weighted',
        label: 'Weighted',
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Criteria',
        href: '/criteria',
    },
];

type PROPS = {
    judgesCategory: JudgesData[];
    judges: JudgesData[];
    participants: Participant[] | TeamParticipant[];
    contestId: number;
    contestType: string;
    roundType: string;
};

export default function CreateCriteria() {
    const { judgesCategory, judges, participants, roundType, contestId } = usePage<PROPS>().props;

    const isSingleRound = roundType?.includes('sr');
    const isMultipleRound = roundType?.includes('mr');
    const [loading, setLoading] = useState<boolean>(false);
    const [, setSelectedJudges] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [openPreliminary, setOpenPreliminary] = useState(false);
    const [value, setValue] = useState('');
    const [valuePreliminary, setValuePreliminary] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    const weighted = valuePreliminary !== 'default' && valuePreliminary !== '';

    const defaultValues: CriteriaRound | CriteriaRoundSr = {
        judges: [],
        qualified: 0,
        preliminary: 0,
        scoringMethod: '',
        final: 0,
        criteria: {
            criteria: [
                {
                    weighted: 0,
                    criteria: '',
                    round: isSingleRound ? 'Preliminary' : '',
                    category: 'Mixed',
                    criterion: [{ evaluationCriterion: '', score: 0 }],
                },
            ],
        },
    };

    const form = useForm<CriteriaRound | CriteriaRoundSr>({
        resolver: zodResolver(isSingleRound ? CriteriaSchemaSr : CriteriaSchema),
        defaultValues,
    });

    const allCriteria = form.watch('criteria.criteria');

    const totalWeight = allCriteria?.reduce((sum, round) => {
        return sum + (Number(round.weighted ?? 0) || 0);
    }, 0);

    const onSubmit = async (data: CriteriaRound | CriteriaRoundSr) => {
        const judge = data.judges.length === 0;
        setLoading(true);
        const invalidRounds = data.criteria.criteria.some((_round, idx) => {
            const totalScore = handleWatchScore(idx);
            return totalScore > 100;
        });

        if (isMultipleRound && data.criteria.criteria.every((round) => round.round !== 'Final')) {
            toast.error('You must add at least one Final round!');
            setLoading(false);
            return;
        }
        if (totalWeight != 100 && valuePreliminary != 'default' && isMultipleRound) {
            toast.error('Total weight across in the contest must be not exceed to 100');
            setLoading(false);
            return;
        }

        if (!weighted && valuePreliminary != 'default' && isMultipleRound) {
            toast.error('You must select a Preliminary Round Type');
            setLoading(false);
            return;
        }

        if (invalidRounds) {
            toast.error("Each round's max score is 100!");
            setLoading(false);
            return;
        } else if (judge) {
            toast.error('Please add a judges!');
            setLoading(false);
            return;
        }

        const promise = new Promise((resolve, reject) => {
            router.post(`/criteria/create/${contestId}`, data, {
                onSuccess: (page) => {
                    setLoading(false);
                    form.reset();
                    resolve(page);
                    setSelectedOptions([]);
                    setSelectedJudges([]);
                    setValue('');
                    setValuePreliminary('');
                },
                onError: (error) => {
                    setLoading(false);
                    console.log(error);
                    reject(error);
                },
            });
        });

        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Criteria created successfully!',
            error: 'Failed to create.',
        });
    };

    const handleToggleChange = (
        selected: Option[], // this comes directly from MultipleSelector
        targetForm: typeof form,
    ) => {
        // extract only the IDs from selected judges
        const selectedIds = selected.map((judge) => Number(judge.id));
        setSelectedJudges((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));

        // update form value
        targetForm.setValue(
            'judges',
            selectedIds.map((id) => ({ id })), // convert to array of { id: number }
        );
    };

    const dataJudgesCategory = judgesCategory
        ?.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
            return numA - numB;
        })
        .map((item) => ({
            id: item.id,
            value: item.name,
            label: item.name,
            role: item.role,
            contest: item.contest?.contest_name,
        }));

    const dataJudges = judges
        ?.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
            return numA - numB;
        })
        .map((item) => ({
            id: item.id,
            value: item.name,
            label: item.name,
            role: item.role,
            contest: item.contest?.contest_name,
        }));

    const {
        fields: fieldCriteria,
        append: appendCriteria,
        remove: removeCriteria,
    } = useFieldArray({
        control: form.control,
        name: `criteria.criteria`,
    });

    const handleAddRound = () => {
        appendCriteria({
            weighted: 0,
            criteria: '',
            category: 'mixed',
            round: isSingleRound ? 'Preliminary' : '',
            criterion: [{ evaluationCriterion: '', score: 0 }],
        });
    };

    const handleWatchScore = (idx: number) => {
        const totalScore = form.watch(`criteria.criteria.${idx}.criterion`).reduce((sum, criterion) => {
            return sum + (Number(criterion.score) || 0);
        }, 0);
        return totalScore;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Criteria" />
            <div className="h-full">
                <Card className="50 h-fit rounded-xl p-6">
                    {participants.length === 0 ? (
                        <div>Cannot create criteria because there are no participants in this contest.</div>
                    ) : (
                        <Form {...form}>
                            <div className="flex flex-col gap-10">
                                <Card className="p-4">
                                    {
                                        <p className="text-lg">
                                            The total number of participants is <span className="font-medium">{participants.length}</span>
                                        </p>
                                    }
                                </Card>
                                <Card className="p-4">
                                    <div className="mb-4">
                                        <div className="mb-2 font-medium">Add Judges</div>
                                        <div className="">
                                            <Tabs defaultValue="judges">
                                                <TabsList>
                                                    <TabsTrigger value="judges">Judges</TabsTrigger>
                                                    <TabsTrigger value="all-judges">All Judges</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="judges">
                                                    <MultipleSelector
                                                        commandProps={{
                                                            label: 'Select judges',
                                                        }}
                                                        // value={dataJudges?.slice(0, 2)}
                                                        groupBy="contest"
                                                        defaultOptions={dataJudgesCategory}
                                                        options={dataJudgesCategory}
                                                        placeholder="Select judges"
                                                        hideClearAllButton
                                                        hidePlaceholderWhenSelected
                                                        emptyIndicator={<p className="text-center text-sm">No judges found</p>}
                                                        className="w-full"
                                                        value={selectedOptions}
                                                        onChange={(selected) => {
                                                            setSelectedOptions(selected);
                                                            handleToggleChange(selected, form);
                                                        }}
                                                    />
                                                </TabsContent>

                                                <TabsContent value="all-judges">
                                                    <MultipleSelector
                                                        commandProps={{
                                                            label: 'Select judges',
                                                        }}
                                                        groupBy="contest"
                                                        defaultOptions={dataJudges}
                                                        options={dataJudges}
                                                        placeholder="Select judges"
                                                        hideClearAllButton
                                                        hidePlaceholderWhenSelected
                                                        emptyIndicator={<p className="text-center text-sm">No judges found</p>}
                                                        className="w-full"
                                                        value={selectedOptions}
                                                        onChange={(selected) => {
                                                            setSelectedOptions(selected);
                                                            handleToggleChange(selected, form);
                                                        }}
                                                    />
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>
                                </Card>

                                <>
                                    <Card className="p-4">
                                        <div className="flex gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`qualified`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="space-y-2">
                                                                <FormLabel>Qualified Participant</FormLabel>
                                                                <Input
                                                                    {...field}
                                                                    type="number"
                                                                    className="w-96"
                                                                    value={field.value || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value; // ensures number type
                                                                        if (val === '') {
                                                                            // allow clearing the input
                                                                            field.onChange('');
                                                                            return;
                                                                        }
                                                                        const num = Number(val);
                                                                        if (num >= 0 && num <= participants.length) {
                                                                            field.onChange(num);
                                                                        }
                                                                    }}
                                                                    placeholder="Enter qualified participant"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {isMultipleRound && (
                                                <div className="flex gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`scoringMethod`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="flex flex-col space-y-2">
                                                                        <FormLabel>Select a Final Scoring Method</FormLabel>
                                                                        <Popover open={open} onOpenChange={setOpen}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    role="combobox"
                                                                                    aria-expanded={open}
                                                                                    className="w-96 justify-between"
                                                                                >
                                                                                    {value
                                                                                        ? scoringMethod.find((framework) => framework.value === value)
                                                                                              ?.label
                                                                                        : 'Select scoring method'}
                                                                                    <ChevronsUpDown className="opacity-50" />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-96 p-0">
                                                                                <Command>
                                                                                    <CommandList>
                                                                                        <CommandGroup>
                                                                                            {scoringMethod.map((framework) => (
                                                                                                <CommandItem
                                                                                                    key={framework.value}
                                                                                                    value={framework.value}
                                                                                                    onSelect={(currentValue) => {
                                                                                                        setValue(
                                                                                                            currentValue === value
                                                                                                                ? ''
                                                                                                                : currentValue,
                                                                                                        );
                                                                                                        field.onChange(framework.value);
                                                                                                        setOpen(false);
                                                                                                    }}
                                                                                                >
                                                                                                    {framework.label}
                                                                                                    <Check
                                                                                                        className={cn(
                                                                                                            'ml-auto',
                                                                                                            value === framework.value
                                                                                                                ? 'opacity-100'
                                                                                                                : 'opacity-0',
                                                                                                        )}
                                                                                                    />
                                                                                                </CommandItem>
                                                                                            ))}
                                                                                        </CommandGroup>
                                                                                    </CommandList>
                                                                                </Command>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`preliminaryScoringMethod`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="flex flex-col space-y-2">
                                                                        <FormLabel>Select a Preliminary Scoring Method</FormLabel>
                                                                        <Popover open={openPreliminary} onOpenChange={setOpenPreliminary}>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    role="combobox"
                                                                                    aria-expanded={openPreliminary}
                                                                                    className="w-96 justify-between"
                                                                                >
                                                                                    {valuePreliminary
                                                                                        ? preliminaryMethod.find(
                                                                                              (framework) => framework.value === valuePreliminary,
                                                                                          )?.label
                                                                                        : 'Select scoring method'}
                                                                                    <ChevronsUpDown className="opacity-50" />
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-96 p-0">
                                                                                <Command>
                                                                                    <CommandList>
                                                                                        <CommandGroup>
                                                                                            {preliminaryMethod.map((framework) => (
                                                                                                <CommandItem
                                                                                                    key={framework.value}
                                                                                                    value={framework.value}
                                                                                                    onSelect={(currentValue) => {
                                                                                                        setValuePreliminary(
                                                                                                            currentValue === value
                                                                                                                ? ''
                                                                                                                : currentValue,
                                                                                                        );
                                                                                                        field.onChange(framework.value);
                                                                                                        setOpenPreliminary(false);
                                                                                                    }}
                                                                                                >
                                                                                                    {framework.label}
                                                                                                    <Check
                                                                                                        className={cn(
                                                                                                            'ml-auto',
                                                                                                            valuePreliminary === framework.value
                                                                                                                ? 'opacity-100'
                                                                                                                : 'opacity-0',
                                                                                                        )}
                                                                                                    />
                                                                                                </CommandItem>
                                                                                            ))}
                                                                                        </CommandGroup>
                                                                                    </CommandList>
                                                                                </Command>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                    {isMultipleRound && value === 'PrelimFinal' && (
                                        <Card className="grid grid-cols-2 p-4">
                                            <FormField
                                                control={form.control}
                                                name={`preliminary`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="space-y-2">
                                                                <FormLabel>Preliminary Round Percentage Score</FormLabel>
                                                                <Input
                                                                    {...field}
                                                                    type="number"
                                                                    max={100}
                                                                    value={field.value || ''}
                                                                    onInput={(e) => {
                                                                        const target = e.target as HTMLInputElement;
                                                                        // restrict length to 3 characters
                                                                        if (target.value.length > 3) {
                                                                            target.value = target.value.slice(0, 3);
                                                                        }
                                                                        // enforce max 100
                                                                        // if (Number(target.value) > 100) {
                                                                        //   target.value = "100";
                                                                        // }
                                                                    }}
                                                                    placeholder="Enter a number"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`final`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <div className="space-y-2">
                                                                <FormLabel>Final Round Percentage Score</FormLabel>
                                                                <Input
                                                                    {...field}
                                                                    type="number"
                                                                    max={100}
                                                                    value={field.value || ''}
                                                                    onInput={(e) => {
                                                                        const target = e.target as HTMLInputElement;

                                                                        if (target.value.length > 3) {
                                                                            target.value = target.value.slice(0, 3);
                                                                        }
                                                                    }}
                                                                    placeholder="Enter a number"
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </Card>
                                    )}
                                </>

                                <Card className="p-4">
                                    <Button onClick={handleAddRound} className="mb-4 cursor-pointer">
                                        Add Contest
                                    </Button>
                                    {isSingleRound &&
                                        fieldCriteria.map((item, idx) => (
                                            <div key={idx}>
                                                <TableCardCriteria
                                                    id={item.id}
                                                    onSubmit={onSubmit}
                                                    // isPending={isPending}
                                                    fieldRound={fieldCriteria}
                                                    removeRound={removeCriteria}
                                                    idx={idx}
                                                    form={form as UseFormReturn<CriteriaRoundSr>}
                                                    isPending={loading}
                                                    watchScore={handleWatchScore}
                                                    roundScoring={true}
                                                    multipleRound={false}
                                                />
                                            </div>
                                        ))}

                                    {isMultipleRound &&
                                        fieldCriteria.map((item, idx) => (
                                            <div key={idx}>
                                                <TableCardCriteria
                                                    id={item.id}
                                                    onSubmit={onSubmit}
                                                    // isPending={isPending}
                                                    fieldRound={fieldCriteria}
                                                    removeRound={removeCriteria}
                                                    idx={idx}
                                                    isPending={loading}
                                                    form={form as UseFormReturn<CriteriaRound>}
                                                    watchScore={handleWatchScore}
                                                    roundScoring={true}
                                                    multipleRound={true}
                                                    edit={true}
                                                    isWeighted={weighted}
                                                />
                                            </div>
                                        ))}
                                </Card>
                            </div>
                        </Form>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
