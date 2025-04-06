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