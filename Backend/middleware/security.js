// Dependency-free security helpers: basic headers + in-memory rate limiter.

export function securityHeaders(req, res, next) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.removeHeader("X-Powered-By");
    next();
}

export function rateLimit({ windowMs, max, message = "Too many requests, please try again later" }) {
    const hits = new Map();

    const timer = setInterval(() => {
        const now = Date.now();
        for (const [key, v] of hits) if (v.reset <= now) hits.delete(key);
    }, windowMs);
    timer.unref?.();

    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        let entry = hits.get(key);
        if (!entry || entry.reset <= now) {
            entry = { count: 0, reset: now + windowMs };
            hits.set(key, entry);
        }
        entry.count += 1;
        if (entry.count > max) {
            res.setHeader("Retry-After", Math.ceil((entry.reset - now) / 1000));
            return res.status(429).json({ success: false, message });
        }
        next();
    };
}
