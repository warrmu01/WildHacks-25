// content.js

// Inject the Watcher Avatar if not already present
if (!document.getElementById("the-watcher-avatar")) {
  const watcher = document.createElement("img");
  watcher.src = chrome.runtime.getURL("assets/coach_base.png"); // Base mood image
  watcher.id = "the-watcher-avatar";

  // Style the avatar
  watcher.style.position = "fixed";
  watcher.style.top = "20px";
  watcher.style.right = "20px";
  watcher.style.width = "260px";
  watcher.style.height = "260px";
  watcher.style.zIndex = "9999";
  watcher.style.cursor = "pointer";
  watcher.style.userSelect = "none";

  document.body.appendChild(watcher);
}

// Listen for mood change messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "changeMood") {
    const watcher = document.getElementById("the-watcher-avatar");
    if (watcher) {
      if (message.mood === "happy") {
        watcher.src = chrome.runtime.getURL("assets/coach_happy.png");
      } else if (message.mood === "mad") {
        watcher.src = chrome.runtime.getURL("assets/coach_mad.png");
      } else if (message.mood === "confused") {
        watcher.src = chrome.runtime.getURL("assets/coach_confused.png");
      } else {
        // Default back to base
        watcher.src = chrome.runtime.getURL("assets/coach_base.png");
      }
    }
  }
});
