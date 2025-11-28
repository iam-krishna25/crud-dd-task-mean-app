## Repo overview

This is a small MEAN-stack demo CRUD app (MongoDB + Express + Angular 15 + Node.js).
The backend (Node/Express/Mongoose) is in `backend/`, the frontend (Angular) is in `frontend/`.

Key responsibilities:
- Backend provides REST endpoints under `/api/tutorials` (see `backend/server.js`).
- Frontend consumes these endpoints using `HttpClient` from `frontend/src/app/services/tutorial.service.ts`.

Quick start (local dev):
```bash
cd backend
npm install
# Ensure MongoDB is running at mongodb://localhost:27017/dd_db
node server.js

cd ../frontend
npm install
ng serve --port 8081   # or npm start
```

Ports & integration:
- Backend: `localhost:8080` (default), see `backend/server.js`.
- Frontend: `localhost:8081` (used with `ng serve`).
- Frontend communicates with backend via `baseUrl` in `frontend/src/app/services/tutorial.service.ts`:
  `http://localhost:8080/api/tutorials`

REST API endpoints (implemented in `backend/app/routes/turorial.routes.js`):
- GET /api/tutorials - list (supports `?title=` filter using a case-insensitive regex)
- GET /api/tutorials/published - published only
- GET /api/tutorials/:id - single by id
- POST /api/tutorials - create (body: `{ title, description, published? }`)
- PUT /api/tutorials/:id - update
- DELETE /api/tutorials/:id - delete one
- DELETE /api/tutorials - delete all

Important patterns & conventions:
- Models: Mongoose schemas are in `backend/app/models/*.js`. The model returns a JSON where `_id` is remapped to `id` via `schema.method('toJSON', ...)` in `tutorial.model.js`.
- Controllers: Business logic goes in `backend/app/controllers/*.js` (e.g., `tutorial.controller.js`) and follow an Express style: Validate -> Model op -> res.send / res.status.
- Routes: Add route files in `backend/app/routes/` and register them in `backend/server.js` with `require('./app/routes/your.routes.js')(app)`.
- Frontend: Angular components are under `frontend/src/app/components/`. Add/modify services under `frontend/src/app/services/` and models under `frontend/src/app/models/`.

Project-specific gotchas & tips (for AI agents):
- The backend repo uses `require()` (CommonJS) with JS files; the frontend uses ES modules + TypeScript.
- There is a small typo: route filename is `turorial.routes.js` (missing a second "t"). Keep the current filename unless intentionally renaming both file and import in `server.js`.
- `cors` is listed in `backend/package.json` but not actively used in `server.js` (commented out). To enable cross-origin calls for local dev, uncomment or add the following in `server.js`:
  ```js
  const cors = require('cors');
  app.use(cors());
  ```
- The backend has no tests configured. Frontend has Angular unit test setup (Karma/Jasmine) in `frontend/package.json` (`npm test`).
- DB credentials are in `backend/app/config/db.config.js` as a plain string. For secure or production usage, prefer env vars and templates.

How to add a new API endpoint (example: `comments` resource):
1. Create Mongoose model in `backend/app/models/comment.model.js`.
2. Add business logic in `backend/app/controllers/comment.controller.js` following existing patterns.
3. Add routes in `backend/app/routes/comment.routes.js` and register in `backend/server.js`.
4. In the frontend, add `Comment` model under `frontend/src/app/models/` and a `comment.service.ts` under `frontend/src/app/services/` mirroring backend endpoints.
5. Add Angular components under `frontend/src/app/components/*` and import the service + module declarations in `app.module.ts`.

Debugging and workflows:
- Backend logs on start: "Connected to the database!" and server port. Check MongoDB is running if it fails.
- Use `nodemon` (dev-only) for auto-reload: `npm install -g nodemon` and `nodemon server.js`.
- To debug HTTP calls from frontend, open browser DevTools Network tab; the Angular service baseUrl is a single point of truth to update.
- To run frontend tests: `cd frontend && npm test`.

PII / Secrets Notice:
- Credentials and DB URLs are not stored in env files; do not commit production secrets. Use env vars or a secure secrets manager.

Where to look for examples:
- Backend CRUD methods: `backend/app/controllers/tutorial.controller.js`.
- Mongoose schema & `id` remapping: `backend/app/models/tutorial.model.js`.
- Angular service using REST: `frontend/src/app/services/tutorial.service.ts` and components in `frontend/src/app/components/`.

When editing the codebase:
- Keep controller/service responsibilities separated.
- Maintain consistent API shapes (use `id` instead of `_id` in objects returned to the frontend).
- Confirm that after changing DB model/fields you update frontend models and unit tests.

If anything is unclear or you want more guidance (e.g., testing strategies, Dockerization, production hardening), ask and I will update this file with more examples.
