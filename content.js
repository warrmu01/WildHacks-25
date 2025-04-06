// ===== Constants & State =====
// ===== Constants & State =====
let lastSiteType = null;
let goodConsecutiveSeconds = 0;
let lastRecordedActiveSeconds = 0;
graceTimer = null;
let inGracePeriod = false;

const GRACE_PERIOD = 5; // seconds before "mad"
const THREE_MINUTES = 15; // seconds of good behavior for reward

// ===== Classify URL =====
function classifyURL(url) {
  const badSites = [
    "youtube.com", "twitter.com", "reddit.com", "instagram.com",
    "https://mail.google.com/mail/u/0/#inbox"
  ];
  const goodSites = [
    "docs.google.com", "github.com", "linkedin.com/feed/"
  ];

  if (badSites.some(domain => url.includes(domain))) return "mad";
  if (goodSites.some(domain => url.includes(domain))) return "happy";
  return "confused";
}

// ===== Inject Coach UI with Speech Bubble + Draggable Avatar =====
function injectCoach() {
  if (document.getElementById("watcher-container")) return;

  const container = document.createElement("div");
  container.id = "watcher-container";
  container.style.position = "fixed";
  container.style.top = "50px";
  container.style.right = "-62px";
  container.style.left = "auto";
  container.style.zIndex = "9999";
  container.style.display = "flex";
  container.style.flexDirection = "row-reverse";
  container.style.alignItems = "center";
  container.style.userSelect = "none";

  const watcher = document.createElement("img");
  watcher.src = chrome.runtime.getURL("assets/coach_base.png");
  watcher.id = "the-watcher-avatar";
  watcher.style.width = "200px";
  watcher.style.height = "200px";
  watcher.style.zIndex = "9999";
  watcher.style.cursor = "grab";
  watcher.style.userSelect = "none";
  watcher.style.transition = "transform 0.1s ease-in-out";
  watcher.style.objectFit = "contain";
  watcher.style.marginLeft = "10px";

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
  speech.style.marginRight = "10px";

  const triangle = document.createElement("div");
  triangle.style.position = "absolute";
  triangle.style.top = "100%";
  triangle.style.left = "50%";
  triangle.style.transform = "translateX(-50%)";
  triangle.style.borderLeft = "10px solid transparent";
  triangle.style.borderRight = "10px solid transparent";
  triangle.style.borderTop = "10px solid #ffffff";
  triangle.style.marginTop = "-1px";
  speech.appendChild(triangle);

  container.appendChild(watcher);
  container.appendChild(speech);
  document.body.appendChild(container);

  // Enable drag
  let isDragging = false;
  let offsetX = 0, offsetY = 0;
  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    watcher.style.cursor = "grabbing";
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;
      container.style.right = "auto";
    }
  });
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      watcher.style.cursor = "grab";
    }
  });
}
// ===== Helpers
function showSpeech(text) {
  const speech = document.getElementById("watcher-speech");
  if (!speech) return;
  speech.textContent = text;
  speech.style.display = "block";
  setTimeout(() => speech.style.display = "none", 5000);
}

function changeWatcherMood(mood) {
  const watcher = document.getElementById("the-watcher-avatar");
  if (!watcher) return;
  const moodMap = {
    happy: "coach_happy.png",
    mad: "coach_mad.png",
    confused: "coach_confused.png",
    base: "coach_base.png"
  };
  watcher.src = chrome.runtime.getURL("assets/" + (moodMap[mood] || moodMap.base));
}

// ===== TimeMe Tracking
TimeMe.initialize({ currentPageName: window.location.href, idleTimeoutInSeconds: 30 });

setInterval(() => {
  const currentActiveSeconds = TimeMe.getTimeOnCurrentPageInSeconds();
  const newActiveSeconds = Math.round(currentActiveSeconds - lastRecordedActiveSeconds);
  lastRecordedActiveSeconds = currentActiveSeconds;

  if (newActiveSeconds > 0) {
    const currentSite = classifyURL(window.location.href);
    if (currentSite !== lastSiteType) {
      if (currentSite === "happy") {
        if (graceTimer) clearTimeout(graceTimer);
        graceTimer = null;
        inGracePeriod = false;
        changeWatcherMood("happy");
      } else if (currentSite === "mad") {
        if (!inGracePeriod) {
          inGracePeriod = true;
          graceTimer = setTimeout(() => {
            changeWatcherMood("mad");
            showSpeech("Caught slacking! 🛑 Get back to work!");
            goodConsecutiveSeconds = 0;
            lastRecordedActiveSeconds = 0;
            graceTimer = null;
            inGracePeriod = false;
          }, GRACE_PERIOD * 1000);
        }
      } else {
        changeWatcherMood("confused");
        showSpeech("Are you sure you are being productive on this site?");
      }
      lastSiteType = currentSite;
    }

    if (currentSite === "happy") {
      goodConsecutiveSeconds += newActiveSeconds;
      if (goodConsecutiveSeconds >= THREE_MINUTES) {
        showSpeech("Amazing work! 🏆 Detective on fire!");
        goodConsecutiveSeconds = 0;
      }
    }
  }
}, 5000);

// ===== Chrome Message Listener (ONE clean handler)
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "removeCoach") {
    const container = document.getElementById("watcher-container");
    if (container) container.style.display = "none";
  }

  if (message.action === "addCoach") {
    injectCoach();
    const mood = classifyURL(window.location.href);
    changeWatcherMood(mood);
  }

  if (message.action === "changeMood") {
    changeWatcherMood(message.mood);
  }
});

// ===== Initial Injection if Enabled + In Task Window
(async () => {
  const { isInTaskWindow } = await import(chrome.runtime.getURL("auth/calendar_api.js"));
  const { coachEnabled, googleAuthToken } = await chrome.storage.local.get(["coachEnabled", "googleAuthToken"]);
  if (coachEnabled === false || !googleAuthToken) return;

  const inTask = await isInTaskWindow(googleAuthToken);
  if (inTask) {
    injectCoach();
    const mood = classifyURL(window.location.href);
    changeWatcherMood(mood);
  } else {
    console.log("⏱️ Not in task window – coach will not appear");
  }
})();

// ===== React to coachEnabled storage toggle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.coachEnabled) {
    if (changes.coachEnabled.newValue === false) {
      const container = document.getElementById("watcher-container");
      if (container) container.remove();
    } else if (changes.coachEnabled.newValue === true) {
      injectCoach();
      const mood = classifyURL(window.location.href);
      changeWatcherMood(mood);
    }
  }
});
