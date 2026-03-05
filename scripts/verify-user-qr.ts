
import mongoose, { Schema, model, models } from "mongoose";
import fs from "fs";

const MONGO_URI = "mongodb+srv://pranalibhosaledelxn_db_user:ptMTCUfRCxnXEHhH@cluster0.h34vvri.mongodb.net/qrgenerate_db";

async function main() {
    await mongoose.connect(MONGO_URI);

    const UserSchema = new Schema({}, { strict: false });
    const User = models.User || model("User", UserSchema);

    const QrCodeSchema = new Schema({ userId: Schema.Types.ObjectId }, { strict: false });
    const QrCode = models.QrCode || model("QrCode", QrCodeSchema);

    const users = await User.find({});
    let output = `Found ${users.length} users.\n`;

    for (const u of users) {
        const count = await QrCode.countDocuments({ userId: u._id });
        output += `------------------------------------------------\n`;
        output += `USER: ${u.email}\n`;
        output += `ID: ${u._id}\n`;
        output += `TOTAL QR HISTORY COUNT: ${count}\n`;
        output += `PROFILE IMAGE: ${u.qrImage ? 'Set' : 'Not Set'}\n`;
        output += `------------------------------------------------\n`;
    }

    fs.writeFileSync("verification_output.txt", output);
    await mongoose.connection.close();
}

main().catch((err) => {
    fs.writeFileSync("verification_output.txt", `Error: ${err.message}`);
});
