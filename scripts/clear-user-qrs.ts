
import mongoose, { Schema, model, models } from "mongoose";

const MONGO_URI = "mongodb+srv://pranalibhosaledelxn_db_user:ptMTCUfRCxnXEHhH@cluster0.h34vvri.mongodb.net/qrgenerate_db";
const TARGET_USER_EMAIL = "pranalibhosaledelxn@gmail.com";

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const UserSchema = new Schema({}, { strict: false });
    const User = models.User || model("User", UserSchema);

    // Explicitly define QrCode model
    const QrCodeSchema = new Schema({ userId: Schema.Types.ObjectId }, { strict: false });
    const QrCode = models.QrCode || model("QrCode", QrCodeSchema);

    const user = await User.findOne({ email: TARGET_USER_EMAIL });

    if (!user) {
        console.log("User not found!");
        process.exit(1);
    }

    console.log(`Found User: ${user.email} (_id: ${user._id})`);

    // Count before delete
    const countBefore = await QrCode.countDocuments({ userId: user._id });
    console.log(`Current QR Count: ${countBefore}`);

    if (countBefore > 0) {
        const res = await QrCode.deleteMany({ userId: user._id });
        console.log(`Deleted ${res.deletedCount} QR codes.`);
    } else {
        console.log("No QR codes to delete.");
    }

    // Verify
    const countAfter = await QrCode.countDocuments({ userId: user._id });
    console.log(`New QR Count: ${countAfter}`);

    await mongoose.connection.close();
}

main().catch(console.error);
