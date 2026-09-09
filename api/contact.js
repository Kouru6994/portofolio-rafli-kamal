export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Nama, email, dan pesan wajib diisi.' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY belum terpasang di Vercel Environment Variables.');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Acme <onboarding@resend.dev>',
        to: ['raflikamalm.37@gmail.com'],
        reply_to: email,
        subject: `[Portfolio Contact] ${subject || 'Pesan Baru'}`,
        text: `Pengirim: ${name} (${email})\n\nPesan:\n${message}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Resend Detail Error]:', errText);
      throw new Error(`Resend Error: ${errText}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[API Contact Error]:', err.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Gagal memproses pesan di server.' 
    });
  }
}