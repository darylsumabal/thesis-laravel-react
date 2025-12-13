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
