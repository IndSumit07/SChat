import mongoose from 'mongoose'

export const ConnectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log("Database Connected Successfully!!!");
        })

        const uri = process.env.MONGODB_URI; // e.g. mongodb+srv://user:pass@cluster.mongodb.net
        const dbName = process.env.MONGODB_DB_NAME || 'RCP';
        await mongoose.connect(uri, { dbName });
    } catch (error) {
        console.log(error.message);
    }
}