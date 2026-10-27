import React, { useEffect, useMemo, useState } from "react";
import {
  dashboardStyles,
  trendStyles,
  chartStyles,
} from "../assets/dummystyle";

import {
  GAUGE_COLORS,
  COLORS,
  INCOME_COLORS,
  INCOME_CATEGORY_ICONS,
  EXPENSE_CATEGORY_ICONS,
} from "../assets/color";

import { useOutletContext } from "react-router-dom";

import {
  getTimeFrameRange,
  calculateData,
  getPreviousTimeFrameRange,
} from "../component/helper";

import axios from "axios";

import {
  ArrowDown,
  BarChart,
  ChevronDown,
  ChevronUp,
  TrendingUp as ProfitIcon,
  PiggyBank,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
  PieChart as PieChartIcon,
  PieChart,
  DollarSign,
} from "lucide-react";

import FinancialCard from "../component/FinancialCard";
import GaugeCard from "../component/GaugeCard";
import AddTransactionModal from "../component/add";

import {
  Cell,
  Legend,
  Pie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getToken, API_URL } from "../utils/auth";

// =====================================================
// SERVER ENDPOINT
// =====================================================

const API_BASE = API_URL;

// =====================================================
// AUTH HEADER
// =====================================================

const getAuthheader = () => {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

// =====================================================
// CONVERT DATE INTO ISO
// =====================================================

function toIsoWithClientTime(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();

    const hhmmss = now.toTimeString().slice(0, 8);

    const combined = new Date(`${dateValue}T${hhmmss}`);

    return combined.toISOString();
  }

  try {
    return new Date(dateValue).toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}

// =====================================================
// DASHBOARD COMPONENT
// =====================================================

const Dashboard = () => {
  const {
    transactions: outletTransactions = [],
    timeFrame = "monthly",
    setTimeFrame = () => {},
    refreshTransactions,
  } = useOutletContext();

  // ===================================================
  // STATES
  // ===================================================

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  // ===================================================
  // TIME FRAME
  // ===================================================

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame),
    [timeFrame]
  );

  const prevTimeFrameRange = useMemo(
    () => getPreviousTimeFrameRange(timeFrame),
    [timeFrame]
  );

  // ===================================================
  // DATE RANGE CHECK
  // ===================================================

  const isDateInRange = (date, start, end) => {
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);

    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return transactionDate >= startDate && transactionDate <= endDate;
  };

  // ===================================================
  // FILTER CURRENT TRANSACTIONS
  // ===================================================

  const filteredTransactions = useMemo(
    () =>
      (outletTransactions || []).filter((t) =>
        isDateInRange(
          t.date,
          timeFrameRange.start,
          timeFrameRange.end
        )
      ),
    [outletTransactions, timeFrameRange]
  );

  // ===================================================
  // FILTER PREVIOUS TRANSACTIONS
  // ===================================================

  const prevFilteredTransactions = useMemo(
    () =>
      (outletTransactions || []).filter((t) =>
        isDateInRange(
          t.date,
          prevTimeFrameRange.start,
          prevTimeFrameRange.end
        )
      ),
    [outletTransactions, prevTimeFrameRange]
  );

  // ===================================================
  // CURRENT TIME FRAME DATA
  // ===================================================

  const currentTimeFrameData = useMemo(() => {
    const data = calculateData(filteredTransactions);

    data.savings = data.income - data.expenses;

    return data;
  }, [filteredTransactions]);

  // ===================================================
  // PREVIOUS TIME FRAME DATA
  // ===================================================

  const prevTimeFrameData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);

    data.savings = data.income - data.expenses;

    return data;
  }, [prevFilteredTransactions]);

  // ===================================================
  // GAUGE DATA
  // ===================================================

  useEffect(() => {
    const maxValues = {
      income: Math.max(currentTimeFrameData.income, 5000),
      expenses: Math.max(currentTimeFrameData.expenses, 3000),
      savings: Math.max(
        Math.abs(currentTimeFrameData.savings),
        2000
      ),
    };

    setGaugeData([
      {
        name: "Income",
        value: currentTimeFrameData.income,
        max: maxValues.income,
      },
      {
        name: "Spent",
        value: currentTimeFrameData.expenses,
        max: maxValues.expenses,
      },
      {
        name: "Savings",
        value: currentTimeFrameData.savings,
        max: maxValues.savings,
      },
    ]);
  }, [currentTimeFrameData, timeFrame]);

  // ===================================================
  // DISPLAY VALUES
  // ===================================================

  const displayIncome =
    timeFrame === "monthly" &&
    typeof overviewMeta.monthlyIncome === "number"
      ? overviewMeta.monthlyIncome
      : currentTimeFrameData.income;

  const displayExpenses =
    timeFrame === "monthly" &&
    typeof overviewMeta.monthlyExpense === "number"
      ? overviewMeta.monthlyExpense
      : currentTimeFrameData.expenses;

  const displaySavings =
    timeFrame === "monthly" &&
    typeof overviewMeta.savings === "number"
      ? overviewMeta.savings
      : currentTimeFrameData.savings;

  // ===================================================
  // EXPENSE CHANGE
  // ===================================================

  const expenseChange = useMemo(() => {
    const prev = prevTimeFrameData.expenses;
    const curr = displayExpenses;

    if (!prev) {
      if (!curr) return 0;

      return 100;
    }

    return Math.round(((curr - prev) / prev) * 100);
  }, [prevTimeFrameData, displayExpenses]);

  // ===================================================
  // FINANCIAL OVERVIEW DATA
  // ===================================================

  const financialOverviewData = useMemo(() => {
    if (
      timeFrame === "monthly" &&
      overviewMeta.expenseDistribution &&
      Array.isArray(overviewMeta.expenseDistribution) &&
      overviewMeta.expenseDistribution.length > 0
    ) {
      return overviewMeta.expenseDistribution.map((d) => ({
        name: d.category,
        value: Math.round(Number(d.amount) || 0),
      }));
    }

    const categories = {};

    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        categories[transaction.category] =
          (categories[transaction.category] || 0) +
          Number(transaction.amount || 0);
      }
    });

    return Object.keys(categories).map((category) => ({
      name: category,
      value: Math.round(categories[category]),
    }));
  }, [filteredTransactions, overviewMeta, timeFrame]);

  // ===================================================
  // SERVER RECENT TRANSACTIONS
  // ===================================================

  const serverRecent = overviewMeta.recentTransactions || [];

  const serverRecentIncome = serverRecent
    .filter((t) => t.type === "income")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const serverRecentExpense = serverRecent
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // ===================================================
  // INCOME TRANSACTIONS
  // ===================================================

  const incomeTransactions = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "income")
        .sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        ),
    [filteredTransactions]
  );

  // ===================================================
  // EXPENSE TRANSACTIONS
  // ===================================================

  const expenseTransactions = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "expense")
        .sort(
          (a, b) =>
            new Date(b.date) - new Date(a.date)
        ),
    [filteredTransactions]
  );

  // ===================================================
  // LISTS FOR DISPLAY
  // ===================================================

  const incomeListForDisplay =
    timeFrame === "monthly" &&
    serverRecentIncome.length > 0
      ? serverRecentIncome
      : incomeTransactions;

  const expenseListForDisplay =
    timeFrame === "monthly" &&
    serverRecentExpense.length > 0
      ? serverRecentExpense
      : expenseTransactions;

  const displayedIncome = showAllIncome
    ? incomeListForDisplay
    : incomeListForDisplay.slice(0, 3);

  const displayedExpense = showAllExpense
    ? expenseListForDisplay
    : expenseListForDisplay.slice(0, 3);

  // ===================================================
  // FETCH DASHBOARD OVERVIEW
  // ===================================================

  const fetchDashboardOverview = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/overview/overview`,
        {
          headers: getAuthheader(),
        }
      );

      if (res?.data?.success) {
        const data = res.data.data;

        // -----------------------------------------------
        // Recent Transactions
        // -----------------------------------------------

        const recent = (
          data.recentTransactions || []
        ).map((item) => {
          const typeFromServer =
            item.type ||
            (item.category ? "expense" : "income");

          const amountNum = Number(item.amount) || 0;

          const isoDate = item.date
            ? new Date(item.date).toISOString()
            : item.createdAt
            ? new Date(item.createdAt).toISOString()
            : new Date().toISOString();

          return {
            id:
              item._id ||
              item.id ||
              Date.now() + Math.random(),

            date: isoDate,

            description:
              item.description ||
              item.note ||
              item.title ||
              (typeFromServer === "income"
                ? item.source || "Income"
                : item.category || "Expense"),

            amount: amountNum,

            type: typeFromServer,

            category:
              item.category ||
              (typeFromServer === "income"
                ? "Salary"
                : "Other"),

            raw: item,
          };
        });

        // -----------------------------------------------
        // Overview Meta
        // -----------------------------------------------

        setOverviewMeta((prev) => ({
          ...prev,

          monthlyIncome: Number(
            data.monthlyIncome || 0
          ),

          monthlyExpense: Number(
            data.monthlyExpense || 0
          ),

          savings:
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : Number(data.monthlyIncome || 0) -
                Number(data.monthlyExpense || 0),

          savingsRate:
            typeof data.savingsRate !== "undefined"
              ? data.savingsRate
              : null,

          spendByCategory:
            data.spendByCategory || {},

          expenseDistribution:
            data.expenseDistribution || [],

          recentTransactions: recent,
        }));

        // -----------------------------------------------
        // Monthly Gauge Data
        // -----------------------------------------------

        if (timeFrame === "monthly") {
          const monthlyIncome = Number(
            data.monthlyIncome || 0
          );

          const monthlyExpense = Number(
            data.monthlyExpense || 0
          );

          const savings =
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : monthlyIncome - monthlyExpense;

          const maxValues = {
            income: Math.max(monthlyIncome, 5000),
            expenses: Math.max(monthlyExpense, 3000),
            savings: Math.max(
              Math.abs(savings),
              2000
            ),
          };

          setGaugeData([
            {
              name: "Income",
              value: monthlyIncome,
              max: maxValues.income,
            },
            {
              name: "Spent",
              value: monthlyExpense,
              max: maxValues.expenses,
            },
            {
              name: "Savings",
              value: savings,
              max: maxValues.savings,
            },
          ]);
        }
      } else {
        console.warn(
          "Dashboard endpoint returned success:false",
          res?.data
        );
      }
    } catch (err) {
      console.error(
        "Failed to fetch dashboard overview:",
        err?.response || err.message || err
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH OVERVIEW ON LOAD
  // ===================================================

  useEffect(() => {
    fetchDashboardOverview();
  }, []);

  // ===================================================
  // ADD TRANSACTION
  // ===================================================

  const handleaddTransaction = async () => {
    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (
      !newTransaction.description ||
      !newTransaction.amount ||
      !newTransaction.category ||
      !newTransaction.date
    ) {
      return;
    }

    // -----------------------------------------------
    // Transaction Type
    // -----------------------------------------------

    const transactionType = String(
      newTransaction.type
    ).toLowerCase();

    // -----------------------------------------------
    // Payload
    // -----------------------------------------------

    const payload = {
      date: toIsoWithClientTime(
        newTransaction.date
      ),

      description: newTransaction.description,

      amount: parseFloat(
        newTransaction.amount
      ),

      category: newTransaction.category,

      type: transactionType,
    };

    try {
      setLoading(true);

      // =============================================
      // INCOME
      // =============================================

      if (transactionType === "income") {

        await axios.post(
          `${API_BASE}/income/addincome`,
          payload,
          {
            headers: getAuthheader(),
          }
        );
      }

      // =============================================
      // EXPENSE
      // =============================================

      else if (transactionType === "expense") {

        await axios.post(
          `${API_BASE}/expense/add`,
          payload,
          {
            headers: getAuthheader(),
          }
        );
      }

      // =============================================
      // INVALID TYPE
      // =============================================

      else {
        console.error(
          "Invalid transaction type:",
          newTransaction.type
        );

        return;
      }

      // -----------------------------------------------
      // Refresh Data
      // -----------------------------------------------

      await refreshTransactions();
      await fetchDashboardOverview();

      // -----------------------------------------------
      // Reset Form
      // -----------------------------------------------

      setNewTransaction({
        date: new Date()
          .toISOString()
          .split("T")[0],

        description: "",

        amount: "",

        type: "expense",

        category: "Food",
      });

      setShowModal(false);
    } catch (err) {
      console.error(
        "❌ Transaction not added:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // RETURN / UI
  // ===================================================

  return (
    <div className={dashboardStyles.container}>

      {/* ==============================================
          HEADER
      ============================================== */}

      <div className={dashboardStyles.headerContainer}>
        <div className={dashboardStyles.headerContent}>

          <div>
            <h1 className={dashboardStyles.headerTitle}>
              Finance Dashboard
            </h1>

            <p className={dashboardStyles.headerSubtitle}>
              Track Your Income and Expense
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={dashboardStyles.addButton}
          >
            <Plus size={20} />
            ADD Transaction
          </button>

        </div>

        {/* Time Frame */}

        <div className={dashboardStyles.timeFrameContainer}>
          <div className={dashboardStyles.timeFrameWrapper}>

            {["daily", "weekly", "monthly"].map(
              (frame) => (
                <button
                  key={frame}
                  onClick={() => setTimeFrame(frame)}
                  className={dashboardStyles.timeFrameButton(
                    timeFrame === frame
                  )}
                >
                  {frame.charAt(0).toUpperCase() +
                    frame.slice(1)}
                </button>
              )
            )}

          </div>
        </div>
      </div>

      {/* ==============================================
          SUMMARY CARDS
      ============================================== */}

      <div className={dashboardStyles.summaryGrid}>

        {/* Total Balance */}

        <FinancialCard
          icon={
            <div
              className={
                dashboardStyles.walletIconContainer
              }
            >
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
          }
          label="Total Balance"
          value={`$${Math.round(
            displayIncome - displayExpenses
          ).toLocaleString()}`}
          additionalContent={
            <div className="flex items-center gap-2 mt-2 text-sm">

              <span
                className={
                  dashboardStyles.balanceBadge
                }
              >
                +${Math.round(
                  displayIncome
                ).toLocaleString()}
              </span>

              <span
                className={
                  dashboardStyles.expenseBadge
                }
              >
                -${Math.round(
                  displayExpenses
                ).toLocaleString()}
              </span>

            </div>
          }
        />

        {/* Expenses */}

        <FinancialCard
          icon={
            <div
              className={
                dashboardStyles.arrowDownIconContainer
              }
            >
              <ArrowDown className="w-5 h-5 text-orange-600" />
            </div>
          }
          label={`${timeFrameRange.label} Expenses`}
          value={`$${Math.round(
            displayExpenses
          ).toLocaleString()}`}
          additionalContent={
            <div
              className={`mt-2 text-xs flex items-center gap-1 ${
                expenseChange >= 0
                  ? trendStyles.positive
                  : trendStyles.negative
              }`}
            >

              {expenseChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}

              <span>
                {Math.abs(expenseChange)}%{" "}
                {expenseChange >= 0
                  ? "Increase"
                  : "Decrease"}{" "}
                from{" "}
                {prevTimeFrameRange.label}
              </span>

            </div>
          }
        />

        {/* Savings */}

        <FinancialCard
          icon={
            <div
              className={
                dashboardStyles.piggyBankIconContainer
              }
            >
              <PiggyBank className="w-5 h-5 text-cyan-600" />
            </div>
          }
          label={timeFrameRange.label}
          value={`$${Math.round(
            displaySavings
          ).toLocaleString()}`}
          additionalContent={
            <div className="mt-2 text-xs flex items-center gap-2">

              <div className="flex items-center gap-1">
                <BarChart className="w-4 h-4" />

                <span>
                  {displayIncome > 0
                    ? Math.round(
                        (displaySavings /
                          displayIncome) *
                          100
                      )
                    : 0}
                  %
                </span>

                {typeof overviewMeta.savingsRate ===
                  "number" && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      overviewMeta.savingsRate < 0
                        ? trendStyles.negativeRate
                        : trendStyles.positiveRate
                    }`}
                  >
                    {overviewMeta.savingsRate}
                  </span>
                )}

              </div>

            </div>
          }
        />

      </div>

      {/* ==============================================
          GAUGE CARDS
      ============================================== */}

      <div className={dashboardStyles.gaugeGrid}>

        {gaugeData.map((gauge) => (
          <GaugeCard
            key={gauge.name}
            gauge={gauge}
            colorInfo={
              GAUGE_COLORS[gauge.name]
            }
            timeFrameLabel={
              timeFrameRange.label
            }
            highlightNegative={
              gauge.name === "Savings"
            }
          />
        ))}

      </div>

      {/* ==============================================
          PIE CHART
      ============================================== */}

      <div
        className={
          dashboardStyles.pieChartContainer
        }
      >

        <div
          className={
            dashboardStyles.pieChartHeader
          }
        >
          <h3
            className={
              dashboardStyles.pieChartTitle
            }
          >
            <PieChartIcon className="w-6 h-6 text-teal-500" />

            Expense Distribution

            <span
              className={
                dashboardStyles.listSubtitle
              }
            >
              {" "}
              ({timeFrameRange.label})
            </span>
          </h3>
        </div>

        <div
          className={
            dashboardStyles.pieChartHeight
          }
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart
              className={chartStyles.pieChart}
            >
              <Pie
                data={financialOverviewData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${Math.round(
                    percent * 100
                  )}%`
                }
                labelLine={false}
              >
                {financialOverviewData.map(
                  (entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[
                          index % COLORS.length
                        ]
                      }
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )
                )}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  `$${Math.round(
                    value
                  ).toLocaleString()}`,
                  "Amount",
                ]}
                contentStyle={
                  dashboardStyles.tooltipContent
                }
                itemStyle={
                  dashboardStyles.tooltipItem
                }
              />

              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(v) => (
                  <span
                    className={
                      dashboardStyles.legendText
                    }
                  >
                    {v}
                  </span>
                )}
                iconSize={10}
                iconType="circle"
                wrapperStyle={
                  dashboardStyles.legendWrapper
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ==============================================
          INCOME + EXPENSE LISTS
      ============================================== */}

      <div className={dashboardStyles.listsGrid}>

        {/* ============================================
            INCOME COLUMN
        ============================================ */}

        <div
          className={
            dashboardStyles.listContainer
          }
        >

          <div
            className={
              dashboardStyles.listHeader
            }
          >
            <h3
              className={
                dashboardStyles.listTitle
              }
            >
              <ProfitIcon className="w-6 h-6 text-green-500" />

              Recent Income{" "}

              <span
                className={
                  dashboardStyles.listSubtitle
                }
              >
                ({timeFrameRange.label})
              </span>
            </h3>

            <span
              className={
                dashboardStyles.incomeCountBadge
              }
            >
              {incomeListForDisplay.length} records
            </span>
          </div>

          <div
            className={
              dashboardStyles.transactionList
            }
          >

            {displayedIncome.map(
              (transaction) => {
                const IconComponent =
                  INCOME_CATEGORY_ICONS[
                    transaction.category
                  ] ||
                  INCOME_CATEGORY_ICONS.Other;

                return (
                  <div
                    key={transaction.id}
                    className={
                      dashboardStyles.incomeTransactionItem
                    }
                  >

                    <div
                      className={
                        dashboardStyles.transactionContent
                      }
                    >

                      <div
                        className={
                          dashboardStyles.incomeIconContainer
                        }
                      >
                        {IconComponent}
                      </div>

                      <div>
                        <p
                          className={
                            dashboardStyles.transactionDescription
                          }
                        >
                          {transaction.description}
                        </p>

                        <p
                          className={
                            dashboardStyles.transactionCategory
                          }
                        >
                          {transaction.category}
                        </p>
                      </div>

                    </div>

                    <div
                      className={
                        dashboardStyles.transactionAmount
                      }
                    >
                      <p
                        className={
                          dashboardStyles.incomeAmount
                        }
                      >
                        +$
                        {Math.abs(
                          transaction.amount
                        ).toLocaleString()}
                      </p>

                      <p
                        className={
                          dashboardStyles.transactionDate
                        }
                      >
                        {new Date(
                          transaction.date
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                );
              }
            )}

            {/* Empty Income */}

            {incomeListForDisplay.length === 0 && (
              <div
                className={
                  dashboardStyles.emptyState
                }
              >
                <div
                  className={dashboardStyles.emptyIconContainer(
                    "bg-green-50"
                  )}
                >
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>

                <p
                  className={
                    dashboardStyles.emptyText
                  }
                >
                  No income transactions
                </p>
              </div>
            )}

            {/* View All Income */}

            {incomeListForDisplay.length > 3 && (
              <div
                className={
                  dashboardStyles.viewAllContainer
                }
              >
                <button
                  onClick={() =>
                    setShowAllIncome(
                      !showAllIncome
                    )
                  }
                  className={
                    dashboardStyles.viewAllButton
                  }
                >
                  {showAllIncome ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Income (
                      {incomeListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ============================================
            EXPENSE COLUMN
        ============================================ */}

        <div
          className={
            dashboardStyles.listContainer
          }
        >

          <div
            className={
              dashboardStyles.listHeader
            }
          >
            <h3 className="text-lg md:text-xl lg:text-xl xl:text-xl font-bold text-gray-800 md:mt-3 mt-3 flex items-center gap-3">

              <ArrowDown className="w-6 h-6 text-orange-500" />

              Recent Expenses{" "}

              <span
                className={
                  dashboardStyles.listSubtitle
                }
              >
                ({timeFrameRange.label})
              </span>

            </h3>

            <span
              className={
                dashboardStyles.expenseCountBadge
              }
            >
              {expenseListForDisplay.length} records
            </span>
          </div>

          <div
            className={
              dashboardStyles.transactionList
            }
          >

            {displayedExpense.map(
              (transaction) => {
                const IconComponent =
                  EXPENSE_CATEGORY_ICONS[
                    transaction.category
                  ] ||
                  EXPENSE_CATEGORY_ICONS.Other;

                return (
                  <div
                    key={transaction.id}
                    className={
                      dashboardStyles.expenseTransactionItem
                    }
                  >

                    <div
                      className={
                        dashboardStyles.transactionContent
                      }
                    >

                      <div
                        className={
                          dashboardStyles.expenseIconContainer
                        }
                      >
                        {IconComponent}
                      </div>

                      <div>
                        <p
                          className={
                            dashboardStyles.transactionDescription
                          }
                        >
                          {transaction.description}
                        </p>

                        <p
                          className={
                            dashboardStyles.transactionCategory
                          }
                        >
                          {transaction.category}
                        </p>
                      </div>

                    </div>

                    <div
                      className={
                        dashboardStyles.transactionAmount
                      }
                    >
                      <p
                        className={
                          dashboardStyles.expenseAmount
                        }
                      >
                        -$
                        {Math.abs(
                          transaction.amount
                        ).toLocaleString()}
                      </p>

                      <p
                        className={
                          dashboardStyles.transactionDate
                        }
                      >
                        {new Date(
                          transaction.date
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                );
              }
            )}

            {/* Empty Expense */}

            {expenseListForDisplay.length === 0 && (
              <div
                className={
                  dashboardStyles.emptyState
                }
              >
                <div
                  className={dashboardStyles.emptyIconContainer(
                    "bg-orange-50"
                  )}
                >
                  <ShoppingCart className="w-8 h-8 text-orange-400" />
                </div>

                <p
                  className={
                    dashboardStyles.emptyText
                  }
                >
                  No expense transactions
                </p>
              </div>
            )}

            {/* View All Expense */}

            {expenseListForDisplay.length > 3 && (
              <div
                className={
                  dashboardStyles.viewAllContainer
                }
              >
                <button
                  onClick={() =>
                    setShowAllExpense(
                      !showAllExpense
                    )
                  }
                  className={
                    dashboardStyles.viewAllButton
                  }
                >
                  {showAllExpense ? (
                    <>
                      <ChevronUp className="w-5 h-5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      View All Expenses (
                      {expenseListForDisplay.length})
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ==============================================
          ADD TRANSACTION MODAL
      ============================================== */}

      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={
          handleaddTransaction
        }
        title="Add Transaction"
      />

    </div>
  );
};

export default Dashboard;