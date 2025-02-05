FROM node:18.19-alpine3.18

RUN mkdir -p /home/node/project_whisperer/node_modules && chown -R node:node /home/node/project_whisperer
WORKDIR /home/node/project_whisperer

#Install dotenvx
RUN curl -fsS https://dotenvx.sh/ | sh

#Install firefox
RUN apk update && apk add chromium 
ENV PUPPETEER_EXECUTABLE_PATH='/usr/bin/chromium'

COPY package*.json ./
RUN npm install --omit=dev --omit=peer
RUN npm update -g
COPY . .
EXPOSE 8080

# Prepend dotenvx run
CMD ["node", "index.js"]