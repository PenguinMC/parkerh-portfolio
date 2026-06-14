# parkerh.com

Personal portfolio site. Single-file HTML + one Vercel serverless function.

## Stack
- Pure HTML/CSS/JS (no build step, no frameworks)
- Canvas-based animated stars + custom cursor
- `/api/contact` is a Vercel function that emails inquiries to the owner via Resend
- Self-hosted Google Fonts (Space Grotesk + JetBrains Mono)

## Deploy
1. Push to GitHub
2. Import the repo in Vercel
3. Add env vars: `RESEND_API_KEY` + `OWNER_EMAIL`
4. Point parkerh.com at the project

## Local dev
Open `index.html` in a browser. The contact form will fail locally (needs the Vercel function).

## Edit
- Copy → `index.html`
- Email → `api/contact.js`
- Add projects → duplicate a `.project` block in the work section
