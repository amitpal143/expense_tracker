import XLSX from "xlsx";
import getDateRange from "../utils/datefilter.js";
import { isObjectId, validateTransaction } from "../utils/validate.js";

// Builds the CRUD / overview / download handlers shared by income and expense.
export default function buildTransactionController({ model, label, totalKey, averageKey, recentCount, sheetName }) {
    const serverError = (res, where, error) => {
        console.error(`${where} ERROR:`, error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    };

    async function add(req, res) {
        try {
            const { error, value } = validateTransaction(req.body, true);
            if (error) return res.status(400).json({ success: false, message: error });

            // type is always decided by the route, never trusted from the client
            const doc = await model.create({ ...value, type: label, userId: req.user._id });

            return res.status(201).json({ success: true, message: `${label} added successfully`, data: doc });
        } catch (error) {
            if (error.name === "ValidationError") {
                return res.status(400).json({ success: false, message: "Invalid data" });
            }
            return serverError(res, `ADD ${label}`, error);
        }
    }

    async function list(req, res) {
        try {
            const items = await model.find({ userId: req.user._id }).sort({ date: -1 });
            return res.json(items);
        } catch (error) {
            return serverError(res, `GET ${label}`, error);
        }
    }

    async function update(req, res) {
        try {
            const { id } = req.params;
            if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid id" });

            const { error, value } = validateTransaction(req.body, false);
            if (error) return res.status(400).json({ success: false, message: error });

            const updated = await model.findOneAndUpdate(
                { _id: id, userId: req.user._id },
                value,
                { new: true, runValidators: true }
            );
            if (!updated) return res.status(404).json({ success: false, message: `${label} not found` });

            return res.status(200).json({ success: true, message: `${label} updated successfully`, data: updated });
        } catch (error) {
            return serverError(res, `UPDATE ${label}`, error);
        }
    }

    async function remove(req, res) {
        try {
            const { id } = req.params;
            if (!isObjectId(id)) return res.status(400).json({ success: false, message: "Invalid id" });

            const deleted = await model.findOneAndDelete({ _id: id, userId: req.user._id });
            if (!deleted) return res.status(404).json({ success: false, message: `${label} not found` });

            return res.status(200).json({ success: true, message: `${label} deleted successfully` });
        } catch (error) {
            return serverError(res, `DELETE ${label}`, error);
        }
    }

    // Built fully in memory and streamed: no shared file on disk, so users can't see each other's data
    async function download(req, res) {
        try {
            const items = await model.find({ userId: req.user._id }).sort({ date: -1 });

            const rows = items.map((i) => ({
                description: i.description,
                amount: i.amount,
                category: i.category,
                type: i.type,
                date: new Date(i.date).toISOString().slice(0, 10),
            }));

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), sheetName);
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename="${label}_details.xlsx"`);
            res.setHeader("Cache-Control", "no-store");
            return res.send(buffer);
        } catch (error) {
            return serverError(res, `DOWNLOAD ${label}`, error);
        }
    }

    async function overview(req, res) {
        try {
            const range = ["daily", "weekly", "monthly", "yearly"].includes(req.query.range)
                ? req.query.range
                : "monthly";
            const { start, end } = getDateRange(range);

            const items = await model
                .find({ userId: req.user._id, date: { $gte: start, $lte: end } })
                .sort({ date: -1 });

            const total = items.reduce((acc, cur) => acc + cur.amount, 0);

            return res.json({
                success: true,
                data: {
                    [totalKey]: total,
                    [averageKey]: items.length > 0 ? total / items.length : 0,
                    numberOfTransactions: items.length,
                    recentTransactions: items.slice(0, recentCount),
                    range,
                },
            });
        } catch (error) {
            return serverError(res, `OVERVIEW ${label}`, error);
        }
    }

    return { add, list, update, remove, download, overview };
}
