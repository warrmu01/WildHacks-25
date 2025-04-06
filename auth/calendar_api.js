export async function fetchCalendarEvents(accessToken) {
    const calendarId = 'primary';
  
    // Get today’s start and end in ISO
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();
  
    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
                `timeMin=${startOfDay}&timeMax=${endOfDay}&` +
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
            title: event.summary,
            start: event.start.dateTime || event.start.date, // supports all-day events
            end: event.end.dateTime || event.end.date
          
    }));
  
    console.log("📅 Today's Events:", events);
    return events;
  }
  
export async function isInTaskWindow(accessToken) {
    const events = await fetchCalendarEvents(accessToken);
    const now = new Date();
    console.log("📅 Current time:", now.toISOString());
    console.log("📅 Events:", events);
  
    return events.some(event => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      console.log(`🔍 Checking event: ${event.title}`);
      console.log(`   Start: ${start.toISOString()}`);
      console.log(`   End: ${end.toISOString()}`);
      return start <= now && now <= end;
    });
  }
  
  