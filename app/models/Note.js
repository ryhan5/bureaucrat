import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    corrected: {
        type: Boolean,
        default: false,
    },
    language: {
        type: String,
        enum: ['en', 'hi'],
        default: 'en'
    }
}, {
    timestamps: true,
});

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

export default Note;