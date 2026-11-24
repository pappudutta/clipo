# Clipo — Local YouTube Video Clipper

Clipo is a locally run desktop-browser application for selecting a time range from a YouTube video and exporting that segment. The frontend is React + Vite; the API is Node.js + Express; yt-dlp retrieves the selected section and FFmpeg handles media processing.

> Use Clipo only for videos you own or are authorized to download. You are responsible for complying with YouTube's Terms of Service and applicable copyright law.

## Features

- Paste a YouTube video URL and preview it in the browser.
- Select start and end times and preview the selected range.
- Query available video heights for a source video.
- Export MP4, MP4 H.264, WebM, MKV, MP3, or M4A.
- Download only the selected section using yt-dlp's section download support.
- Run the frontend and backend locally; no hosted Clipo service is required.

## Requirements (Windows 10/11)

1. **Node.js 18.11 or newer** (LTS recommended).
2. **Python 3** and **yt-dlp**. Install/update with `py -m pip install -U yt-dlp`.
3. **FFmpeg** available on PATH. Install with `winget install Gyan.FFmpeg`, then open a new terminal.
4. **Deno** (recommended as the JavaScript runtime for yt-dlp's YouTube support). Install from the official Deno installation instructions and confirm `deno --version`.

Confirm the commands are available:

```powershell
node --version
npm --version
yt-dlp --version
ffmpeg -version
deno --version
```

The backend invokes yt-dlp with `--remote-components ejs:github`; an internet connection is needed for yt-dlp to retrieve those remote components and access YouTube.

## Installation

Open PowerShell in the project root (the folder containing the root `package.json`):

```powershell
npm install
npm run install:all
```

## Run in development

```powershell
npm run dev
```

This starts:

- React/Vite frontend: http://localhost:5173
- Express API: http://localhost:5000

Open http://localhost:5173 in your browser. Keep the terminal running while using Clipo.

### Automatic VS Code development startup

When you open this folder in VS Code, the **Clipo: Start Development Servers** workspace task can run `npm run dev` automatically. VS Code will prompt you to allow automatic tasks for this trusted workspace. You can also manage the choice later with **Tasks: Manage Automatic Tasks** from the Command Palette.

The task keeps its integrated terminal visible and prevents a second VS Code instance of the task from starting. Before either the task or a manual `npm run dev` starts, Clipo checks that ports `5000` (API) and `5173` (Vite) are free. If either is occupied, it prints a clear message and does not stop or alter the existing process.

- **Frontend changes:** Vite Hot Module Replacement updates React components and styles automatically in the browser where it can preserve state.
- **Backend changes:** Node's built-in `--watch` mode restarts the Express server when files under `backend/src/` change. Its restart output remains visible in the same terminal.
- **Stop both servers:** focus the development task terminal and press `Ctrl+C`; `concurrently` stops the frontend and backend together.
- **Manual restart required:** stop and start the task after changing `.env` values, installed dependencies, package scripts, Node/FFmpeg/yt-dlp configuration, or port settings.

## Optional backend configuration

Create `backend/.env` only if you need to override defaults. Do not commit this file. Example:

```dotenv
PORT=5000
CORS_ORIGIN=http://localhost:5173
MAX_CLIP_SECONDS=600
MAX_HEIGHT=0
ACCURATE_CUTS=0
MAX_CONCURRENT_JOBS=2
JOB_TIMEOUT_MINUTES=20
CLIP_TTL_MINUTES=60
# Optional absolute or backend-relative path to a Netscape-format cookies file:
# YT_COOKIES_FILE=cookies/youtube-cookies.txt
# Optional executable overrides if not available on PATH:
# YT_DLP_PATH=C:\\\Users\\\YourName\\\AppData\\\Local\\\Programs\\\python\\\python.exe
# FFMPEG_PATH=C:\\\ffmpeg\\\bin
```

Cookies are optional and should only be used with an account/session you are authorized to use. Never share or commit browser cookies. Some YouTube videos may not be available without authentication; cookies do not guarantee access.

## Build and production-style local run

```powershell
npm run build
npm start
```

Then open http://localhost:5000. The Express server serves `frontend/dist` when that folder exists.

## Output and cleanup

Generated clips are written temporarily to `backend/clips/`. The backend clears leftover files at startup and removes completed clips after the configured TTL (default 60 minutes). Do not store personal files in that directory.

## Project structure

```text
clipo/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.js
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── package.json
└── README.md
```

## Troubleshooting

- **`yt-dlp` not found:** install it with `py -m pip install -U yt-dlp` and ensure the Python Scripts directory is on PATH, or set `YT_DLP_PATH` to the executable.
- **`ffmpeg` not found:** install FFmpeg and reopen PowerShell so PATH refreshes; alternatively set `FFMPEG_PATH`.
- **YouTube bot/sign-in verification:** update yt-dlp, confirm Deno is installed, and retry. If needed, configure an authorized cookies file using `YT_COOKIES_FILE`; do not publish it.
- **Port already in use:** stop the process using port 5000 or 5173, or change the corresponding configuration.
- **Frontend cannot reach API:** in development, Vite proxies `/api` to `http://localhost:5000`; ensure the backend is running.

## License

## License

Clipo is open-source software licensed under the [MIT License](LICENSE).

You are free to use, modify, and distribute this software under the terms of the MIT License.
