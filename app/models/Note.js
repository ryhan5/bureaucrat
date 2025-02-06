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
    },
    category: {
        type: String,
        enum: ['Personal', 'Work', 'Ideas', 'Tasks', 'Other'],
        default: 'Other'
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
});

// Add text index for search functionality
noteSchema.index({ text: 'text' });

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);

export default Note;