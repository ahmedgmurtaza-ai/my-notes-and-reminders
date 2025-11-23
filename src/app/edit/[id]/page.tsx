'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Switch,
  Paper,
  InputAdornment,
  IconButton,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  PhotoCamera as CameraIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter, useParams } from 'next/navigation';

export default function EditNote() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDateTime, setReminderDateTime] = useState<Dayjs | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes/${id}`);
        if (res.ok) {
          const data = await res.json();
          const note = data.note;
          
          setTitle(note.title);
          setDescription(note.description);
          setReminderDateTime(note.reminderDateTime ? dayjs(note.reminderDateTime) : null);
          setIsRecurring(note.isRecurring);
          setImagePreview(note.imageUrl || null);
        } else {
          console.error('Failed to fetch note');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNote();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert Dayjs to Date for API
    const reminderDate = reminderDateTime ? new Date(reminderDateTime.toISOString()) : null;

    const noteData = {
      title,
      description,
      imageUrl: imagePreview || null,
      reminderDateTime: reminderDate,
      isRecurring
    };

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',  // Use PATCH for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (res.ok) {
        router.push('/');
      } else {
        console.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    setCameraActive(true);
  };

  const handleCloseCamera = () => {
    setCameraActive(false);
  };

  // Function to simulate capturing an image from the camera
  const captureImage = () => {
    // In a real app, this would access the device's camera
    // For this example, we'll create a dummy image
    const dummyImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%234caf50"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="white">Captured Image</text></svg>';
    setImagePreview(dummyImage);
    setCameraActive(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Edit Note
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <DatePicker
                label="Reminder Date"
                value={reminderDateTime}
                onChange={(newValue) => setReminderDateTime(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />

              <TimePicker
                label="Reminder Time"
                value={reminderDateTime}
                onChange={(newValue) => setReminderDateTime(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                }
                label="Daily Reminder"
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                id="image-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<ImageIcon />}
                  sx={{ mr: 1 }}
                >
                  Upload Image
                </Button>
              </label>

              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={handleCameraCapture}
                sx={{ mr: 1 }}
              >
                Capture
              </Button>
            </Box>

            {imagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                />
              </Box>
            )}

            {cameraActive && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Camera View (Simulated)
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: '300px',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      border: '1px dashed #ccc'
                    }}
                  >
                    <Typography color="text.secondary">
                      Camera feed would appear here
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<CameraIcon />}
                    onClick={captureImage}
                  >
                    Capture
                  </Button>
                  <IconButton
                    onClick={handleCloseCamera}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Paper>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Update Note
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}