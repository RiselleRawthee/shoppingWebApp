# ShopLite Backend — Python/FastAPI Standards

## Architecture
- **Routers are thin**: validate input, query the database, return a response. No business logic in routers.
- **Models** (`app/models.py`): SQLAlchemy ORM. One class per database table.
- **Schemas** (`app/schemas.py`): Pydantic v2. Always define separate `Request` and `Response` schemas.
- **Database**: SQLite via SQLAlchemy. Inject the session with `db: Session = Depends(get_db)`.
- **No `SELECT *`**: Always specify columns explicitly in queries.

## Python Standards
- Python 3.11+. Every function must have type hints. No exceptions.
- Use `async def` for FastAPI route handlers.
- Error handling: raise `HTTPException` with the appropriate status code. Never return 200 with an error body.

## HTTP Status Codes
| Scenario | Code |
|---|---|
| Resource created | 201 |
| Resource not found | 404 |
| Invalid input / failed validation | 422 |
| Business rule violation (e.g. duplicate) | 409 |
| Permission denied | 403 |
| Successful delete | 204 |

## Naming Conventions
- Files: `snake_case.py`
- Classes: `PascalCase`
- Functions / variables: `snake_case`
- Router files: plural noun (`products.py`, `reviews.py`)
- Schema classes: `{Entity}Request`, `{Entity}Response`

## Testing
- Use `pytest`. All fixtures live in `tests/conftest.py`.
- Each endpoint needs: happy path, not found / 404, invalid input / 422, and business rule violation.
- Tests must be independent — no shared state between test functions.
- New features get `xfail` tests written first (executable acceptance criteria). Remove `xfail` when implemented.

## Linting
- `ruff` is configured in `pyproject.toml`. Run: `ruff check . --fix`
- `ruff` runs automatically via hooks after every `.py` file edit — you will see `[Hook] ruff: OK` fire.

## Key Commands
```bash
# From backend/
uvicorn app.main:app --reload   # start server
pytest tests/ -v                # run tests
ruff check . --fix              # lint
```
