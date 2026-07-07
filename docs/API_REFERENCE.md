# API_REFERENCE.md

# API Reference

## Overview

MindMesh exposes a modular REST API that enables communication between the frontend, execution engine, AI providers, plugins, and external applications.

The API is designed around a capability-oriented architecture rather than a collection of application-specific endpoints.

As the platform evolves, new modules can be added without breaking existing integrations.

---

# API Design Principles

The API follows several core principles.

## Stateless Communication

Each request contains all information required for execution.

The server should not depend on session state whenever possible.

---

## Modular Endpoints

Services are organized into independent modules.

Each module has a clearly defined responsibility.

---

## Extensibility

New capabilities should be introduced through new endpoints rather than modifying existing ones.

Versioning maintains backwards compatibility.

---

## Predictable Responses

Every endpoint returns a standardized response structure.

Example:

```json
{
    "success": true,
    "data": {},
    "errors": [],
    "metadata": {}
}
```

---

# High-Level Architecture

```mermaid
graph TD

Client

--> API Gateway

API Gateway

--> Workflow API

API Gateway

--> AI API

API Gateway

--> Workspace API

API Gateway

--> Plugin API

API Gateway

--> Execution API

API Gateway

--> System API
```

---

# Endpoint Categories

## System

Provides information about the running instance.

Typical endpoints:

```text
GET /health

GET /version

GET /telemetry

GET /configuration
```

Responsibilities

- Health checks
- Runtime status
- System information
- Diagnostics

---

## Workspace

Responsible for workspace management.

Typical endpoints:

```text
GET /workspaces

POST /workspaces

PUT /workspaces/{id}

DELETE /workspaces/{id}

POST /workspaces/import

POST /workspaces/export
```

Responsibilities

- Workspace lifecycle
- Import/export
- Metadata
- Persistence

---

## Workflow

Manages visual workflows.

Typical endpoints:

```text
GET /workflow

POST /workflow

PUT /workflow

DELETE /workflow

POST /workflow/validate
```

Responsibilities

- Canvas state
- Validation
- Serialization
- Node graph management

---

## Execution

Controls workflow execution.

Typical endpoints:

```text
POST /execute

POST /execute/node

POST /cancel

GET /execution/{id}

GET /logs/{id}
```

Responsibilities

- Workflow execution
- Node execution
- Monitoring
- Cancellation
- Logs

---

## AI

Interfaces with language models.

Typical endpoints:

```text
POST /chat

POST /completion

POST /embedding

POST /vision

POST /rerank
```

Responsibilities

- Prompt execution
- Streaming responses
- Embeddings
- Vision models
- Model abstraction

---

## Plugins

Manages runtime extensions.

Typical endpoints:

```text
GET /plugins

POST /plugins/install

POST /plugins/enable

POST /plugins/disable

DELETE /plugins
```

Responsibilities

- Discovery
- Registration
- Activation
- Version validation

---

## Memory

Provides long-term context management.

Typical endpoints:

```text
POST /memory/store

POST /memory/search

POST /memory/update

DELETE /memory
```

Responsibilities

- Storage
- Retrieval
- Semantic search
- Context management

---

## Assets

Handles project resources.

Typical endpoints:

```text
POST /assets/upload

GET /assets

DELETE /assets

GET /assets/{id}
```

Supported asset types may include:

- Images
- PDFs
- Audio
- Video
- CSV
- Markdown
- JSON

---

# Request Format

Requests generally follow this structure.

```json
{
    "workspace": "workspace-id",
    "node": "node-id",
    "payload": {},
    "metadata": {}
}
```

This enables consistent communication across services.

---

# Response Format

Successful responses:

```json
{
    "success": true,
    "data": {},
    "metadata": {}
}
```

Error responses:

```json
{
    "success": false,
    "errors": [
        {
            "code": "INVALID_REQUEST",
            "message": "Required field missing."
        }
    ]
}
```

---

# Authentication

Current development builds may not require authentication.

Production deployments should support:

- API Keys
- JWT
- OAuth2
- Role-Based Access Control (RBAC)

Authentication is intentionally separated from business logic.

---

# Versioning

Endpoints are versioned.

Example:

```text
/api/v1/

↓

/api/v2/
```

Breaking changes are introduced only through new versions.

---

# Rate Limiting

Production deployments may enforce limits.

Example policies:

```text
Anonymous

↓

100 requests/hour

Authenticated

↓

5000 requests/hour

Internal Services

↓

Unlimited
```

Limits are deployment-specific.

---

# Error Handling

Errors use standard HTTP status codes.

| Code | Meaning |
|------|----------|
| 200 | Success |
| 201 | Resource Created |
| 400 | Invalid Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource Not Found |
| 409 | Conflict |
| 422 | Validation Failed |
| 429 | Rate Limited |
| 500 | Internal Error |

---

# Streaming

Certain endpoints support streaming responses.

Examples include:

- AI generation
- Long-running workflows
- Execution logs
- Live telemetry

Streaming protocols may include:

- WebSocket
- Server-Sent Events (SSE)

---

# Observability

Every request may generate telemetry.

Collected metrics include:

- Request duration
- Response size
- Error rate
- Execution time
- Token usage
- Resource consumption

These metrics feed the platform's observability layer.

---

# SDK Philosophy

The API is designed so that official SDKs can be built without requiring API redesign.

Potential SDKs include:

- Python
- JavaScript
- TypeScript
- Go
- Rust

Each SDK should map closely to the REST interface while providing native abstractions.

---

# Future Directions

The API is expected to expand with capabilities such as:

- GraphQL support
- Event-driven execution
- Webhooks
- Remote workflow execution
- Distributed runtime coordination
- Multi-user collaboration
- Plugin marketplace integration

The underlying design prioritizes stability, allowing the API surface to grow without disrupting existing integrations.

---

# Design Philosophy

MindMesh treats its API as the public interface to its execution platform.

The frontend is simply one consumer of this API.

Automation tools, plugins, desktop applications, mobile clients, and external services interact with the same architecture through consistent interfaces.

This approach keeps the platform modular, scalable, and independent of any single user interface.
