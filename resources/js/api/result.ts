import axios from "axios";


export type TeamParticipant = {
  id: number;
  organizer_id: number;
  contest_id: number;
  team_participant_no: string;
  team_name: string;
  team_description: string;
  team_captain: string;
  poster_url: string;
};

export type Participant = {
  id: number;
  participant_no: string;
  age: string;
  first_name: string;
  description: string;
  last_name: string;
  gender: string;
  poster_url: string;
};

export type OverAllScore = {
  id: string;
  score: string;
  rank: string;
};

type JudgesScore = {
  id: number;
  score: number;
  judge_name: string;
  criteria: string;
  rank: number;
  total: number;
  total_score: number;
  total_rank: number;
  final_rank: number;
};

export type Score = {
  id: string;
  participant: Participant;
  total_scores: { [key: string]: string };
  overall_scores: OverAllScore;
  judges_score: JudgesScore[];
};

export type ScoreTest = {
  id: string;
  criteria: string;
  participant: Participant;
  participant_gender: string;
  judge_name: string;
  total_scores: { [key: string]: string };
  overall_scores: OverAllScore;
  judges_score: JudgesScore[];
};

export type ScoreTeam = {
  id: string;
  participant: TeamParticipant;
  total_scores: { [key: string]: string };
  overall_scores: OverAllScore;
  judges_score: JudgesScore[];
};

type Judges = {
  id: string;
  name: string;
  role: string;
};

export type JudgesGroup = {
  id: string;
  is_finished: number;
  round: number | string;
  contest?: { contest_scoring_type: string; contest_type: string };
  judges: Judges;
  isJudgeFinished: number;
  judge: Judges;
};
type J = JudgesGroup[];

type MultipleJudges = {
  round: number;
  isRoundFinished: boolean;
  judge_group: J;
  isJudgeFinished: boolean;
};

export type S = {
  judge_group: J;
  message: string;
  is_finished: boolean;
  // all_judges_finished: boolean;
};

export type JudgesGroups = {
  // rounds: {
    preliminary: S;
    final: S;
  // };
};

export type M = {
  rounds: MultipleJudges[];
};

// export const createResult = async (contest_id: number, group_id: string) => {
//   return axios.post(`result/contest/${contest_id}/${group_id}`);
// };

export const createResultTest = async (
  contest_id: number,
  group_id: string,
  resultType: string,
  roundType: string
) => {
  return axios.post(
    `result/contest/${contest_id}/${group_id}/${resultType}/${roundType}/test`
  );
};

export const createResultSingleRound = async (
  contest_id: number,
  group_id: string,
  resultType: string,
  roundType: string
) => {
  return axios.post(
    `result/contest/${contest_id}/${group_id}/${resultType}/${roundType}/single`
  );
};

export const createResultTestTeam = async (
  contest_id: number,
  group_id: string,
  resultType: string,
  roundType: string
) => {
  return axios.post(
    `result/contest/${contest_id}/${group_id}/${resultType}/${roundType}/test/team`
  );
};

export const createResultSingleRoundTeam = async (
  contest_id: number,
  group_id: string,
  resultType: string,
  roundType: string
) => {
  return axios.post(
    `result/contest/${contest_id}/${group_id}/${resultType}/${roundType}/single/team`
  );
};

export const createResultFinal = async (
  contest_id: number,
  group_id: string,
  resultType: string
) => {
  return axios.post(
    `result/contest/${contest_id}/${group_id}/${resultType}/final`
  );
};

export const fetchResultTest = async (contestId: number, groupId: string) => {
  const response = await axios.get(
    `result/contest/test/${contestId}/${groupId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultTestTeam = async (
  contestId: number,
  groupId: string
) => {
  const response = await axios.get(
    `result/contest/test/team/${contestId}/${groupId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultJudge = async (
  contestId: number,
  groupId: string,
  judgeId: string
) => {
  const response = await axios.get(
    `result/contest/judges/${contestId}/${groupId}/${judgeId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;

    return results;
  }
};

export const fetchResultJudgeTeam = async (
  contestId: number,
  groupId: string,
  judgeId: string
) => {
  const response = await axios.get(
    `result/contest/judges/team/${contestId}/${groupId}/${judgeId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;

    return results;
  }
};

export const fetchMajorAward = async (groupId: string, contestId: number) => {
  const response = await axios.get(
    `scoring/final/major/award/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchMajorTeamAward = async (
  groupId: string,
  contestId: number
) => {
  const response = await axios.get(
    `scoring/final/major/award/team/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchFinalResult = async (groupId: string, contestId: number) => {
  const response = await axios.get(
    `scoring/final/result/top/${groupId}/${contestId}`
  );
  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchFinalResultTeam = async (
  groupId: string,
  contestId: number
) => {
  const response = await axios.get(
    `scoring/final/result/top/team/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchFinalResultSingleRound = async (
  groupId: string,
  contestId: number,
  criteria: string
) => {
  const response = await axios.get(
    `scoring/final/result/top/round/${groupId}/${contestId}/${criteria}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchFinalResultSingleRoundTeam = async (
  groupId: string,
  contestId: number,
  criteria: string
) => {
  const response = await axios.get(
    `scoring/final/result/top/round/team/${groupId}/${contestId}/${criteria}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchFinal = async (groupId: string, contestId: number) => {
  const response = await axios.get(
    `scoring/final/result/round/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchFinalTeam = async (groupId: string, contestId: number) => {
  const response = await axios.get(
    `scoring/final/result/round/team/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchTopResult = async (groupId: string, contestId: number) => {
  const response = await axios.get(
    `scoring/final/top/award/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchTopResultTeam = async (
  groupId: string,
  contestId: number
) => {
  const response = await axios.get(
    `scoring/final/top/award/team/${groupId}/${contestId}`
  );
  const { data } = response;
  if (data.message) {
    return [];
  } else {
    const { major_awards } = data;
    return major_awards ?? [];
  }
};

export const fetchResultTestSystem = async (
  contestId: number,
  groupId: string
) => {
  const response = await axios.get(
    `result/contest/test/system/${contestId}/${groupId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultTestSystemTeam = async (
  contestId: number,
  groupId: string
) => {
  const response = await axios.get(
    `result/contest/test/system/team/${contestId}/${groupId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultTestSystemFinal = async (
  contestId: number,
  groupId: string
) => {
  const response = await axios.get(
    `result/contest/test/system/ranked/${contestId}/${groupId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultTestSystemFinalTeam = async (
  contestId: number,
  groupId: string
) => {
  const response = await axios.get(
    `result/contest/test/system/ranked/team/${contestId}/${groupId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultFinal = async (groupId: string, contestId: number) => {
  const response = await axios.get(
    `result/contest/final/${groupId}/${contestId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultFinalTeam = async (
  groupId: string,
  contestId: number
) => {
  const response = await axios.get(
    `result/contest/final/team/${groupId}/${contestId}`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultTeam = async (contest_id: number, group_id: string) => {
  const response = await axios.get(
    `result/contest/${contest_id}/${group_id}/team`
  );

  const { data } = response;

  if (data.message) {
    return [];
  } else {
    const { results } = data;
    return results ?? [];
  }
};

export const fetchResultMultiple = async (
  contest_id: number,
  group_id: string,
  round: number | undefined
) => {
  const response = await axios.get(
    `result/contest/multiple/${contest_id}/${group_id}/${round}`
  );
  const { data } = response;
  const { results } = data;
  return results ?? [];
};

export const fetchJudgesGroup = async (contestId: number, groupId: string) => {
  const response = await axios.get(
    `judging/judges/group/contest/${contestId}/${groupId}`
  );

  const { data } = response;
  return data;
};

export const updateJudgesGroup = async (
  contestId: number,
  groupId: string,
  judgeId: number,
  criteria: string
) => {
  return await axios.post(
    `judging/judges/update/${contestId}/${groupId}/${judgeId}`,
    { criteria }
  );
};

export const fetchJudgesGroupMultiple = async (
  contestId: number,
  groupId: string
) => {
  const response = await axios.get(
    `judging/judges/group/contest/multiple/${contestId}/${groupId}`
  );

  const { data } = response;
  return data;
};

export type ActivityLog = {
  action: string;
  changes: {
    before: {
      score: number;
      updated_at: string;
    };
    after: {
      score: number;
      updated_at: string;
    };
  };
  model_data: {
    round: "Final";
    criteria: string;
    evaluation_criteria: string;
    score: number;
  };
  judge: {
    name: string;
    email: string;
    role: string;
  };
  participant: {
    id: 2;
    contest_id: 1;
    participant_no: string;
    first_name: string;
    last_name: string;
    team_participant_no: string;
    team_name: string;
    gender: string;
  };
  updated_at: string;
};

export const fetchActivityLog = async (groupId: string) => {
  const response = await axios.get(`judging/activity-log/${groupId}`);
  const { data } = response;
  const { activity } = data;
  console.log(activity);
  return activity;
};
