# Zapdos - a crappy way to share questions in your stream

Bad q&a app

## TODO

- [x] "remove pin" button
- [x] Pin persistence?
- [x] Better question asking form
- [x] Better url "slugs" for submitting questions
- [x] An actual UI
- [x] Better responsiveness for question view
- [x] "Copy form link" button
- [x] "Copy OBS embed link" button
- [x] Create "protected router" for authed parts
- [x] Redo router structure
- [x] Maybe SSR some things? Idk
- [x] Delete question

## Create Your `.env` File
First you will need to create a `.env` file using the `.env.example` file.

You will have to add your `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` which can be found in the [Twitch Developer Console](https://dev.twitch.tv/console);

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

## Run locally with Railway
- You will need to create a Postgres instance and update the `DATABASE_URL` in your `.env` file
- You will need to create a Soketi instance you can use [this repository as a template](https://github.com/l0gicgate/zapdos-soketi)
- You will need to update the `NEXT_PUBLIC_PUSHER_SERVER_HOST` variable in your `.env` to point to your Soketi host on railway
- You will need to update the `NEXT_PUBLIC_PUSHER_SERVER_PORT` variable in your `.env` to `443`
- You will need to update the `NEXT_PUBLIC_PUSHER_SERVER_TLS` variable in your `.env` to `true`