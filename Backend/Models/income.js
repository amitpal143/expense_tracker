import mongoose from "mongoose";

const incomeschema = new mongoose.Schema(
    {
        description :

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
    ref:"user",
    required:true,
 },
 type:
 {
    type:String,
    required:true,
 },
  },
  {
 timestamps:true,
  }
)

const incomemodel = mongoose.models.income || mongoose.model("income",incomeschema);

export default incomemodel;