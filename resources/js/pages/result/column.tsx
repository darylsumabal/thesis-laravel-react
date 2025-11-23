import { CriteriaInfos } from '@/api/criteria';
import { Score, ScoreTeam } from '@/api/result';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { ActionArchive } from '../criteria/Action';

function getOrdinal(n: number): string {
    const s = ['th', 'st', 'nd', 'rd'],
        v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export const columnFnIndividual = (data: Score[], type: string): ColumnDef<Score>[] => {
    const columns: ColumnDef<Score>[] = [
        {
            accessorFn: (r) => r.participant.participant_no,
            id: 'participant_no',
            header: 'NO',
            cell: ({ row }) => <div className="text-base">{row.getValue('participant_no')}</div>,
        },
        {
            accessorFn: (row) => `${row.participant.first_name} ${row.participant.last_name}`, // from data
            id: 'full_name', // use to get the row value
            header: 'FULL NAME',
            cell: ({ row }) => (
                <div>
                    <p className="text-base capitalize">{row.getValue('full_name')}</p>
                </div> //get value is base on the id
            ),
        },
    ];
    const sortedJudges = [...(data[0]?.judges_score ?? [])].sort((a, b) => {
        const numA = parseInt(a.judge_name.match(/\d+/)?.[0] ?? '');
        const numB = parseInt(b.judge_name.match(/\d+/)?.[0] ?? '');
        return numA - numB;
    });
    sortedJudges.forEach((judge, i) => {
        columns.push({
            accessorFn: (row) => row.judges_score[i]?.score,
            id: i.toString(),
            header: judge.judge_name,
            cell: ({ row }) => <div className="text-base">{row.original.judges_score[i]?.score}</div>,
        });
    });

    if (type === 'point') {
        columns.push({
            id: 'score',
            header: 'FINAL SCORE',
            cell: ({ row }) => <div className="text-base">{row.original.overall_scores?.score}</div>,
        });
        columns.push({
            header: 'PLACES',
            cell: ({ table, row }) => {
                const rows = [...table.getRowModel().rows];

                // Sort rows by FINAL SCORE descending
                const sorted = rows.sort((a, b) => {
                    const aScore = a.original.overall_scores?.score ?? 0;
                    const bScore = b.original.overall_scores?.score ?? 0;
                    return Number(bScore) - Number(aScore);
                });

                // Calculate ranks with tie handling
                let currentRank = 1;
                let previousScore = '';
                const rankedRows = sorted.map((sortedRow, index) => {
                    const currentScore = sortedRow.original.overall_scores?.score ?? 0;

                    // If this score is different from the previous, update rank to current position + 1
                    if (previousScore !== null && Number(currentScore) !== Number(previousScore)) {
                        currentRank = index + 1;
                    }

                    previousScore = currentScore;

                    return {
                        ...sortedRow,
                        rank: currentRank,
                    };
                });

                // Find the current row and get its rank
                const currentRowRank = rankedRows.find((r) => r.id === row.id)?.rank || 1;

                return <div className="text-base">{getOrdinal(currentRowRank)}</div>;
            },
        });
    } else if (type === 'rank') {
        columns.push({
            id: 'score',
            header: 'FINAL SCORE',
            cell: ({ row }) => <div className="text-base">{row.original.overall_scores?.score}</div>,
        });

        columns.push({
            accessorFn: (row) => row.overall_scores?.rank || 'N/A',
            id: 'rank',
            header: 'PLACES',
            cell: ({ row, table }) => {
                const rankValue = row.getValue('rank');
                if (rankValue === 'N/A') return <div className="text-base">N/A</div>;

                // Get all valid ranks from the table data
                const allRanks = table
                    .getRowModel()
                    .rows.map((r) => r.getValue('rank'))
                    .filter((rank) => rank !== 'N/A')
                    .map((rank) => Number(rank));

                // Sort ranks in ascending order (1.3, 1.6, 1.8, 3.0, etc.)
                const sortedRanks = [...new Set(allRanks)].sort((a, b) => a - b);
                const position = sortedRanks.indexOf(Number(rankValue)) + 1;

                return <div className="text-base">{getOrdinal(position)}</div>;
            },
        });
    }
    return columns;
};

export const columnFnTeam = (data: ScoreTeam[], type: string): ColumnDef<ScoreTeam>[] => {
    const columns: ColumnDef<ScoreTeam>[] = [
        {
            accessorFn: (r) => r.participant.team_participant_no,
            id: 'team_participant_no',
            header: 'NO',
            cell: ({ row }) => <div className="text-base">{row.getValue('team_participant_no')}</div>,
        },
        {
            accessorFn: (row) => row.participant.team_name, // from data
            id: 'team_name', // use to get the row value
            header: 'TEAM NAME',
            cell: ({ row }) => (
                <div>
                    <p className="text-base capitalize">{row.getValue('team_name')}</p>
                </div> //get value is base on the id
            ),
        },
    ];

    const sortedJudges = [...(data[0]?.judges_score ?? [])].sort((a, b) => {
        const numA = parseInt(a.judge_name.match(/\d+/)?.[0] ?? '');
        const numB = parseInt(b.judge_name.match(/\d+/)?.[0] ?? '');
        return numA - numB;
    });
    sortedJudges.forEach((judge, i) => {
        columns.push({
            accessorFn: (row) => row.judges_score[i]?.score,
            id: i.toString(),
            header: judge.judge_name,
            cell: ({ row }) => <div className="text-base">{row.original.judges_score[i]?.score}</div>,
        });
    });
    if (type === 'point') {
        columns.push({
            // accessorFn: (row) => row.overall_scores?.score || "N/A",
            id: 'score',
            header: 'FINAL SCORE',
            cell: ({ row }) => <div className="text-base">{row.original.overall_scores?.score}</div>,
        });

        columns.push({
            header: 'PLACES',
            cell: ({ table, row }) => {
                const rows = [...table.getRowModel().rows];

                // Sort rows by FINAL SCORE descending
                const sorted = rows.sort((a, b) => {
                    const aScore = a.original.overall_scores?.score ?? 0;
                    const bScore = b.original.overall_scores?.score ?? 0;
                    return Number(bScore) - Number(aScore);
                });

                // Find index of current row in sorted array
                const placeIndex = sorted.findIndex((r) => r.id === row.id);

                return <div className="text-base">{getOrdinal(placeIndex + 1)}</div>;
            },
        });
    } else if (type === 'rank') {
        columns.push({
            // accessorFn: (row) => row.overall_scores?.score || "N/A",
            id: 'score',
            header: 'FINAL SCORE',
            cell: ({ row }) => <div className="text-base">{row.original.overall_scores?.score}</div>,
        });

        columns.push({
            accessorFn: (row) => row.overall_scores?.rank || 'N/A',
            id: 'rank',
            header: 'PLACES',
            cell: ({ row, table }) => {
                const rankValue = row.getValue('rank');
                if (rankValue === 'N/A') return <div className="text-base">N/A</div>;

                // Get all valid ranks from the table data
                const allRanks = table
                    .getRowModel()
                    .rows.map((r) => r.getValue('rank'))
                    .filter((rank) => rank !== 'N/A')
                    .map((rank) => Number(rank));

                // Sort ranks in ascending order (1.3, 1.6, 1.8, 3.0, etc.)
                const sortedRanks = [...new Set(allRanks)].sort((a, b) => a - b);

                // Find the position of current rank in sorted array
                const position = sortedRanks.indexOf(Number(rankValue)) + 1;

                return <div className="text-base">{getOrdinal(position)}</div>;
            },
        });
    }

    return columns;
};

export const columnResultTableArchive: ColumnDef<CriteriaInfos>[] = [
    {
        accessorFn: (r) => r.contest?.event.name,
        id: 'name',
        header: 'Event',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorFn: (r) => r.contest?.contest_name,
        id: 'contest_name',
        header: 'Contest',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_name')}</div>,
    },
    // {
    //   accessorFn: (r) => r.contest.event.organizer,
    //   id: "organizer",
    //   header: "Organizer",
    //   cell: ({ row }) => (
    //     <div className="text-base">{row.getValue("organizer")}</div>
    //   ),
    // },
    {
        accessorFn: (r) => r.contest?.contest_scoring_type,
        id: 'contest_scoring_type',
        header: 'Scoring Type',
        cell: ({ row }) => <div className="text-base">{row.getValue('contest_scoring_type')}</div>,
    },
    {
        accessorFn: (r) => r.contest?.contest_type,
        id: 'contest_type',
        header: 'Contest Type',
        cell: ({ row }) => <div className="text-base">{row.getValue('contest_type')}</div>,
    },
    {
        accessorFn: (r) =>
            r.contest.contest_gender_category === 'maleFemale'
                ? 'Male & Female'
                : r.contest.contest_gender_category.charAt(0).toUpperCase() + r.contest.contest_gender_category.slice(1).toLowerCase(),
        id: 'gender_category',
        header: 'Category',
        cell: ({ row }) => {
            const genderCategory = row.getValue('gender_category');

            return <div className="text-base capitalize">{genderCategory ? String(genderCategory) : 'Team'}</div>;
        },
    },
    {
        accessorFn: (r) => r.scoring_method,
        id: 'scoring_method',
        header: 'Scoring Method',
        cell: ({ row }) => {
            const value = row.getValue('scoring_method');
            return <div className="text-base capitalize">{value ? String(value) : 'Single Scoring Method'}</div>;
        },
    },
    {
        accessorFn: (r) => r.contest.contest_date,
        id: 'date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Contest Date
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => {
            const formattedDated = row.original.contest.contest_date;

            const formatted = new Date(formattedDated).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            return <div className="text-base capitalize">{formatted}</div>;
        },
    },

    {
        header: 'Action',
        cell: ({ row }) => {
            return <ActionArchive row={row} />;
        },
    },
];

export const columnResultTable: ColumnDef<CriteriaInfos>[] = [
    {
        accessorFn: (r) => r.contest?.event.name,
        id: 'name',
        header: 'Event',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorFn: (r) => r.contest?.contest_name,
        id: 'contest_name',
        header: 'Contest',
        cell: ({ row }) => <div className="text-base capitalize">{row.getValue('contest_name')}</div>,
    },
    // {
    //   accessorFn: (r) => r.contest.event.organizer,
    //   id: "organizer",
    //   header: "Organizer",
    //   cell: ({ row }) => (
    //     <div className="text-base">{row.getValue("organizer")}</div>
    //   ),
    // },
    {
        accessorFn: (r) => r.contest?.contest_scoring_type,
        id: 'contest_scoring_type',
        header: 'Scoring Type',
        cell: ({ row }) => <div className="text-base">{row.getValue('contest_scoring_type')}</div>,
    },
    {
        accessorFn: (r) => r.contest?.contest_type,
        id: 'contest_type',
        header: 'Contest Type',
        cell: ({ row }) => <div className="text-base">{row.getValue('contest_type')}</div>,
    },
    {
        accessorFn: (r) =>
            r.gender_category === 'maleFemale'
                ? 'Male & Female'
                : r.gender_category.charAt(0).toUpperCase() + r.gender_category.slice(1).toLowerCase(),
        id: 'gender_category',
        header: 'Category',
        cell: ({ row }) => {
            const genderCategory = row.getValue('gender_category');

            return <div className="text-base capitalize">{genderCategory ? String(genderCategory) : 'Team'}</div>;
        },
    },
    {
        accessorFn: (r) => r.scoring_method,
        id: 'scoring_method',
        header: 'Scoring Method',
        cell: ({ row }) => {
            const value = row.getValue('scoring_method');
            return <div className="text-base capitalize">{value ? String(value) : 'Single Scoring Method'}</div>;
        },
    },
    {
        accessorFn: (r) => r.contest.contest_date,
        id: 'date',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Contest Date
                    <ArrowUpDown />
                </Button>
            );
        },
        cell: ({ row }) => {
            const formattedDated = row.original.contest.contest_date;

            const formatted = new Date(formattedDated).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            return <div className="text-base capitalize">{formatted}</div>;
        },
    },

    // {
    //   header: "Action",
    //   cell: ({ row }) => {
    //     return <Action row={row} />;
    //   },
    // },
];
