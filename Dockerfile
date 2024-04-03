FROM node:18-alpine3.18

RUN mkdir -p /home/node/project_whisperer/node_modules && chown -R node:node /home/node/project_whisperer
WORKDIR /home/node/project_whisperer

#Install dotenvx
RUN curl -fsS https://dotenvx.sh/ | sh

#Install firefox
RUN apk update && apk add firefox 

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 1231

# Prepend dotenvx run
CMD ["./dotenvx", "run",  "--env-file=.env.vault", "--", "node", "index.js"]