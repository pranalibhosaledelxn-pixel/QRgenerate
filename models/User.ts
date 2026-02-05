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
    },
    {
        timestamps: true,
    }
);

// If the model is already compiled in the Mongoose models object, use it.
// Otherwise, create a new model.
const User = models.User || model("User", UserSchema);

export default User;
