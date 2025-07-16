import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        token: {
            type: String   // not required: true  // no token when registering
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export { User };   // or export { User };