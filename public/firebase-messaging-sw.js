importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "%VITE_FIREBASE_API%",
  authDomain: "daywaka-768aa.firebaseapp.com",
  projectId: "daywaka-768aa",
  storageBucket: "daywaka-768aa.firebasestorage.app",
  messagingSenderId: "476064351728",
  appId: "1:476064351728:web:cbf66db67d2ee925380935",
  measurementId: "G-HWQR5JX8KC",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
// Customize background notification handling here
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
