import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    },

});

const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;