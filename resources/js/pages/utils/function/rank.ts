export const getRankBgClass = (rank: string, qualified: number | undefined) => {
    const r = parseFloat(rank);

    if (qualified !== undefined && r <= qualified) {
        // Top 3
        // if (r === 1) ; // 🥇 Gold
        return 'dark:bg-white dark:text-black text-white bg-black font-medium';
    }

    // Handle ties (like 3.5, 5.5, etc.)
    // if (!Number.isInteger(r)) {
    //   return "bg-black text-white font-medium"; // tie highlight
    // }
    return ''; // default

    //   const r = parseFloat(rank);

    //     if (qualified !== undefined && r <= qualified) {
    //       // Top 3
    //       if (r >= 1) return "bg-black text-white font-bold";
    //     }

    //     // Handle ties (like 3.5, 5.5, etc.)
    //     if (!Number.isInteger(r)) {
    //       return "bg-black text-white font-semibold"; // tie highlight
    //     }

    //     return ""; // default
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
