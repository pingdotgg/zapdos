# Ping Ask - a totally awesome way to share questions in your stream

Good q&a app.

## Create Your `.env` File

First you will need to create a `.env` file using the `.env.example` file.

You will have to add your `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` which can be found in the [Twitch Developer Console](https://dev.twitch.tv/console)

You will need to set the OAuth Redirect Url for you Twitch Application to `http://localhost:3000/api/auth/callback/twitch`

## Run locally with Docker

Once you've created the env file run the following command:

```
docker-compose up -d
```

Once the services are up run the migrations:

```
npm run migrate
```
