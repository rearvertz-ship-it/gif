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
  
  const now = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  
  const message = `🖼️ GIF Viewed!\\nGIF #${id}\\nIP: ${ip}\\nUA: ${ua}\\nTime: ${now}`;
  
  const webhookUrl = 'https://discord.com/api/webhooks/1490714732683067482/ae8gBJ6SmxJLVdbz5FMO55PmuhLnPPhSkp_iAvep88ScYAnlzEf6ghUVjUD_yoVRI-h2';
  
  try {
    // Sync webhook
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: message })
    });
  } catch (e) {
    console.error('Webhook:', e);
  }

  try {
    const fs = await import('fs/promises');
    const stats = await fs.stat(gifPath);
    
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    const readStream = (await import('fs')).createReadStream(gifPath);
    readStream.pipe(res);
  } catch (e) {
    console.error('GIF:', e);
    res.status(404).end();
  }
}
