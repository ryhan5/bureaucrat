import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
    dueDate: {
        type: Date,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    category: {
        type: String,
        enum: ['meeting', 'document', 'event', 'personal', 'other'],
        default: 'other'
    },
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        web: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;
