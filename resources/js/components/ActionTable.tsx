import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    RowSelectionState,
    SortingState,
    useReactTable,
    VisibilityState,
} from '@tanstack/react-table';

import { Archive, ArchiveRestore, Check, ChevronDownIcon, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Card } from './ui/card';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from './ui/command';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
type TableProps<
    T extends {
        id: string;
        contest_scoring_type?: string;
        contest_id?: string;
        group_id?: string;
        contest?: {
            contest_scoring_type: string;
            contest_type: string;
        };
        contest_type?: string;
    },
> = {
    data: T[];
    columns: ColumnDef<T>[];
    searchInput?: string;
    handleClick?: (
        id: string,
        contest_scoring_type?: string,
        contest_id?: string,
        group_id?: string,
        contest?: {
            contest_scoring_type: string;
            contest_type: string;
        },
        contest_type?: string,
    ) => void;
    ref?: React.Ref<HTMLDivElement>;
    isPending?: boolean;
    isSearchInput?: boolean;
    isFilter?: boolean;
    placeholder?: string;
    isPagination?: boolean;
    paginationSize?: number;
    className?: string;
    isArchive?: boolean;
    enableArchive?: boolean;
    handleArchive?: () => void;
};

const TableAction = <
    T extends {
        id: string;
        contest_scoring_type?: string;
        contest_id?: string;
        group_id?: string;
        contest?: {
            contest_scoring_type: string;
            contest_type: string;
        };
        contest_type?: string;
    },
>({
    data,
    columns,
    searchInput,
    handleClick,
    ref,
    isPending,
    isSearchInput = true,
    isFilter = true,
    placeholder,
    isPagination = true,
    paginationSize = 10,
    className,
    isArchive,
    handleArchive,
    enableArchive = false,
}: TableProps<T>) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);

    const [openYear, setOpenYear] = useState(false);
    const [year, setYear] = useState<Date | undefined>(undefined);

    const [openMonthYear, setOpenMonthYear] = useState(false);
    const [openMonth, setOpenMonth] = useState(false);
    const [openYears, setOpenYears] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: paginationSize,
    });
    // const test = !isArchive ? data : archiveData;
    // console.log(data);
    const table = useReactTable({
        data: data ?? [],
        columns: columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    const monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const yearList = ['2025', '2026', '2027', '2028', '2029', '2030'];
    const searchIn = String(searchInput);

    useEffect(() => {
        if (selectedMonth && selectedYear) {
            // Convert month name to number (e.g., "June" → "06")
            const monthNumber = String(new Date(`${selectedMonth} 1`).getMonth() + 1).padStart(2, '0');

            const filterValue = `${selectedYear}-${monthNumber}`; // "2025-06"
            table.getColumn('date')?.setFilterValue(filterValue);
            setDate(undefined);
            setYear(undefined);
        } else {
            // Reset the filter if either is missing
            // table.getColumn("date")?.setFilterValue("");
        }
    }, [selectedMonth, selectedYear, table]);

    useEffect(() => {
        if (date || year) {
            setSelectedMonth(null);
            setSelectedYear(null);
        }
    }, [date, year]);

    return (
        <div>
            <div className="mb-2 flex w-full flex-col xl:flex-row">
                {isSearchInput && (
                    <div className="w-full">
                        <Input
                            placeholder={placeholder}
                            value={(table.getColumn(searchIn)?.getFilterValue() as string) ?? ''}
                            onChange={(event) => table.getColumn(searchIn)?.setFilterValue(event.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                )}

                {isFilter && (
                    <div className="mt-2 flex w-full flex-col gap-2 xl:mt-0 xl:flex-row">
                        <div className="w-full">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between bg-transparent font-normal">
                                        {date
                                            ? `${date.toLocaleDateString('en-PH', {
                                                  year: 'numeric',
                                                  month: 'long',
                                                  day: 'numeric',
                                              })}`
                                            : 'Filter by Date'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="overflow-hidden p-0" align="start">
                                    <Calendar
                                        className="w-full"
                                        mode="single"
                                        selected={date}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setDate(date);
                                            const formatted = date
                                                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                                                : '';
                                            table.getColumn('date')?.setFilterValue(formatted);
                                            setYear(undefined);
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-full">
                            <Popover open={openYear} onOpenChange={setOpenYear}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between bg-transparent font-normal">
                                        {year ? year.getFullYear() : 'Filter by Year'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                    <div className="flex flex-col space-y-2">
                                        {Array.from({ length: 8 }, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return (
                                                <Button
                                                    key={year}
                                                    variant="ghost"
                                                    className="justify-start bg-transparent"
                                                    onClick={() => {
                                                        const picked = new Date(`${year}-01-01`);
                                                        setYear(picked);
                                                        setDate(undefined);
                                                        table.getColumn('date')?.setFilterValue(`${year}`);
                                                        setOpenYear(false);
                                                    }}
                                                >
                                                    {year}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="w-full">
                            <Popover open={openMonthYear} onOpenChange={setOpenMonthYear}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between bg-transparent font-normal">
                                        {selectedMonth && selectedYear ? `${selectedMonth} ${selectedYear}` : 'Filter by Date and Month'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="flex w-auto space-x-2 overflow-hidden p-2" align="start">
                                    <Popover open={openYears} onOpenChange={setOpenYears}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={openYears} className="justify-between">
                                                {selectedYear ?? 'Select Year'}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandEmpty>No year found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {yearList.map((year) => (
                                                            <CommandItem
                                                                key={year}
                                                                value={year}
                                                                onSelect={() => {
                                                                    setSelectedYear(year === selectedYear ? null : year);
                                                                    setOpenYear(false);
                                                                }}
                                                            >
                                                                {year}
                                                                <Check
                                                                    className={cn('ml-auto', selectedYear === year ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    <Popover open={openMonth} onOpenChange={setOpenMonth}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" aria-expanded={openMonth}>
                                                {selectedMonth ?? 'Select Month'}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Command>
                                                <CommandList>
                                                    <CommandEmpty>No month found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {monthList.map((month) => (
                                                            <CommandItem
                                                                key={month}
                                                                value={month}
                                                                onSelect={() => {
                                                                    setSelectedMonth(month === selectedMonth ? null : month);
                                                                    setOpenMonth(false);
                                                                }}
                                                            >
                                                                {month}
                                                                <Check
                                                                    className={cn('ml-auto', selectedMonth === month ? 'opacity-100' : 'opacity-0')}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {enableArchive && (
                            <div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md border-2">
                                <Button onClick={handleArchive} className={`${isArchive && 'bg-destructive'}`}>
                                    {!isArchive ? <Archive /> : <ArchiveRestore />}
                                    <p className="font-medium">Archive</p>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Card className={cn('rounded-md border', className)} ref={ref}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isPending ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24">
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="text-base">Loading</div>
                                        <Loader2 className="animate-spin" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    // className="cursor-pointer  hover:text-slate-100 hover:duration-500 data-[state=selected]:bg-slate-950 data-[state=selected]:text-slate-100"
                                    className="cursor-pointer hover:bg-[#45226b] hover:text-slate-100 hover:duration-500"
                                    key={row.id}
                                    onClick={() =>
                                        handleClick?.(
                                            row.original.id,
                                            row.original.contest_scoring_type,
                                            row.original.contest_id,
                                            row.original.group_id,
                                            row.original.contest,
                                            row.original.contest_type,
                                        )
                                    }
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
            {isPagination && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 flex-col text-sm">
                        <div>Items {table.getFilteredRowModel().rows.length}</div>
                        <div>
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </div>
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableAction;
