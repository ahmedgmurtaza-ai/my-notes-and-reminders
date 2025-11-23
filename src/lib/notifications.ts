// Service Worker registration and notification handling
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return registration;
      } else {
        console.log('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('Push notifications are not supported in this browser.');
    return null;
  }
};

export const subscribeUserToPush = async () => {
  const registration = await registerServiceWorker();
  
  if (!registration || !registration.pushManager) {
    console.error('Push manager is not available.');
    return null;
  }

  try {
    // Generate VAPID keys for your application
    // In a production app, these should be generated server-side
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
    });
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Helper function to convert base64 string to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

// Function to show local notifications immediately
export const showLocalNotification = (title: string, body: string) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    // This will trigger the service worker to show a notification
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body: body,
        icon: '/icons/icon-192x192.png',
        tag: 'reminder-notification'
      });
    });
  }
};

// Function to schedule notification (client-side simulation)
export const scheduleNotification = (title: string, body: string, time: Date) => {
  const now = new Date();
  const delay = time.getTime() - now.getTime();
  
  if (delay > 0) {
    setTimeout(() => {
      showLocalNotification(title, body);
    }, delay);
  }
};

// Function to check for upcoming reminders
export const checkForReminders = async () => {
  try {
    const res = await fetch('/api/notes');
    const data = await res.json();
    const notes = data.notes;
    
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000); // Check reminders in the next hour
    
    notes.forEach((note: any) => {
      if (note.reminderDateTime) {
        const reminderTime = new Date(note.reminderDateTime);
        
        // Check if reminder is within the next hour
        if (reminderTime > now && reminderTime < nextHour) {
          // Show notification
          showLocalNotification(
            `Reminder: ${note.title}`,
            note.description.substring(0, 50) + (note.description.length > 50 ? '...' : '')
          );
          
          // If recurring, schedule the next day's reminder
          if (note.isRecurring) {
            const nextDay = new Date(reminderTime);
            nextDay.setDate(nextDay.getDate() + 1);
            
            // This is a simplified approach - in a real app, you'd want to persist this
            setTimeout(() => {
              showLocalNotification(
                `Daily Reminder: ${note.title}`,
                note.description.substring(0, 50) + (note.description.length > 50 ? '...' : '')
              );
            }, 24 * 60 * 60 * 1000); // 24 hours
          }
        }
      }
    });
  } catch (error) {
    console.error('Error checking for reminders:', error);
  }
};