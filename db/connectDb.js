import mongoose from "mongoose";

const connectDb = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connection Established : ${conn.connection.host}`);
    } catch (error) {
        console.log(`Error Connecting Mongo Database : ${error.message}`);
        process.exit(1);
    }
}

export default connectDb