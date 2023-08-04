FROM node:16-alpine AS build

RUN apk update && apk add git

RUN mkdir -p /app

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


FROM nginx:stable-alpine3.17-slim
EXPOSE 80
COPY default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build ./app/dist/my-election /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]