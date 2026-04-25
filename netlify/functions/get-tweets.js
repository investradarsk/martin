// Netlify Function: get-tweets.js
// Proxies nitter RSS to avoid CORS issues
// Called as /.netlify/functions/get-tweets

exports.handler = async function(event, context) {
  const hosts = [
    'nitter.net',
    'nitter.privacydev.net', 
    'nitter.poast.org',
    'nitter.1d4.us'
  ];
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  for (const host of hosts) {
    try {
      const url = 'https://' + host + '/InvestRadarSK/rss';
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InvestRadar/1.0)' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!res.ok) continue;
      
      const xml = await res.text();
      
      // Parse XML items
      const items = [];
      const itemRegex = /<item>([\s\S]*?)</item>/g;
      let match;
      
      while ((match = itemRegex.exec(xml)) !== null && items.length < 5) {
        const block = match[1];
        const getTag = (tag) => {
          const m = block.match(new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/' + tag + '>'));
          if (m) return m[1].trim();
          const m2 = block.match(new RegExp('<' + tag + '[^>]*>([^<]*)<\/' + tag + '>'));
          return m2 ? m2[1].trim() : '';
        };
        
        const title = getTag('title');
        const pubDate = getTag('pubDate');
        const link = getTag('link');
        
        if (title && title !== 'InvestRadarSK') {
          items.push({ title, pubDate, link });
        }
      }
      
      if (items.length > 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ ok: true, items, source: host })
        };
      }
    } catch(e) {
      continue;
    }
  }
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: false, items: [] })
  };
};
