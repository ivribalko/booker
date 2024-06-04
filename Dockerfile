FROM node:latest
WORKDIR /app
COPY . /app
RUN apt-get update
RUN apt-get install chromium -y
RUN npm install
CMD ["npm", "start"]
