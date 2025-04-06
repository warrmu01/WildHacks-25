# 👀 The Watcher : Your Snarky Productivity Coach

The Watcher is a Chrome extension that keeps your productivity in check with a twist — sarcasm, banter, and a GPT-style AI coach that knows when you're *actually* getting things done… and when you're just pretending.

Built for [Wild Hacks 2025], this project uses **Gemini AI**, **Google Calendar API**, and **OAuth** to deliver real-time coaching based on your task schedule and tab activity.

## 🔥 Features

- ✅ **AI Coach Avatar**: A draggable coach that appears on-screen when it's task time — and disappears when you're free.
- 🗓️ **Google Calendar Integration**: Syncs with your calendar to track productivity windows.
- 🧠 **Gemini API**: Powers the coach's witty feedback, motivational nudges, and sarcastic commentary.
- 👀 **Tab Tracking (Chrome Extension)**: Monitors tab usage to detect procrastination (Reddit, YouTube, etc... we see you).
- 📝 **To-Do Tracking (Coming Soon)**: Manage and sync tasks for smarter productivity suggestions.

## 🚀 How It Works

1. **OAuth Login** via Google for Calendar access.
2. Coach avatar loads during active task blocks.
3. Extension monitors current tabs and time.
4. **Gemini API** is called to generate personalized banter based on:
   - Your current task
   - Whether you’re on-task or procrastinating
5. Avatar disappears when your focus session ends.

## 🛠️ Tech Stack

- **Frontend**: HTML, JavaScript, CSS (Chrome Extension)
- **AI Integration**: Gemini API
- **Auth & Calendar**: Google OAuth + Google Calendar API

## ⚙️ Setup Instructions

> ⚠️ Work in progress. Chrome Extension only for now.

1. Clone this repo
2. Load the `extension/` folder as an **unpacked extension** in Chrome
3. Set up your `.env` for Gemini + Google APIs
4. Authenticate with Google
5. Start procrastinating — we’ll be watching 😏

## 💡 Inspiration

We wanted to solve a real problem: staying focused when working alone. Instead of boring Pomodoro timers or productivity apps, we imagined a sarcastic AI coach that *feels* like your chaotic friend yelling at you to get back to work.


## 📚 External Libraries & Frameworks Used

- [Gemini API](https://ai.google.dev/)
- [Google Calendar API](https://developers.google.com/calendar)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)

## ✅ MLH Submission Note

In compliance with MLH rules:  
This project uses several external APIs and libraries, as listed above.  
All work in this repository is original and created by our team during the hackathon.  
**MLH may conduct cheating checks** — feel free to reach out if any clarification is needed.

---

Made with Redbull, chaos, and just a bunch of friends at Wild Hacks 2025.
