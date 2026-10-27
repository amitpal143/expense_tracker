import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, parseDate, isObjectId, validateTransaction } from "../utils/validate.js";
import getDateRange from "../utils/datefilter.js";

test("parseAmount accepts positive numbers and numeric strings", () => {
    assert.equal(parseAmount(10), 10);
    assert.equal(parseAmount("12.5"), 12.5);
});

test("parseAmount rejects 0, negative, NaN, huge, empty and non-scalars", () => {
    for (const v of [0, -5, "abc", "", "  ", NaN, Infinity, 1e13, null, undefined, {}, [], true]) {
        assert.equal(parseAmount(v), null, `should reject ${JSON.stringify(v)}`);
    }
});

test("parseDate", () => {
    assert.ok(parseDate("2026-10-25"));
    assert.equal(parseDate("not-a-date"), null);
    assert.equal(parseDate(""), null);
    assert.equal(parseDate({}), null);
});

test("isObjectId", () => {
    assert.ok(isObjectId("507f1f77bcf86cd799439011"));
    assert.equal(isObjectId("123"), false);
    assert.equal(isObjectId({ $ne: 1 }), false);
});

test("validateTransaction: create requires all fields", () => {
    const ok = { description: " Lunch ", amount: "20", category: "Food", date: "2026-10-25" };
    const r = validateTransaction(ok, true);
    assert.equal(r.value.description, "Lunch");
    assert.equal(r.value.amount, 20);
    assert.ok(validateTransaction({ ...ok, amount: 0 }, true).error);
    assert.ok(validateTransaction({ ...ok, amount: -1 }, true).error);
    assert.ok(validateTransaction({ ...ok, date: "x" }, true).error);
    assert.ok(validateTransaction({ ...ok, description: "" }, true).error);
    assert.ok(validateTransaction({ ...ok, category: undefined }, true).error);
});

test("validateTransaction: partial update validates only supplied fields", () => {
    assert.equal(validateTransaction({ amount: 5 }, false).value.amount, 5);
    assert.ok(validateTransaction({}, false).error);
    assert.ok(validateTransaction({ amount: -5 }, false).error);
});

test("getDateRange: weekly starts at Sunday midnight, daily at today midnight", () => {
    const w = getDateRange("weekly").start;
    assert.equal(w.getDay(), 0);
    assert.equal(w.getHours(), 0);
    assert.equal(w.getMinutes(), 0);
    const d = getDateRange("daily").start;
    assert.equal(d.getHours(), 0);
    const m = getDateRange("monthly").start;
    assert.equal(m.getDate(), 1);
    const y = getDateRange("yearly").start;
    assert.equal(y.getMonth(), 0);
    assert.equal(y.getDate(), 1);
    assert.equal(getDateRange("garbage").start.getDate(), 1); // falls back to monthly
});
