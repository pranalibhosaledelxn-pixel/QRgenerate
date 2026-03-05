const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        isPremium: { type: Boolean, default: false },
        plan: { type: String, default: "Free" },
        paymentId: { type: String },
    },
    { timestamps: true }
);

// Prevent overwriting model if already compiled
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function verifyPaymentUpdate() {
    const MONGODB_URI = process.env.MONGO_URI;

    if (!MONGODB_URI) {
        console.error("❌ Error: MONGO_URI not found in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // 1. Create a dummy user
        const testEmail = `test-user-${Date.now()}@example.com`;
        const newUser = await User.create({
            name: "Test User",
            email: testEmail,
            isPremium: false,
            plan: "Free"
        });
        console.log(`✅ Created test user: ${newUser.email} (Plan: ${newUser.plan}, Premium: ${newUser.isPremium})`);

        // 2. Simulate Payment Verification Update
        console.log("🔄 Simulating Payment Verification Update...");
        const razorpay_payment_id = `pay_test_${Date.now()}`;
        const planName = "Pro";

        const updatedUser = await User.findOneAndUpdate(
            { email: testEmail },
            {
                isPremium: true,
                plan: planName,
                paymentId: razorpay_payment_id,
            },
            { new: true }
        );

        // 3. Verify Updates
        if (updatedUser.isPremium === true && updatedUser.plan === "Pro" && updatedUser.paymentId === razorpay_payment_id) {
            console.log("✅ SUCCESS: User record updated correctly!");
            console.log("   - isPremium:", updatedUser.isPremium);
            console.log("   - Plan:", updatedUser.plan);
            console.log("   - Payment ID:", updatedUser.paymentId);
        } else {
            console.error("❌ FAILED: User record was NOT updated correctly.");
            console.log(updatedUser);
        }

        // 4. Cleanup
        await User.deleteOne({ email: testEmail });
        console.log("✅ Cleanup: Deleted test user");

    } catch (error) {
        console.error("❌ Error during verification:", error);
    } finally {
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    }
}

verifyPaymentUpdate();
