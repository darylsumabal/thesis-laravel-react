import { DeleteCriteriaPayload, ScoringDataRound } from '@/lib/constant/scoring';
import axios from 'axios';
import { Contests } from './contest';

export type Scoring = {
    contest: Contests[];
    message: string;
};

export type JudgesData = {
    id: string;
    name: string;
    role: string;
    contest: {
        contest_name: string;
    };
};

export const fetchScoringTable = async (scoringType: string[], organizerId: number) => {
    const response = await axios.get(`/scoring/organizer/${organizerId}`, {
        params: {
            scoringType: scoringType.join(','),
        },
    });
    const { data } = response;
    return data;
};

export const fetchScoring = async (scoringType: string[], organizerId: number, contestId: string) => {
    const response = await axios.get(`/scoring/organizer/${organizerId}/${contestId}`, {
        params: {
            scoringType: scoringType.join(','),
        },
    });
    const { data } = response;
    return data;
};

export const fetchJudges = async () => {
    const response = await axios.get('/contest/judges');
    const { data } = response;
    const { judges } = data;
    return judges;
};

export const fetchJudgesCategory = async (contestId: string) => {
    const response = await axios.get(`/contest/judges/category/${contestId}`);
    const { data } = response;
    const { judges } = data;
    return judges;
};

export const fetchQualified = async (contestId: string, groupId: string) => {
    const response = await axios.get(`scoring/organizer/${contestId}/contest/${groupId}/qualified`);
    const { data } = response;

    const { qualified } = data;
    return qualified;
};

export const fetchPercentage = async (contestId: string, groupId: string) => {
    const response = await axios.get(`scoring/organizer/${contestId}/contest/${groupId}/percentage`);
    const { data } = response;

    const { percentage } = data;
    return percentage;
};

// export const createCriteria = async (
//   organizerId: number,
//   id: number,
//   data: ScoringDataPointBased
// ) => {
//   return await axios.post(
//     `scoring/organizer/${organizerId}/contest/${id}/criteria`,
//     data
//   );
// };

// export const createCriteriaMultipleRound = async (
//   organizerId: number,
//   id: number,
//   data: ScoringDataMultipleRound
// ) => {
//   return await axios.post(
//     `scoring/organizer/${organizerId}/contest/${id}/criteria/multiple-round`,
//     data
//   );
// };

export const createCriteriaRound = async (organizerId: number, id: number, data: ScoringDataRound) => {
    return await axios.post(`scoring/organizer/${organizerId}/contest/${id}/criteria`, data);
};

//edit
export const addCriteria = async (contestId: number, groupId: string, data: ScoringDataRound) => {
    return await axios.post(`scoring/contest/${contestId}/add/criteria/${groupId}`, data);
};

export const updateCriteria = async (contestId: number, groupId: string, data: ScoringDataRound) => {
    return await axios.post(`scoring/contest/${contestId}/update/criteria/${groupId}`, data);
};

export const updateJudges = async (contestId: number, groupId: string, data: { judges: { id: number }[] }) => {
    return await axios.post(`scoring/contest/${contestId}/update/judges/${groupId}`, data);
};

export const deleteJudges = async (contestId: number, groupId: string, judgeId: number) => {
    return await axios.delete(`scoring/contest/${contestId}/delete/judges/${judgeId}/${groupId}`);
};

export const deleteCriteria = async (contestId: number, groupId: string, data: DeleteCriteriaPayload) => {
    return await axios.delete(`scoring/contest/${contestId}/delete/criteria/${groupId}`, { data });
};

export const fetchPrelimFinal = async (contestId: string, groupId: string) => {
    const response = await axios.get(`scoring/contest/${contestId}/prelim-final/${groupId}`);
    const { data } = response;

    return data;
};

export const updatePrelimFinal = async (contestId: number, groupId: string, data: { preliminary: number; final: number }) => {
    return await axios.post(`scoring/contest/${contestId}/update/prelim-final/${groupId}`, data);
};

export const updateQualified = async (contestId: number, groupId: string, data: { qualified: number }) => {
    return await axios.post(`scoring/contest/${contestId}/update/qualified/${groupId}`, data);
};

export const fetchScoringMethod = async (contestId: number, groupId: string) => {
    const response = await axios.get(`scoring/method/${contestId}/contest/${groupId}`);
    const { data } = response;

    const { scoring_method } = data;
    return scoring_method;
};
