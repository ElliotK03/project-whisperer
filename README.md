# project-whisperer

A browser automation project with real-time log streaming to a web frontend.
Built to learn how headless browsers, SSE, and Docker fit together in a Node.js backend.

---

## Features

- Headless browser automation with Puppeteer — logs in and submits forms on a target web portal
- Live log streaming to the frontend using Server-Sent Events (SSE) — no polling
- Structured logging with Winston, extended with a custom SSE transport
- Credentials managed through environment variables (dotenv)
- Docker support — tested on Koyeb and Azure App Service
- Mocha tests for core logic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Server | Express |
| Automation | Puppeteer |
| Logging | Winston + custom SSE transport |
| Real-time | Server-Sent Events (SSE) |
| Config | dotenv |
| Testing | Mocha |
| Container | Docker |

---

## Project Structure

```
project-whisperer/
├── index.js        # Express server, SSE endpoint, automation logic
├── bot.js          # Old bot integration (disabled)
├── logger.js       # Winston logger with custom SSE transport
├── client/         # HTML frontend for live log display
├── test/           # Mocha tests
└── Dockerfile
```

---

## How It Works

1. Frontend sends a trigger link to the Express server
2. Server starts a Puppeteer browser session to automate the target portal
3. Each step logs an event through Winston
4. A custom Winston transport pipes those log events into an open SSE connection
5. Frontend receives and displays the updates live

The SSE transport is the interesting part — instead of adding WebSockets, Winston's transport interface is extended to write directly into the SSE response stream. Keeps things simple.

---

## Getting Started

### Prerequisites

- Node.js v18.8.0 or v22.22.0
- npm or yarn
- Docker (optional)

### Local setup

1. Clone the repo:
   ```bash
   git clone https://github.com/ElliotK03/project-whisperer.git
   cd project-whisperer
   ```

2. Create a `.env` file:
   ```
   PW1='your_credential_here'
   ```

3. Install and run:
   ```bash
   npm install
   node index.js
   ```

4. Open the frontend in your browser to trigger and monitor the automation.

### Docker

```bash
docker build -t project-whisperer .
docker run --env-file .env -p 3000:3000 project-whisperer
```

---

## Testing

```bash
npm test
```

---

## Known Limitations

- Username is hardcoded; only the password goes through `.env` (will fix in the future)
- The old Guilded bot is disabled (platform shut down)
- Puppeteer automation is written for a specific portal, not generalised

---

## Notes

Main things I was trying to learn here: Puppeteer automation, building a custom Winston transport, and getting Docker deployment working end-to-end.
