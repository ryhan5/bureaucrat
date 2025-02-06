import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Note from '../../models/Note';

export async function POST(request) {
	try {
		await dbConnect();
		const { text, timestamp, corrected, language, category, tags } = await request.json();
		
		const note = await Note.create({
			text,
			timestamp,
			corrected,
			language,
			category,
			tags
		});

		return NextResponse.json({ success: true, data: note });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request) {
	try {
		await dbConnect();
		const { searchParams } = new URL(request.url);
		const searchQuery = searchParams.get('search');
		const category = searchParams.get('category');
		
		let query = {};
		
		if (searchQuery) {
			query.$text = { $search: searchQuery };
		}
		
		if (category && category !== 'All') {
			query.category = category;
		}
		
		const notes = await Note.find(query).sort({ createdAt: -1 });
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
		const { id, text, corrected, language, category, tags } = await request.json();
		
		const updatedNote = await Note.findByIdAndUpdate(
			id,
			{ 
				...(text && { text }),
				...(corrected !== undefined && { corrected }),
				...(language && { language }),
				...(category && { category }),
				...(tags && { tags })
			},
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
