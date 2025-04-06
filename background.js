// background.js

// When the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(
    tab.id,
    { action: "changeMood", mood: "happy" },
    function (response) {
      if (chrome.runtime.lastError) {
        console.log(
          "No content script found on this tab:",
          chrome.runtime.lastError.message
        );
      }
    }
  );
});
