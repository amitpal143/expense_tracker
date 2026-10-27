const getDateRange = (range) => {
    const now = new Date();
    let start;

    switch (range) {
        case "daily":
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "weekly":
            // Week starts on Sunday at 00:00 (local server time)
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            break;
        case "yearly":
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case "monthly":
        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end: new Date() };
};

export default getDateRange;
