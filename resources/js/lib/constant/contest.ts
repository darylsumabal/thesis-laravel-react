import { Field } from "@/components/CardWrap";
import { ComboboxData } from "@/components/ActionCombobox";
import { ComboboxField } from "@/components/ActionForm";
import { Contests } from "@/api/contest";
import { Participant, TeamParticipant } from "@/api/result";

type ContestFields<T, R = string> = {
  label: string;
  value: (item: T) => R;
};

export const PARTICIPANT_FIELDS: ContestFields<Participant>[] = [
  { label: "Name", value: (item) => `${item.first_name} ${item.last_name}` },
  { label: "Description", value: (item) => item.description },
  { label: "Age", value: (item) => item.age },

  { label: "Gender", value: (item) => item.gender },
  {
    label: "Participant No",
    value: (item) => item.participant_no,
  },
];

export const TEAM_PARTICIPANT_FIELDS: ContestFields<TeamParticipant>[] = [
  { label: "Team Captain", value: (item) => item.team_captain },
  {
    label: "Team Name",
    value: (item) => item.team_name,
  },
  { label: "Team Description", value: (item) => item.team_description },

  { label: "Team No", value: (item) => item.team_participant_no },
];

export const CONTEST_FIELDS: ContestFields<Contests>[] = [
  // { label: "Event Name", value: (item) => item.event.name },
  // { label: "Event Organizer", value: (item) => item.event.organizer },
  { label: "Contest Name", value: (item) => item.contest_name },
  {
    label: "Description",
    value: (item) => item.contest_description,
  },
  { label: "Contest Organizer", value: (item) => item.contest_organizer },
  {
    label: "Type of Scoring",
    value: (item) => item.contest_scoring_type,
  },
  {
    label: "Category",
    value: (item) =>
      item.contest_gender_category === "maleFemale"
        ? "Male & Female"
        : item.contest_gender_category.charAt(0).toUpperCase() +
          item.contest_gender_category.slice(1).toLowerCase(),
  },
  { label: "Type of Contest", value: (item) => item.contest_type },
  { label: "Venue", value: (item) => item.contest_venue },
  { label: "Address", value: (item) => item.event.address },
];

export const COMBOBOX_INPUT_GENDER: ComboboxField[] = [
  {
    label: "GENDER",
    data: [
      {
        label: "SELECT",
        value: "",
      },
      {
        label: "Male",
        value: "Male",
      },
      {
        label: "Female",
        value: "Female",
      },
    ],
  },
];

export const FIELD_PARTICIPANT_CONTEST: Field[] = [
  {
    label: "PARTICIPANT NO",
    inputType: "number",
  },
  {
    label: "FIRST NAME",
    inputType: "text",
  },
  {
    label: "LAST NAME",
    inputType: "text",
  },
  {
    label: "DESCRIPTION",
    inputType: "textarea",
  },
  {
    label: "AGE",
    inputType: "number",
  },
  {
    label: "GENDER",
    inputType: "combobox",
  },
  {
    label: "IMAGE",
    inputType: "file",
  },
];

export const FIELD_NAME_PARTICIPANT = {
  "PARTICIPANT NO": "participant_no",
  "FIRST NAME": "first_name",
  "LAST NAME": "last_name",
  DESCRIPTION: "description",
  AGE: "age",
  GENDER: "gender",
  IMAGE: "poster_url",
} as const;

export const UPLOAD_FIELD_PARTICIPANT_CONTEST: Field[] = [
  {
    label: "UPLOAD FILE",
    inputType: "file",
  },
];

export const UPLOAD_FIELD_PARTICIPANT = {
  "UPLOAD FILE": "excel_file",
} as const;

export const UPLOAD_FIELD_TEAM_PARTICIPANT_CONTEST: Field[] = [
  {
    label: "UPLOAD FILE",
    inputType: "file",
  },
];

export const UPLOAD_FIELD_TEAM_PARTICIPANT = {
  "UPLOAD FILE": "excel_file",
} as const;

export const FIELD_TEAM_PARTICIPANT: Field[] = [
  {
    label: "TEAM PARTICIPANT NO",
    inputType: "number",
  },
  {
    label: "TEAM NAME",
    inputType: "text",
  },
  {
    label: "TEAM DESCRIPTION",
    inputType: "textarea",
  },
  {
    label: "TEAM CAPTAIN",
    inputType: "text",
  },
  {
    label: "IMAGE",
    inputType: "file",
  },
];

export const FIELD_NAME_TEAM_PARTICIPANT = {
  "TEAM PARTICIPANT NO": "team_participant_no",
  "TEAM NAME": "team_name",
  "TEAM DESCRIPTION": "team_description",
  "TEAM CAPTAIN": "team_captain",
  IMAGE: "poster_url",
} as const;

export const COMBOBOX_INPUT_PARTICIPANT: ComboboxData[] = [
  {
    value: "Individual Participants",
    label: "Individual Participants",
  },
  {
    value: "Upload Participants",
    label: "Upload Participants",
  },
];

export const COMBOBOX_INPUT_TEAM: ComboboxData[] = [
  {
    value: "Teams Participants",
    label: "Teams Participants",
  },
  {
    value: "Upload Teams Participants",
    label: "Upload Teams Participants",
  },
];

export const COMBOBOX_INPUT_GENDER_CATEGORY: ComboboxData[] = [
  {
    value: "Male",
    label: "Male",
  },
  {
    value: "Female",
    label: "Female",
  },
  {
    value: "Mixed",
    label: "Mixed",
  },
];

export const COMBOBOX_INPUT_CRITERIA_TYPE: ComboboxData[] = [
  {
    value: "Preliminary",
    label: "Preliminary",
  },
  {
    value: "Final",
    label: "Final",
  },
];

export const COMBOBOX_INPUT_COMPUTATION_TYPE: ComboboxData[] = [
  {
    value: "Preliminary and Final",
    label: "Preliminary and Final",
  },
  {
    value: "Final",
    label: "Final",
  },
];

// export const FIELD_EDIT_PARTICIPANT = {
//   "PARTICIPANT NO": "participant_no",
//   "FIRST NAME": "first_name",
//   "LAST NAME": "last_name",
//   DESCRIPTION: "description",
//   AGE: "age",
//   GENDER: "gender",
//   IMAGE: "poster_url",
// } as const;

export const FIELD_EDIT_CONTEST: Field[] = [
  {
    label: "CONTEST CATEGORY",
    inputType: "text",
  },
  {
    label: "DESCRIPTION",
    inputType: "textarea",
  },
  {
    label: "CONTEST ORGANIZER",
    inputType: "text",
  },
  {
    label: "CONTEST DATE",
    inputType: "date",
  },
  {
    label: "VENUE",
    inputType: "text",
  },
  {
    label: "POSTER",
    inputType: "file" as const,
  },
];

export const FIELD_NAME_EDIT_CONTEST = {
  "CONTEST CATEGORY": "contest_name",
  DESCRIPTION: "contest_description",
  "CONTEST ORGANIZER": "contest_organizer",
  "CONTEST DATE": "contest_date",
  VENUE: "contest_venue",
  POSTER: "contest_poster",
} as const;

export const scoreMap: Record<string, "sr" | "mr"> = {
  "Point Based Single Round": "sr",
  "Point Based Multiple Round": "mr",
  "Rank Based Single Round": "sr",
  "Rank Based Multiple Round": "mr",
};

export const scoringTypeMap: Record<string, "point_based" | "rank_based"> = {
  "Point Based Single Round": "point_based",
  "Point Based Multiple Round": "point_based",
  "Rank Based Single Round": "rank_based",
  "Rank Based Multiple Round": "rank_based",
};
