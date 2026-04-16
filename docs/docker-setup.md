# How The Docker Setup Works

This document explains how this project's container setup works.

It is not a VPS checklist.
It is the "what are these Docker files actually doing?" reference for:

- `Dockerfile`
- `docker-compose.prod.yml`
- `docker-compose.local.yml`
- the relationship between `.env`, `.deploy.env`, and `Caddy`

If you want the full VPS rollout sequence, use `docs/self-hosted-vps-guide.md`.

## What This Docker Setup Is Trying To Achieve

This project wants a deployment model that is:

- reproducible
- easy to explain
- realistic for a self-hosted VPS
- flexible enough to run multiple services, not just the Next.js app

That leads to a simple idea:

1. build Docker images once
2. push those images to a registry
3. pull them onto the VPS
4. run the whole stack with Docker Compose

Instead of putting everything in one container, the stack is split by responsibility:

- `app` runs Next.js
- `postgres` stores relational data
- `redis` supports app infrastructure
- `uptime-kuma` handles monitoring
- `caddy` is the public web entrypoint
- `migrate` runs Prisma migrations as a one-off operational step

## The Big Picture

There are really two separate jobs here:

### 1. Build the images

That job is handled by the `Dockerfile`.

It produces two outputs:

- a `runner` image for the actual app
- a `migrator` image for `prisma migrate deploy`

### 2. Run the services together

That job is handled by Docker Compose.

The production Compose file:

- chooses which images to run
- injects runtime configuration
- attaches services to a shared network
- persists data with named volumes
- exposes only the public entrypoint

## How The `Dockerfile` Works

This is a multi-stage Docker build.

That means one file builds several intermediate stages, and the final images copy only the parts they actually need.

### `base`

The `base` stage gives every later stage the same starting point:

- the same Node version
- the same working directory
- the same OS-level dependency setup

This project installs `openssl` there because Prisma needs it.

Putting that in `base` avoids repeating the same system package setup in every stage.

### `dependencies`

The `dependencies` stage installs Node dependencies once.

Why this stage exists:

- package installation is expensive
- Docker can cache it well if the manifest files do not change
- later stages can copy the installed `node_modules` tree instead of reinstalling everything

That is why the file copies `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` first before running `pnpm install`.

### `builder`

The `builder` stage creates the production-ready Next.js output.

It:

- reuses `node_modules` from `dependencies`
- copies in the full application source
- generates the Prisma client
- runs the production Next.js build

#### Why Prisma generate happens before `pnpm build`

Because the build output needs to trace the generated Prisma client into the final runtime artifact.

If Prisma client generation happened too late, the final standalone server could miss files it needs in production.

#### Why there are placeholder env vars during build

Some parts of the app expect certain environment variables to exist when the production build runs.

The values set in the Dockerfile are not the real production secrets or URLs.
They are only safe placeholders that let the build complete.

The real values still come later from the VPS runtime `.env`.

#### What `DEPLOYMENT_VERSION` is doing

`DEPLOYMENT_VERSION` is passed into the build so the final artifact can carry a release identifier.

That helps this app's self-hosting story because the deployment can stamp a version into the built output without changing the application code every time.

### `migrator`

The `migrator` stage builds a separate image just for:

```bash
prisma migrate deploy
```

It does not include the whole app runtime.
It only copies what migration execution needs:

- dependencies
- Prisma schema files
- Prisma config
- package metadata

This separation is useful because schema migration is not the same thing as serving web traffic.

### `runner`

The `runner` stage is the image that actually serves the app.

It starts from a fresh Node image instead of reusing the builder image.

Why:

- the final runtime image stays smaller
- build-time tooling does not all need to ship to production
- the image becomes easier to reason about as "only what the running app needs"

It then copies only the important runtime artifacts:

- `public/`
- generated Prisma client
- `.next/standalone`
- `.next/static`

#### What those pieces mean

- `.next/standalone`
  The traced Node server and server-side runtime files
- `.next/static`
  Static assets the browser needs
- generated Prisma client
  Database client code the server still uses at runtime

The image also prepares `.next/cache` and gives it to the `node` user because production mounts a named volume there.

Finally, it runs as `USER node` instead of `root`, which is the safer default for an internet-facing app container.

## Why There Are Two Output Images

This setup intentionally builds two images from one `Dockerfile`.

### `runner`

Use this image when you want the app to serve requests.

It is the image assigned to the `app` service in production.

### `migrator`

Use this image when you want to apply Prisma migrations.

It is the image assigned to the `migrate` service.

Keeping them separate has a few benefits:

- app startup is not responsible for schema rollout
- migration failures are easier to spot
- deployment order stays explicit
- the operational story is easier to explain

## How `docker-compose.prod.yml` Works

The production Compose file defines the full VPS stack.

It answers questions like:

- which services exist
- which image each service uses
- which env values each service gets
- which ports are public
- which volumes persist data
- which services should wait for others

## Service By Service

### `postgres`

This is the primary relational database.

Important details:

- it uses the official `postgres:17-alpine` image
- it gets credentials and database names from `.env`
- it stores its data in the `postgres_data` named volume
- it has a healthcheck so dependent services can wait for a healthy database

It does not publish a host port in production.
Only sibling containers on the internal Docker network can reach it.

### `redis`

This is an internal support service.

In this project it backs rate-limiting-related behavior and broader app infrastructure.

Important details:

- it uses `redis:7-alpine`
- it enables append-only persistence
- it stores data in the `redis_data` named volume
- it has a healthcheck

Like Postgres, it stays internal-only in production.

### `app`

This is the main Next.js service.

Important details:

- its image comes from `APP_IMAGE`
- that value is selected through `.deploy.env`
- its runtime configuration comes from `.env`
- it mounts `next_cache` at `/app/.next/cache`
- it exposes port `3000` only to the internal Docker network
- it waits for healthy Postgres and Redis containers before starting

#### Why `expose` instead of `ports`

Because the app should not be directly reachable from the public internet.

`expose` makes the port available to other containers, especially `caddy`, without publishing it on the VPS host itself.

### `migrate`

This service exists only to run the migration image.

Important details:

- its image comes from `MIGRATION_IMAGE`
- that value also comes from `.deploy.env`
- it reads runtime env values from `.env`
- it depends on healthy Postgres
- it has `profiles: [ops]`
- it is not meant to stay running

#### Why the `ops` profile matters

It keeps the migration service out of the normal long-running stack.

That means:

- `docker compose up` does not treat it like a forever service
- you can call it intentionally during deployment
- the file makes it obvious that migrations are an operational step

### `uptime-kuma`

This is the self-hosted monitoring service.

Important details:

- it uses the `louislam/uptime-kuma:1` image
- it stores data in `uptime_kuma_data`
- it exposes port `3001` only to sibling containers

It is private behind Caddy in the same way the app is.

### `caddy`

This is the public entrypoint.

Important details:

- it is the only service that publishes host ports
- it binds `80:80` and `443:443`
- it reads domain-related values from `.env`
- it mounts `Caddyfile` read-only
- it stores certificate/runtime state in `caddy_data` and `caddy_config`

Its job is:

- accept internet traffic
- handle HTTPS
- proxy the main domain to `app:3000`
- proxy the status subdomain to `uptime-kuma:3001`

## `.env` vs `.deploy.env`

This distinction is one of the most important parts of the setup.

### `.env`

This file contains runtime configuration.

Examples:

- domains
- database credentials
- Redis URL
- Better Auth settings

These values describe how the running services should behave.

### `.deploy.env`

This file contains release selection.

Examples:

- `APP_IMAGE=...`
- `MIGRATION_IMAGE=...`

These values decide which already-built images Compose should run.

The mental model is:

- `.env` tells the containers how to behave
- `.deploy.env` tells Compose which release to boot

## Why Most Services Stay Internal-Only

In production, only `caddy` should be internet-facing.

That is why:

- `postgres` has no public `ports`
- `redis` has no public `ports`
- `app` uses `expose`
- `uptime-kuma` uses `expose`

This keeps the public surface small:

- `80`
- `443`

Everything else stays reachable only inside Docker networking.

## Why `Caddy` Is The Public Entrypoint

Putting Caddy in front keeps responsibilities clean.

Caddy handles:

- domain routing
- HTTPS termination
- public entrypoint behavior

The app container can then focus on application logic instead of acting like a public web edge server.

That is also why the production Compose file publishes ports only on `caddy`.

## What The Named Volumes Persist

Containers are disposable.

Named volumes hold the state that should survive container replacement.

### `postgres_data`

Persists PostgreSQL data files.

Without it, the database would reset when the container is replaced.

### `redis_data`

Persists Redis append-only data.

This matters because this Redis setup is configured to keep state, not just behave like a purely disposable cache.

### `next_cache`

Persists the Next.js filesystem cache at `/app/.next/cache`.

That helps features like:

- ISR
- cached fetch data
- image optimization artifacts

survive restarts more cleanly.

### `uptime_kuma_data`

Persists the Kuma dashboard state:

- monitor definitions
- user account
- general Kuma data

### `caddy_data` and `caddy_config`

Persist Caddy runtime state, including certificates and related config state.

That way HTTPS does not start from scratch every time the Caddy container is recreated.

## How Healthchecks And `depends_on` Shape Startup

The Compose file uses both healthchecks and `depends_on`, but they do different jobs.

### Healthchecks

Healthchecks answer:

- is this container actually responding in a useful way?

Examples in this stack:

- Postgres uses `pg_isready`
- Redis uses `redis-cli ping`
- the app does an internal HTTP fetch to itself

### `depends_on`

`depends_on` answers:

- which service should Compose try to start before another one?

In this stack:

- `app` waits for healthy Postgres and Redis
- `migrate` waits for healthy Postgres
- `caddy` waits for `app` and `uptime-kuma` to start

### Important limitation

This still does not mean the system is magically perfect after startup.

It helps shape startup order, but it does not replace:

- good app-level readiness behavior
- real monitoring
- reading logs when something goes wrong

That is why this stack still uses healthchecks, logs, and Uptime Kuma instead of assuming Compose alone solves readiness forever.

## How `docker-compose.local.yml` Differs

The local Compose file is intentionally much smaller than production.

It only provides support services:

- `postgres`
- `redis`

It does not try to run:

- the Next.js app
- Caddy
- Uptime Kuma
- migrations as a normal service

That is intentional.

In local development, the app usually runs with:

```bash
pnpm dev
```

while Docker only supplies the services the app needs around it.

### Why the local ports are bound to `127.0.0.1`

Because local support services should be reachable from your machine, but not exposed broadly on your network.

That is why local Compose uses:

- `127.0.0.1:5432:5432`
- `127.0.0.1:6379:6379`

### Why local still uses volumes and healthchecks

Even in development, it is useful to keep:

- database state across restarts
- Redis state across restarts when relevant
- a clear readiness signal for support services

So local remains lightweight, but not disposable in a frustrating way.

## Typical Command Flows

### Local validation

Build the two images locally:

```bash
docker build --target runner -t hosting-vercel-local-hostinger:app-local .
docker build --target migrator -t hosting-vercel-local-hostinger:migrate-local .
```

Run the production-style stack locally with explicit image tags:

```bash
cat <<'EOF' > .deploy.env
APP_IMAGE=hosting-vercel-local-hostinger:app-local
MIGRATION_IMAGE=hosting-vercel-local-hostinger:migrate-local
EOF

docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml up -d postgres redis uptime-kuma
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml run --rm migrate
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml up -d app caddy
```

### Production rollout

The production model is:

1. build and push the `runner` image
2. build and push the `migrator` image
3. copy `docker-compose.prod.yml` and `Caddyfile` to the VPS
4. place the production `.env` on the VPS
5. create `.deploy.env` with the chosen image tags
6. pull the images on the VPS
7. start support services
8. run migrations
9. start `app` and `caddy`

For the full walkthrough, use `docs/self-hosted-vps-guide.md`.

### Common inspection commands

Check running services:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml ps
```

Check app logs:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml logs -f app
```

Check Caddy logs:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml logs -f caddy
```

Check Kuma logs:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml logs -f uptime-kuma
```

## Bottom Line

This Docker setup separates concerns cleanly:

- one file builds the images
- one Compose file defines the production stack
- one smaller Compose file supports local development
- one env file defines runtime behavior
- one env file selects the release image tags

That is what makes the project easy to explain as a self-hosted VPS stack instead of just "a Next.js app in one container."
