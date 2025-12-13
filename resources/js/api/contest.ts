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
