import incomemodel from "../Models/income.js";
import buildTransactionController from "./transactionFactory.js";

const c = buildTransactionController({
    model: incomemodel,
    label: "income",
    totalKey: "totalIncome",
    averageKey: "averageIncome",
    recentCount: 9,
    sheetName: "income",
});

export const addincome = c.add;
export const getincome = c.list;
export const updateincome = c.update;
export const deleteincome = c.remove;
export const downloadsheet = c.download;
export const incomeoverview = c.overview;
