// background.js


import { classifyURL } from "./util/tabutils.js"; // ✅ CORRECT

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url) {
    const mood = classifyURL(tab.url);

    // Delay ensures content.js is ready
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, {
        action: "changeMood",
        mood: mood,
      }).catch((err) => {
        console.warn("Could not send message to tab:", err);
      });
    }, 500); // 0.5s delay
  }
});


