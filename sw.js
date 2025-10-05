const CACHE_NAME = 'wellnest-v3-fixed-' + Date.now();
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
  '/pray.html',
  '/reminders.html',
  '/login.html',
  '/signup.html',
  '/style.css',
  '/images/fitness-logo.svg',
  '/images/yoga.svg',
  '/images/diet.svg',
  '/images/sleep.svg',
  '/images/fit.webp'
];

// Install event - cache resources and clear old cache
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Clear all old caches first
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Then create new cache
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Creating new cache:', CACHE_NAME);
          return cache.addAll(urlsToCache);
        })
    ]).then(() => {
      // Force immediate activation
      return self.skipWaiting();
    })
  );
});

// Activate event - take control immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Activating: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - always try network first, fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If fetch successful, update cache and return response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

// Enhanced notification handling for apps
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Focus the app window when notification is clicked
  event.waitUntil(
    clients.matchAll().then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Background sync for reminders (when supported)
self.addEventListener('sync', event => {
  if (event.tag === 'reminder-sync') {
    event.waitUntil(
      handleBackgroundReminders()
    );
  } else if (event.tag === 'prayer-sync') {
    event.waitUntil(
      handleBackgroundPrayers()
    );
  }
});

function handleBackgroundReminders() {
  console.log('🔔 Background reminder sync triggered');
  
  // Get stored reminders from IndexedDB or localStorage
  return new Promise((resolve) => {
    // This would normally check for pending reminders
    // and send notifications if needed
    console.log('Checking for pending reminders...');
    resolve();
  });
}

function handleBackgroundPrayers() {
  console.log('🕌 Background prayer sync triggered');
  
  return new Promise((resolve) => {
    // Check for missed prayers and send notifications
    console.log('Checking for missed prayers...');
    resolve();
  });
}

// Handle push notifications (for advanced implementations)
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'WellNest reminder',
    icon: '/images/fitness-logo.svg',
    badge: '/images/fitness-logo.svg',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/fitness-logo.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('WellNest Health Tracker', options)
  );
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