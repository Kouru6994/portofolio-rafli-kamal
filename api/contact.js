export default async function handler(req, res) {
  // Header untuk mengizinkan akses CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Penanganan request preflight browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hanya izinkan HTTP method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { name, email, subject, message } = req.body || {};

  // Validasi input server-side
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Nama, email, dan pesan wajib diisi.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Format email tidak valid.' });
  }

  try {
    // Pengiriman email menggunakan Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>',
        to: [process.env.TO_EMAIL || 'raflikamalm.37@gmail.com'],
        reply_to: email,
        subject: `[Portfolio Contact] ${subject || 'Pesan Baru'}`,
        text: `Pengirim: ${name} (${email})\n\nPesan:\n${message}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Resend API Error: ${errText}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[API Contact Error]:', err.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Gagal memproses pesan di server. Silakan coba lagi.' 
    });
  }
}