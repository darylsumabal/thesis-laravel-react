import axios from 'axios';
import { Contests } from './contest';

export interface C {
    id: string; // change to optional and number type beta test
    score?: number;
    group_id: string;
    evaluation_criteria: string;
    contest?: { contest_scoring_type: string; contest_type: string }; //beta test
    contest_id: string;
}

export interface Criterion extends C {
    round?: number;
}

type Criteria = {
    id: number;
    evaluation_criteria: string;
    score: number;
    round: string;
};

export type MultipleCriterion = {
    round: string;
    id: number;
    evaluation_criteria: string;
    score: string;
    criteria: Criteria[];
    category?: string;
    criterion?: {
        id: number;
        evaluationCriterion: string;
        score: string | number;
    }[];
};

type Judges = {
    id: number;
    group_id: string;
    judge_id: number;
    contest_id: number;
};

export interface CriteriaInfos {
    id: string;
    contest_id: string;
    group_id: string;
    judges: Judges[];
    contest: Contests;
    scoring_method: string;
    gender_category: string;
}

export type CriteriaInfo = {
    criteria_list: CriteriaInfos[];
    message: string;
};

interface Score extends C {
    judges_id: number | null;
    round?: number;
}

export type MultipleScore = {
    criteria: Score[];
};

export type JudgingScore = {
    criteria: Score[];
};

export interface PointBasedCriteria extends CriteriaInfo {
    criteria: Criterion[];
}

export interface RankBasedCriteria extends CriteriaInfo {
    criteria: Criterion[];
}

export interface MultipleRoundCriteria extends CriteriaInfo {
    criteria_test: MultipleCriterion[];
}

export type JudgesCheck = {
    is_finished: boolean;
    message: string;
};

export const fetchMultipleBasedCriteria = async (groupId: string) => {
    const response = await axios.get(`criteria/${groupId}/scores/multiple-round`);
    const { data } = response;
    const { scores } = data;
    return scores;
};

export const fetchJudgesCriteria = async (groupId: string) => {
    const response = await axios.get(`criteria/${groupId}/judges`);
    const { data } = response;
    const { scores } = data;
    return scores;
};

export const fetchScoreCriteria = async (organizerId: number, contestId: string, groupId: string) => {
    const response = await axios.get(`/criteria/criteria-list/scores/organizer/${organizerId}/${contestId}/${groupId}`);
    const { data } = response;

    return data;
};

export const fetchScoreCriteriaTable = async (organizerId: number) => {
    const response = await axios.get(`/criteria/criteria-list/scores/organizer/${organizerId}`);
    const { data } = response;

    return data;
};

export const fetchScoreArchivedCriteriaTable = async (organizerId: number) => {
    const response = await axios.get(`/criteria/criteria-list/scores/archived/organizer/${organizerId}`);
    const { data } = response;

    return data;
};

export const fetchTeamParticipant = async (contestId: number) => {
    const response = await axios.get(`judging/contest/${contestId}/participants-team`);
    const { data } = response;
    const { participants } = data;
    return participants ?? [];
};

export const fetchParticipant = async (contestId: number) => {
    const response = await axios.get(`judging/contest/${contestId}/participants`);
    const { data } = response;
    const { participants } = data;
    return participants ?? [];
};

export const updateCriteria = async (evaluation_criteria: string, id: string) => {
    return await axios.put(`criteria/${id}/point-based`, {
        evaluation_criteria: evaluation_criteria,
    });
};

export const updateRankCriteria = async (evaluation_criteria: string, id: string) => {
    return await axios.put(`criteria/${id}/rank-based`, {
        evaluation_criteria: evaluation_criteria,
    });
};

export const updateMultipleBasedCriteria = async (evaluation_criteria: string, id: number) => {
    return await axios.put(`criteria/${id}/multiple-round`, {
        evaluation_criteria: evaluation_criteria,
    });
};

export const deleteCriteria = async (id: string) => {
    return await axios.delete(`criteria/criteria-list/${id}/scores`);
};

export const archivedCriteria = async (id: string) => {
    return await axios.post(`criteria/criteria-list/${id}/scores/archived`);
};

export const archivedRestoreCriteria = async (id: string) => {
    return await axios.post(`criteria/criteria-list/${id}/scores/archived/restore`);
};
