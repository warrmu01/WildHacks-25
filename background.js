// background.js
import { classifyURL } from "./util/tabutils.js";
import { isInTaskWindow } from "./auth/calendar_api.js";

// 🔄 Check Google Calendar every 2 minutes
async function checkTasksPeriodically() {
  const { googleAuthToken } = await chrome.storage.local.get(["googleAuthToken"]);
  if (!googleAuthToken) return;

  const inTask = await isInTaskWindow(googleAuthToken);
  const { coachEnabled: prev } = await chrome.storage.local.get(["coachEnabled"]);

  await chrome.storage.local.set({ coachEnabled: inTask });
  
  if (inTask && !prev) {
    // ✅ If it just turned ON, notify all tabs to add coach
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { action: "addCoach" }).catch((err) => {
          console.warn("Coach add failed for tab:", tab.url);
        });
      }
    });
  }
  if (!inTask && prev) {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { action: "removeCoach" }).catch((err) => {
          console.warn("Coach remove failed for tab:", tab.url);
        });
      }
    });
  }
  console.log(`🔁 Coach auto-toggle: ${inTask ? "ENABLED" : "DISABLED"}`);
}

// ✅ Run once on startup
checkTasksPeriodically();

// 🕔 Run every 2 minutes
setInterval(checkTasksPeriodically, 2 * 60 * 1000);

// 🧠 On tab update, set mood + inject coach if allowed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url) {
    const { coachEnabled } = await chrome.storage.local.get(["coachEnabled"]);

    const mood = classifyURL(tab.url);

    // Small delay to ensure content script is ready
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, {
        action: "changeMood",
        mood: mood,
      }).catch((err) => {
        console.warn("Could not send mood to tab:", err);
      });

      if (coachEnabled) {
        chrome.tabs.sendMessage(tabId, {
          action: "addCoach"
        }).catch((err) => {
          console.warn("Could not inject coach:", err);
        });
      }
    }, 500);
  }
});
