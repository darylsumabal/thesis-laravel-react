export const getRankBgClass = (rank: string, qualified: number | undefined) => {
    const r = parseFloat(rank);

    if (qualified !== undefined && r <= qualified) {
        // Top 3
        // if (r === 1) ; // 🥇 Gold
        return 'bg-[#45226b] text-white font-medium';
    }
    return '';

};

export const formatRank = (rank: string) => {
    const r = parseFloat(rank);
    // if the number is an integer, return without decimal
    if (Number.isInteger(r)) {
        return r.toString();
    }
    // otherwise, keep the decimal
    return r.toFixed(1);
};
