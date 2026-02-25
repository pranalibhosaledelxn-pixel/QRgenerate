import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
        },
        password: {
            type: String,
            required: false,
            select: false, // Don't return password by default
        },
        image: {
            type: String,
        },
        googleId: {
            type: String,
            sparse: true,
        },
        qrImage: {
            type: String,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        plan: {
            type: String,
            default: "Free",
        },
        paymentId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// If the model is already compiled in the Mongoose models object, delete it to force re-compilation
// This is a dev-mode fix to ensure schema changes are picked up without full restart
if (process.env.NODE_ENV === "development" && models.User) {
    delete models.User;
}


const User = models.User || model("User", UserSchema);

export default User;
