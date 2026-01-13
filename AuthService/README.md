AuthService
=========

Purpose: provide authentication for magent microservices. Supports:

- Guest login (issues internal JWT)
- OAuth2 login (e.g. Google) and exchanges for internal JWT
- JWT bearer validation via `JwtAuthenticationFilter`

Configuration
-------------

Set environment variables before running:

- `GOOGLE_CLIENT_ID` — OAuth2 client id
- `GOOGLE_CLIENT_SECRET` — OAuth2 client secret
- `JWT_SECRET` or `jwt.secret` property — HMAC secret (must be long enough for HS256)
- `OPENAI_API_KEY` — (for Agent integration later)

Run (Maven):

```bash
cd AuthService
mvn -DskipTests package spring-boot:run
```

Docker (build & run):

```bash
cd AuthService
mvn -DskipTests package
docker build -t magent-auth:local .
docker run -e JWT_SECRET=changeme -p 8081:8081 magent-auth:local
```

Endpoints
---------

- POST /auth/guest — create a guest JWT
  - Body: `{ "displayName": "Guest007" }`
  - Returns: `{ "token": "...", "role": "GUEST" }`
- POST /oauth2/authorization/google — start Google OAuth2 flow (browser)
- GET /auth/me — returns parsed token claims (requires Bearer token)

Example: guest login

```bash
curl -s -X POST http://localhost:8081/auth/guest -H "Content-Type: application/json" -d '{"displayName":"visitor"}'

# Response -> {"token":"ey...","role":"GUEST"}

# Use token to call /auth/me
TOKEN=$(curl -s -X POST http://localhost:8081/auth/guest -H "Content-Type: application/json" -d '{"displayName":"visitor"}' | jq -r .token)
curl -s http://localhost:8081/auth/me -H "Authorization: Bearer $TOKEN"
```

Notes
-----

- The OAuth2 success handler returns an internal JWT as JSON after successful provider login.
- Do not use `changeme` in production; use a secure, high-entropy secret and store secrets in your cloud provider's secret manager.
