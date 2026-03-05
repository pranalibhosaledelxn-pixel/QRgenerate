import mongoose, { Schema, model, models } from "mongoose";

const QrCodeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalUrl: {
            type: String,
            required: true,
        },
        gcsImageUrl: {
            type: String,
            required: true,
        },
        storagePath: {
            type: String, // Path in GCS bucket (e.g., qrcodes/123.png)
        },
    },
    {
        timestamps: true,
    }
);

const QrCode = models.QrCode || model("QrCode", QrCodeSchema);

export default QrCode;
