import axios from 'axios';
import { Event } from './event';

export type Contests = {
    id: string;
    contest_name: string;
    contest_description: string;
    contest_organizer: string;
    contest_date: string;
    contest_address: string;
    contest_scoring_type: string;
    contest_gender_category: string;
    contest_type: string;
    contest_venue: string;
    contest_poster: string;
    event_id: number;
    event: Event;
};

export type Contest = {
    contest: Contests[];
    message: string;
};

export const fetchContestTable = async (organizerId: number, eventId: number) => {
    const response = await axios.get(`contest/organizer/${organizerId}/event/${eventId}`);
    const { data } = response;
    return data;
};

export const fetchPoster = async (contestId: number) => {
    const response = await axios.get(`events/poster/${contestId}`);
    const { data } = response;
    const { poster } = data;
    return poster;
};

export const fetchContest = async (id: string, organizerId: number) => {
    const response = await axios.get(`contest/organizer/${organizerId}/${id}`);
    const { data } = response;
    return data;
};

export const createParticipants = async (data: FormData, id: string) => {
    return await axios.post(`contest/${id}/organizer/participant`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateParticipant = async (data: FormData, contestId: string, participantId: string) => {
    return await axios.post(`contest/${contestId}/update/participant/${participantId}`, data);
};

export const indexParticipants = async (contestId: string, id: string) => {
    const response = await axios.get(`contest/${contestId}/participant/${id}`);
    const { data } = response;
    const { participant } = data;
    return participant;
};

export const indexTeamParticipants = async (contestId: string, id: string) => {
    const response = await axios.get(`contest/${contestId}/team/participant/${id}`);
    const { data } = response;
    const { participant } = data;
    return participant;
};

export const createPoster = async (data: FormData, contestId: string) => {
    return await axios.post(`events/poster/${contestId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const importParticipants = async (data: FormData, id: string, type = 'participant') => {
    return await axios.post(`contest/${id}/organizer/${type}/upload`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const importTeamParticipants = async (data: FormData, id: string, type = 'team-participant') => {
    return await axios.post(`contest/${id}/organizer/${type}/upload`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createTeamParticipants = async (data: FormData, id: string, organizerId: number) => {
    return await axios.post(`contest/${id}/organizer/${organizerId}/team-participant`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const updateTeamParticipant = async (data: FormData, contestId: string, participantId: string) => {
    return await axios.post(`contest/${contestId}/team/${participantId}`, data);
};

export const deleteContest = async (id: string) => {
    return await axios.delete(`contest/${id}`);
};

export const fetchArchivedContest = async (id: number, eventId: number) => {
    const response = await axios.get(`contest/organizer/archived/${id}/event/${eventId}`);
    const { data } = response;
    return data;
};

export const archivedContest = async (id: string) => {
    return await axios.post(`contest/archived/${id}`);
};

export const archivedRestoreContest = async (id: string) => {
    return await axios.post(`contest/archived/restore/${id}`);
};

export const deleteParticipant = async (contestId: number, id: string) => {
    return await axios.delete(`contest/participant/${contestId}/${id}`);
};

export const deleteTeamParticipant = async (contestId: number, id: string) => {
    return await axios.delete(`contest/team-participant/${contestId}/${id}`);
};

export const updateContest = async (data: FormData, contestId: number) => {
    return await axios.post(`contest/update/${contestId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
