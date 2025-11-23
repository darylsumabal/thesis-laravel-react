import { Contest } from '@/api/contest';
import TableAction from '@/components/ActionTable';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { columns, columnsArchive } from './column';

type PROPS = { contest: Contest; archiveContest?: Contest; eventId: number };
export default function IndexContestTable({ contest, archiveContest, eventId }: PROPS) {
    const [archive, setArchived] = useState(false);

    const handleArchive = () => {
        setArchived(!archive);
    };

    const handleClick = (
        id: string,
        _contest_scoring_type?: string,
        _contest_id?: string,
        _group_id?: string,
        _contest?: { contest_scoring_type: string },
        contest_type?: string,
    ) => {
        router.visit(`/event/event-list/${eventId}/contest/${id}/${contest_type?.toLocaleLowerCase()}`);
    };

    return (
        <Card className="w-full">
            <CardContent>
                {!archive ? (
                    <TableAction
                        // isPending={isPending}
                        columns={columns}
                        data={contest || []}
                        placeholder="Search contest..."
                        searchInput="contest_name"
                        handleClick={handleClick}
                        handleArchive={handleArchive}
                        isArchive={archive}
                        enableArchive={true}
                    />
                ) : (
                    <TableAction
                        // isPending={isPending}
                        columns={columnsArchive}
                        data={archiveContest || []}
                        placeholder="Search archived contest..."
                        searchInput="contest_name"
                        handleClick={handleClick}
                        handleArchive={handleArchive}
                        isArchive={archive}
                        enableArchive={true}
                    />
                )}
            </CardContent>
        </Card>
    );
}
