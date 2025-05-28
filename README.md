# Backend Project

A TypeScript/Node.js backend service built with Express following 12-factor app principles.

## Table of Contents

- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Development Workflow](#development-workflow)
  - [Building the Project](#building-the-project)
  - [Testing](#testing)
  - [Code Quality](#code-quality)
- [Project Structure](#project-structure)
- [Docker](#docker)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Kubernetes](#kubernetes)
- [Logging](#logging)
- [CI/CD](#cicd)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Docker (optional, for containerization)
- Kubernetes CLI (optional, for deployment)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/shirocola/poc-coding-agent-be.git
cd poc-coding-agent-be
npm install
```

### Configuration

1. Create a `.env` file in the project root:

```bash
cp .env.example .env
```

2. Modify the `.env` file with your environment-specific values

## Development Workflow

### Building the Project

To build the project:

```bash
npm run build
```

This will compile the TypeScript code into JavaScript in the `dist` directory.

### Testing

Run the test suite:

```bash
npm test
```

For coverage reports:

```bash
npm run test:coverage
```

### Code Quality

Before committing changes, ensure the code is properly formatted:

```bash
npm run format
```

To run linting:

```bash
npm run lint
```

To run the full CI check locally (build, format, lint, test):

```bash
npm run ci
```

## Project Structure

```
.
├── src/                     # Main application source code
│   ├── controllers/         # Express route handlers and controllers
│   ├── services/            # Business logic and service classes
│   ├── repositories/        # Data access and persistence logic
│   ├── models/              # TypeScript interfaces and domain models
│   ├── middlewares/         # Express middleware functions
│   ├── config/              # Configuration files and environment setup
│   ├── utils/               # Utility functions and helpers
│   └── logger/              # Logger setup and configuration
├── tests/                   # Unit and integration tests
├── docs/                    # Documentation and API specs
├── scripts/                 # Project-related scripts (e.g., migrations)
├── k8s/                     # Kubernetes manifests
├── .env.example             # Example environment variables
├── .eslintrc                # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── Dockerfile               # Docker build configuration
└── README.md                # Project documentation
```

## Docker

### Building the Docker Image

```bash
docker build -t my-app .
```

### Running the Container

```bash
docker run -p 3000:3000 my-app
```

### Using Environment Variables

```bash
docker run --env-file .env -p 3000:3000 my-app
```

### Development with Docker Compose

For development, use Docker Compose to orchestrate the app, database, and other dependencies:

```bash
docker-compose up -d
```

## API Documentation

API documentation is available at `/api-docs` when the application is running.

To update the Swagger specification:

1. Edit `src/docs/swagger.yaml`
2. Rebuild the application

The API documentation uses `swagger-ui-express` and `swagger-jsdoc`.

## Environment Variables

All configuration is managed via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Environment (development, test, production) | `development` |
| `AWS_ACCESS_KEY_ID` | AWS access key ID | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | - |
| `AWS_REGION` | AWS region | - |
| `LOG_LEVEL` | Logging level | `info` |
| `S3_LOG_BUCKET` | S3 bucket for log storage | - |

## Kubernetes

### Deployment

Kubernetes manifests are located in the `k8s/` directory. To deploy:

```bash
kubectl apply -f k8s/
```

The deployment includes:
- Deployment resources
- Service definitions
- ConfigMaps and Secrets
- Ingress rules (if applicable)

## Logging

### Configuration

Logging is handled via [Winston](https://github.com/winstonjs/winston) or [Pino](https://getpino.io/) with JSON output support.

Logs are:
- Output to stdout/stderr in development
- Stored in AWS S3 for long-term retention in production
- Configurable via environment variables

### Visualization

Logs can be visualized in Grafana by:
- Connecting Grafana to S3 as a data source
- Exporting logs for analysis

## CI/CD

This project uses automated CI/CD pipelines that run on every push and pull request:

1. **Lint**: Check code style and quality
2. **Format**: Ensure consistent code formatting
3. **Build**: Compile the TypeScript code
4. **Test**: Run the test suite
5. **Docker Build**: Build the Docker image
6. **Deploy**: Deploy to the target environment (if on main branch)

The workflow is defined in `.github/workflows/ci.yml`.