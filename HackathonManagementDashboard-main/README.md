# FairJudge

**FairJudge** is a hackathon management platform designed to help organizers run events and make project reviews more consistent and transparent. It combines a Next.js dashboard, an Express/MongoDB API, and a Python AI service for decision-support workflows such as duplicate checks, reviewer assignment, team formation, and review analysis.

> AI results are recommendations and review signals. Organizers and judges remain responsible for decisions.

## At a glance

- Role-based workflows for organizers, judges, participants, and administrators.
- Hackathon setup, registration, team coordination, project submissions, evaluations, and results.
- AI-assisted duplicate and bias checks, review recommendations, reviewer assignment, and team formation.
- Audit and analytics endpoints for AI checks.
- A separate RAG service directory is included, but its current FastAPI entry point is only a health placeholder; retrieval/chat is not yet wired into the running application.

## Architecture

| Component | Location | Technology | Local address |
| --- | --- | --- | --- |
| Web application | `frontend/` | Next.js, React, TypeScript, Tailwind CSS | `http://localhost:3000` |
| API | `backend/` | Node.js, Express, Mongoose | `http://localhost:5000` |
| AI service | `ai-service/` | Python, FastAPI, MongoDB Motor, scikit-learn, sentence-transformers | `http://localhost:8000` |
| RAG service scaffold | `rag-service/` | Python, FastAPI | `http://localhost:8001` |
| Shared resources | `shared/` | Shared project resources | — |

The frontend calls the backend at `NEXT_PUBLIC_API_URL`. The backend calls the AI service at `AI_SERVICE_URL`. Both the backend and AI service use MongoDB.

## Main workflows

### Organizers and administrators

- Create and manage hackathons, configuration, announcements, problem statements, registrations, teams, reviewers, evaluations, and results.
- Review fairness alerts, appeals, and audit information.
- Request AI-assisted reviewer assignment and inspect analytics.

### Participants

- Discover and register for hackathons.
- Join or leave teams, submit projects, and view certificates.

### Judges

- Review assigned projects, check conflicts, and score work against evaluation rubrics.
- Request AI review analysis to support (not replace) human scoring.

### AI-assisted services

The AI service currently exposes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Service health |
| `POST` | `/api/duplicate-check` | Check participant details for possible duplicates |
| `POST` | `/api/bias-detect` | Analyze evaluation data for potential bias signals |
| `POST` | `/api/review-agent` | Produce review and score-consistency recommendations |
| `POST` | `/api/reviewer-assign` | Assign reviewers to projects |
| `POST` | `/api/team-form` | Form teams from participant and event data |
| `GET` | `/api/audit/duplicates` | Read duplicate-check audit entries |
| `GET` | `/api/audit/bias` | Read bias-analysis audit entries |
| `GET` | `/api/analytics/reviewer/{reviewer_id}` | Read reviewer bias-history analytics |

FastAPI interactive API documentation is available at `http://localhost:8000/docs` while the AI service is running.

The backend exposes its health check at `http://localhost:5000/health`. Application API routes are mounted under `/api` (including `/api/auth`, `/api/hackathons`, `/api/participants`, `/api/reviews`, `/api/teams`, `/api/projects`, `/api/evaluations`, and `/api/certificates`).

## Requirements

- Node.js 20.9 or newer and npm.
- Python 3.10 or newer and `pip`.
- A MongoDB instance accessible to the backend and AI service. MongoDB Atlas or a local MongoDB server can be used.
- For optional Google Drive-backed file storage, Google Drive API credentials and a configured folder.

## Run locally

Run each service in its own terminal from the repository root. Install dependencies once per service.

### 1. Configure the backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least:

```dotenv
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fairjudge
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
```

Set the optional Google Drive variables in the same file if you enable Drive storage. Keep service-account keys and all real secrets out of source control.

Start the API:

```powershell
npm run dev
```

### 2. Configure and start the AI service

In a new terminal:

```powershell
cd ai-service
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Set `MONGO_URI` in `ai-service/.env` to the database used by the backend. Then start the service:

```powershell
uvicorn app.main:app --reload --port 8000
```

The first use of sentence-transformer functionality may require downloading its model files.

### 3. Configure and start the frontend

In another terminal:

```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL = "http://localhost:5000/api"
npm run dev
```

Open `http://localhost:3000`. You can persist `NEXT_PUBLIC_API_URL` in a local `frontend/.env.local` file instead of setting it in the terminal.

### Optional: run the RAG scaffold

The current RAG entry point only provides a root health response; it is not connected to the app's workflows, and its requirements file is still a placeholder. To start it for development, make sure FastAPI and Uvicorn are installed in your Python environment, then run from `rag-service/`:

```powershell
python -m pip install fastapi uvicorn
uvicorn app.main:app --reload --port 8001
```

## Environment variables

| Variable | Used by | Description |
| --- | --- | --- |
| `MONGO_URI` | Backend, AI service | MongoDB connection string |
| `DB_NAME` | AI service | AI service database name (defaults in code when unset) |
| `PORT` | Backend, AI service, deployed services | HTTP port |
| `JWT_SECRET` | Backend | Secret used for signing authentication tokens; use a strong private value |
| `JWT_ACCESS_EXPIRE` | Backend | Access-token lifetime |
| `JWT_REFRESH_EXPIRE` | Backend | Refresh-token lifetime |
| `AI_SERVICE_URL` | Backend | Base URL of the AI service, for example `http://localhost:8000` |
| `FRONTEND_URL` | Backend | Allowed frontend origin(s); comma-separated values are supported |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend API base URL, including `/api` |
| `GOOGLE_DRIVE_FOLDER_ID` | Backend, optional | Destination folder for Drive-backed files |
| `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` | Backend, optional | Path to the Google service-account key file |

See [`backend/.env.example`](./backend/.env.example) and [`ai-service/.env.example`](./ai-service/.env.example) for the checked-in templates. Never put production credentials in these templates or commit local `.env` files.

## Deployment

The repository includes a Render Blueprint at [`render.yaml`](./render.yaml) for the frontend, backend, AI service, and RAG service. Before deploying:

1. Create a Blueprint from the repository in Render.
2. Provide the requested secret values such as `MONGO_URI` and `JWT_SECRET`.
3. Set the backend's `AI_SERVICE_URL` to the deployed AI service URL and `FRONTEND_URL` to the deployed frontend origin.
4. Set the frontend's `NEXT_PUBLIC_API_URL` to the deployed backend URL followed by `/api`.
5. Ensure the AI service uses the intended MongoDB database; configure optional Google Drive credentials separately if needed.

Review the service logs and health endpoints after deployment. Free-tier hosting may scale services to zero or sleep when idle, depending on the provider's current plan behavior.

## Development checks

Run frontend checks from `frontend/`:

```powershell
npm run lint
npm run build
```

The backend package currently defines `start` and `dev` scripts; it does not define a package-level test script. Python service dependencies are listed in each service's `requirements.txt`.

## Repository layout

```text
.
├── ai-service/       # AI API and duplicate, bias, review, assignment, and team modules
├── backend/          # Express API, routes, models, middleware, and jobs
├── frontend/         # Next.js application
├── rag-service/      # RAG service scaffold; entry point is currently a placeholder
├── shared/           # Shared project resources
├── docker-compose.yml
├── render.yaml       # Render Blueprint
└── README.md
```

## Security and responsible use

- Keep `.env` files, database URLs, signing secrets, OAuth credentials, and service-account keys private.
- Use HTTPS and provider-managed secrets in production.
- The backend enables security middleware, rate limiting, credentialed CORS, and production CSRF protection. Configure allowed origins and cookie settings for the deployment environment.
- Treat duplicate and bias signals as prompts for human review, not as automatic grounds to reject or penalize a participant.
- Follow applicable privacy rules when collecting participant information, resumes, evaluation data, and audit records.

## Contributing

1. Create a focused branch for your change.
2. Keep secrets and generated files out of commits.
3. Run the relevant lint, build, and service checks before opening a pull request.
4. Document any new environment variables or service endpoints.

---

Built for more transparent, well-organized hackathons.
