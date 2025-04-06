// Inject the Watcher Avatar if not already present
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
  
  // Listen for mood change messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  