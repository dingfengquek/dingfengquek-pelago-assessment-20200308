FROM node:lts-stretch

WORKDIR /app

COPY . .

CMD ["yarn", "run", "serve"]
