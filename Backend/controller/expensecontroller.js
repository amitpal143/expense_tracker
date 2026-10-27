import expensemodel from "../Models/expense.js";
import buildTransactionController from "./transactionFactory.js";

const c = buildTransactionController({
    model: expensemodel,
    label: "expense",
    totalKey: "totalExpense",
    averageKey: "averageExpense",
    recentCount: 9,
    sheetName: "expense",
});

export const addexpense = c.add;
export const getexpense = c.list;
export const updateexpense = c.update;
export const deleteexpense = c.remove;
export const downloadsheet = c.download;
export const expenseoverview = c.overview;
