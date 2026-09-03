import incomemodel from "../Models/income.js";
import XSLS from "xlsx";
import getDateRange from"../utils/datefilter.js";

/======= add userincome =======/

export async function addincome(req, res) {
    
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

        const newIncome = new incomemodel({
            userId,
            description,
            amount,
            category,
            type,
            date: new Date(date)
        });

        await newIncome.save();

        return res.status(201).json({
            success: true,
            message: "Income added successfully",
            data: newIncome
        });

    } catch (error) {
        console.error("🔥 ADD INCOME ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

/======= get userincome ======/

export async function getincome(req,res)
{
   

   try {
       const userId = req.user._id;
       const income = await incomemodel.find({userId}).sort({date:-1});
       res.json(income);
   } 
catch (error) {
        console.log("error");
        res.status(401).json({
            success:false,
            message:"server error",
        })
        
    }

}


/===== update userincome ======/

export async function updateincome(req,res)
{
  

    try {
           const{id} = req.params;
    const userId = req.user._id;
    const{description,amount} = req.body;

        const updateIncome = await incomemodel.findOneAndUpdate(
            
                {id:id,userId},
                {description,amount},            
               { new:true},
                
        );
        if(!updateIncome)
        {
           return  res.status(401).json(
                {
                    success:false,
                    message:"income not updated",
                }
            )
        }

        res.status(201).json(
            {
                success:true,
                messsage:"income update successfully",
                data:updateIncome,
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

/======= delete userincome =====/
export async function deleteincome(req, res) {
    try {
        const income = await incomemodel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!income) {
            return res.status(404).json({
                success: false,
                message: "Income not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Income deleted successfully"
        });

    } catch (error) {
        console.error("DELETE INCOME ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


/===== download xls sheet ======/

export async function downloadsheet(req,res)

{
    const userId = req.user._id;
    try {
      const income = (await incomemodel.find({userId}).sort({date :-1}));

      const plaindata = income.map((inc) => ({
         description:inc.description,
         amount:inc.amount,
         category:inc.category,
         date:new Date(inc.date).toLocaleDateString(),
      }));
       const worksheet = XSLS.utils.json_to_sheet(plaindata);
       const workbook = XSLS.utils.book_new();
       XSLS.utils.book_append_sheet(workbook,worksheet,"incomemodel");
       XSLS.writeFile(workbook,"income_details.xlsx");
       res.download("income_details.xlsx");


      
    } 
catch (error) {
        console.log("error");
        res.status(401).json({
            success:false,
            message:"server error",
        })
        
    }
}

/======= user incomeoverview ======/

export async function incomeoverview(req,res)
{
    try {
        const userId = req.user._id;
        const{range} = req.query;
        const{start,end} = getDateRange(range);

        const incomes = await incomemodel.find({

            userId,
            date:{$gte: start,$lte:end},
        }).sort({date:-1});

        

const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
const numberOfTransactions = incomes.length;
const recentTransactions = incomes.slice(0, 9);

res.json({
    success:true,
    data:
    {
        totalIncome,
        averageIncome,
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

