# Backend Project Documentation

## Code Standards

### Required Before Each Commit
- Run `npm run format` before committing any changes to ensure proper code formatting.
- This will run Prettier and ESLint on all TypeScript files to maintain consistent style.

### Development Flow
- Build: `npm run build`
- Test: `npm test`
- Full CI check: `npm run ci` (includes build, format, lint, test)

## Repository Structure

- `src/`: Main application source code
  - `controllers/`: Express route handlers and controllers
  - `services/`: Business logic and service classes
  - `repositories/`: Data access and persistence logic
  - `models/`: TypeScript interfaces and domain models
  - `middlewares/`: Express middleware functions
  - `config/`: Configuration files and environment setup
  - `utils/`: Utility functions and helpers
  - `logger/`: Logger setup and configuration
- `tests/`: Unit and integration tests (mirrors `src/` structure)
- `docs/`: Documentation and API specs
- `scripts/`: Project-related scripts (e.g., migrations, seeding)
- `k8s/`: Kubernetes manifests (Deployment, Service, ConfigMap, etc.)

## Key Guidelines

1. Follow TypeScript, Node.js, and Express best practices and idiomatic patterns.
2. Maintain existing code structure and organization.
3. Use object-oriented programming and dependency injection patterns where appropriate.
4. Write unit tests for new functionality. Use table-driven unit tests when possible.
5. Document public APIs and complex logic. Suggest changes to the `docs/` folder when appropriate.
6. Use environment variables for configuration and secrets.
7. Keep business logic out of controllers and infrastructure; use services and repositories.
8. Use dependency injection for services and repositories.

## 12-Factor Application Principles

This project follows [The Twelve-Factor App](https://12factor.net/) methodology for building scalable, maintainable, and portable applications:

1. **Codebase**: One codebase tracked in version control, many deploys.
2. **Dependencies**: Explicitly declare and isolate dependencies in `package.json`.
3. **Config**: Store configuration in environment variables, never in code.
4. **Backing Services**: Treat backing services (databases, queues, etc.) as attached resources, configured via environment variables.
5. **Build, Release, Run**: Strictly separate build and run stages using scripts and Docker.
6. **Processes**: Execute the app as one or more stateless processes; persist state in backing services.
7. **Port Binding**: Export services via port binding (e.g., Express listens on `$PORT`).
8. **Concurrency**: Scale out via process model (e.g., Docker, Kubernetes).
9. **Disposability**: Fast startup and graceful shutdown for robust deployments.
10. **Dev/Prod Parity**: Keep development, staging, and production as similar as possible (use Docker and `.env` files).
11. **Logs**: Treat logs as event streams; output to stdout/stderr and aggregate via AWS S3.
12. **Admin Processes**: Run admin/management tasks as one-off processes (e.g., via `npm run` scripts or Docker exec).

## Docker

- Build the Docker image:
  ```sh
  docker build -t my-app .
  ```
- Run the container:
  ```sh
  docker run -p 3000:3000 my-app
  ```
- **Dockerfile** is located at the project root and is configured for a multi-stage build to optimize image size and security.
- Supports environment variable injection via `--env-file` or `-e` flags for configuration.
- Example for using an environment file:
  ```sh
  docker run --env-file .env -p 3000:3000 my-app
  ```
- For development, consider using `docker-compose.yml` to orchestrate app, database, and other dependencies.

- **Best Practices:**
  - Use non-root user in the Dockerfile for security.
  - Expose only necessary ports.
  - Keep the image as small as possible by using a minimal base image (e.g., `node:alpine`).
  - Copy only necessary files and use `.dockerignore` to exclude unnecessary files.

## API Documentation (Swagger/OpenAPI)

- API docs are available at `/api-docs` when running the app.
- To update the Swagger spec, edit `src/docs/swagger.yaml` and rebuild.
- Example Swagger setup uses `swagger-ui-express` and `swagger-jsdoc`.

## Kubernetes

- Kubernetes manifests are in the `k8s/` directory.
- Deploy to your cluster:
  ```sh
  kubectl apply -f k8s/
  ```

## Logger Setup (Grafana & AWS S3)

- Logging is handled via [Winston](https://github.com/winstonjs/winston) or [Pino](https://getpino.io/) with support for JSON output.
- **Logs are stored in AWS S3 for long-term retention and analysis.**
- Logs can be visualized in Grafana by connecting Grafana to S3 as a data source or by exporting logs for analysis.
- Example logger setup is in `src/logger/` and configured via environment variables.

## Environment Variables

- All sensitive and environment-specific configuration is managed via `.env` files or Kubernetes secrets.
- Example variables:
  - `PORT`
  - `NODE_ENV`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `LOG_LEVEL`
  - `S3_LOG_BUCKET`

## CI/CD

- Full CI/CD pipeline runs on every push and pull request.
- Typical steps: lint, format, build, test, Docker build, and deploy (if on main branch).
- Example: GitHub Actions workflow in `.github/workflows/ci.yml`.