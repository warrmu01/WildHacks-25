
export function classifyURL(url) {

    const badSites = ["youtube.com", "twitter.com", "reddit.com", "instagram.com"]
    const goodSites = ["docs.google.com", "github.com", "linkedin.com/feed/"]

    if (badSites.some(domain => url.includes(domain))) return "mad";
    if (goodSites.some(domain => url.includes(domain))) return "happy";
    return "confused";
}