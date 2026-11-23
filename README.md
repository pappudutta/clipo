# Clipo — Local YouTube Video Clipper

Clipo is a self-hosted, local web application that lets you preview a YouTube video, choose a start and end time, and export just that section as a video or audio file.

It runs on your own computer. The browser interface is built with **React + Vite**, the local API uses **Node.js + Express**, **yt-dlp** retrieves media, and **FFmpeg** processes the output.

> **Important:** Only use Clipo with videos you own, have permission to download, or are otherwise legally allowed to use. You are responsible for following YouTube's Terms of Service, copyright law, and any other applicable rules. Clipo does not bypass access controls or grant rights to third-party content.

---

## Contents

- [Features](#features)
- [How Clipo works](#how-clipo-works)
- [Requirements](#requirements)
- [Install the required tools](#install-the-required-tools)
- [Download and install Clipo](#download-and-install-clipo)
- [Start Clipo](#start-clipo)
- [How to use Clipo](#how-to-use-clipo)
- [Optional configuration](#optional-configuration)
- [Build for local production use](#build-for-local-production-use)
- [Where your clips are saved](#where-your-clips-are-saved)
- [Troubleshooting](#troubleshooting)
- [Project structure](#project-structure)
- [Technology stack](#technology-stack)
- [License](#license)

## Features

- Paste a YouTube video URL and load its preview.
- Preview the video in the browser.
- Choose a clip's start and end points using the timeline and time controls.
- Preview the selected time range before processing.
- Choose an available video resolution.
- Export video as MP4, MP4 (H.264), WebM, or MKV.
- Export audio as MP3 or M4A.
- View processing progress and download completed clips.
- Run the frontend and backend locally on your computer.
- Automatically remove temporary clip files after a configured period.

## How Clipo works

Clipo has two local parts:

1. **Frontend:** the website you open in your browser. During development it runs at `http://localhost:5173`.
2. **Backend:** the local Node.js service that communicates with yt-dlp and FFmpeg. It runs at `http://localhost:5000`.

When you submit a clip, the frontend sends the video URL and selected timestamps to the backend. The backend asks yt-dlp to retrieve the requested section and uses FFmpeg for media processing. The completed file is made available to download from the browser.

Your computer must remain on, and the backend terminal must remain running, while a clip is being processed.

## Requirements

These instructions are for **Windows 10 and Windows 11**.

| Tool | Why it is needed |
| --- | --- |
| Node.js 18.11 or newer (LTS recommended) | Runs the frontend tooling and backend |
| npm | Installs project packages; included with Node.js |
| Python 3 | Installs and runs yt-dlp |
| yt-dlp | Retrieves video and audio media |
| FFmpeg | Processes and converts media |
| Deno | Recommended by yt-dlp for YouTube's JavaScript challenge support |
| Internet connection | Loads YouTube content and required remote components |

You do not need to install React, Vite, or Express globally. npm installs the project dependencies for you.

## Install the required tools

If you already have these tools installed, check their versions in PowerShell and skip the tools that are ready.

### 1. Install Node.js

1. Visit [nodejs.org](https://nodejs.org/).
2. Download and install the current **LTS** version for Windows.
3. During installation, keep the standard options enabled.
4. Close and reopen PowerShell.

Check the installation:

```powershell
node --version
npm --version
```

Node.js should be version 18.11 or newer.

### 2. Install Python

1. Visit [python.org/downloads](https://www.python.org/downloads/).
2. Download the Windows installer.
3. During setup, enable **Add Python to PATH** if that option is shown.
4. Finish the installation and reopen PowerShell.

Check Python:

```powershell
py --version
```

If the `py` command is unavailable but `python --version` works, use `python` instead of `py` in the commands below.

### 3. Install yt-dlp

In PowerShell, run:

```powershell
py -m pip install -U yt-dlp
```

Check it:

```powershell
yt-dlp --version
```

If PowerShell says `yt-dlp` is not recognized, close and reopen PowerShell. If it still is not found, make sure Python's Scripts directory is on your PATH, or configure the executable path using the optional `YT_DLP_PATH` setting below.

### 4. Install FFmpeg

The easiest option on supported Windows systems is:

```powershell
winget install Gyan.FFmpeg
```

Follow any prompts shown by Windows Package Manager. When installation finishes, close and reopen PowerShell.

Check it:

```powershell
ffmpeg -version
```

If `winget` is unavailable, install FFmpeg using the instructions on the [FFmpeg website](https://ffmpeg.org/download.html) and add the folder containing `ffmpeg.exe` to your Windows PATH.

### 5. Install Deno

Deno is recommended for yt-dlp's YouTube JavaScript challenge support. Follow the current Windows installation instructions at [deno.com](https://deno.com/).

Check it:

```powershell
deno --version
```

### 6. Check all tools

Open a new PowerShell window and run:

```powershell
node --version
npm --version
py --version
yt-dlp --version
ffmpeg -version
deno --version
```

If a command is not recognized, resolve that tool's installation or PATH issue before continuing.

## Download and install Clipo

### 1. Download the project

Open the [Clipo GitHub repository](https://github.com/pappudutta/clipo).

- To download the source code, select **Code → Download ZIP**.
- Extract the ZIP file to a folder you can easily find, for example:

```text
C:\Users\YourName\Apps\clipo
```

You can also clone the repository if Git is installed:

```powershell
git clone https://github.com/pappudutta/clipo.git
cd clipo
```

### 2. Open PowerShell in the project folder

The project folder is the one containing the root `package.json`.

For example:

```powershell
cd C:\Users\YourName\Apps\clipo
```

Replace the example path with the folder where you extracted or cloned Clipo.

### 3. Install project dependencies

Run:

```powershell
npm install
npm run install:all
```

This installs the root tools and the dependencies for the backend and frontend. The first installation may take a few minutes.

If the commands finish without errors, the installation is complete.

## Start Clipo

In the project root, run:

```powershell
npm run dev
```

This starts both local services:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

Keep this PowerShell window open while using Clipo. Open **http://localhost:5173** in your browser.

To stop the development servers, focus the PowerShell window and press **Ctrl + C**.

### Start the services separately (if needed)

If the combined command does not work, open two PowerShell windows.

**Window 1 — Backend:**

```powershell
cd C:\Users\YourName\Apps\clipo\backend
npm run dev
```

**Window 2 — Frontend:**

```powershell
cd C:\Users\YourName\Apps\clipo\frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## How to use Clipo

1. Start Clipo using the instructions above.
2. Open [http://localhost:5173](http://localhost:5173) in your browser.
3. Copy the URL of a video you are authorized to use.
4. Paste the URL into Clipo.
5. Wait for the video preview and available quality options to load.
6. Select the start and end points of the section you want.
7. Use the preview controls to check the selected section.
8. Choose the output format and, for video formats, an available quality.
9. Start processing.
10. Wait for the progress indicator to finish, then download the completed clip.

**Tips:**
- The end time must be later than the start time.
- The default maximum clip duration is 10 minutes. You can change this with `MAX_CLIP_SECONDS`.
- Available resolutions depend on the source video.
- Live streams cannot be clipped while they are live.
- Some videos may be unavailable because of privacy, age, regional restrictions, authentication requirements, or YouTube-side limitations.

## Optional configuration

Most users can run Clipo without creating a configuration file.

To change backend settings, create a file named **`backend/.env`**. You can start by copying the example:

```powershell
Copy-Item backend/.env.example backend/.env
```

If `backend/.env.example` is not present in your downloaded version, create `backend/.env` manually and add only the settings you need.

Available settings:

| Setting | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | Backend port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `MAX_CLIP_SECONDS` | `600` | Maximum clip duration in seconds |
| `MAX_HEIGHT` | `0` | Maximum video height; `0` means no configured cap |
| `ACCURATE_CUTS` | `0` | Set to `1` to request more accurate keyframe cuts |
| `MAX_CONCURRENT_JOBS` | `2` | Maximum simultaneous processing jobs |
| `JOB_TIMEOUT_MINUTES` | `20` | Processing timeout per job |
| `CLIP_TTL_MINUTES` | `60` | Time before completed temporary clips are removed |
| `YT_DLP_PATH` | `yt-dlp` | Optional path to the yt-dlp executable |
| `FFMPEG_PATH` | empty | Optional FFmpeg location override |
| `YT_COOKIES_FILE` | empty | Optional path to an authorized Netscape-format cookies file |

Example:

```dotenv
PORT=5000
CORS_ORIGIN=http://localhost:5173
MAX_CLIP_SECONDS=600
MAX_HEIGHT=0
ACCURATE_CUTS=0
MAX_CONCURRENT_JOBS=2
JOB_TIMEOUT_MINUTES=20
CLIP_TTL_MINUTES=60
# Optional:
# YT_COOKIES_FILE=cookies/youtube-cookies.txt
# YT_DLP_PATH=C:\\path\\to\\yt-dlp.exe
# FFMPEG_PATH=C:\\path\\to\\ffmpeg\\bin
```

After changing `backend/.env`, restart the backend for the settings to take effect.

### About YouTube cookies

Some videos may require an authenticated session or trigger YouTube's bot-verification checks. If you choose to configure cookies:

- Only use cookies from an account/session you are authorized to use.
- Export them in the Netscape cookies format supported by yt-dlp.
- Set `YT_COOKIES_FILE` to the file's path in `backend/.env`.
- Keep the cookies file private. **Never commit it, upload it to GitHub, or share it with anyone.**
- Cookies do not guarantee that a video can be accessed or downloaded.

Clipo's yt-dlp command also requests the `ejs:github` remote component. An internet connection is required for yt-dlp to retrieve that component.

## Build for local production use

To build the frontend and serve it through the Express backend:

```powershell
npm run build
npm start
```

Then open [http://localhost:5000](http://localhost:5000).

This is still a locally hosted application; it does not deploy Clipo to a public website or create a hosted service.

## Where your clips are saved

- Temporary output files are written to `backend/clips/`.
- The backend removes leftover files when it starts.
- Completed clips are automatically removed after the configured retention period (default: 60 minutes).
- Download a completed clip before it expires.

Do not use `backend/clips/` as permanent storage for personal files.

## Troubleshooting

### `node` or `npm` is not recognized

Install Node.js, close and reopen PowerShell, and check `node --version` and `npm --version`.

### `yt-dlp` is not recognized

Run:

```powershell
py -m pip install -U yt-dlp
```

Then reopen PowerShell. If needed, add Python's Scripts directory to PATH or set `YT_DLP_PATH` in `backend/.env` to the full path of the yt-dlp executable.

### FFmpeg is not found

Check:

```powershell
ffmpeg -version
```

If the command is unavailable, install FFmpeg and add its `bin` directory to PATH. Reopen PowerShell after changing PATH. You can also set `FFMPEG_PATH` in `backend/.env` if you need an explicit location.

### YouTube asks you to sign in or verify that you are not a bot

Update yt-dlp:

```powershell
py -m pip install -U yt-dlp
```

Confirm Deno is installed and available in PATH. If the video legitimately requires an authenticated session, you may configure an authorized cookies file as described above. Access can still be restricted by YouTube.

### Port 5000 or 5173 is already in use

Another application may already be using that port. Stop the other process or change the relevant port configuration. If you change the backend port, also update the frontend Vite proxy configuration so API requests reach the correct port.

### The website opens but cannot reach the backend

- Make sure the backend terminal is still running.
- Check that the backend started on port 5000.
- Open [http://localhost:5000/api/health](http://localhost:5000/api/health). A healthy backend responds with JSON containing `"ok": true`.
- In development, the Vite server proxies API requests to `http://localhost:5000`.

### A video or format cannot be processed

The selected video may be private, removed, age-restricted, region-restricted, live, or unavailable to your session. Try another video or an available output quality. Clipo cannot guarantee access to every YouTube video.

### Installation fails

- Check that you are running commands from the folder containing the root `package.json`.
- Confirm Node.js and npm are installed.
- Read the first error shown in PowerShell; later errors may be consequences of that first failure.
- If dependency installation is interrupted, retry `npm install` and `npm run install:all`.

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
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── index.html
│   └── package.json
├── package.json
├── package-lock.json
├── .gitignore
├── LICENSE
└── README.md
```

## Technology stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Media retrieval:** yt-dlp
- **Media processing:** FFmpeg
- **JavaScript runtime for yt-dlp support:** Deno

## License

Clipo is open-source software licensed under the [MIT License](LICENSE). You may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the terms of the MIT License.

Third-party tools and dependencies retain their own licenses and terms.
