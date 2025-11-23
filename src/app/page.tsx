'use client';

import React, { useState, useEffect } from 'react';
import { Container, Fab, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { checkForReminders } from '@/lib/notifications';

interface Note {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  reminderDateTime?: Date;
  isRecurring: boolean;
  createdAt: Date;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Set up function to check reminders globally
    (window as any).checkReminders = checkForReminders;

    // Fetch notes from the API
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        const data = await res.json();
        // Sort notes by creation date in descending order
        const sortedNotes = data.notes.sort((a: Note, b: Note) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotes(sortedNotes);

        // Check for any upcoming reminders after loading notes
        setTimeout(() => checkForReminders(), 1000);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []);

  const handleAddNote = () => {
    router.push('/add');
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Notes & Reminders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Keep track of your tasks and set reminders
        </Typography>
      </Box>

      {notes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No notes yet. Add your first note to get started!
          </Typography>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List>
            {notes.map((note) => (
              <ListItem key={note._id} sx={{ py: 2, borderBottom: '1px solid #eee' }}>
                <ListItemText
                  primary={note.title}
                  secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {note.description.substring(0, 100)}{note.description.length > 100 ? '...' : ''}
                      </Typography>
                      <br />
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {new Date(note.createdAt).toLocaleString()}
                      </Typography>
                      {note.reminderDateTime && (
                        <React.Fragment>
                          <br />
                          <Typography
                            component="span"
                            variant="caption"
                            color="primary"
                          >
                            Reminder: {new Date(note.reminderDateTime).toLocaleString()}
                            {note.isRecurring && ' (Daily)'}
                          </Typography>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => router.push(`/edit/${note._id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteNote(note._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  {note.reminderDateTime && (
                    <IconButton edge="end" aria-label="notification">
                      <NotificationsIcon color="primary" />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddNote}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}