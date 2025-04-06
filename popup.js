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

// popup.js

function updateTimes() {
  chrome.storage.local.get(["GoodTime", "BadTime"], (result) => {
    document.getElementById("good-time").textContent = result.GoodTime || 0;
    document.getElementById("bad-time").textContent = result.BadTime || 0;
  });
}

// Update immediately when popup opens
updateTimes();

// (Optional) Refresh every few seconds if popup stays open
setInterval(updateTimes, 5000);
