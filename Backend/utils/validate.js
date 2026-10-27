// Small dependency-free validation helpers (safe to unit test).

export const isObjectId = (v) => typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

export const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

export const MAX_AMOUNT = 1e12;

// Accepts numbers or numeric strings; must be finite, > 0 and <= MAX_AMOUNT
export function parseAmount(v) {
    if (typeof v === "string" && v.trim() === "") return null;
    if (typeof v !== "number" && typeof v !== "string") return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0 || n > MAX_AMOUNT) return null;
    return n;
}

export function parseDate(v) {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v !== "string" && typeof v !== "number") return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
}

// Validates a transaction body. Returns { error } or { value }.
// requireAll=true for create; false for update (only supplied fields are checked).
export function validateTransaction(body, requireAll) {
    const b = body && typeof body === "object" ? body : {};
    const out = {};

    if (requireAll || b.description !== undefined) {
        if (!isNonEmptyString(b.description)) return { error: "Description is required" };
        if (b.description.trim().length > 200) return { error: "Description is too long (max 200)" };
        out.description = b.description.trim();
    }
    if (requireAll || b.amount !== undefined) {
        const amount = parseAmount(b.amount);
        if (amount === null) return { error: "Amount must be a positive number" };
        out.amount = amount;
    }
    if (requireAll || b.category !== undefined) {
        if (!isNonEmptyString(b.category)) return { error: "Category is required" };
        if (b.category.trim().length > 50) return { error: "Category is too long (max 50)" };
        out.category = b.category.trim();
    }
    if (requireAll || b.date !== undefined) {
        const date = parseDate(b.date);
        if (!date) return { error: "A valid date is required" };
        out.date = date;
    }
    if (!requireAll && Object.keys(out).length === 0) {
        return { error: "Nothing to update" };
    }
    return { value: out };
}
