// content.js

// Create a container div to hold BOTH the avatar and the speech bubble
if (!document.getElementById("watcher-container")) {
  const container = document.createElement("div");
  container.id = "watcher-container";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.userSelect = "none";
  container.style.pointerEvents = "none"; // So it doesn’t block clicks on page

  // Create the Watcher Avatar (Ghost)
  const watcher = document.createElement("img");
  watcher.src = chrome.runtime.getURL("assets/coach_base.png");
  watcher.id = "the-watcher-avatar";
  watcher.style.width = "200px";
  watcher.style.height = "200px";
  watcher.style.maxWidth = "220px";
  watcher.style.maxHeight = "220px";
  watcher.style.minWidth = "80px";
  watcher.style.minHeight = "80px";
  watcher.style.objectFit = "contain";
  watcher.style.marginBottom = "5px"; // small gap to bubble

  const speech = document.createElement("div");
  speech.id = "watcher-speech";
  speech.style.padding = "8px 12px";
  speech.style.backgroundColor = "#ffffff";
  speech.style.border = "1px solid #000";
  speech.style.borderRadius = "8px";
  speech.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
  speech.style.fontSize = "14px";
  speech.style.maxWidth = "200px";
  speech.style.wordWrap = "break-word";
  speech.style.textAlign = "center";
  speech.style.position = "relative"; // for the triangle
  speech.style.display = "none";

  // Add the triangle pointer
  const triangle = document.createElement("div");
  triangle.style.position = "absolute";
  triangle.style.bottom = "-10px";
  triangle.style.left = "50%";
  triangle.style.transform = "translateX(-50%)";
  triangle.style.width = "0";
  triangle.style.height = "0";
  triangle.style.borderLeft = "8px solid transparent";
  triangle.style.borderRight = "8px solid transparent";
  triangle.style.borderTop = "10px solid #ffffff"; // same as bubble color

  speech.appendChild(triangle);

  // Assemble
  container.appendChild(watcher);
  container.appendChild(speech);
  document.body.appendChild(container);
}

// ===== Function to show speech bubble =====
function showSpeech(text) {
  const speech = document.getElementById("watcher-speech");
  if (!speech) return;

  speech.textContent = text;
  speech.style.display = "block";

  // Hide after 5 seconds
  setTimeout(() => {
    speech.style.display = "none";
  }, 5000);
}

// ===== Listen for Messages =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const container = document.getElementById("watcher-container");
  const watcher = document.getElementById("the-watcher-avatar");
  const speech = document.getElementById("watcher-speech");

  if (!watcher || !speech || !container) return;

  if (message.action === "changeMood") {
    if (message.mood === "happy") {
      watcher.src = chrome.runtime.getURL("assets/coach_happy.png");
      showSpeech("Good job, detective! 🕵️‍♂️");
    } else if (message.mood === "mad") {
      watcher.src = chrome.runtime.getURL("assets/coach_mad.png");
      showSpeech("Busted! Get back to work. 🚨");
    } else if (message.mood === "confused") {
      watcher.src = chrome.runtime.getURL("assets/coach_confused.png");
      showSpeech("Hmm... what are you doing? 🤔");
    } else {
      watcher.src = chrome.runtime.getURL("assets/coach_base.png");
    }
  } else if (message.action === "removeCoach") {
    container.style.display = "none"; // Hide the WHOLE container (ghost + speech)
  } else if (message.action === "addCoach") {
    container.style.display = "flex"; // Show the WHOLE container (ghost + speech)
    speech.style.display = "none"; // Reset speech hidden
  }
});
