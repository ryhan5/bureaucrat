import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Note from '../../models/Note';

export async function POST(request) {
	try {
		await dbConnect();
		const { text, timestamp, corrected } = await request.json();
		
		const note = await Note.create({
			text,
			timestamp,
			corrected
		});

		return NextResponse.json({ success: true, data: note });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET() {
	try {
		await dbConnect();
		const notes = await Note.find({}).sort({ createdAt: -1 });
		return NextResponse.json({ success: true, data: notes });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request) {
	try {
		await dbConnect();
		const { id } = await request.json();
		const deletedNote = await Note.findByIdAndDelete(id);
		
		if (!deletedNote) {
			return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, data: deletedNote });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function PUT(request) {
	try {
		await dbConnect();
		const { id, text, corrected } = await request.json();
		
		const updatedNote = await Note.findByIdAndUpdate(
			id,
			{ text, corrected },
			{ new: true }
		);
		
		if (!updatedNote) {
			return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
		}

		return NextResponse.json({ success: true, data: updatedNote });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
