import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        description:
        {
            type:String,
            required:true,
        },
        amount:
        {
          type:Number,
          required:true,
        },
        category:
        {
         type:String,
         required:true,
        },
         date:
 {
 type:Date,
 required:true,

 },
        userId:
        {
           type:mongoose.Schema.Types.ObjectId,
           required:true,
        },
        type:
        {
            type:String,
            required:true,
        }
    }
)

const expensemodel = mongoose.models.expense || mongoose.model("expense",expenseSchema);

export default expensemodel;