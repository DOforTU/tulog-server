# TULOG Server

> Backend server for personal or team blog platform.
> You can see the detail of the project [here](https://github.com/DOforTU/tulog).

## Project Overview

Backend API server that provides a platform for recording and sharing knowledge and experiences through personal or team blog services.

## Key Features

## Project Structure

```
tulog-server/
├── api/               # NestJS Application
│   ├── docs/          # Development documentation (coding standards, commit rules, security guide)
│   ├── src/           # Source code
│   ├── test/          # Test files
│   └── README.md      # Technical documentation and development guide
├── docs/              # Project design documents (architecture, requirements, specifications)
└── README.md          # Project overview (current file)
```

## Tech Stack

-   **Backend**: NestJS, TypeScript
-   **Database**: PostgreSQL
-   **Validation**: class-validator, class-transformer
-   **Documentation**: Swagger (OpenAPI)
-   **Development**: ESLint, Jest

## Getting Started

For detailed installation and development guide, please refer to [api/README.md](./api/README.md).

```bash
# Clone the project
git clone https://github.com/DOforTU/tulog-server.git

# Install dependencies and run development server
cd tulog-server/api
npm install
npm run start:dev
```

## Development Documentation

For detailed development guide, please refer to the following documents:

-   [API Server Development Guide](./api/README.md) - Tech stack, installation and execution methods
-   [Coding Standards](./api/docs/CODING_STANDARDS.md) - Function names, variable names, file name rules
-   [Commit Rules](./api/docs/COMMIT_RULES.md) - Commit message writing rules
-   [Security Guide](./api/docs/SECURITY.md) - Security configuration and management methods

## License

This project is distributed under the MIT License.
