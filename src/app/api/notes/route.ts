import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/models/Note';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const notes = await Note.find({})
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .select('_id title description imageUrl reminderDateTime isRecurring createdAt');
    
    return new Response(
      JSON.stringify({ notes }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching notes:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch notes' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { title, description, imageUrl, reminderDateTime, isRecurring } = body;
    
    const newNote = new Note({
      title,
      description,
      imageUrl: imageUrl || null,
      reminderDateTime: reminderDateTime ? new Date(reminderDateTime) : null,
      isRecurring: isRecurring || false,
    });
    
    const savedNote = await newNote.save();
    
    return new Response(
      JSON.stringify({ note: savedNote }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create note' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}