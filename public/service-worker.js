// frontend/public/service-worker.js

self.addEventListener("push", (event) => {
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Notification";
  const message = data.jobTitle || "You have a new message";
  const url =  data.jobLink || "https://google.com"; // Default URL if none provided

  const options = {
    body: message,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-192x192.png",
    data: { url: url } 
  };

  event.waitUntil(
    self.registration.showNotification("New Notification", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  const url = event.notification.data.url; // Get the URL from the notification data
  console.log("Hello");
  event.notification.close();
  /*event.waitUntil(
    clients.openWindow("http://localhost:3000") // Change this URL to where your app runs
  );*/

  event.waitUntil(
    clients.openWindow(url) // Open the URL in a new tab
  );
});
