# PetVet AI - SaudePet

**Veterinary Virtual Assistant Platform - WhatsApp-First Approach**

[![CI Pipeline](https://github.com/rodaquino-OMNI/SaudePet/actions/workflows/ci.yml/badge.svg)](https://github.com/rodaquino-OMNI/SaudePet/actions/workflows/ci.yml)
[![CodeQL](https://github.com/rodaquino-OMNI/SaudePet/actions/workflows/codeql.yml/badge.svg)](https://github.com/rodaquino-OMNI/SaudePet/actions/workflows/codeql.yml)

## Overview

PetVet AI (SaudePet) is a WhatsApp-first veterinary virtual assistant platform that provides AI-powered veterinary consultations, diagnosis, and treatment recommendations. Users interact primarily through WhatsApp, with an optional admin dashboard for operations management.

### Platform Strategy

| Channel | Priority | Description |
|---------|----------|-------------|
| **WhatsApp** | PRIMARY | Main user interface via WhatsApp Business Cloud API |
| **Admin Dashboard** | INTERNAL | React-based web panel for operations and analytics |
| **Mobile App** | PLANNED | React Native app for enhanced features (Phase 2) |

### Current Status: **MVP Complete**

The platform is fully functional with all core features implemented:
- WhatsApp webhook integration with conversation flows
- AI-powered veterinary diagnosis and treatment recommendations
- Pet and user management
- Subscription management with Stripe integration
- Comprehensive monitoring and observability

---

## Architecture

```
                              USER CHANNELS
┌─────────────────────────────────────────────────────────────────────────┐
│              WhatsApp (PRIMARY)          │    Admin Dashboard           │
│   ┌───────────────────────────────┐      │   ┌───────────────────────┐  │
│   │  WhatsApp Business Cloud API  │      │   │   React + Vite        │  │
│   │  (Meta Webhooks)              │      │   │   (Internal Use)      │  │
│   └───────────────┬───────────────┘      │   └───────────┬───────────┘  │
└───────────────────┼──────────────────────┴───────────────┼──────────────┘
                    │                                      │
                    ▼                                      │
┌─────────────────────────────────────────────────────────────────────────┐
│                      AWS APPLICATION LOAD BALANCER                       │
│                        (HTTPS + SSL/TLS)                                │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  WhatsApp Handler │ │    Core API       │ │   AI Services     │
│  (Node.js/Express)│ │   (Node.js/TS)    │ │   (Python/FastAPI)│
│  Port: 3001       │ │   Port: 3000      │ │   Port: 8000      │
│  ECS Fargate      │ │   ECS Fargate     │ │   ECS Fargate     │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ • Webhook Receiver│ │ • Users Module    │ │ • LLM Orchestrator│
│ • Message Queue   │ │ • Pets Module     │ │ • Diagnosis Engine│
│ • Flow Engine     │ │ • Consultations   │ │ • Treatment Proto.│
│ • Session Manager │ │ • Health Records  │ │ • Image Analysis  │
│ • Template Sender │ │ • Subscriptions   │ │ • Knowledge Base  │
└─────────┬─────────┘ │ • Reminders       │ └─────────┬─────────┘
          │           └─────────┬─────────┘           │
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                    │
├─────────────────────┬───────────────────────┬───────────────────────────┤
│   PostgreSQL (RDS)  │   Redis (ElastiCache) │      S3 Storage           │
│   [Transactional]   │   [Sessions & Cache]  │   [Media & Documents]     │
│                     │                       │                           │
│ • users             │ • WhatsApp Sessions   │ • Pet Photos              │
│ • pets              │ • Conversation State  │ • Medical Documents       │
│ • consultations     │ • LLM Response Cache  │ • Prescription PDFs       │
│ • health_records    │ • Rate Limiting       │                           │
│ • subscriptions     │                       │                           │
│ • reminders         │                       │                           │
│ • whatsapp_sessions │                       │                           │
└─────────────────────┴───────────────────────┴───────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **WhatsApp Integration** | WhatsApp Business Cloud API v18.0 | Primary user interface |
| **Backend API** | Node.js 20 LTS + Express + TypeScript | Core business logic |
| **AI Services** | Python 3.11 + FastAPI | LLM orchestration, diagnosis engine |
| **Database** | PostgreSQL 15 (RDS) | Transactional data |
| **Cache/Sessions** | Redis 7 (ElastiCache) | WhatsApp sessions, LLM cache |
| **Storage** | AWS S3 + CloudFront | Media files, prescriptions |
| **Infrastructure** | AWS ECS Fargate, ALB, RDS | Cloud hosting |
| **IaC** | Terraform | Infrastructure as Code |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Monitoring** | CloudWatch + SNS | Observability & alerting |
| **Payments** | Stripe | Subscription billing |
| **LLM Providers** | OpenAI + Anthropic | AI diagnosis (with fallback) |

---

## Repository Structure

```
SaudePet/
├── packages/
│   ├── whatsapp-handler/        # WhatsApp webhook & message processing
│   │   ├── src/
│   │   │   ├── webhooks/        # Meta webhook handlers
│   │   │   ├── flows/           # Conversation flows (main-menu, consultation, subscription)
│   │   │   ├── clients/         # API, AI, WhatsApp clients
│   │   │   ├── services/        # Session management
│   │   │   ├── queues/          # Bull message queue
│   │   │   └── utils/           # Logger, metrics
│   │   └── Dockerfile
│   │
│   ├── api/                     # Core business API
│   │   ├── src/
│   │   │   ├── modules/         # users, pets, consultations, health-records,
│   │   │   │                    # subscriptions, reminders
│   │   │   ├── shared/          # middleware, logger
│   │   │   └── config/          # database, app config
│   │   └── Dockerfile
│   │
│   ├── ai-services/             # Python AI/LLM services
│   │   ├── src/
│   │   │   ├── llm/             # LLM orchestrator (OpenAI/Anthropic)
│   │   │   ├── diagnosis/       # Veterinary diagnosis analyzer
│   │   │   └── routers/         # FastAPI endpoints
│   │   └── Dockerfile
│   │
│   └── admin-dashboard/         # React admin panel
│       ├── src/
│       │   ├── pages/           # Dashboard, Users, Pets, Consultations, etc.
│       │   ├── components/      # Reusable UI components
│       │   └── store/           # Zustand state management
│       └── Dockerfile
│
├── infrastructure/
│   └── terraform/
│       ├── modules/             # networking, database, compute, storage, monitoring
│       └── environments/        # dev, staging, production
│
├── .github/
│   ├── workflows/               # ci.yml, cd-staging.yml, cd-production.yml, codeql.yml
│   ├── dependabot.yml           # Automated dependency updates
│   └── CODEOWNERS
│
├── docs/
│   └── api/
│       └── openapi.yaml         # API documentation (OpenAPI 3.0)
│
├── scripts/
│   ├── init-db.sql              # Database schema
│   ├── setup-dev.sh             # Development setup
│   └── simulate-whatsapp.sh     # Local WhatsApp testing
│
├── docker-compose.yml           # Production composition
└── docker-compose.dev.yml       # Development with hot reload
```

---

## Features

### Implemented (MVP)

#### WhatsApp Conversation Flows
- **Main Menu**: Navigation hub with buttons for consultations, pets, history, subscription
- **Consultation Flow**: Symptom collection, AI diagnosis, treatment recommendations, prescription generation
- **Pet Registration**: Species selection (dog, cat, bird, exotic), profile creation
- **Subscription Flow**: Plan selection, payment integration, upgrade/downgrade

#### AI-Powered Diagnosis
- Multi-provider LLM support (OpenAI primary, Anthropic fallback)
- Clarifying questions for precise diagnosis
- Differential diagnosis with probability scores
- Urgency level assessment (low, medium, high, emergency)
- Treatment protocol generation with medications and supportive care

#### Core Platform
- Phone-based user authentication (WhatsApp verified)
- Pet profile management with health records
- Consultation history with full conversation logs
- Digital prescription generation (PDF)
- Reminder system (vaccines, medications, checkups)

#### Subscription Plans
| Plan | Price | Consultations | Pets |
|------|-------|---------------|------|
| Basic | R$ 29.90/mo | 5/month | 1 |
| Family | R$ 49.90/mo | Unlimited | 3 |
| Premium | R$ 79.90/mo | Unlimited | Unlimited + Image Analysis |

#### Infrastructure & DevOps
- Multi-environment Terraform (dev, staging, production)
- Blue-green deployment support
- WAF protection (production)
- CloudWatch dashboards and alarms
- Automated security scanning (CodeQL, Dependabot, Trivy)

### Planned (Phase 2)
- [ ] React Native mobile app
- [ ] Advanced image analysis for skin conditions
- [ ] Multi-language support (EN, ES)
- [ ] Telehealth video consultations
- [ ] Pharmacy integrations
- [ ] Pet insurance partnerships

---

## Getting Started

### Prerequisites

- Node.js 20.x
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15 (or via Docker)
- Redis 7 (or via Docker)
- AWS Account (for deployment)
- API Keys: OpenAI/Anthropic, WhatsApp Business, Stripe

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/rodaquino-OMNI/SaudePet.git
cd SaudePet
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Start with Docker Compose (Development)**
```bash
docker compose -f docker-compose.dev.yml up
```

4. **Or run services individually**
```bash
# Install dependencies
npm install

# Start database and Redis
docker compose up db redis -d

# Run services
npm run dev:api
npm run dev:whatsapp
npm run dev:ai
```

### Development URLs

| Service | URL | Description |
|---------|-----|-------------|
| WhatsApp Handler | http://localhost:3001 | Webhook endpoint |
| Core API | http://localhost:3000 | REST API |
| AI Services | http://localhost:8000 | Diagnosis endpoints |
| Admin Dashboard | http://localhost:5173 | Web admin panel |
| API Docs | http://localhost:3000/docs | Swagger UI |
| pgAdmin | http://localhost:8082 | Database management |
| Redis Commander | http://localhost:8081 | Cache inspection |

### Testing WhatsApp Locally

```bash
# Use ngrok for webhook testing
ngrok http 3001

# Or use the WhatsApp simulator
./scripts/simulate-whatsapp.sh --message "Ola"
./scripts/simulate-whatsapp.sh --flow consultation
```

---

## API Documentation

The API is documented using OpenAPI 3.0 specification. See [docs/api/openapi.yaml](docs/api/openapi.yaml).

### Key Endpoints

```
# Users
GET    /api/v1/users/by-phone/:phoneNumber
POST   /api/v1/users

# Pets
GET    /api/v1/pets
POST   /api/v1/pets
GET    /api/v1/pets/:id

# Consultations
POST   /api/v1/consultations
GET    /api/v1/consultations/:id
PATCH  /api/v1/consultations/:id
POST   /api/v1/consultations/:id/prescription

# Subscriptions
GET    /api/v1/subscriptions/plans
POST   /api/v1/subscriptions
PUT    /api/v1/subscriptions/current

# Reminders
GET    /api/v1/reminders
POST   /api/v1/reminders
POST   /api/v1/reminders/:id/acknowledge
POST   /api/v1/reminders/:id/snooze

# WhatsApp Webhook
GET    /webhooks/whatsapp    # Meta verification
POST   /webhooks/whatsapp    # Message receiver
```

---

## Deployment

### CI/CD Pipelines

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | PR, push to develop | Lint, test, build, security scan |
| `cd-staging.yml` | Push to develop | Auto-deploy to staging |
| `cd-production.yml` | Release published | Blue-green deploy to production |
| `codeql.yml` | Weekly, PR | Security analysis |

### Infrastructure Environments

```bash
# Development
cd infrastructure/terraform/environments/dev
terraform init && terraform apply

# Staging
cd infrastructure/terraform/environments/staging
terraform init && terraform apply

# Production (with WAF and Multi-AZ)
cd infrastructure/terraform/environments/production
terraform init && terraform apply
```

---

## Monitoring

### CloudWatch Dashboards

- **WhatsApp Metrics**: Webhook count, response time, message volume
- **ECS Metrics**: CPU/Memory utilization per service
- **Business Metrics**: Consultations completed, prescriptions generated

### Alerts Configured

- WhatsApp webhook error rate > 10 in 5 minutes
- Webhook latency > 5 seconds
- ECS CPU > 80%
- RDS CPU > 80%
- Redis memory > 80%
- ALB 5xx errors > 50 in 5 minutes

---

## Testing

```bash
# Run all tests
npm test

# Test specific packages
npm run test:api
npm run test:whatsapp-handler

# Python tests
cd packages/ai-services && pytest

# Coverage
npm run test:coverage
```

---

## Security

- **Authentication**: Phone-based via WhatsApp verification
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Secrets**: AWS Secrets Manager with KMS encryption
- **Scanning**: CodeQL (SAST), Trivy (container), Dependabot (dependencies)
- **LGPD Compliance**: Soft delete support, data export capability

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript for Node.js services
- Python 3.11+ with type hints for AI services
- ESLint + Prettier (TS), Black + Ruff (Python)
- Conventional Commits

---

## License

This project is proprietary software. All rights reserved.

---

## Contact

- **Repository**: [github.com/rodaquino-OMNI/SaudePet](https://github.com/rodaquino-OMNI/SaudePet)
- **Email**: support@petvet.ai

---

<p align="center">
  <strong>PetVet AI - SaudePet</strong><br>
  WhatsApp-First Veterinary Virtual Assistant<br>
  <em>Democratizing access to veterinary care</em>
</p>
