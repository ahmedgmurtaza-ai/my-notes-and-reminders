import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  reminderDateTime?: Date;
  isRecurring: boolean; // For daily reminders
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  reminderDateTime: {
    type: Date,
    default: null,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);