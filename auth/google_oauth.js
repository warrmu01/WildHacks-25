export async function authenticateWithGoogle() {


    const clientId = '999419271104-qr1cb08t0ru1h6lkonqlhknrmkguuchg.apps.googleusercontent.com'; // Replace this
    const redirectUri = `https://hifdddnmgiicnijglpmbjlhpppdeogim.chromiumapp.org`;

    console.log("🔁 Starting auth flow...");
    console.log("👉 Redirect URI:", redirectUri);
  
    const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
      `client_id=${clientId}` +
      `&response_type=token` +
      `&redirect_uri=${redirectUri}` +
      `&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly`;
  
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true,
      }, function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
          console.error("❌ Auth error:", chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
  
        console.log("🔁 Redirect URL received:", redirectUrl);
  
        const url = new URL(redirectUrl);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        const accessToken = hashParams.get('access_token');
  
        if (accessToken) {
          console.log("✅ Got access token:", accessToken);
          resolve(accessToken);
        } else {
          console.warn("⚠️ No access token in redirect");
          reject(new Error("No access token found."));
        }
      });
    });
  }