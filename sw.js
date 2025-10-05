const CACHE_NAME = 'wellnest-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/body.html',
  '/bodyhealth.html',
  '/mind.html',
  '/sleep.html',
  '/diet.html',
  '/workout.html',
  '/care.html',
  '/reminders.html',
  '/login.html',
  '/signup.html',
  '/style.css',
  '/images/fitness-logo.svg',
  '/images/yoga.svg',
  '/images/diet.svg',
  '/images/sleep.svg'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for reminders (when supported)
self.addEventListener('sync', event => {
  if (event.tag === 'reminder-sync') {
    event.waitUntil(
      // Handle background reminder sync
      console.log('Background reminder sync triggered')
    );
  }
});

// Push notifications (for future enhancement)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'WellNest reminder!',
    icon: '/images/fitness-logo.svg',
    badge: '/images/fitness-logo.svg',
    vibrate: [200, 100, 200],
    tag: 'wellnest-reminder',
    actions: [
      {
        action: 'complete',
        title: 'Mark Complete',
        icon: '/images/fitness-logo.svg'
      },
      {
        action: 'snooze',
        title: 'Snooze 10min',
        icon: '/images/fitness-logo.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('WellNest Health Reminder', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'complete') {
    // Handle complete action
    console.log('Reminder marked complete');
  } else if (event.action === 'snooze') {
    // Handle snooze action
    console.log('Reminder snoozed for 10 minutes');
  } else {
    // Open app
    event.waitUntil(
      clients.openWindow('/reminders.html')
    );
  }
});