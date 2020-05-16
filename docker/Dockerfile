FROM node:14

WORKDIR /app

COPY ./index.js ./index.js
COPY ./package-lock.json ./package-lock.json
COPY ./package.json ./package.json

RUN npm install
RUN apt-get update && apt-get install -y \
  ffmpeg 
  
CMD node index.js

EXPOSE 8585