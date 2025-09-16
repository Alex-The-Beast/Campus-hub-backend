import mongoose  from "mongoose";
const { Schema } = mongoose;

const PYQSchema=new Schema({
    branch:{
        type:String,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    semester:{
        type:Number,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    pdfUrl:{
        type:String,
        required:true
    },
    course:{
        type:String,
        required:true
    },
    examType:{
        type:String,
        required:true
    },
    uploadedBy:{
        type:String,
        default: "Anonymous"
        
    }
},{timestamps:true})

const PYQ=mongoose.model("PYQ",PYQSchema);
export default PYQ;
