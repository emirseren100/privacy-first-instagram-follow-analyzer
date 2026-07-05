# Follow Clarity

Privacy-first Instagram follow analyzer. Upload your own Instagram export and analyze follower/following relationships locally in your browser.

**Live Demo:** https://follow-clarity.netlify.app

## What It Does

- Shows people you follow who do not follow you back.
- Shows people who follow you but you do not follow back.
- Shows mutual follows.
- Shows total followers and following counts.
- Supports search, A-Z / Z-A sorting, copy usernames, CSV export, and Instagram profile links.

## Privacy Model

Follow Clarity does not scrape Instagram, does not ask for login details, and does not use unofficial Instagram APIs.

The app only analyzes files selected by the user:

- Instagram export ZIP files
- Instagram followers/following JSON files
- Instagram followers/following HTML files

All parsing happens locally in the browser. Uploaded export data is not sent to an application server.

## Supported Export Files

The parser supports files such as:

- `followers_1.json`
- `followers_2.json`
- `followers_1 (1).json`
- `following.json`
- `following_1.json`
- `followers.html`
- `following.html`
- ZIP exports containing those files

It reads usernames from common Instagram export structures including:

- `string_list_data[].value`
- `string_list_data[].href`
- `string_map_data`
- safe `title` fallbacks
- Instagram profile href formats such as `/username` and `/_u/username`

## How To Download Instagram Export Data

1. Open Instagram settings.
2. Go to Account Center.
3. Open "Your information and permissions".
4. Choose "Download your information".
5. Select your Instagram account.
6. Choose the "Followers and following" data category.
7. Set date range to **All time / Tum zamanlar**.
8. Choose JSON format if available. HTML is also supported.
9. Download the ZIP export when Instagram prepares it.
10. Upload the ZIP file into Follow Clarity.

Limited date ranges, such as "last year", can produce incomplete follower counts. Use **All time / Tum zamanlar** for the most accurate result.

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- JSZip
- Vitest
- jsdom

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

On Windows PowerShell, use `npm.cmd` if normal `npm` commands are blocked:

```bash
npm.cmd install
npm.cmd run dev
```

Run tests:

```bash
npm run test
```

Build:

```bash
npm run build
```

## Limitations

- This app does not work by entering an Instagram username.
- It does not fetch Instagram data from the internet.
- It does not use login, password, cookie, session, or token access.
- Results depend on the export file selected by the user.
- Incomplete exports may produce incomplete counts.

## Deployment

This project is deployed on Netlify:

```text
https://follow-clarity.netlify.app
```

Netlify build settings are defined in `netlify.toml`.
