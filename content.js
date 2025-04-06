// Inject the Watcher Avatar if not already present
function classifyURL(url) {

  const badSites = ["youtube.com", "twitter.com", "reddit.com", "instagram.com"]
  const goodSites = ["docs.google.com", "github.com", "linkedin.com/feed/"]

  if (badSites.some(domain => url.includes(domain))) return "mad";
  if (goodSites.some(domain => url.includes(domain))) return "happy";
  return "confused";
}

// Move message listener OUTSIDE of injectCoach function
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "removeCoach") {
    const watcher = document.getElementById("the-watcher-avatar");
    if (watcher) watcher.remove();
  }

  if (message.action === "addCoach") {
    injectCoach();

    // Get current page's URL and classify it
    const mood = classifyURL(window.location.href);
    const moodMap = {
      happy: "coach_happy.png",
      mad: "coach_mad.png",
      confused: "coach_confused.png",
      base: "coach_base.png"
    };

    const watcher = document.getElementById("the-watcher-avatar");
    if (watcher) {
      watcher.src = chrome.runtime.getURL("assets/" + (moodMap[mood] || moodMap.base));
    }
  }

  if (message.action === "changeMood") {
    const watcher = document.getElementById("the-watcher-avatar");
    if (watcher) {
      const moodMap = {
        happy: "coach_happy.png",
        mad: "coach_mad.png",
        confused: "coach_confused.png",
        base: "coach_base.png"
      };
      watcher.src = chrome.runtime.getURL("assets/" + (moodMap[message.mood] || moodMap.base));
    }
  }
});

function injectCoach() {
  if (!document.getElementById("the-watcher-avatar")) {
    const watcher = document.createElement("img");
    watcher.src = chrome.runtime.getURL("assets/coach_base.png"); // Default image
    watcher.id = "the-watcher-avatar";

    // Style the avatar
    watcher.style.position = "fixed";
    watcher.style.top = "50px";
    watcher.style.left = "auto";
    watcher.style.right = "-62px";
    watcher.style.width = "200px";
    watcher.style.height = "200px";
    watcher.style.zIndex = "9999";
    watcher.style.cursor = "grab";
    watcher.style.userSelect = "none";
    watcher.style.transition = "transform 0.1s ease-in-out";

    document.body.appendChild(watcher);

    // Enable drag functionality
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    watcher.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - watcher.getBoundingClientRect().left;
      offsetY = e.clientY - watcher.getBoundingClientRect().top;
      watcher.style.transition = "none";
      watcher.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        watcher.style.left = `${x}px`;
        watcher.style.top = `${y}px`;
        watcher.style.right = "auto";
        watcher.style.position = "fixed";
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        watcher.style.transition = "transform 0.2s ease-in-out";
        watcher.style.cursor = "grab";
      }
    });
  }
}

// Check if coach is enabled in storage before injecting
chrome.storage.local.get("coachEnabled", (data) => {
  if (data.coachEnabled !== false) {
    injectCoach();
  }
});

// Add a listener for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.coachEnabled) {
    // If coachEnabled changed
    if (changes.coachEnabled.newValue === false) {
      // If it was set to false, remove the coach
      const watcher = document.getElementById("the-watcher-avatar");
      if (watcher) watcher.remove();
    } else if (changes.coachEnabled.newValue === true) {
      // If it was set to true, add the coach
      injectCoach();

      // Set the appropriate mood
      const mood = classifyURL(window.location.href);
      const moodMap = {
        happy: "coach_happy.png",
        mad: "coach_mad.png",
        confused: "coach_confused.png",
        base: "coach_base.png"
      };

      const watcher = document.getElementById("the-watcher-avatar");
      if (watcher) {
        watcher.src = chrome.runtime.getURL("assets/" + (moodMap[mood] || moodMap.base));
      }
    }
  }
});

// (async () => {
//     const { isInTaskWindow } = await import(chrome.runtime.getURL("auth/calendar_api.js"));
  
//     chrome.storage.local.get(["coachEnabled", "googleAuthToken"], async ({ coachEnabled, googleAuthToken }) => {
//       if (coachEnabled === false || !googleAuthToken) return;
  
//       const inTask = await isInTaskWindow(googleAuthToken);
//       if (inTask) {
//         injectCoach();
//       } else {
//         console.log("⏱️ Not in task window – coach will not appear");
//       }
//     });
//   })();