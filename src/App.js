// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  // This will generate the VAPID keys on the frontend
  const VAPID_PUBLIC_KEY = 'BGWNHwBlYOAdOHlSx7HjEmRUAFcF7Wp4Vj2sl9z2ge9XElwPdiz9XTg81yF-s2Q2iO6fimv3TU4HS88J_oJNsbY'; // Same as in the backend

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      subscribeUser();
    } else {
      console.log('Notification permission denied.');
    }
  };

  // Subscribe the user to push notifications
  const subscribeUser = async () => {
    try {
      // Check if the browser supports Push Notification and Service Worker
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported in this browser');
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered');

      // Check if PushManager is available
      if (!('PushManager' in window)) {
        throw new Error('PushManager not supported in this browser');
      }

      // Request permission to show notifications
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission to receive notifications was denied');
      }

      // Get the push subscription details from the service worker
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Notifications must be visible
        //applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY,
        applicationServerKey: VAPID_PUBLIC_KEY, // Your VAPID public key
      });

      // Prepare the device data to send to the backend
      const deviceData = {
        pushEndpoint: subscription.endpoint,
        publicKey: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        authToken: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
      };

      // Assume we have the userID (e.g., from the logged-in user context)
      const userID = '674a99c0ef55673986ccab87'; // Replace with actual userID from your app context

      // Send the subscription details to the backend API to register the device
      const userData = {
        userID,
        username: 'ran1', // Replace with actual username
        email: 'ran1@example.com', // Replace with actual email
      };

      const response = await axios.post('http://localhost:5000/api/user/add', {
        userData,
        deviceData,
      });

      console.log('User subscribed successfully:', response.data);
      setIsSubscribed(true);
    } catch (error) {
      setSubscriptionError(error.message);
      console.error('Error subscribing user:', error);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker registered:', registration);
      });
    }
  }, []);

  return (
    <div className="App">
      <h1>Web Push Notifications Demo</h1>
      <button onClick={subscribeUser}>Enable Notifications</button>
      
    </div>
  );
}

export default App;
