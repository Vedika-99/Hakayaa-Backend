# Render Deployment

Deploy this folder as the backend web service.

## Render Settings

```text
Root Directory: hakayaa-backend
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

## Required Environment Variables

Set these in Render's Environment tab. Do not commit `.env`.

```text
NODE_ENV=production
ALLOWED_ORIGINS=https://your-frontend-domain.com
CLIENT_ID=...
CLIENT_SECRET=...
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN=...
SHEET_ID=...
SHEET_NAME=Sheet1
GMAIL_USER=...
ADMIN_EMAIL=...
```

Render provides `PORT` automatically, so you do not need to set it there.

## API Routes

```text
GET  /health
POST /submit
```

If the frontend is deployed as a separate Render static site, set its
`window.HAKAYAA_SUBMIT_ENDPOINT` value to:

```text
https://your-backend-service.onrender.com/submit
```
