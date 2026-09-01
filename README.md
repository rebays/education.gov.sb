# Education Resource Hub

A resource library platform composed of two apps:

- **`cms/`** — a [Wagtail](https://wagtail.org/) (Django) CMS that manages content — resource library folders/files, news, publications, and site menus — and exposes it over GraphQL (via `wagtail-grapple`) for the frontend to consume.
- **`web/`** — a [Next.js](https://nextjs.org/) frontend that reads content from the CMS's GraphQL API and renders the public-facing site.

## Prerequisites

- Python 3.13+ and a virtual environment tool (the repo includes a `.venv/`)
- Node.js 22+ and npm

## Running the CMS

```bash
cd cms
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # first time only
python manage.py runserver
```

The CMS admin runs at `http://127.0.0.1:8000/admin/` and exposes GraphQL at `http://127.0.0.1:8000/graphql/`.

By default the CMS uses SQLite with no extra configuration. Copy `cms/.env.example` to `cms/.env` to customize settings such as `DATABASE_URL` (for Postgres) or S3-backed media storage.

## Running the web app

```bash
cd web
npm install
npm run dev
```

The site runs at `http://localhost:3000`. Copy `web/.env.example` to `web/.env.local` and set `CMS_GRAPHQL_URL` to point at the running CMS instance (defaults to `http://127.0.0.1:8000/graphql/`).

## Notes

- Run the CMS and web app together (in separate terminals) for full local development, since the web app fetches its content from the CMS.
- See `cms/GRAPHQL_QUERIES.md` for example GraphQL queries against the CMS.
