// sw.js - Service Worker for PWA functionality

const CACHE_NAME = 'notes-app-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available, otherwise fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  let data;
  if (event.data) {
    data = event.data.json();
  } else {
    data = {
      title: 'Notes & Reminders',
      body: 'You have a new reminder!',
      icon: '/icons/icon-192x192.png',
      tag: 'reminder'
    };
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Schedule reminder notifications when the service worker starts
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // If there are clients (open tabs), we can send a message to check reminders
      if (clients.length > 0) {
        clients.forEach((client) => {
          client.postMessage({ command: 'CHECK_REMINDERS' });
        });
      } else {
        // If no clients, we might want to set up timer-based reminders using background sync
        // This is a simplified approach
        console.log('Service worker activated. Clients:', clients.length);
      }
    })
  );
});