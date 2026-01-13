# magent
MAGENT - AI Agent using Spring AI with power of OpenAI LLM, integrated 2D-style voice and other interesting stuff

## Features
- AI Chat with OpenAI GPT
- Tool Calling (Search, Sheets, Presentations, Design, Photo Editing, Voice Generation)
- Voice Synthesis and Transcription (ElevenLabs, VOICEVOX/Coeiroink)
- Web UI with 3D Avatar and Stickers
- JWT Authentication (Guest and OAuth2)
- Microservices Architecture (Spring Boot)
- Docker Compose and Kubernetes Deployment

## Setup

### Prerequisites
- Java 17
- Docker and Docker Compose
- Node.js 16+ (for UI)
- API Keys: OpenAI, ElevenLabs, SerpAPI, Google, Microsoft (optional for full features)

### Environment Variables
Set the following in `API_KEYS_SETUP.md` or environment:
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `SERP_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`

### Running Locally
1. Clone the repo
2. Run services: `docker-compose up -d`
3. Start UI: `cd ui && npm install && npm start`
4. Open http://localhost:3000

### Voice Setup
- VOICEVOX is included in docker-compose for Japanese TTS.
- For STT, uses OpenAI Whisper (via VoiceService).

### Deployment
- Docker Compose: `docker-compose up -d`
- Kubernetes: `kubectl apply -f k8s/`

### API Endpoints
- Auth: POST /auth/guest or /oauth2/authorization/google
- Chat: POST /agent/chat
- Voice: POST /voice/tts, POST /voice/stt

## Troubleshooting
- Ensure all services are running: `docker-compose ps`
- Check logs: `docker-compose logs <service>`
- API keys required for tool integrations
