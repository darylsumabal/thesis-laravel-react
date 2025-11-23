export const EVENT = {
    ADD: '/dashboard/event/add-event',
    UPCOMING: '/dashboard/event/upcoming-event-list',
    ADD_CONTEST: '/dashboard/event/upcoming-event-list/:event_id/add-contest',
} as const;

export const CONTEST = {
    TABLE: '/dashboard/contest/contest-list',
    PARTICIPANT: '/dashboard/contest/contest-list/:contest_id/card/individual/participant',
    TEAM_PARTICIPANT: '/dashboard/contest/contest-list/:contest_id/card/team/team-participant',
    // CARD: {
    //   INDIVIDUAL: "/dashboard/contest/contest-list/:contest_id/card/individual",
    //   TEAM: "/dashboard/contest/contest-list/:contest_id/card/team",
    // },
    CARD: {
        INDIVIDUAL: '/dashboard/event/upcoming-event-list/:contest_id/add-contest/:contest_id/card/individual',
        TEAM: '/dashboard/event/upcoming-event-list/:contest_id/add-contest/:contest_id/card/team',
    },
    // dashboard/event/upcoming-event-list/1/add-contest/1/card/team
} as const;

export const SCORING = {
    TABLE: {
        POINT: '/dashboard/scoring/point-based',
        RANK: '/dashboard/scoring/rank-based',
    },
    CARD: {
        POINT: {
            SR: {
                INDIVIDUAL: '/dashboard/scoring/point-based/contest/:id/individual/sr',
            },
            MR: {
                INDIVIDUAL: '/dashboard/scoring/point-based/contest/:id/individual/mr',
            },
            TEAM: {
                SR: '/dashboard/scoring/point-based/contest/:id/team/sr',
                MR: '/dashboard/scoring/point-based/contest/:id/team/mr',
            },
        },
        RANK: {
            SR: {
                INDIVIDUAL: '/dashboard/scoring/rank-based/contest/:id/individual/sr',
            },
            MR: {
                INDIVIDUAL: '/dashboard/scoring/rank-based/contest/:id/individual/mr',
            },
            TEAM: {
                SR: '/dashboard/scoring/rank-based/contest/:id/team/sr',
                MR: '/dashboard/scoring/rank-based/contest/:id/team/mr',
            },
        },
    },
    CREATE_CRITERIA: {
        POINT: {
            SR: {
                INDIVIDUAL: '/dashboard/scoring/point-based/contest/:id/individual/sr/create-criteria',
            },
            MR: {
                INDIVIDUAL: '/dashboard/scoring/point-based/contest/:id/individual/mr/create-criteria',
            },
            TEAM: {
                SR: '/dashboard/scoring/point-based/contest/:id/team/sr/create-criteria',
                MR: '/dashboard/scoring/point-based/contest/:id/team/mr/create-criteria',
            },
        },
        RANK: {
            SR: {
                INDIVIDUAL: '/dashboard/scoring/rank-based/contest/:id/individual/sr/create-criteria',
            },
            MR: {
                INDIVIDUAL: '/dashboard/scoring/rank-based/contest/:id/individual/mr/create-criteria',
            },
            TEAM: {
                SR: '/dashboard/scoring/rank-based/contest/:id/team/sr/create-criteria',
                MR: '/dashboard/scoring/rank-based/contest/:id/team/mr/create-criteria',
            },
        },
    },
} as const;

export const CRITERIA = {
    LIST: '/dashboard/criteria-list',
    CARD: {
        INDIVIDUAL: {
            POINT: '/dashboard/criteria-list/contest/:contest_id/:group_id/point/individual',
            RANK: '/dashboard/criteria-list/contest/:contest_id/:group_id/rank/individual',
        },
        TEAM: {
            POINT: '/dashboard/criteria-list/contest/:contest_id/:group_id/point/team',
            RANK: '/dashboard/criteria-list/contest/:contest_id/:group_id/rank/team',
        },
    },
    TABLE: {
        INDIVIDUAL: {
            POINT: '/dashboard/criteria-list/contest/:contest_id/:group_id/point-based/individual/table',
            RANK: '/dashboard/criteria-list/contest/:contest_id/:group_id/rank-based/individual/table',
        },
        TEAM: {
            POINT: '/dashboard/criteria-list/contest/:contest_id/:group_id/point-based/team/table',
            RANK: '/dashboard/criteria-list/contest/:contest_id/:group_id/rank-based/team/table',
        },
    },
} as const;

export const RESULT = {
    TABLE: '/dashboard/result/contest-result',
    CARD: {
        INDIVIDUAL: {
            POINT: {
                SR: '/dashboard/result/contest-result/point-sr/:contest_id/:group_id/contest-card/individual',
                MR: '/dashboard/result/contest-result/point-mr/:contest_id/:group_id/contest-card/individual',
            },
            RANK: {
                SR: '/dashboard/result/contest-result/rank-sr/:contest_id/:group_id/contest-card/individual',
                MR: '/dashboard/result/contest-result/rank-mr/:contest_id/:group_id/contest-card/individual',
            },
        },
        TEAM: {
            POINT: {
                SR: '/dashboard/result/contest-result/point-sr/:contest_id/:group_id/contest-card/team',
                MR: '/dashboard/result/contest-result/point-mr/:contest_id/:group_id/contest-card/team',
            },
            RANK: {
                SR: '/dashboard/result/contest-result/rank-sr/:contest_id/:group_id/contest-card/team',
                MR: '/dashboard/result/contest-result/rank-mr/:contest_id/:group_id/contest-card/team',
            },
        },
    },
    SCORE: {
        INDIVIDUAL: {
            POINT: {
                SR: '/dashboard/result/contest-result/point-sr/:contest_id/:group_id/contest-card/individual/contest-judges',
                MR: '/dashboard/result/contest-result/point-mr/:contest_id/:group_id/contest-card/individual/contest-judges',
            },
            RANK: {
                SR: '/dashboard/result/contest-result/rank-sr/:contest_id/:group_id/contest-card/individual/contest-judges',
                MR: '/dashboard/result/contest-result/rank-mr/:contest_id/:group_id/contest-card/individual/contest-judges',
            },
        },
        TEAM: {
            POINT: {
                SR: '/dashboard/result/contest-result/point-sr/:contest_id/:group_id/contest-card/team/contest-judges',
                MR: '/dashboard/result/contest-result/point-mr/:contest_id/:group_id/contest-card/team/contest-judges',
            },
            RANK: {
                SR: '/dashboard/result/contest-result/rank-sr/:contest_id/:group_id/contest-card/team/contest-judges',
                MR: '/dashboard/result/contest-result/rank-mr/:contest_id/:group_id/contest-card/team/contest-judges',
            },
        },
    },
} as const;
