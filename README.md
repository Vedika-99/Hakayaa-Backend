# Hakayaa Backend

Production-ready Node.js + Express backend for the Hakayaa contact form.

## What It Does

- Accepts `POST /submit`
- Validates and sanitizes `name`, `email`, optional `phone`, and `message`
- Blocks simple spam/honeypot submissions
- Rate limits submissions
- Stores rows in Google Sheets
- Sends an admin email through Gmail OAuth2
- Uses only environment variables, so it is ready for Render

## Install

```bash
cd hakayaa-backend
npm install
npm start
```

Local API:

```text
http://localhost:3000/submit
```

## Google Sheet Setup

1. Create a Google Sheet.
2. Add headers in row 1:

```text
Name | Email | Phone | Message | Timestamp
```

3. Copy the spreadsheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

4. Put that value in `SHEET_ID`.

## Google Cloud Setup

1. Go to Google Cloud Console.
2. Create or select a project.
3. Enable these APIs:
   - Google Sheets API
   - Gmail API
4. Configure OAuth consent screen.
5. Create OAuth client credentials:
   - Application type: Web application
   - Authorized redirect URI: `https://developers.google.com/oauthplayground`
6. Copy the OAuth client ID and client secret into:

```text
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=https://developers.google.com/oauthplayground
```

## Generate Refresh Token

Use Google OAuth Playground:

1. Open `https://developers.google.com/oauthplayground`.
2. Click the gear icon.
3. Enable `Use your own OAuth credentials`.
4. Paste your `CLIENT_ID` and `CLIENT_SECRET`.
5. In scopes, add:

```text
https://www.googleapis.com/auth/spreadsheets
https://mail.google.com/
```

6. Click `Authorize APIs`.
7. Sign in with the same Google account that owns the Sheet and Gmail sender.
8. Click `Exchange authorization code for tokens`.
9. Copy the refresh token into:

```text
REFRESH_TOKEN=
```

Important: the Google account used for OAuth must have access to the Sheet and must be the Gmail account used in `GMAIL_USER`.

## Environment Variables

Copy `.env.example` to `.env` locally:

```bash
cp .env.example .env
```

Fill these values:

```text
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.com
CLIENT_ID=...
CLIENT_SECRET=...
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN=...
SHEET_ID=...
SHEET_NAME=Sheet1
GMAIL_USER=your-gmail-address@gmail.com
ADMIN_EMAIL=admin@example.com
```

## Render Deployment

1. Push `hakayaa-backend` to GitHub.
2. In Render, create a new `Web Service`.
3. Select the repository.
4. Use:

```text
Root Directory: hakayaa-backend
Build Command: npm install
Start Command: npm start
```

5. Add every value from `.env.example` in Render Environment Variables.
6. Set `ALLOWED_ORIGINS` to your real website domain.
7. Deploy.

Your production endpoint will look like:

```text
https://your-render-service.onrender.com/submit
```

## Frontend Integration

If the frontend is hosted separately from the backend, use your full Render URL:

```js
const API_URL = "https://your-render-service.onrender.com/submit";
```

If the frontend and backend are served from the same domain, this works:

```js
const API_URL = "/submit";
```

There is a complete copy-paste example in `frontend-submit-example.js`.
