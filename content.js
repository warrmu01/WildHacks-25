// content.js

// ===== UI: Create the ghost and speech bubble =====
if (!document.getElementById("watcher-container")) {
  const container = document.createElement("div");
  container.id = "watcher-container";
  container.style.position = "fixed";
  container.style.top = "20px";
  container.style.right = "20px";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "column"; // flex column = bubble on top of ghost
  container.style.alignItems = "center"; // center everything nicely
  container.style.userSelect = "none";
  container.style.pointerEvents = "none";

  const watcher = document.createElement("img");
  watcher.src = chrome.runtime.getURL("assets/coach_base.png");
  watcher.id = "the-watcher-avatar";
  watcher.style.width = "120px"; // ✅ not too huge
  watcher.style.height = "120px";
  watcher.style.maxWidth = "140px";
  watcher.style.maxHeight = "140px";
  watcher.style.minWidth = "100px";
  watcher.style.minHeight = "100px";
  watcher.style.objectFit = "contain";
  watcher.style.marginTop = "10px"; // Add space below bubble, above ghost
  watcher.style.marginBottom = "0px"; // No weird gaps under ghost

  const speech = document.createElement("div");
  speech.id = "watcher-speech";
  speech.style.padding = "10px 15px"; // ✅ More padding inside bubble
  speech.style.backgroundColor = "#ffffff";
  speech.style.border = "2px solid #000"; // Make border thicker
  speech.style.borderRadius = "12px"; // ✅ Softer, more rounded
  speech.style.boxShadow = "2px 4px 8px rgba(0,0,0,0.25)"; // More visible shadow
  speech.style.fontSize = "15px"; // Slightly bigger font
  speech.style.maxWidth = "220px"; // ✅ Wider bubble
  speech.style.wordBreak = "break-word"; // Break long words nicely
  speech.style.textAlign = "center";
  speech.style.position = "relative";
  speech.style.display = "none"; // Hidden by default

  // Speech bubble triangle
  const triangle = document.createElement("div");
  triangle.style.position = "absolute";
  triangle.style.top = "100%"; // ✅ Put triangle at bottom of bubble
  triangle.style.left = "50%";
  triangle.style.transform = "translateX(-50%)";
  triangle.style.width = "0";
  triangle.style.height = "0";
  triangle.style.borderLeft = "10px solid transparent";
  triangle.style.borderRight = "10px solid transparent";
  triangle.style.borderTop = "10px solid #ffffff"; // same as bubble color
  triangle.style.marginTop = "-1px"; // tighten triangle a bit

  speech.appendChild(triangle);
  container.appendChild(speech);
  container.appendChild(watcher); // Order changed: first speech, then ghost
  document.body.appendChild(container);
}

// ===== Helpers =====
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

function changeWatcherMood(mood) {
  const watcher = document.getElementById("the-watcher-avatar");
  if (!watcher) return;

  if (mood === "happy") {
    watcher.src = chrome.runtime.getURL("assets/coach_happy.png");
  } else if (mood === "mad") {
    watcher.src = chrome.runtime.getURL("assets/coach_mad.png");
  } else if (mood === "confused") {
    watcher.src = chrome.runtime.getURL("assets/coach_confused.png");
  } else {
    watcher.src = chrome.runtime.getURL("assets/coach_base.png");
  }
}

// ===== Listen for external messages (optional popup controls) =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const container = document.getElementById("watcher-container");
  if (!container) return;

  if (message.action === "removeCoach") {
    container.style.display = "none";
  } else if (message.action === "addCoach") {
    container.style.display = "flex";
  }
});

// ===== Time Tracking Setup =====
TimeMe.initialize({
  currentPageName: window.location.href,
  idleTimeoutInSeconds: 30,
});

const badSites = [
  "instagram.com",
  "youtube.com",
  "tiktok.com",
  "netflix.com",
  "reddit.com",
];
const goodSites = [
  "github.com",
  "stackoverflow.com",
  "notion.so",
  "docs.google.com",
  "coursera.org",
];

function classifySite(url) {
  if (!url) return "neutral";
  if (badSites.some((site) => url.includes(site))) return "bad";
  if (goodSites.some((site) => url.includes(site))) return "good";
  return "neutral";
}

const siteType = classifySite(window.location.href);
console.log(`Site classified as: ${siteType}`);

let goodConsecutiveSeconds = 0;
let lastRecordedActiveSeconds = 0;
let graceTimer = null;
let inGracePeriod = false;
let messageTimeout = null;

const THREE_MINUTES = 15; // 3 minutes
const GRACE_PERIOD = 5; // 5 seconds

// ===== Monitor Active Time =====
setInterval(() => {
  const currentActiveSeconds = TimeMe.getTimeOnCurrentPageInSeconds();
  const newActiveSeconds = Math.round(
    currentActiveSeconds - lastRecordedActiveSeconds
  );
  lastRecordedActiveSeconds = currentActiveSeconds;

  if (newActiveSeconds > 0) {
    const currentSite = classifySite(window.location.href);

    if (currentSite === "good") {
      if (graceTimer) {
        clearTimeout(graceTimer);
        graceTimer = null;
        inGracePeriod = false;
        console.log(
          "Returned to good site during grace period. Timer continues."
        );
      }
      goodConsecutiveSeconds += newActiveSeconds;
      changeWatcherMood("happy");

      console.log(`Good consecutive seconds: ${goodConsecutiveSeconds}`);

      if (goodConsecutiveSeconds >= THREE_MINUTES) {
        showSpeech("Amazing work! 🏆 Detective on fire!");
        goodConsecutiveSeconds = 0; // reset after reward
      }
    } else if (siteType === "bad") {
      if (!inGracePeriod) {
        inGracePeriod = true;
        console.log("Entered bad site. Starting grace timer...");

        graceTimer = setTimeout(() => {
          console.log("Grace period over. Still on bad site.");

          // Punishment happens here
          changeWatcherMood("mad");
          showSpeech("Caught slacking! 🛑 Get back to work!");

          // FULL RESET
          goodConsecutiveSeconds = 0; // ✅ Reset good timer
          lastRecordedActiveSeconds = 0; // ✅ Optional: Reset last recorded seconds too (extra safe)

          // Clear grace tracking
          graceTimer = null;
          inGracePeriod = false;
        }, GRACE_PERIOD * 1000);
      }
    } else {
      // Neutral site — do nothing special
      console.log("Neutral site.");
    }
  }
}, 5000); // every 5 seconds
