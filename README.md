# Ping Ask - a totally awesome way to share questions in your stream

Good q&a app

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

## Run locally with docker

First you will need to create a `.env` file using the `.env.example` file.

You will have to add your `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` and it should work out of the box.

You will also need to create a Postgres instance and fill out the `DATABASE_URL`. You can do that in a few minutes on [Railway](https://railway.app/)

Once you've set up your Postgres instance you will need to run the initial migration:

```
npm run migrate
```

Once you've created the env file run the following command to start Soketi:

```
docker-compose up -d
```
