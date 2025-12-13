import TableAction from '@/components/ActionTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Events } from '../../api/event';
import { columns, columnsArchive } from './column';
import Index from './Index';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Event List',
        href: '/event-list',
    },
];

type PROPS = {
    event: Events;
    archiveEvent: Events;
    organizerId: number;
};

export default function IndexTable() {
    const { event, archiveEvent } = usePage<PROPS>().props;

    const [archive, setArchived] = useState(false);

    const handleClick = (id: string) => {
        router.visit(`/event/event-list/${id}`);
    };

    const handleArchive = () => {
        setArchived(!archive);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Event List" />
            <Tabs defaultValue="event-list">
                <TabsList>
                    <TabsTrigger value="event-list">Event List</TabsTrigger>
                    <TabsTrigger value="event">Create Event</TabsTrigger>
                </TabsList>
                <TabsContent value="event-list">
                    {!archive ? (
                        <TableAction
                            // isPending={pendingEvent}
                            columns={columns}
                            handleArchive={handleArchive}
                            data={event.data || []}
                            placeholder="Search events..."
                            searchInput="name"
                            isArchive={archive}
                            handleClick={handleClick}
                            enableArchive={true}
                            links={event.links}
                            pagination={{
                                currentPage: event.current_page,
                                lastPage: event.last_page,
                                perPage: event.per_page,
                                total: event.total,
                            }}
                        />
                    ) : (
                        <TableAction
                            // isPending={pendingArchived}
                            columns={columnsArchive}
                            handleArchive={handleArchive}
                            data={archiveEvent.data || []}
                            placeholder="Search archive events..."
                            searchInput="name"
                            isArchive={archive}
                            handleClick={handleClick}
                            enableArchive={true}
                            links={archiveEvent.links}
                            pagination={{
                                currentPage: archiveEvent.current_page,
                                lastPage: archiveEvent.last_page,
                                perPage: archiveEvent.per_page,
                                total: archiveEvent.total,
                            }}
                        />
                    )}
                </TabsContent>
                <TabsContent value="event">
                    <Index />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
