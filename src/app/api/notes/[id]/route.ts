import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/models/Note';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid note ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Note deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting note:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete note' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const { id } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid note ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const note = await Note.findById(id);

    if (!note) {
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ note }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching note:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch note' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const { id } = params;
    const body = await request.json();
    const { title, description, imageUrl, reminderDateTime, isRecurring } = body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid note ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find the note and update
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title,
        description,
        imageUrl: imageUrl || null,
        reminderDateTime: reminderDateTime ? new Date(reminderDateTime) : null,
        isRecurring: isRecurring || false,
        // Don't update createdAt - keep the original creation time
      },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return new Response(
        JSON.stringify({ error: 'Note not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ note: updatedNote }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating note:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update note' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}