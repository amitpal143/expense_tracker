import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        description: { type: String, required: true, trim: true, maxlength: 200 },
        amount: { type: Number, required: true, min: [0.000001, "Amount must be positive"], max: 1e12 },
        category: { type: String, required: true, trim: true, maxlength: 50 },
        date: { type: Date, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
        type: { type: String, required: true, enum: ["income"], default: "income" },
    },
    { timestamps: true }
);

schema.index({ userId: 1, date: -1 });

const model = mongoose.models.income || mongoose.model("income", schema);

export default model;
