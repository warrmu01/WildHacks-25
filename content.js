// content.js
let lastSiteType = null; // ✅ ADDED this to track last classified site

// ===== UI: Create the ghost and speech bubble =====
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
  container.style.pointerEvents = "none";

  const watcher = document.createElement("img");
  watcher.src = chrome.runtime.getURL("assets/coach_base.png");
  watcher.id = "the-watcher-avatar";
  watcher.style.width = "120px";
  watcher.style.height = "120px";
  watcher.style.maxWidth = "140px";
  watcher.style.maxHeight = "140px";
  watcher.style.minWidth = "100px";
  watcher.style.minHeight = "100px";
  watcher.style.objectFit = "contain";
  watcher.style.marginTop = "10px";
  watcher.style.marginBottom = "0px";

  const speech = document.createElement("div");
  speech.id = "watcher-speech";
  speech.style.padding = "10px 15px";
  speech.style.backgroundColor = "#ffffff";
  speech.style.border = "2px solid #000";
  speech.style.borderRadius = "12px";
  speech.style.boxShadow = "2px 4px 8px rgba(0,0,0,0.25)";
  speech.style.fontSize = "15px";
  speech.style.maxWidth = "220px";
  speech.style.wordBreak = "break-word";
  speech.style.textAlign = "center";
  speech.style.position = "relative";
  speech.style.display = "none";

  // Speech bubble triangle
  const triangle = document.createElement("div");
  triangle.style.position = "absolute";
  triangle.style.top = "100%";
  triangle.style.left = "50%";
  triangle.style.transform = "translateX(-50%)";
  triangle.style.width = "0";
  triangle.style.height = "0";
  triangle.style.borderLeft = "10px solid transparent";
  triangle.style.borderRight = "10px solid transparent";
  triangle.style.borderTop = "10px solid #ffffff";
  triangle.style.marginTop = "-1px";

  speech.appendChild(triangle);
  container.appendChild(speech);
  container.appendChild(watcher);
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

let goodConsecutiveSeconds = 0;
let lastRecordedActiveSeconds = 0;
let graceTimer = null;
let inGracePeriod = false;
let messageTimeout = null;

const THREE_MINUTES = 15; // 15 seconds for debugging
const GRACE_PERIOD = 5; // 5 seconds grace period

// ===== Monitor Active Time =====
setInterval(() => {
  const currentActiveSeconds = TimeMe.getTimeOnCurrentPageInSeconds();
  const newActiveSeconds = Math.round(
    currentActiveSeconds - lastRecordedActiveSeconds
  );
  lastRecordedActiveSeconds = currentActiveSeconds;

  if (newActiveSeconds > 0) {
    const currentSite = classifySite(window.location.href);

    if (currentSite !== lastSiteType) {
      // Only trigger when switching sites

      if (currentSite === "good") {
        if (graceTimer) {
          clearTimeout(graceTimer);
          graceTimer = null;
          inGracePeriod = false;
          console.log(
            "Returned to good site during grace period. Timer continues."
          );
        }
        changeWatcherMood("happy");
      } else if (currentSite === "bad") {
        if (!inGracePeriod) {
          inGracePeriod = true;
          console.log("Entered bad site. Starting grace timer...");

          graceTimer = setTimeout(() => {
            console.log("Grace period over. Still on bad site.");
            changeWatcherMood("mad");
            showSpeech("Caught slacking! 🛑 Get back to work!");
            goodConsecutiveSeconds = 0;
            lastRecordedActiveSeconds = 0;
            graceTimer = null;
            inGracePeriod = false;
          }, GRACE_PERIOD * 1000);
        }
      } else {
        // Neutral site (confused face + speech)
        console.log("Neutral site (confused face).");
        changeWatcherMood("confused");
        showSpeech("Are you sure you are being productive on this site?");
      }

      lastSiteType = currentSite; // update the last site type after handling
    }

    if (currentSite === "good") {
      goodConsecutiveSeconds += newActiveSeconds;
      console.log(`Good consecutive seconds: ${goodConsecutiveSeconds}`);

      if (goodConsecutiveSeconds >= THREE_MINUTES) {
        showSpeech("Amazing work! 🏆 Detective on fire!");
        goodConsecutiveSeconds = 0; // reset after reward
      }
    }
  }
}, 5000); // every 5 seconds
