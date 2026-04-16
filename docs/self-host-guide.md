# Self-Hosting Next.js on a VPS with Docker

This is the canonical setup guide for this project.

Use it when you want the full command-by-command flow for:

- one Ubuntu `24.04` VPS
- one non-root deploy user
- Docker and Docker Compose
- `Caddy` for HTTPS and reverse proxying
- a self-hosted `Next.js 16` app
- `Postgres`
- `Redis`
- `Uptime Kuma`
- one-off Prisma migrations through a separate `migrate` container

This guide assumes the app code already exists locally.

If you want the creator-facing recording order, use `docs/video-demo.md`.
If you want the container-level explanation of how the Dockerfile and Compose files work, use `docs/docker-setup.md`.
If you want deeper context on runtime envs or Kuma, use `docs/runtime-envs.md` and `docs/uptime-kuma.md`.

## What This Setup Builds

By the end, you will have:

- `https://your-domain.com` served by `Caddy`
- `https://status.your-domain.com` served by `Uptime Kuma`
- one Docker network connecting `caddy`, `app`, `postgres`, `redis`, `uptime-kuma`, and `migrate`
- automatic HTTPS from Let's Encrypt
- a deployment flow that builds images once and runs them on the VPS

## Architecture Overview

```mermaid
flowchart LR
  Browser["Browser"] --> DNS["DNS"]
  DNS --> Caddy["Caddy reverse proxy"]
  Caddy --> App["Next.js app container"]
  Caddy --> Kuma["Uptime Kuma container"]
  App --> Postgres["Postgres container"]
  App --> Redis["Redis container"]
  Migrate["Migration container"] --> Postgres
```

Main app flow:

1. the browser requests `https://your-domain.com`
2. DNS points the domain to your VPS IP
3. `Caddy` receives the request on ports `80` and `443`
4. `Caddy` terminates HTTPS and reverse proxies to the `app` container
5. the `app` container talks to `postgres` and `redis` on the internal Docker network

Monitoring flow:

1. the browser requests `https://status.your-domain.com`
2. DNS points that subdomain to the same VPS IP
3. `Caddy` receives the request
4. `Caddy` reverse proxies to the `uptime-kuma` container

## Why These Pieces Exist

### Why not use `root` every day?

Because `root` can do everything on the machine.

That is risky because:

- one typo can damage the whole server
- a compromised root session gives an attacker full control

Using a normal deploy user is safer:

- daily work happens as a regular user
- `sudo` is only used for system-level tasks
- the blast radius is smaller if something goes wrong

### What does Docker give us here?

Docker keeps each service isolated and repeatable.

That helps because:

- the app, database, cache, proxy, and monitoring tool each get their own container
- the VPS setup is easier to reproduce
- deployments become "pull the new image and restart the service"

### What is `Caddy`?

`Caddy` is the public entrypoint for this stack.

It handles:

- incoming web traffic
- automatic HTTPS certificates from Let's Encrypt
- routing requests to the correct container

### Why use a reverse proxy in front of Next.js?

The Next.js self-hosting guide recommends putting a reverse proxy in front of the app instead of exposing the app server directly.

That gives you:

- one public entrypoint
- automatic TLS termination
- cleaner multi-service routing on one VPS
- separation between internet-facing traffic and internal app services

### Why are `Postgres` and `Redis` internal-only?

They do not need to be reachable from the public internet.

Keeping them internal-only:

- reduces attack surface
- avoids accidental exposure
- keeps the only public ports at `80` and `443`

### Why add `Uptime Kuma`?

Because it makes the VPS story stronger.

It shows:

- the VPS can run more than one app container
- you can self-host monitoring on the same machine
- you can publish a public status page on a subdomain

### Why does this app care about runtime envs?

This project is intentionally deployed with runtime configuration.

That matters because:

- the same built image can be promoted to different environments
- deployment settings stay on the server instead of being baked into the build
- auth/provider visibility is evaluated at runtime where needed

For the deeper explanation, see `docs/runtime-envs.md`.

### Why is the `migrate` container separate from app startup?

Because schema migration is an operational step, not part of normal request handling.

Keeping it separate:

- makes failures easier to see
- avoids coupling app boot to a one-off migration command
- lets you run `prisma migrate deploy` exactly once during rollout

## Prerequisites

Before you start, make sure you have:

- an Ubuntu `24.04` VPS
- a domain you control
- local access to this repo
- Docker Desktop or Docker Engine on your local machine
- a GitHub Container Registry token that can push packages
- a GitHub Container Registry token that can pull packages on the VPS

Recommended VPS baseline for this demo:

- `2` vCPU
- `4 GB` RAM
- enough disk space for Docker images, Postgres data, Redis append-only data, and Kuma data

## Values To Replace

Run these on your local machine and replace the placeholders first:

```bash
export VPS_IP="YOUR_VPS_IP"
export VPS_USER="deploy"
export APP_DIR="/srv/hosting-vercel-local-hostinger"
export APP_DOMAIN="your-domain.com"
export STATUS_DOMAIN="status.your-domain.com"
export GHCR_USERNAME="YOUR_GITHUB_USERNAME"
export GHCR_TOKEN="YOUR_GHCR_WRITE_TOKEN"
export GHCR_READ_TOKEN="YOUR_GHCR_READ_TOKEN"
export IMAGE_TAG="$(git rev-parse --short HEAD)"
export IMAGE_ROOT="ghcr.io/$GHCR_USERNAME/hosting-vercel-local-hostinger"
export APP_IMAGE="$IMAGE_ROOT:app-$IMAGE_TAG"
export MIGRATION_IMAGE="$IMAGE_ROOT:migrate-$IMAGE_TAG"
```

Important:

- local shell variables do not automatically carry into a fresh SSH session
- if you open a new shell, rerun the exports you still need
- if you prefer, replace the variables with literal values in the commands below

## Phase 0: Buy The VPS, Domain, And SSH In

### Checklist

- create the VPS with Ubuntu `24.04`
- note the public IP
- point or buy your domain
- confirm the app already runs locally

### Optional: create an SSH key if you do not already have one

Run on your local machine:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
```

If your VPS provider supports SSH keys during provisioning, add the public key there.

If password login is temporarily enabled, you can copy your key after the VPS exists:

```bash
ssh-copy-id root@$VPS_IP
```

## Phase 1: First Root Login And System Updates

Use `root` once for initial bootstrap.

Run on your local machine:

```bash
ssh root@$VPS_IP
```

Update the base system:

```bash
apt-get update
apt-get upgrade -y
```

Why this matters:

- you start from a patched base image
- you reduce the chance of setup issues caused by outdated packages

## Phase 2: Create A Non-Root Deploy User

Run on the VPS as `root`:

```bash
adduser $VPS_USER
usermod -aG sudo $VPS_USER
mkdir -p /home/$VPS_USER/.ssh
cp /root/.ssh/authorized_keys /home/$VPS_USER/.ssh/authorized_keys
chown -R $VPS_USER:$VPS_USER /home/$VPS_USER/.ssh
chmod 700 /home/$VPS_USER/.ssh
chmod 600 /home/$VPS_USER/.ssh/authorized_keys
```

Now verify that the new user can log in before changing anything else.

Run on your local machine in a new terminal:

```bash
ssh $VPS_USER@$VPS_IP
```

If that works, reconnect as the deploy user:

```bash
exit
ssh $VPS_USER@$VPS_IP
```

Talking point:

- use `root` only to bootstrap the machine, then do normal work as `deploy` with `sudo` only when necessary

## Phase 3: Install Docker, Compose Plugin, And The Firewall

Run on the VPS as `$VPS_USER`:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg ufw
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Reconnect so the new Docker group membership applies:

```bash
exit
ssh $VPS_USER@$VPS_IP
```

Verify Docker:

```bash
docker --version
docker compose version
```

Now lock down the firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

Why this matters:

- `OpenSSH` keeps remote access working
- `80` and `443` are required for HTTP, HTTPS, and certificate issuance
- everything else stays blocked by default

## Phase 4: Point DNS For The App And Status Subdomain

Create these DNS records with your domain provider:

- `A` record for `@` pointing to `$VPS_IP`
- `A` record for `status` pointing to `$VPS_IP`

That gives you:

- `https://$APP_DOMAIN`
- `https://$STATUS_DOMAIN`

Optional verification from your local machine:

```bash
dig +short $APP_DOMAIN
dig +short $STATUS_DOMAIN
```

Do not move on to the HTTPS step until both hostnames resolve to your VPS IP.

## Phase 5: Prepare The Server Directory And Production `.env`

Create the app directory on the VPS:

```bash
sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"
```

Copy the environment template from your local machine:

```bash
scp .env.example $VPS_USER@$VPS_IP:$APP_DIR/
```

Now switch back to the VPS and create the real production env file:

```bash
cd "$APP_DIR"
cp .env.example .env
```

Generate the two important secrets:

```bash
openssl rand -hex 32
openssl rand -base64 32
```

Edit the server-side env file:

```bash
nano .env
```

Set at least these values:

```env
APP_DOMAIN=your-domain.com
STATUS_DOMAIN=status.your-domain.com
LETSENCRYPT_EMAIL=ops@example.com
BETTER_AUTH_URL=https://your-domain.com
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=replace-with-a-base64-key
POSTGRES_DB=hostmarshall
POSTGRES_USER=hostmarshall
POSTGRES_PASSWORD=replace-with-a-strong-password
DATABASE_URL=postgresql://hostmarshall:replace-with-a-strong-password@postgres:5432/hostmarshall?schema=public
REDIS_URL=redis://redis:6379
```

Important:

- keep the database host as `postgres`
- keep the Redis host as `redis`
- `BETTER_AUTH_URL` should match your real public app URL
- leave optional OAuth provider variables empty unless you plan to use them

Why this matters:

- `.env` is runtime deployment config, not something to commit
- this project is designed so the server injects runtime config into the same built image

## Phase 6: Build And Push The `app` And `migrate` Images To GHCR

Run these on your local machine from the repo root.

Log in to GitHub Container Registry:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
```

Build and push the app image for a typical VPS architecture:

```bash
docker buildx build --platform linux/amd64 --target runner --build-arg DEPLOYMENT_VERSION="$IMAGE_TAG" -t "$APP_IMAGE" --push .
```

Build and push the migration image:

```bash
docker buildx build --platform linux/amd64 --target migrator -t "$MIGRATION_IMAGE" --push .
```

Why this matters:

- the VPS only needs to pull images, not build them
- `runner` is the actual Next.js runtime image
- `migrator` exists only to run `prisma migrate deploy`
- `linux/amd64` matches the common x86_64 VPS target

## Phase 7: Copy The Deployment Files To The VPS

Copy the deployment files from your local machine:

```bash
scp docker-compose.prod.yml Caddyfile $VPS_USER@$VPS_IP:$APP_DIR/
```

Now verify on the VPS:

```bash
cd "$APP_DIR"
ls -la
```

At this point the server should contain:

- `.env`
- `.env.example`
- `docker-compose.prod.yml`
- `Caddyfile`

Why this matters:

- the VPS needs the Compose definition and the reverse proxy config
- the actual app code does not need to be copied to the VPS because you are deploying images

## Phase 8: Pull Images, Start Infra, Run Migrations, Start App And Caddy

If your current VPS shell does not have the image variables available, rerun these first or replace them with literal values:

```bash
export GHCR_USERNAME="YOUR_GITHUB_USERNAME"
export GHCR_READ_TOKEN="YOUR_GHCR_READ_TOKEN"
export APP_IMAGE="ghcr.io/YOUR_GITHUB_USERNAME/hosting-vercel-local-hostinger:app-your-tag"
export MIGRATION_IMAGE="ghcr.io/YOUR_GITHUB_USERNAME/hosting-vercel-local-hostinger:migrate-your-tag"
```

Create `.deploy.env` on the VPS so Compose knows which image tags to run:

```bash
cd "$APP_DIR"
cat <<EOF > .deploy.env
APP_IMAGE=$APP_IMAGE
MIGRATION_IMAGE=$MIGRATION_IMAGE
EOF
```

Log the VPS into GHCR:

```bash
echo "$GHCR_READ_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
```

Pull both images:

```bash
docker pull "$APP_IMAGE"
docker pull "$MIGRATION_IMAGE"
```

Start infrastructure services first:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml up -d postgres redis uptime-kuma
```

Run migrations once:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml run --rm migrate
```

Start the public app and proxy:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml up -d app caddy
```

Verify the stack:

```bash
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml ps
```

Optional cleanup:

```bash
docker image prune -f
```

Why this deployment order matters:

- `postgres`, `redis`, and `uptime-kuma` can come up first without public traffic
- migrations run before the app starts serving requests
- `Caddy` comes up only after the app container exists and DNS is already pointed correctly

## Phase 9: First-Time Uptime Kuma Setup

Open this in your browser:

- `https://$STATUS_DOMAIN`

On first load, Uptime Kuma will ask you to create an admin account.

After you log in:

1. create one monitor for `https://$APP_DOMAIN`
2. create one monitor for `https://$STATUS_DOMAIN`
3. optionally create a public status page and add those monitors to it

Recommended first monitor settings are documented in `docs/monitoring.md`.

Why Kuma is useful in the video:

- it is immediately visible on screen
- it proves the VPS can host another service cleanly
- it gives you both an admin dashboard and an optional public status page

## Phase 10: Verification And Troubleshooting

### Quick verification

From your local machine:

```bash
curl -I https://$APP_DOMAIN
curl -I https://$STATUS_DOMAIN
```

From the VPS:

```bash
cd "$APP_DIR"
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml ps
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml logs --tail=100 app
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml logs --tail=100 caddy
docker compose --env-file .env --env-file .deploy.env -f docker-compose.prod.yml logs --tail=100 uptime-kuma
```

You should be able to open:

- `https://$APP_DOMAIN`
- `https://$STATUS_DOMAIN`

### Common problems

#### The browser cannot reach the domain

Check:

- the DNS `A` records
- `ufw status`
- whether ports `80` and `443` are open

#### HTTPS does not come up

Check:

- DNS resolves before you start Caddy
- `LETSENCRYPT_EMAIL` is set in `.env`
- `docker compose ... logs --tail=100 caddy`

#### The app returns `502`

Check:

- whether `app` is healthy in `docker compose ... ps`
- whether the `DATABASE_URL` and `REDIS_URL` are correct
- whether the app container started with the expected runtime envs

#### Migrations fail

Check:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- the `migrate` container output

#### Uptime Kuma does not load

Check:

- the `status` DNS record
- `STATUS_DOMAIN` in `.env`
- that `Caddyfile` was copied to the VPS
- that `uptime-kuma` is running

## Optional Hardening And Next Steps

After the base deployment works, consider:

- disabling SSH password auth after key-based login is verified
- disabling direct root SSH login after the deploy user is confirmed
- adding Postgres backups or provider snapshots
- enabling the existing GitHub Actions workflow later for automated deploys
- adding notification channels in Uptime Kuma
- documenting a rollback flow for older image tags

## Files This Guide Relies On

These repo files are the source of truth for the commands above:

- `Dockerfile`
- `docker-compose.prod.yml`
- `Caddyfile`
- `.env.example`
- `.github/workflows/deploy.yml`

If any of those files change, update this guide too.
