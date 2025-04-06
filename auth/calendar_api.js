export async function fetchCalendarEvents(accessToken) {
    const calendarId = 'primary';
  
    // ⏱ Get current time
    const now = new Date();
  
    // 🔁 Round down to nearest 15 minutes
    const minutes = Math.floor(now.getMinutes() / 15) * 15;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), minutes, 0, 0);
    const end = new Date(start.getTime() + 15 * 60 * 1000); // +15 minutes
  
    const timeMin = start.toISOString();
    const timeMax = end.toISOString();
  
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
                `timeMin=${timeMin}&timeMax=${timeMax}&` +
                `singleEvents=true&orderBy=startTime`;
  
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Calendar error: ${error.error.message}`);
    }
  
    const data = await response.json();
  
    const events = data.items.map(event => ({
      title: event.summary || "No Title",
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date
    }));
  
    console.log("📅 Events in 15-minute window:", events);
    return events;
  }
  
  export async function isInTaskWindow(accessToken) {
    const events = await fetchCalendarEvents(accessToken);
    const now = new Date();
    console.log("📅 Current time:", now.toISOString());
    console.log("📅 Checking events for overlap...");
  
    return events.some(event => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      console.log(`🔍 ${event.title}`);
      console.log(`  ▶ Start: ${start.toISOString()}`);
      console.log(`  ⏹ End: ${end.toISOString()}`);
      return start <= now && now <= end;
    });
  }
  