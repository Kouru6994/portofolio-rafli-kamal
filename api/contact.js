export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { name, email, subject, message, delayHours = 10 } = req.body;

  // 1. Validasi Server-side
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Nama, email, dan pesan wajib diisi.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Format email tidak valid.' });
  }

  try {
    // 2. Hitung waktu pengiriman (Scheduled Delivery)
    const sendAt = Math.floor(Date.now() / 1000) + (Number(delayHours) * 3600);

    // 3. Kirim via SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        send_at: sendAt,
        personalizations: [
          {
            to: [{ email: process.env.TO_EMAIL || 'raflikamalm.37@gmail.com' }],
          },
        ],
        from: { 
          email: process.env.FROM_EMAIL || 'noreply@rafli.dev', 
          name: 'Portfolio Contact' 
        },
        reply_to: { email, name },
        subject: `[Portfolio Contact] ${subject || 'Pesan Baru'}`,
        content: [
          {
            type: 'text/plain',
            value: `Pengirim: ${name} (${email})\nWaktu Kirim Web: ${new Date().toISOString()}\n\nPesan:\n${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`SendGrid API Error: ${errText}`);
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