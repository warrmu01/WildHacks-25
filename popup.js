import { authenticateWithGoogle } from './auth/google_oauth.js';
import { fetchCalendarEvents } from "./auth/calendar_api.js";

console.log("✅ popup.js is running!");

function sendToContent(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action });
  });
}

// 🚫 Remove coach + store setting
document.getElementById("remove-btn").addEventListener("click", () => {
  chrome.storage.local.set({ coachEnabled: false }, () => {
    sendToContent("removeCoach");
  });
});

// ✅ Re-add coach + store setting
document.getElementById("add-btn").addEventListener("click", () => {
  chrome.storage.local.set({ coachEnabled: true }, () => {
    sendToContent("addCoach");
  });
});

// ✅ Single auth handler
document.getElementById("auth-btn").addEventListener("click", async () => {
  try {
    const token = await authenticateWithGoogle();
    console.log("🎉 Got token:", token);
    chrome.storage.local.set({ googleAuthToken: token });

    const events = await fetchCalendarEvents(token);
    console.log("📅 Events received:", events);

    // Optional: Trigger mood or do something else with the events

  } catch (err) {
    console.error("❌ Error during login or fetch:", err);
  }
});


