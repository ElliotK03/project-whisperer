# Project whisperer

This is just a browser automation playground.

*Seriously tho, don't skip your classes*

## Overview

> This project is created for testing purposes only. Use at your own risk.

This project is created for students who ~~can't (or won't) make it to class~~ wants to dip their toes in browser automation.

## Features

- Real-time SSE logging via web frontend
- Headless browser automation with Puppeteer
- Credential management via environment variables
- Docker containerization support
- Extensible logging framework (Winston)

## Tech stack

Language: JavaScript (NodeJS).

Frameworks: guilded.js, express, puppeteer, dotenv, winston

Tools: Docker (optional)

## Project structure

```yaml
project-whisperer/
├── index.js # Main server & automation logic
├── bot.js # Guilded bot (legacy/disabled)
├── logger.js # Winston logger + custom transports
├── client/ # HTML frontend
├── test/ # Mocha test suite
└── Dockerfile # Container configuration
```

## How it works

- Winston for logging

- Puppeteer (or Selenium in the older `selenium` branch) for browser automation, dotenv to store password while username is hardcoded

- Guilded bot (disabled) and HTML frontend to receive attendance link

- Automation pipeline starts as soon as the link is received

  - If you're using HTML frontend, the results are updated in real-time through Server-Sent Events (SSE)

  - If you were sending the link through the bot, it sends replies as updates

Apart from running the scripts in NodeJS, you can also build a Docker image to run it in a container.

**Note that the bot in this repo no longer works as Guilded platform has been shut down.** The existing Guilded bot code is disabled and abandoned in place.

## How to use

### Prerequisites

- Node.js v18.8.0 or v22.22.0
- npm or yarn
- (Optional) Docker & Docker Compose for containerized deployment

### Selfhosting

*This part will not cover the Guilded bot setup.*

Dependencies may be out-of-date. The server requires Node v18.8.0 (tested also with v22.22.0)

1. Clone this repo

2. Create a file called `.env`, this file will look something like:

    ```bash
     PW1='yourpasswordhere'
    ```

    Alternatively, you can put your password string in an environment variable called `PW1`

3. Install dependencies: `npm install`

4. Run the server: `node index.js`

### Cloud Hosting

With the docker image, it's possible to host this project anywhere that Docker is supported. Personally I tried Koyeb and Azure App Server.

Read the documentations for your selected cloud hosting platform.

## Testing

Run tests with:

  ```bash
  npm test
  ```

## Known Limitations

- Username is hardcoded; only password is env-based
- Guilded bot functionality is disabled (platform shutdown)
- Browser automation targets specific MMU attendance portal
