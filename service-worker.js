self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || "Notification";
    const options = {
      body: data.body || "You have a new message.",
      icon: data.icon || "./src/content/web-app-manifest-192x192.png",
      data: data.url || "/",
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
