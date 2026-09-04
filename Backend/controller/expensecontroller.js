import expensemodel from "../Models/expense.js";
import getDateRange from "../utils/datefilter.js";
import XSLS from "xlsx";


/====== add expense ======/
 export async function addexpense(req,res)
 {
    
    try {
        console.log("body",req.body);
        const userId = req.user._id;

        const {
            description,
            amount,
            category,
            type,
            date
        } = req.body;

        if (!description || !amount || !category || !type || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newexpense = new expensemodel({
            userId,
            description,
            amount,
            category,
            type,
            date: new Date(date)
        });

        await newexpense.save();

        return res.status(201).json({
            success: true,
            message: "expense added successfully",
            data: newexpense
        });

    } catch (error) {
        console.error("🔥 ADD expense ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
 }

 /======= get allexpense =====/
 export async function getexpense(req,res)
 {
 try {
       const userId = req.user._id;
       const expense = await expensemodel.find({userId}).sort({date:-1});
       res.json(expense);
   } 
catch (error) {
        console.log("error");
        res.status(401).json({
            success:false,
            message:"server error",
        })
        
    }
 }

 /====== update expense =====/
 export async function updateexpense(req,res)
 {
    
    try {
           const{id} = req.params;
    const userId = req.user._id;
    const{description,amount} = req.body;

        const updateExpense = await expensemodel.findOneAndUpdate(
            
                {id:id,userId},
                {description,amount},            
               { new:true},
                
        );
        if(!updateExpense)
        {
           return  res.status(401).json(
                {
                    success:false,
                    message:"Expense not updated",
                }
            )
        }

        res.status(201).json(
            {
                success:true,
                messsage:"expense update successfully",
                data:updateExpense,
            }
        )
    }
     catch (error) {
        console.log("error");
        res.status(401).json({
            success:false,
            message:"server error",
        })
        
    }
 }

 /======= delete expense =====/
 export async function deleteexpense(req,res)
 {
    try {
        const expense = await expensemodel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "expense not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "expense deleted successfully"
        });

    } catch (error) {
        console.error("DELETE expense ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
 }

 /======= download xsls sheet ======/
 export async function downloadsheet(req,res)
 {
    
    const userId = req.user._id;
    try {
      const expense= (await expensemodel.find({userId}).sort({date :-1}));

      const plaindata = expense.map((exp) => ({
         description:exp.description,
         amount:exp.amount,
         category:exp.category,
         date:new Date(exp.date).toLocaleDateString(),
      }));
       const worksheet = XSLS.utils.json_to_sheet(plaindata);
       const workbook = XSLS.utils.book_new();
       XSLS.utils.book_append_sheet(workbook,worksheet,"expensemodel");
       XSLS.writeFile(workbook,"expense_details.xlsx");
       res.download("expense_details.xlsx");


      
    } 
catch (error) {
        console.log("error");
        res.status(401).json({
            success:false,
            message:"server error",
        })
        
    }
 }

 /===== expense overview =====/
 export async function expenseoverview(req,res)
 {
        try {
        const userId = req.user._id;
        const{range} = req.query;
        const{start,end} = getDateRange(range);

        const expense = await expensemodel.find({

            userId,
            date:{$gte: start,$lte:end},
        }).sort({date:-1});

        
 const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense = expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;
    const recentTransactions =expense.slice(0,5);

res.json({
    success:true,
    data:
    {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range,
    }
})
    }

catch (error) {
        console.log("error");
        res.status(401).json({
            success:false,
            message:"server error",
        })
        
    } 
 }




