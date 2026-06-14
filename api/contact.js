// /api/contact.js — sends the portfolio contact form to Parker via Resend.
// Required env vars: RESEND_API_KEY, OWNER_EMAIL

const RESEND_API = 'https://api.resend.com/emails';
const FROM = process.env.PORTFOLIO_FROM || 'parkerh.com <onboarding@resend.dev>';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const project_type = String(body.project_type || '').trim();
    const timeline = String(body.timeline || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required.' });
      return;
    }
    // Basic email sanity
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please use a valid email.' });
      return;
    }

    const owner = process.env.OWNER_EMAIL || 'parkerhughes@flycraftchs.com';

    const safe = (s) => s.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]);

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif;color:#fff;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#000;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;max-width:600px;">
  <tr><td style="background:linear-gradient(90deg,#6E5EFB,transparent);height:3px;border-radius:12px 12px 0 0;"></td></tr>
  <tr><td style="padding:32px 36px 12px;">
    <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.22em;color:#6E5EFB;text-transform:uppercase;margin-bottom:6px;">parkerh.com / new inquiry</div>
    <h1 style="font-family:'Helvetica Neue',Arial,sans-serif;font-weight:300;font-size:26px;line-height:1.2;margin:0;color:#fff;">From <strong style="font-weight:500;">${safe(name)}</strong></h1>
  </td></tr>
  <tr><td style="padding:16px 36px 28px;">
    <table cellpadding="6" cellspacing="0" border="0" style="font-family:'Courier New',monospace;font-size:13px;color:#fff;width:100%;">
      <tr><td style="color:rgba(255,255,255,0.5);width:100px;">EMAIL</td><td><a href="mailto:${safe(email)}" style="color:#6E5EFB;text-decoration:none;">${safe(email)}</a></td></tr>
      ${phone ? `<tr><td style="color:rgba(255,255,255,0.5);">PHONE</td><td><a href="tel:${safe(phone)}" style="color:#6E5EFB;text-decoration:none;">${safe(phone)}</a></td></tr>` : ''}
      <tr><td style="color:rgba(255,255,255,0.5);">PROJECT</td><td>${safe(project_type) || '(not specified)'}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.5);">TIMELINE</td><td>${safe(timeline) || '(not specified)'}</td></tr>
    </table>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
      <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.22em;color:rgba(255,255,255,0.5);text-transform:uppercase;margin-bottom:14px;">Message</div>
      <p style="font-size:15px;line-height:1.65;color:rgba(255,255,255,0.9);margin:0;white-space:pre-wrap;">${safe(message)}</p>
    </div>
  </td></tr>
  <tr><td style="padding:0 36px 28px;">
    <a href="mailto:${safe(email)}?subject=Re%3A%20Your%20message%20to%20parkerh.com" style="display:inline-block;padding:13px 26px;background:#6E5EFB;color:#fff;text-decoration:none;border-radius:6px;font-family:'Courier New',monospace;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Reply to ${safe(name.split(' ')[0])}</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    const text = `New inquiry on parkerh.com\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || '(not provided)'}\nProject: ${project_type || '(not specified)'}\nTimeline: ${timeline || '(not specified)'}\n\nMessage:\n${message}\n\nReply: mailto:${email}`;

    const r = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [owner],
        reply_to: email,
        subject: `New inquiry from ${name} — parkerh.com`,
        html,
        text
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Resend error', r.status, data);
      res.status(500).json({ error: 'Could not send. Try again or email hello@parkerh.com' });
      return;
    }

    res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    console.error('Handler error', e);
    res.status(500).json({ error: 'Server error. Email hello@parkerh.com' });
  }
};
