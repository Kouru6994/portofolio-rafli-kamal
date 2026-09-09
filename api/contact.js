export default async function handler(req, res) {
  // Header CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya izinkan HTTP POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // Parse body aman (mendukung parsed object maupun raw json string)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, error: 'Format data JSON tidak valid.' });
    }
  }

  const { name, email, subject, message } = body || {};

  // Validasi input server-side
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Nama, email, dan pesan wajib diisi.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Format email pengirim tidak valid.' });
  }

  // Kredensial Resend dari Environment Variables
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[API Contact Error]: RESEND_API_KEY belum disetel di Vercel Environment Variables.');
    return res.status(500).json({
      success: false,
      error: 'Konfigurasi server belum lengkap (RESEND_API_KEY belum terpasang di Vercel).'
    });
  }

  try {
    const toEmail = process.env.TO_EMAIL || 'vrkouru@gmail.com';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Portfolio Contact] ${subject || 'Pesan Baru'}`,
        text: `Pengirim: ${name} (${email})\n\nPesan:\n${message}`,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('[Resend Detail Error]:', data);
      const errMsg = data?.message || data?.error || 'Gagal mengirim email via Resend.';
      return res.status(response.status).json({
        success: false,
        error: errMsg
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[API Contact Error]:', err.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Gagal memproses pesan di server.' 
    });
  }
}