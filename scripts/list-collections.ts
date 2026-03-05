
import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://pranalibhosaledelxn_db_user:ptMTCUfRCxnXEHhH@cluster0.h34vvri.mongodb.net/qrgenerate_db";

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    if (!mongoose.connection.db) {
        throw new Error("Database connection not established");
    }
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections in database:");
    collections.forEach(c => console.log(` - ${c.name}`));

    await mongoose.connection.close();
}

main().catch(console.error);
