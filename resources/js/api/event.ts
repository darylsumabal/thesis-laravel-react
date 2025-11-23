import { AxiosResponse } from 'axios';
import axios from 'axios';

export type Event = {
    id: string;
    name: string;
    description: string;
    date: string;
    scoring_method: string;
    organizer: string;
    venue: string;
    address: string;
    poster: string;
};

export type Events = {
    events: Event[];
    message: string;
};

export const createEvent = async (data: FormData, organizerId: number): Promise<AxiosResponse<Events>> => {
    return await axios.post(`events/${organizerId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateEvent = async (data: FormData, eventId: number): Promise<AxiosResponse<Events>> => {
    return await axios.post(`events/update/${eventId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const fetchEventTable = async (organizerId: number) => {
    const response = await axios.get(`events/organizer/${organizerId}`);
    const { data } = response;
    return data;
};

export const fetchEvent = async (id: string, organizerId: number) => {
    const response = await axios.get(`events/organizer/${organizerId}/${id}`);
    const { data } = response;
    return data;
};

export const fetchArchivedEvent = async (organizerId: number) => {
    const response = await axios.get(`events/archived/${organizerId}`);
    const { data } = response;
    return data;
};

export const deleteEvent = async (id: string) => {
    return await axios.delete(`events/${id}`);
};

export const archiveEvent = async (id: string) => {
    return await axios.post(`events/archived/${id}`);
};

export const restoreArchiveEvent = async (id: string) => {
    return await axios.post(`events/archived/restore/${id}`);
};

export const createContest = async (data: FormData, id: string, organizerId: number) => {
    return await axios.post(`events/${id}/contest/${organizerId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
