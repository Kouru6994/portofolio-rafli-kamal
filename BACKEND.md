# Backend Contact Form — Setup Guide

## Endpoint yang dibutuhkan

```
POST /api/contact
Content-Type: application/json
```

### Request body
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "sentAt": "ISO8601 timestamp",
  "delayHours": 10
}
```

### Response (success)
```json
{ "success": true }
```

### Response (error)
```json
{ "success": false, "error": "Reason string" }
```

---

## Opsi implementasi backend

### 1. Node.js + Express (simple)
```js
// api/contact.js
const nodemailer = require('nodemailer');

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message, delayHours } = req.body;

  // simpan ke DB atau queue
  await db.insert({ name, email, subject, message,
    scheduledFor: new Date(Date.now() + delayHours * 3600_000) });

  res.json({ success: true });
});

// Cron job — jalankan setiap jam
cron.schedule('0 * * * *', async () => {
  const pending = await db.find({ scheduledFor: { $lte: new Date() }, sent: false });
  for (const item of pending) {
    await transporter.sendMail({
      from: 'portfolio@rafli.dev',
      to: 'raflikamalm.37@gmail.com',
      subject: `[Portfolio] ${item.subject}`,
      text: `From: ${item.name} <${item.email}>\n\n${item.message}`,
    });
    await db.update({ _id: item._id }, { sent: true });
  }
});
```

### 2. Vercel Edge Function (serverless)
```js
// pages/api/contact.js (Next.js) atau api/contact.js (Vercel)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, subject, message, delayHours } = req.body;

  // Pakai SendGrid Scheduled Send
  const sendAt = Math.floor(Date.now() / 1000) + (delayHours * 3600);
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      send_at: sendAt,   // <-- delayed send
      personalizations: [{ to: [{ email: 'raflikamalm.37@gmail.com' }] }],
      from: { email: 'noreply@rafli.dev' },
      subject: `[Portfolio] ${subject}`,
      content: [{ type: 'text/plain', value: `From: ${name} <${email}>\n\n${message}` }],
    }),
  });

  res.json({ success: true });
}
```

### 3. Netlify Functions
```js
// netlify/functions/contact.js — struktur sama dengan Vercel
exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // implementasi sama seperti Vercel di atas
  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

---

## Environment variables yang dibutuhkan
```
SENDGRID_KEY=SG.xxxx          # atau MAILGUN_KEY, RESEND_KEY, dll
TO_EMAIL=raflikamalm.37@gmail.com
FROM_EMAIL=noreply@rafli.dev
```

## CORS — tambahkan di backend
```js
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```
