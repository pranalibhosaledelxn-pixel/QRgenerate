import mongoose, { Schema, model, models } from "mongoose";

const StoreSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Store name is required"],
        },
        description: {
            type: String,
        },
        address: {
            type: String,
            required: [true, "Store address is required"],
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        qrCode: {
            type: String, // Base64 data URI
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Store = models.Store || model("Store", StoreSchema);

export default Store;
