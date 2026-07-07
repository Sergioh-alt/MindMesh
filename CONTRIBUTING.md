# Contributing to MindMesh

Thank you for your interest in contributing to MindMesh.

MindMesh is an open-source cognitive workflow platform focused on building modular, visual, and extensible systems where humans and AI can design, execute, and improve complex workflows.

Contributions are welcome from developers, researchers, designers, documentation writers, and AI enthusiasts.

---

# Contribution Philosophy

MindMesh follows a few fundamental principles:

- Keep the architecture modular.
- Prefer clear interfaces over tightly coupled solutions.
- Document decisions and design changes.
- Build reusable components.
- Maintain provider independence.
- Prioritize reliability over unnecessary complexity.

Every contribution should improve the ecosystem, not only add functionality.

---

# Ways to Contribute

There are several ways to contribute:

## Code Contributions

Examples:

- New node implementations
- Runtime improvements
- Backend services
- Frontend components
- Provider integrations
- Performance improvements
- Security improvements

---

## Documentation

Documentation is a critical part of MindMesh.

Useful contributions include:

- Architecture improvements
- Tutorials
- Examples
- API documentation
- Developer guides
- Workflow examples

---

## Design Contributions

MindMesh is a visual platform.

Design contributions may include:

- User experience improvements
- Interface components
- Visualization improvements
- Workflow interaction ideas

---

## Research Contributions

AI workflows evolve rapidly.

Research contributions may include:

- New execution strategies
- Agent architectures
- Memory approaches
- Evaluation methods
- AI integration patterns

---

# Development Environment

## Requirements

Recommended environment:

- Python 3.10+
- Node.js 18+
- npm
- Git

---

# Repository Structure

The project follows a modular structure:

```text
mindmesh/

├── frontend/
│   ├── components/
│   ├── canvas/
│   ├── hooks/
│   └── state/

├── backend/
│   ├── api/
│   ├── runtime/
│   ├── services/
│   ├── providers/
│   └── storage/

├── docs/

├── examples/

├── plugins/

└── tests/
```

Each directory has a clear responsibility.

Avoid placing unrelated functionality in existing modules.

---

# Setting Up the Project

## Clone Repository

```bash
git clone https://github.com/Sergioh-alt/mindmesh.git

cd mindmesh
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

```

Run development server:

```bash
uvicorn main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# Creating a Contribution

## 1. Create a Branch

Use descriptive branch names.

Examples:

```
feature/custom-node-system

fix/runtime-validation

docs/architecture-update
```

---

## 2. Make Changes

Before submitting:

- Keep changes focused.
- Follow existing code style.
- Add documentation when necessary.
- Avoid unnecessary dependencies.

---

## 3. Test Your Changes

Run available tests:

```bash
pytest
```

Frontend:

```bash
npm test
```

Check:

- Existing functionality still works.
- New features behave correctly.
- No breaking changes are introduced.

---

# Node Development Guidelines

New nodes should follow the MindMesh node contract.

Every node should define:

- Identity
- Inputs
- Outputs
- Validation
- Execution logic
- Metadata

Example:

```python
class ExampleNode:

    name = "Example"

    inputs = [
        "data"
    ]

    outputs = [
        "result"
    ]

    def validate(self):
        pass

    def execute(self, context):
        pass
```

---

# Architecture Guidelines

Contributors should respect the separation between layers.

Correct:

```
Frontend

↓

API

↓

Service

↓

Runtime

↓

Infrastructure
```

Avoid:

```
Frontend

↓

Database
```

or:

```
Node

↓

Direct External API Access
```

All communication should pass through the appropriate abstraction layer.

---

# Commit Guidelines

Use meaningful commit messages.

Recommended format:

```
type: description
```

Examples:

```
feat: add workflow validation engine

fix: resolve node state synchronization

docs: update architecture guide
```

---

# Pull Request Guidelines

A pull request should include:

## Description

Explain:

- What changed
- Why it was needed
- How it works

---

## Testing

Include:

- Tests performed
- Environment used
- Possible limitations

---

## Documentation

Update documentation when changing:

- Architecture
- APIs
- Node behavior
- User workflows

---

# Code Review

Reviews focus on:

- Architecture consistency
- Maintainability
- Security
- Performance
- User impact

A contribution may be requested to change direction if it introduces unnecessary complexity.

---

# Security Contributions

Security issues should not be publicly disclosed.

Please review:

```
SECURITY.md
```

before reporting vulnerabilities.

---

# Community Standards

Contributors are expected to:

- Be respectful.
- Provide constructive feedback.
- Discuss technical decisions openly.
- Help improve the ecosystem.

Discussions should focus on ideas and implementation quality.

---

# Future Contributor Areas

The following areas are especially valuable:

## Workflow Runtime

- Scheduling
- Parallel execution
- Reliability

## AI Integration

- Agent systems
- Provider adapters
- Memory systems

## Developer Experience

- SDKs
- Documentation
- Examples

## Platform Features

- Collaboration
- Versioning
- Deployment

---

# Final Note

MindMesh is built around the idea that future AI systems will not be single applications, but interconnected workflows combining humans, models, tools, and knowledge.

Every contribution helps build a more open and flexible foundation for that future.

