# Booker

Cron job to book gym classes and notify via Telegram bot.

## secret.js

Create `secret.js` in the repo with:

```javascript
import { DAYS } from "./days.js";

const USER_ID = 'site user id';
export const URL = `https://site/${USER_ID}/`;
export const LOGIN = 'site login';
export const PASSWORD = 'site password';
export const TOKEN = 'Telegram bot token';
export const CHAT_ID = Telegram chat id;
export const CLASSES = [
    {
        day: DAYS.indexOf('Monday'),
        time: '7:30 pm - 8:15 pm',
        type: 'Cycling',
    },
    ...
];

```

## Build

```shell
docker build --no-cache -t booker -f Dockerfile .
```

## Run

```shell
docker run -d --restart unless-stopped --name booker --env TZ=America/New_York booker
```

## Stop

```shell
docker stop booker
```
