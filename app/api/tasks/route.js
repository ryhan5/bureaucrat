import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Task from '../../models/Task';

export async function POST(request) {
    try {
        await dbConnect();
        const taskData = await request.json();
        const task = await Task.create(taskData);
        
        // Here you would trigger notifications setup
        // scheduleNotifications(task);
        
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        
        let query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        
        const tasks = await Task.find(query).sort({ dueDate: 1 });
        return NextResponse.json({ success: true, data: tasks });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const { id, ...updateData } = await request.json();
        const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!task) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const { id } = await request.json();
        const task = await Task.findByIdAndDelete(id);
        
        if (!task) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: task });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
