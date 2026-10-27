import incomemodel from "../Models/income.js";
import expensemodel from "../Models/expense.js";
import getDateRange from "../utils/datefilter.js";

export async function getoverview(req, res) {
    try {
        const userId = req.user._id;
        const { start, end } = getDateRange("monthly");

        const [incomes, expenses] = await Promise.all([
            incomemodel.find({ userId, date: { $gte: start, $lte: end } }).lean(),
            expensemodel.find({ userId, date: { $gte: start, $lte: end } }).lean(),
        ]);

        const sum = (arr) => arr.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const monthlyIncome = sum(incomes);
        const monthlyExpense = sum(expenses);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        // Newest first, by transaction date (falls back to creation time)
        const when = (t) => new Date(t.createdAt || t.date).getTime();
        const recentTransactions = [
            ...incomes.map((i) => ({ ...i, type: "income" })),
            ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date) - new Date(a.date) || when(b) - when(a));

        const spendByCategory = {};
        for (const exp of expenses) {
            const cat = exp.category || "Other";
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
            category,
            amount,
            percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        }));

        return res.status(200).json({
            success: true,
            data: {
                monthlyIncome,
                monthlyExpense,
                savings,
                savingsRate,
                spendByCategory,
                recentTransactions,
                expenseDistribution,
            },
        });
    } catch (error) {
        console.error("DASHBOARD ERROR:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}
