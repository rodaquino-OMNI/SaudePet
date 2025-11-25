# PetVet AI - DevOps Implementation Roadmap

## Document Control
| Version | Date | Author | Status |
|---------|------|--------|--------|
| 2.0 | Novembro 2025 | DevOps Team | Draft |

---

## Executive Summary

This document provides a comprehensive DevOps implementation roadmap for PetVet AI, a veterinary virtual assistant platform with a **WhatsApp-first** approach and optional standalone mobile application.

### Platform Strategy

| Channel | Priority | Description |
|---------|----------|-------------|
| **WhatsApp** | PRIMARY | Main user interface via WhatsApp Business API |
| **Standalone App** | SECONDARY | React Native mobile app for enhanced features |
| **Admin Dashboard** | INTERNAL | Web panel for operations and analytics |

### Why WhatsApp-First?

1. **Zero friction onboarding** - Users already have WhatsApp installed
2. **Familiar interface** - No learning curve for chat interactions
3. **Higher engagement** - 98% message open rate vs 20% for apps
4. **Lower acquisition cost** - No app store marketing needed
5. **Broader reach** - Works on any smartphone with WhatsApp
6. **Faster MVP** - Backend-focused development

**Total estimated duration to MVP: 14 weeks**

---

## Project Context

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            USER CHANNELS                                 │
├───────────────────────────────┬─────────────────────────────────────────┤
│      WhatsApp (PRIMARY)       │        Mobile App (SECONDARY)           │
│   ┌───────────────────────┐   │   ┌───────────────────────────────┐     │
│   │  WhatsApp Business    │   │   │     React Native App          │     │
│   │  Cloud API            │   │   │     (iOS & Android)           │     │
│   └───────────┬───────────┘   │   └───────────────┬───────────────┘     │
│               │               │                   │                     │
│               ▼               │                   ▼                     │
│   ┌───────────────────────┐   │   ┌───────────────────────────────┐     │
│   │  Meta Webhooks        │   │   │     REST API / WebSocket      │     │
│   └───────────┬───────────┘   │   └───────────────┬───────────────┘     │
└───────────────┼───────────────┴───────────────────┼─────────────────────┘
                │                                   │
                └─────────────┬─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE (CDN + WAF)                          │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AWS APPLICATION LOAD BALANCER                         │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                ┌─────────────────┼─────────────────┐
                │                 │                 │
                ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  WhatsApp Handler │ │    Core API       │ │   AI Services     │
│  (Node.js)        │ │   (Node.js)       │ │   (Python)        │
│  ECS Fargate      │ │   ECS Fargate     │ │   ECS Fargate     │
├───────────────────┤ ├───────────────────┤ ├───────────────────┤
│ • Webhook Receiver│ │ • Auth Module     │ │ • Chat Engine     │
│ • Message Router  │ │ • Pet Module      │ │ • Diagnosis AI    │
│ • Template Sender │ │ • Health Records  │ │ • LLM Orchestrator│
│ • Media Handler   │ │ • Subscriptions   │ │ • Image Analysis  │
│ • Session Manager │ │ • Notifications   │ │ • Knowledge Base  │
└─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
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
│ • Users             │ • WhatsApp Sessions   │ • Pet Photos              │
│ • Pets              │ • Conversation State  │ • Medical Documents       │
│ • Health Records    │ • LLM Response Cache  │ • Prescription PDFs       │
│ • Consultations     │ • Rate Limiting       │ • Backup Archives         │
│ • Subscriptions     │                       │                           │
└─────────────────────┴───────────────────────┴───────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **WhatsApp Integration** | WhatsApp Business Cloud API | Primary user interface |
| **Backend API** | Node.js 20 LTS + Express + TypeScript | Core business logic |
| **AI Services** | Python + FastAPI | LLM orchestration, diagnosis engine |
| **Database** | PostgreSQL 15 (RDS) | Transactional data |
| **Cache/Sessions** | Redis 7 (ElastiCache) | WhatsApp sessions, LLM cache |
| **Storage** | AWS S3 | Media files, documents |
| **CDN/Security** | Cloudflare | DDoS protection, edge caching |
| **Infrastructure** | AWS (ECS Fargate, ALB, RDS) | Cloud hosting |
| **CI/CD** | GitHub Actions | Automated pipelines |
| **Monitoring** | CloudWatch + Sentry | Observability |
| **Mobile App** | React Native + TypeScript | Secondary channel (Phase 2) |

---

## Visual Timeline

```
         Week 1-2        Week 3-4        Week 5-7        Week 8-11
         ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌──────────────┐
Phase 1  │Planning │     │         │     │         │     │              │
         │   P0    │     │         │     │         │     │              │
         └─────────┘     │         │     │         │     │              │
                         │         │     │         │     │              │
Phase 2                  │Dev Env  │     │         │     │              │
                         │   P0    │     │         │     │              │
                         └─────────┘     │         │     │              │
                                         │         │     │              │
Phase 3                                  │CI/CD    │     │              │
                                         │   P0    │     │              │
                                         └─────────┘     │              │
                                                         │              │
Phase 4                                                  │ Infra        │
                                                         │   P0         │
                                                         └──────────────┘

         Week 6-11                                       
         ┌──────────────────────────────────────────────────────────────┐
Phase 5  │              Backend & WhatsApp Development                  │
         │                          P0                                  │
         └──────────────────────────────────────────────────────────────┘

         Week 12         Week 12-13      Week 14         Week 14+
         ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
Phase 6  │Testing  │     │         │     │         │     │         │
         │   P0    │     │         │     │         │     │         │
         └─────────┘     │         │     │         │     │         │
                         │         │     │         │     │         │
Phase 7                  │Monitor  │     │         │     │         │
                         │   P0    │     │         │     │         │
                         └─────────┘     │         │     │         │
                                         │         │     │         │
Phase 8                                  │Docs     │     │         │
                                         │   P1    │     │         │
                                         └─────────┘     │         │
                                                         │         │
Phase 9                                                  │Deploy   │
                                                         │   P0    │
                                                         └─────────┘

         Week 15+
         ┌─────────────────────────────────────────────────────────────┐
Phase 10 │                    Post-Launch & Mobile App                 │
         │                         Ongoing                             │
         └─────────────────────────────────────────────────────────────┘
```

---

# Phase 1: Planning & Requirements

**Duration**: 2 weeks | **Priority**: P0 (Critical)

## Task 1.1: Requirements Finalization
| Attribute | Details |
|-----------|---------|
| **Description** | Finalize functional and non-functional requirements with WhatsApp-first focus |
| **Acceptance Criteria** | - All user stories documented in Jira/Azure DevOps<br>- WhatsApp conversation flows mapped<br>- MVP scope defined (WhatsApp only)<br>- Mobile app deferred to Phase 2 |
| **Required Roles** | Product Owner, Tech Lead, Business Analyst |
| **Estimated Effort** | 3 days |
| **Dependencies** | None (kickoff task) |
| **Tools** | Jira, Confluence, Miro (flow diagrams) |
| **Risks/Blockers** | WhatsApp Business API approval timeline |

### User Stories - WhatsApp MVP

```
Epic: WhatsApp Onboarding
  - US001: User sends first message, bot introduces itself
  - US002: User registers pet via guided conversation
  - US003: User confirms phone number for account creation
  - US004: User selects subscription plan via interactive buttons
  - US005: User receives payment link (Stripe/PIX)

Epic: AI Veterinary Consultation (WhatsApp)
  - US006: User describes symptoms in natural language
  - US007: Bot asks clarifying questions (structured flow)
  - US008: User sends pet photo for analysis
  - US009: Bot provides diagnosis with severity indicator
  - US010: Bot provides treatment protocol with medications
  - US011: User receives prescription PDF via WhatsApp
  - US012: Consultation saved to pet health record

Epic: Pet Management (WhatsApp)
  - US013: User lists registered pets ("meus pets")
  - US014: User switches active pet for consultation
  - US015: User adds new pet via conversation
  - US016: User views pet health timeline ("histórico")

Epic: Reminders & Notifications (WhatsApp)
  - US017: User receives vaccination reminders
  - US018: User receives medication reminders
  - US019: User receives subscription renewal alerts
  - US020: User can snooze/acknowledge reminders

Epic: Subscription Management (WhatsApp)
  - US021: User checks subscription status ("minha assinatura")
  - US022: User upgrades/downgrades plan
  - US023: User receives payment failure notification
  - US024: User cancels subscription
```

### WhatsApp Conversation Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN MENU FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User: "Olá" / "Oi" / Any greeting                              │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Olá! 🐾 Sou o PetVet IA, seu veterinário virtual.       │   │
│  │                                                          │   │
│  │ Como posso ajudar?                                       │   │
│  │                                                          │   │
│  │ [🩺 Nova Consulta]  [📋 Meus Pets]  [📊 Histórico]      │   │
│  │ [💳 Assinatura]     [❓ Ajuda]                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 CONSULTATION FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User: [🩺 Nova Consulta]                                       │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Para qual pet é a consulta?                              │   │
│  │                                                          │   │
│  │ [🐕 Rex - Labrador]  [🐈 Mia - Siamês]  [➕ Novo Pet]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ O que o Rex está sentindo? Descreva os sintomas com o   │   │
│  │ máximo de detalhes possível.                            │   │
│  │                                                          │   │
│  │ 💡 Dica: Mencione há quanto tempo, frequência e         │   │
│  │ intensidade dos sintomas.                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│  User: "Ele está vomitando desde ontem, já foram 3 vezes.      │
│         Não quer comer e está mais quieto que o normal."       │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Entendi. Algumas perguntas rápidas:                     │   │
│  │                                                          │   │
│  │ 1. O vômito tem sangue ou é amarelado?                  │   │
│  │ 2. Ele está bebendo água normalmente?                   │   │
│  │ 3. Comeu algo diferente ou teve acesso à rua?           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│  User: "Amarelado, está bebendo pouca água, ontem              │
│         comeu um pedaço de osso"                               │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ⚠️ ANÁLISE CLÍNICA - Rex                                │   │
│  │                                                          │   │
│  │ 📋 DIAGNÓSTICOS DIFERENCIAIS:                           │   │
│  │ 1. Gastroenterite aguda                                 │   │
│  │ 2. Corpo estranho (fragmento de osso)                   │   │
│  │ 3. Indiscrição alimentar                                │   │
│  │                                                          │   │
│  │ 🔍 DIAGNÓSTICO MAIS PROVÁVEL:                           │   │
│  │ Gastroenterite aguda por indiscrição alimentar          │   │
│  │                                                          │   │
│  │ 🚨 Nível de Urgência: MÉDIO                             │   │
│  │                                                          │   │
│  │ [Ver Tratamento Completo]  [Enviar Prescrição]          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Task 1.2: WhatsApp Business API Setup
| Attribute | Details |
|-----------|---------|
| **Description** | Register for Meta Business account and WhatsApp Business API |
| **Acceptance Criteria** | - Meta Business account verified<br>- WhatsApp Business API access approved<br>- Test phone number configured<br>- Webhook URL placeholder defined |
| **Required Roles** | Tech Lead, Business Owner |
| **Estimated Effort** | 3-5 days (includes Meta approval) |
| **Dependencies** | Business documentation ready |
| **Tools** | Meta Business Suite, WhatsApp Business Platform |
| **Risks/Blockers** | Meta verification delays (plan 2 weeks buffer) |

### WhatsApp Business API Requirements

```yaml
Meta Business Verification:
  - Business name: PetVet AI
  - Business category: Health/Medical
  - Business documents: CNPJ, business address proof
  - Website: Required for verification
  
WhatsApp Business Account:
  - Display name: PetVet AI 🐾
  - Profile picture: Logo
  - Business description: Veterinário virtual 24/7
  - Business hours: 24/7 (automated)
  - Phone number: Dedicated number for WhatsApp
  
Message Templates (pre-approved):
  - welcome_message: Initial greeting
  - consultation_start: Begin consultation flow
  - diagnosis_result: Send diagnosis
  - prescription_ready: Prescription notification
  - vaccination_reminder: Upcoming vaccine
  - medication_reminder: Take medication
  - payment_reminder: Subscription renewal
  - payment_failed: Failed payment alert
```

## Task 1.3: Architecture Decision Records (ADRs)
| Attribute | Details |
|-----------|---------|
| **Description** | Document key architectural decisions for WhatsApp-first platform |
| **Acceptance Criteria** | - ADRs for WhatsApp integration, session management, LLM strategy<br>- Trade-off analysis documented<br>- Team alignment on decisions |
| **Required Roles** | Solution Architect, Tech Lead, DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 1.1 |
| **Tools** | Confluence, Markdown in Git repo |
| **Risks/Blockers** | WhatsApp API limitations discovery |

### Key ADRs

```markdown
## ADR-001: WhatsApp as Primary Channel
**Status**: Accepted
**Context**: Need to reach maximum users with minimum friction
**Decision**: WhatsApp Business Cloud API as primary interface
**Consequences**: 
  + No app download required
  + Familiar UX for users
  + 98% message open rate
  - Limited rich UI capabilities
  - Dependent on Meta platform
  - Template message approval process

## ADR-002: Conversation State Management
**Status**: Accepted  
**Context**: WhatsApp is stateless, need to track conversation context
**Decision**: Redis-based session store with 24h TTL
**Consequences**:
  + Fast session lookups
  + Natural session expiry
  + Supports conversation branching
  - Additional infrastructure component

## ADR-003: Message Processing Architecture
**Status**: Accepted
**Context**: WhatsApp webhooks need fast response (<20s)
**Decision**: Async processing with immediate acknowledgment
**Consequences**:
  + Reliable message delivery
  + Can handle LLM latency
  - Complexity in message ordering
  - Need for queue infrastructure

## ADR-004: LLM Provider Strategy
**Status**: Accepted
**Context**: Need reliable AI responses for veterinary diagnosis
**Decision**: Multi-provider abstraction (OpenAI primary, Anthropic fallback)
**Consequences**:
  + Resilience against provider outages
  + Can optimize cost/quality per use case
  - Integration complexity
  - Prompt compatibility across providers

## ADR-005: Media Handling
**Status**: Accepted
**Context**: Users will send pet photos for analysis
**Decision**: Download from WhatsApp CDN → S3 → Process
**Consequences**:
  + Persistent storage of media
  + Can reprocess if needed
  - Additional S3 costs
  - Need to handle media expiry (WhatsApp CDN links expire)

## ADR-006: Mobile App Strategy
**Status**: Accepted
**Context**: Some features benefit from native app experience
**Decision**: React Native app as Phase 2 (post-MVP)
**Consequences**:
  + Focus resources on WhatsApp MVP
  + App can leverage existing backend
  - Delayed enhanced features (health timeline UI)
  - Need to maintain two channels eventually
```

## Task 1.4: Technical Specifications
| Attribute | Details |
|-----------|---------|
| **Description** | Define API contracts, data models, and WhatsApp integration specs |
| **Acceptance Criteria** | - OpenAPI 3.0 spec for all endpoints<br>- WhatsApp webhook handlers documented<br>- Database ERD approved<br>- Message template specs defined |
| **Required Roles** | Backend Developer, Solution Architect, Tech Lead |
| **Estimated Effort** | 4 days |
| **Dependencies** | Task 1.2, 1.3 |
| **Tools** | Swagger/OpenAPI, dbdiagram.io |
| **Risks/Blockers** | WhatsApp API rate limits understanding |

### Core API Endpoints

```yaml
# WhatsApp Webhook Handlers
WhatsApp:
  POST /webhooks/whatsapp              # Receive messages from Meta
  GET  /webhooks/whatsapp              # Webhook verification (Meta challenge)

# Internal APIs (not exposed to WhatsApp directly)
Authentication:
  POST /api/v1/auth/phone/verify       # Verify phone number
  POST /api/v1/auth/token              # Get API token (for mobile app)

Users:
  GET    /api/v1/users/me              # Get current user
  PUT    /api/v1/users/me              # Update user profile
  DELETE /api/v1/users/me              # Delete account (LGPD)

Pets:
  GET    /api/v1/pets                  # List user's pets
  POST   /api/v1/pets                  # Create pet
  GET    /api/v1/pets/{id}             # Get pet details
  PUT    /api/v1/pets/{id}             # Update pet
  DELETE /api/v1/pets/{id}             # Delete pet

Health Records:
  GET    /api/v1/pets/{id}/records     # List health records
  POST   /api/v1/pets/{id}/records     # Create health record
  GET    /api/v1/pets/{id}/timeline    # Get timeline view
  POST   /api/v1/pets/{id}/documents   # Upload document

Consultations:
  POST   /api/v1/consultations         # Start consultation
  GET    /api/v1/consultations/{id}    # Get consultation details
  POST   /api/v1/consultations/{id}/messages  # Add message
  GET    /api/v1/consultations/{id}/prescription  # Get prescription PDF

Subscriptions:
  GET    /api/v1/subscriptions/plans   # List available plans
  POST   /api/v1/subscriptions         # Create subscription
  GET    /api/v1/subscriptions/current # Get current subscription
  PUT    /api/v1/subscriptions/current # Update subscription
  DELETE /api/v1/subscriptions/current # Cancel subscription

Notifications:
  GET    /api/v1/notifications         # List notifications
  PUT    /api/v1/notifications/{id}/read  # Mark as read
  POST   /api/v1/reminders             # Create reminder
  GET    /api/v1/reminders             # List reminders
```

### Database Schema

```sql
-- Users (identified by WhatsApp phone number)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,  -- WhatsApp number
    name VARCHAR(100),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP  -- Soft delete for LGPD
);

-- Pets
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    species VARCHAR(20) NOT NULL,  -- dog, cat, bird, exotic
    breed VARCHAR(100),
    birth_date DATE,
    sex VARCHAR(10),  -- male, female
    weight DECIMAL(5,2),
    neutered BOOLEAN DEFAULT FALSE,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Consultations (WhatsApp conversations)
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    whatsapp_conversation_id VARCHAR(100),  -- Meta's conversation ID
    status VARCHAR(20) DEFAULT 'active',  -- active, completed, cancelled
    symptoms TEXT,
    diagnosis JSONB,  -- Structured diagnosis result
    treatment JSONB,  -- Treatment protocol
    urgency_level VARCHAR(20),  -- low, medium, high, emergency
    prescription_url VARCHAR(500),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Consultation Messages
CREATE TABLE consultation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,  -- user, assistant, system
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',  -- text, image, document
    media_url VARCHAR(500),
    whatsapp_message_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Health Records
CREATE TABLE health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id),
    record_type VARCHAR(50) NOT NULL,  -- consultation, vaccine, exam, medication, procedure
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    attachments JSONB,  -- Array of {url, type, name}
    metadata JSONB,  -- Type-specific data
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL,  -- basic, family, premium
    status VARCHAR(20) DEFAULT 'active',  -- active, cancelled, past_due, trialing
    stripe_subscription_id VARCHAR(100),
    stripe_customer_id VARCHAR(100),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP
);

-- Reminders
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,  -- vaccine, medication, checkup
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, acknowledged, snoozed
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Sessions (for conversation state)
-- Note: Primarily managed in Redis, this is for persistence/analytics
CREATE TABLE whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    phone_number VARCHAR(20) NOT NULL,
    session_state JSONB,  -- Current conversation state
    active_pet_id UUID REFERENCES pets(id),
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_consultations_pet_id ON consultations(pet_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, date DESC);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_date, status);
CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
```

## Task 1.5: Security & Compliance Planning
| Attribute | Details |
|-----------|---------|
| **Description** | Define security requirements and LGPD compliance for WhatsApp platform |
| **Acceptance Criteria** | - LGPD compliance checklist<br>- WhatsApp data handling policies<br>- Security controls mapped<br>- Privacy policy for WhatsApp |
| **Required Roles** | Security Engineer, Legal Consultant, Tech Lead |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 1.1 |
| **Tools** | Confluence, Security frameworks |
| **Risks/Blockers** | Legal review delays |

### Security Requirements

```yaml
Data Protection:
  encryption_at_rest: AES-256 (RDS, S3)
  encryption_in_transit: TLS 1.3
  pii_fields: phone_number, name, email (encrypted)
  data_retention: 
    consultations: 5 years
    messages: 2 years
    media: 1 year (then archived to Glacier)

Access Control:
  authentication: Phone number verification via WhatsApp
  api_tokens: JWT (for mobile app)
  rate_limiting:
    whatsapp_webhook: 1000/min
    api_endpoints: 100/15min per user
  admin_access: MFA required

WhatsApp Specific:
  webhook_verification: Meta signature validation (X-Hub-Signature-256)
  media_handling: Download immediately, Meta CDN links expire
  phone_verification: Trust WhatsApp's verification
  message_encryption: E2E by WhatsApp (we see decrypted)

LGPD Compliance:
  consent: 
    - Explicit opt-in on first message
    - Clear privacy policy link
    - Right to data export
    - Right to deletion
  data_portability: Export to JSON/PDF
  deletion: 
    - Soft delete with 30-day grace
    - Hard delete on request
  audit_logging: All data access logged
```

---

# Phase 2: Development Environment Setup

**Duration**: 2 weeks | **Priority**: P0 (Critical)

## Task 2.1: Repository Structure Setup
| Attribute | Details |
|-----------|---------|
| **Description** | Initialize GitHub repository with WhatsApp-focused structure |
| **Acceptance Criteria** | - Monorepo structure defined<br>- Branch protection configured<br>- CODEOWNERS file created<br>- PR templates configured |
| **Required Roles** | DevOps Engineer, Tech Lead |
| **Estimated Effort** | 1 day |
| **Dependencies** | None |
| **Tools** | GitHub, Git |
| **Risks/Blockers** | Team alignment on structure |

### Repository Structure

```
petvet-ai/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Continuous integration
│   │   ├── cd-staging.yml            # Deploy to staging
│   │   ├── cd-production.yml         # Deploy to production
│   │   └── scheduled-reminders.yml   # Cron for reminders
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── packages/
│   ├── whatsapp-handler/             # WhatsApp webhook & message processing
│   │   ├── src/
│   │   │   ├── webhooks/             # Meta webhook handlers
│   │   │   ├── handlers/             # Message type handlers
│   │   │   ├── flows/                # Conversation flow definitions
│   │   │   ├── templates/            # WhatsApp message templates
│   │   │   ├── session/              # Session management
│   │   │   └── utils/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── api/                          # Core business API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── pets/
│   │   │   │   ├── consultations/
│   │   │   │   ├── health-records/
│   │   │   │   ├── subscriptions/
│   │   │   │   └── notifications/
│   │   │   ├── shared/
│   │   │   └── config/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── ai-services/                  # Python AI/LLM services
│   │   ├── src/
│   │   │   ├── llm/                  # LLM orchestrator
│   │   │   ├── diagnosis/            # Veterinary diagnosis engine
│   │   │   ├── knowledge/            # MSD knowledge base
│   │   │   ├── image/                # Image analysis
│   │   │   └── prescription/         # Prescription generator
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── admin/                        # Admin dashboard (React)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── mobile/                       # Mobile app (Phase 2)
│       ├── src/
│       └── package.json
│
├── infrastructure/
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── networking/
│   │   │   ├── database/
│   │   │   ├── compute/
│   │   │   ├── storage/
│   │   │   └── monitoring/
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── production/
│   └── docker/
│
├── docs/
│   ├── api/                          # OpenAPI specs
│   ├── whatsapp/                     # WhatsApp flows & templates
│   ├── architecture/                 # ADRs and diagrams
│   └── runbooks/
│
├── scripts/
│   ├── setup-dev.sh
│   ├── seed-data.sh
│   └── simulate-whatsapp.sh          # Local WhatsApp testing
│
├── docker-compose.yml
├── package.json                      # Workspace root
└── README.md
```

## Task 2.2: Local Development Environment
| Attribute | Details |
|-----------|---------|
| **Description** | Create Docker Compose for local development with WhatsApp simulator |
| **Acceptance Criteria** | - All services runnable locally<br>- WhatsApp webhook simulator<br>- Hot reload enabled<br>- Seed data available |
| **Required Roles** | DevOps Engineer, Backend Developer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Task 2.1 |
| **Tools** | Docker, Docker Compose, ngrok |
| **Risks/Blockers** | WhatsApp testing complexity |

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  # WhatsApp Handler Service
  whatsapp-handler:
    build:
      context: ./packages/whatsapp-handler
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./packages/whatsapp-handler:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=3001
      - WHATSAPP_VERIFY_TOKEN=${WHATSAPP_VERIFY_TOKEN}
      - WHATSAPP_ACCESS_TOKEN=${WHATSAPP_ACCESS_TOKEN}
      - WHATSAPP_PHONE_NUMBER_ID=${WHATSAPP_PHONE_NUMBER_ID}
      - API_URL=http://api:3000
      - AI_SERVICES_URL=http://ai-services:8000
      - REDIS_URL=redis://redis:6379
    depends_on:
      - api
      - redis

  # Core API Service
  api:
    build:
      context: ./packages/api
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./packages/api:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/petvet
      - REDIS_URL=redis://redis:6379
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  # AI Services
  ai-services:
    build:
      context: ./packages/ai-services
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./packages/ai-services:/app
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=petvet
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis (Sessions & Cache)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # LocalStack (S3 emulation)
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3
      - DEFAULT_REGION=us-east-1
    volumes:
      - localstack_data:/var/lib/localstack

  # WhatsApp Simulator (for local testing)
  whatsapp-simulator:
    build:
      context: ./scripts/whatsapp-simulator
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - WEBHOOK_URL=http://whatsapp-handler:3001/webhooks/whatsapp
    depends_on:
      - whatsapp-handler

  # Admin Dashboard
  admin:
    build:
      context: ./packages/admin
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./packages/admin:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:3000

volumes:
  postgres_data:
  redis_data:
  localstack_data:
```

### WhatsApp Simulator

```typescript
// scripts/whatsapp-simulator/src/index.ts
// Simple UI to simulate WhatsApp messages for local development

import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3001/webhooks/whatsapp';

// Simulate incoming text message
app.post('/simulate/text', async (req, res) => {
  const { from, text } = req.body;
  
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15551234567',
            phone_number_id: 'PHONE_NUMBER_ID'
          },
          contacts: [{
            profile: { name: 'Test User' },
            wa_id: from
          }],
          messages: [{
            from: from,
            id: `wamid.${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: { body: text },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    await axios.post(WEBHOOK_URL, payload);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate button click
app.post('/simulate/button', async (req, res) => {
  const { from, buttonId, buttonText } = req.body;
  
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15551234567',
            phone_number_id: 'PHONE_NUMBER_ID'
          },
          contacts: [{
            profile: { name: 'Test User' },
            wa_id: from
          }],
          messages: [{
            from: from,
            id: `wamid.${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'interactive',
            interactive: {
              type: 'button_reply',
              button_reply: {
                id: buttonId,
                title: buttonText
              }
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    await axios.post(WEBHOOK_URL, payload);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulate image message
app.post('/simulate/image', async (req, res) => {
  const { from, imageUrl, caption } = req.body;
  
  const payload = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15551234567',
            phone_number_id: 'PHONE_NUMBER_ID'
          },
          contacts: [{
            profile: { name: 'Test User' },
            wa_id: from
          }],
          messages: [{
            from: from,
            id: `wamid.${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            type: 'image',
            image: {
              mime_type: 'image/jpeg',
              sha256: 'abc123',
              id: 'MEDIA_ID',
              caption: caption
            }
          }]
        },
        field: 'messages'
      }]
    }]
  };

  try {
    await axios.post(WEBHOOK_URL, payload);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3002, () => {
  console.log('WhatsApp Simulator running on http://localhost:3002');
});
```

## Task 2.3: Code Quality Tools Setup
| Attribute | Details |
|-----------|---------|
| **Description** | Configure linting, formatting, and pre-commit hooks |
| **Acceptance Criteria** | - ESLint + Prettier for TypeScript<br>- Black + Ruff for Python<br>- Husky pre-commit hooks<br>- Conventional commits enforced |
| **Required Roles** | Senior Developer, Tech Lead |
| **Estimated Effort** | 1 day |
| **Dependencies** | Task 2.1 |
| **Tools** | ESLint, Prettier, Husky, Black, Ruff |
| **Risks/Blockers** | Developer adoption |

## Task 2.4: WhatsApp Testing with ngrok
| Attribute | Details |
|-----------|---------|
| **Description** | Setup ngrok for testing with real WhatsApp messages |
| **Acceptance Criteria** | - ngrok tunnel configured<br>- Meta webhook pointing to ngrok<br>- Test messages flowing through<br>- Documentation for team |
| **Required Roles** | DevOps Engineer, Backend Developer |
| **Estimated Effort** | 1 day |
| **Dependencies** | Task 1.2, 2.2 |
| **Tools** | ngrok, Meta Developer Console |
| **Risks/Blockers** | ngrok session limits on free tier |

### ngrok Configuration

```yaml
# ngrok.yml (example)
version: "2"
authtoken: <your-ngrok-token>
tunnels:
  whatsapp:
    proto: http
    addr: 3001
    hostname: petvet-dev.ngrok.io  # Requires paid plan for stable hostname
```

```bash
# scripts/setup-ngrok.sh
#!/bin/bash

# Start ngrok tunnel
ngrok http 3001 --domain=petvet-dev.ngrok.io &

# Wait for tunnel
sleep 5

# Get public URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

echo "======================================"
echo "ngrok tunnel is running!"
echo "Public URL: $NGROK_URL"
echo ""
echo "Update your Meta webhook URL to:"
echo "$NGROK_URL/webhooks/whatsapp"
echo "======================================"
```

## Task 2.5: Developer Documentation
| Attribute | Details |
|-----------|---------|
| **Description** | Create onboarding documentation for WhatsApp-first development |
| **Acceptance Criteria** | - README with quickstart<br>- WhatsApp testing guide<br>- Message flow diagrams<br>- Contributing guidelines |
| **Required Roles** | Tech Lead, Senior Developer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 2.2, 2.4 |
| **Tools** | Markdown, Mermaid diagrams |
| **Risks/Blockers** | Documentation maintenance |

---

# Phase 3: CI/CD Pipeline

**Duration**: 3 weeks | **Priority**: P0 (Critical)

## Task 3.1: CI Pipeline - Build & Test
| Attribute | Details |
|-----------|---------|
| **Description** | Create GitHub Actions workflow for continuous integration |
| **Acceptance Criteria** | - Automated build on every PR<br>- Unit tests execution<br>- Linting and type checking<br>- Coverage reporting |
| **Required Roles** | DevOps Engineer, Senior Developer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Phase 2 |
| **Tools** | GitHub Actions, Jest, pytest |
| **Risks/Blockers** | Test infrastructure complexity |

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

env:
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.11'

jobs:
  # Lint and type check all packages
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint TypeScript packages
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

      - uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'
      
      - name: Install Python dependencies
        run: pip install -r packages/ai-services/requirements.txt
      
      - name: Lint Python
        run: |
          cd packages/ai-services
          ruff check .
          black --check .

  # Test WhatsApp Handler
  test-whatsapp-handler:
    runs-on: ubuntu-latest
    needs: lint
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:whatsapp-handler
        env:
          REDIS_URL: redis://localhost:6379
          NODE_ENV: test
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./packages/whatsapp-handler/coverage/lcov.info
          flags: whatsapp-handler

  # Test Core API
  test-api:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: petvet_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/petvet_test
      
      - name: Run tests
        run: npm run test:api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/petvet_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
          NODE_ENV: test
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./packages/api/coverage/lcov.info
          flags: api

  # Test AI Services
  test-ai-services:
    runs-on: ubuntu-latest
    needs: lint
    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
          cache: 'pip'
      
      - name: Install dependencies
        run: pip install -r packages/ai-services/requirements.txt
      
      - name: Run tests
        run: |
          cd packages/ai-services
          pytest --cov=src --cov-report=xml
        env:
          REDIS_URL: redis://localhost:6379
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY_TEST }}
      
      - uses: codecov/codecov-action@v3
        with:
          files: ./packages/ai-services/coverage.xml
          flags: ai-services

  # Build Docker images
  build:
    runs-on: ubuntu-latest
    needs: [test-whatsapp-handler, test-api, test-ai-services]
    steps:
      - uses: actions/checkout@v4
      
      - uses: docker/setup-buildx-action@v3
      
      - name: Build WhatsApp Handler
        uses: docker/build-push-action@v5
        with:
          context: ./packages/whatsapp-handler
          push: false
          tags: petvet-whatsapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build API
        uses: docker/build-push-action@v5
        with:
          context: ./packages/api
          push: false
          tags: petvet-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build AI Services
        uses: docker/build-push-action@v5
        with:
          context: ./packages/ai-services
          push: false
          tags: petvet-ai:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Task 3.2: CD Pipeline - Staging
| Attribute | Details |
|-----------|---------|
| **Description** | Create deployment pipeline to staging environment |
| **Acceptance Criteria** | - Automated deploy on merge to develop<br>- Database migrations executed<br>- WhatsApp webhook updated<br>- Health checks validated |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Task 3.1, Phase 4 (partial) |
| **Tools** | GitHub Actions, AWS CLI, Docker |
| **Risks/Blockers** | AWS permissions setup |

### Staging Deployment Workflow

```yaml
# .github/workflows/cd-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
  ECS_CLUSTER: petvet-staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push WhatsApp Handler
        run: |
          docker build -t $ECR_REGISTRY/petvet-whatsapp:${{ github.sha }} ./packages/whatsapp-handler
          docker push $ECR_REGISTRY/petvet-whatsapp:${{ github.sha }}
          docker tag $ECR_REGISTRY/petvet-whatsapp:${{ github.sha }} $ECR_REGISTRY/petvet-whatsapp:staging
          docker push $ECR_REGISTRY/petvet-whatsapp:staging

      - name: Build and push API
        run: |
          docker build -t $ECR_REGISTRY/petvet-api:${{ github.sha }} ./packages/api
          docker push $ECR_REGISTRY/petvet-api:${{ github.sha }}
          docker tag $ECR_REGISTRY/petvet-api:${{ github.sha }} $ECR_REGISTRY/petvet-api:staging
          docker push $ECR_REGISTRY/petvet-api:staging

      - name: Build and push AI Services
        run: |
          docker build -t $ECR_REGISTRY/petvet-ai:${{ github.sha }} ./packages/ai-services
          docker push $ECR_REGISTRY/petvet-ai:${{ github.sha }}
          docker tag $ECR_REGISTRY/petvet-ai:${{ github.sha }} $ECR_REGISTRY/petvet-ai:staging
          docker push $ECR_REGISTRY/petvet-ai:staging

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster $ECS_CLUSTER \
            --task-definition petvet-migration-staging \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.STAGING_SUBNET_ID }}],securityGroups=[${{ secrets.STAGING_SG_ID }}],assignPublicIp=ENABLED}" \
            --overrides '{"containerOverrides":[{"name":"migration","command":["npm","run","db:migrate"]}]}'
          
          # Wait for migration to complete
          sleep 30

      - name: Update ECS services
        run: |
          # Update WhatsApp Handler
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service petvet-whatsapp-staging \
            --force-new-deployment
          
          # Update API
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service petvet-api-staging \
            --force-new-deployment
          
          # Update AI Services
          aws ecs update-service \
            --cluster $ECS_CLUSTER \
            --service petvet-ai-staging \
            --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster $ECS_CLUSTER \
            --services petvet-whatsapp-staging petvet-api-staging petvet-ai-staging

      - name: Verify health
        run: |
          # Check WhatsApp handler health
          curl -f https://staging-whatsapp.petvet.ai/health || exit 1
          
          # Check API health
          curl -f https://staging-api.petvet.ai/health || exit 1
          
          # Check AI services health
          curl -f https://staging-ai.petvet.ai/health || exit 1

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && '✅' || '❌' }} Staging deployment ${{ job.status }}: ${{ github.sha }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Task 3.3: CD Pipeline - Production
| Attribute | Details |
|-----------|---------|
| **Description** | Create deployment pipeline to production with approval gate |
| **Acceptance Criteria** | - Manual approval required<br>- Blue-green deployment<br>- WhatsApp webhook failover<br>- Rollback capability |
| **Required Roles** | DevOps Engineer, Tech Lead |
| **Estimated Effort** | 4 days |
| **Dependencies** | Task 3.2 |
| **Tools** | GitHub Actions, AWS CodeDeploy |
| **Risks/Blockers** | Production complexity |

### Production Deployment Workflow

```yaml
# .github/workflows/cd-production.yml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: 
      name: production
      url: https://api.petvet.ai
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1

      - name: Get release version
        id: version
        run: echo "tag=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Tag and push production images
        env:
          VERSION: ${{ steps.version.outputs.tag }}
        run: |
          # Pull staging images and tag for production
          docker pull $ECR_REGISTRY/petvet-whatsapp:staging
          docker pull $ECR_REGISTRY/petvet-api:staging
          docker pull $ECR_REGISTRY/petvet-ai:staging
          
          # Tag with version and production
          docker tag $ECR_REGISTRY/petvet-whatsapp:staging $ECR_REGISTRY/petvet-whatsapp:$VERSION
          docker tag $ECR_REGISTRY/petvet-whatsapp:staging $ECR_REGISTRY/petvet-whatsapp:production
          docker tag $ECR_REGISTRY/petvet-api:staging $ECR_REGISTRY/petvet-api:$VERSION
          docker tag $ECR_REGISTRY/petvet-api:staging $ECR_REGISTRY/petvet-api:production
          docker tag $ECR_REGISTRY/petvet-ai:staging $ECR_REGISTRY/petvet-ai:$VERSION
          docker tag $ECR_REGISTRY/petvet-ai:staging $ECR_REGISTRY/petvet-ai:production
          
          # Push
          docker push $ECR_REGISTRY/petvet-whatsapp:$VERSION
          docker push $ECR_REGISTRY/petvet-whatsapp:production
          docker push $ECR_REGISTRY/petvet-api:$VERSION
          docker push $ECR_REGISTRY/petvet-api:production
          docker push $ECR_REGISTRY/petvet-ai:$VERSION
          docker push $ECR_REGISTRY/petvet-ai:production

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster petvet-production \
            --task-definition petvet-migration-prod \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.PROD_SUBNET_ID }}],securityGroups=[${{ secrets.PROD_SG_ID }}]}"
          
          sleep 60  # Wait for migration

      - name: Blue-Green deployment
        run: |
          # Deploy to green environment first
          aws ecs update-service \
            --cluster petvet-production \
            --service petvet-whatsapp-green \
            --task-definition petvet-whatsapp-prod \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster petvet-production \
            --service petvet-api-green \
            --task-definition petvet-api-prod \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster petvet-production \
            --service petvet-ai-green \
            --task-definition petvet-ai-prod \
            --force-new-deployment
          
          # Wait for green to be healthy
          aws ecs wait services-stable \
            --cluster petvet-production \
            --services petvet-whatsapp-green petvet-api-green petvet-ai-green

      - name: Health check green environment
        run: |
          curl -f https://green.petvet.ai/health || exit 1

      - name: Switch traffic to green
        run: |
          # Update ALB target group weights
          aws elbv2 modify-rule \
            --rule-arn ${{ secrets.ALB_RULE_ARN }} \
            --actions '[{"Type":"forward","ForwardConfig":{"TargetGroups":[{"TargetGroupArn":"${{ secrets.GREEN_TG_ARN }}","Weight":100},{"TargetGroupArn":"${{ secrets.BLUE_TG_ARN }}","Weight":0}]}}]'

      - name: Verify production
        run: |
          sleep 30
          
          # Verify WhatsApp webhook is responding
          curl -f "https://whatsapp.petvet.ai/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${{ secrets.WHATSAPP_VERIFY_TOKEN }}&hub.challenge=test" || exit 1
          
          # Verify API
          curl -f https://api.petvet.ai/health || exit 1

      - name: Update blue environment
        if: success()
        run: |
          # Update blue to match green for next deployment
          aws ecs update-service \
            --cluster petvet-production \
            --service petvet-whatsapp-blue \
            --task-definition petvet-whatsapp-prod \
            --force-new-deployment

      - name: Rollback on failure
        if: failure()
        run: |
          # Switch traffic back to blue
          aws elbv2 modify-rule \
            --rule-arn ${{ secrets.ALB_RULE_ARN }} \
            --actions '[{"Type":"forward","ForwardConfig":{"TargetGroups":[{"TargetGroupArn":"${{ secrets.BLUE_TG_ARN }}","Weight":100},{"TargetGroupArn":"${{ secrets.GREEN_TG_ARN }}","Weight":0}]}}]'

      - name: Notify team
        if: always()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "${{ job.status == 'success' && '🚀' || '🚨' }} Production deployment ${{ job.status }}: ${{ steps.version.outputs.tag }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Task 3.4: Scheduled Jobs Pipeline
| Attribute | Details |
|-----------|---------|
| **Description** | Configure scheduled jobs for reminders and maintenance |
| **Acceptance Criteria** | - Daily reminder processor<br>- Weekly cleanup jobs<br>- Monthly subscription renewal checks<br>- Error handling and alerts |
| **Required Roles** | DevOps Engineer, Backend Developer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 3.1 |
| **Tools** | GitHub Actions, AWS EventBridge |
| **Risks/Blockers** | Job timing and reliability |

### Scheduled Jobs Workflow

```yaml
# .github/workflows/scheduled-jobs.yml
name: Scheduled Jobs

on:
  schedule:
    # Process reminders every hour
    - cron: '0 * * * *'
  workflow_dispatch:
    inputs:
      job_type:
        description: 'Job to run'
        required: true
        type: choice
        options:
          - reminders
          - cleanup
          - subscription-check

jobs:
  process-reminders:
    if: github.event.schedule == '0 * * * *' || github.event.inputs.job_type == 'reminders'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger reminder processor
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.API_INTERNAL_TOKEN }}" \
            https://api.petvet.ai/internal/jobs/process-reminders

  cleanup:
    if: github.event.schedule == '0 3 * * 0' || github.event.inputs.job_type == 'cleanup'  # Sundays at 3 AM
    runs-on: ubuntu-latest
    steps:
      - name: Run cleanup jobs
        run: |
          # Clean expired sessions
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.API_INTERNAL_TOKEN }}" \
            https://api.petvet.ai/internal/jobs/cleanup-sessions
          
          # Archive old consultations
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.API_INTERNAL_TOKEN }}" \
            https://api.petvet.ai/internal/jobs/archive-consultations
```

## Task 3.5: Security Scanning Integration
| Attribute | Details |
|-----------|---------|
| **Description** | Integrate security scanning into CI pipeline |
| **Acceptance Criteria** | - SAST with CodeQL<br>- Dependency scanning with Dependabot<br>- Container scanning with Trivy<br>- WhatsApp webhook security validated |
| **Required Roles** | Security Engineer, DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 3.1 |
| **Tools** | CodeQL, Trivy, Dependabot |
| **Risks/Blockers** | False positive management |

---

# Phase 4: Infrastructure Setup

**Duration**: 4 weeks | **Priority**: P0 (Critical)

## Task 4.1: Terraform Foundation
| Attribute | Details |
|-----------|---------|
| **Description** | Create Infrastructure as Code foundation with Terraform |
| **Acceptance Criteria** | - Remote state in S3<br>- Environment separation<br>- Module structure defined<br>- WhatsApp webhook endpoint planned |
| **Required Roles** | DevOps Engineer, Cloud Architect |
| **Estimated Effort** | 3 days |
| **Dependencies** | AWS account setup |
| **Tools** | Terraform, AWS |
| **Risks/Blockers** | State management complexity |

### Terraform Structure

```
infrastructure/terraform/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── rds.tf
│   │   ├── elasticache.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── compute/
│   │   ├── ecs-cluster.tf
│   │   ├── ecs-whatsapp.tf      # WhatsApp handler service
│   │   ├── ecs-api.tf           # Core API service
│   │   ├── ecs-ai.tf            # AI services
│   │   ├── alb.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── storage/
│   │   ├── s3.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/
│       ├── cloudwatch.tf
│       ├── alarms.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── backend.tf
└── versions.tf
```

## Task 4.2: VPC & Networking
| Attribute | Details |
|-----------|---------|
| **Description** | Create VPC with public/private subnets optimized for WhatsApp webhooks |
| **Acceptance Criteria** | - VPC with 3 AZs<br>- Public subnets for ALB (WhatsApp webhooks)<br>- Private subnets for ECS/RDS<br>- NAT Gateway for outbound |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 4.1 |
| **Tools** | Terraform, AWS VPC |
| **Risks/Blockers** | CIDR planning |

### VPC Module

```hcl
# modules/networking/main.tf
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "petvet-${var.environment}"
  cidr = var.vpc_cidr  # 10.0.0.0/16

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment != "production"
  enable_dns_hostnames   = true
  enable_dns_support     = true

  # Tags for ECS/ALB integration
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# Security group for WhatsApp webhook (public facing)
resource "aws_security_group" "whatsapp_webhook" {
  name        = "petvet-whatsapp-webhook-${var.environment}"
  description = "Security group for WhatsApp webhook endpoint"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTPS from Meta (WhatsApp)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [
      # Meta/Facebook IP ranges (should be updated periodically)
      "157.240.0.0/16",
      "31.13.0.0/16",
      "179.60.192.0/22",
      "66.220.144.0/20"
    ]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "petvet-whatsapp-webhook-${var.environment}"
  }
}
```

## Task 4.3: Database Infrastructure
| Attribute | Details |
|-----------|---------|
| **Description** | Provision PostgreSQL RDS and Redis ElastiCache |
| **Acceptance Criteria** | - RDS Multi-AZ for production<br>- Redis for WhatsApp sessions<br>- Automated backups<br>- Proper security groups |
| **Required Roles** | DevOps Engineer, DBA |
| **Estimated Effort** | 3 days |
| **Dependencies** | Task 4.2 |
| **Tools** | Terraform, AWS RDS, ElastiCache |
| **Risks/Blockers** | Instance sizing |

### Database Module

```hcl
# modules/database/rds.tf
resource "aws_db_instance" "main" {
  identifier = "petvet-${var.environment}"

  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_storage_size
  storage_type         = "gp3"
  storage_encrypted    = true

  db_name  = "petvet"
  username = var.db_username
  password = var.db_password

  multi_az               = var.environment == "production"
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot     = var.environment != "production"
  deletion_protection     = var.environment == "production"

  performance_insights_enabled = true

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# modules/database/elasticache.tf
resource "aws_elasticache_replication_group" "main" {
  replication_group_id = "petvet-${var.environment}"
  description          = "Redis for PetVet WhatsApp sessions and cache"

  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = var.environment == "production"

  # Important for WhatsApp session management
  parameter_group_name = aws_elasticache_parameter_group.main.name

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_elasticache_parameter_group" "main" {
  name   = "petvet-redis-${var.environment}"
  family = "redis7"

  # Optimize for session storage
  parameter {
    name  = "maxmemory-policy"
    value = "volatile-lru"  # Evict keys with TTL when memory is full
  }
}
```

## Task 4.4: ECS Cluster & Services
| Attribute | Details |
|-----------|---------|
| **Description** | Create ECS Fargate cluster with WhatsApp handler, API, and AI services |
| **Acceptance Criteria** | - ECS cluster with Fargate<br>- WhatsApp handler service (high availability)<br>- API service<br>- AI services<br>- Auto-scaling configured |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 5 days |
| **Dependencies** | Task 4.2, 4.3 |
| **Tools** | Terraform, AWS ECS |
| **Risks/Blockers** | Container resource optimization |

### ECS WhatsApp Handler Service

```hcl
# modules/compute/ecs-whatsapp.tf

resource "aws_ecs_task_definition" "whatsapp" {
  family                   = "petvet-whatsapp-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.whatsapp_cpu
  memory                   = var.whatsapp_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "whatsapp-handler"
      image = "${var.ecr_repository_url}/petvet-whatsapp:${var.image_tag}"
      
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "PORT", value = "3001" },
        { name = "API_URL", value = "http://petvet-api.${var.environment}.local:3000" },
        { name = "AI_SERVICES_URL", value = "http://petvet-ai.${var.environment}.local:8000" }
      ]

      secrets = [
        { name = "WHATSAPP_VERIFY_TOKEN", valueFrom = "${aws_secretsmanager_secret.whatsapp.arn}:verify_token::" },
        { name = "WHATSAPP_ACCESS_TOKEN", valueFrom = "${aws_secretsmanager_secret.whatsapp.arn}:access_token::" },
        { name = "WHATSAPP_PHONE_NUMBER_ID", valueFrom = "${aws_secretsmanager_secret.whatsapp.arn}:phone_number_id::" },
        { name = "REDIS_URL", valueFrom = aws_secretsmanager_secret.redis_url.arn }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/petvet-whatsapp-${var.environment}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "whatsapp"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

resource "aws_ecs_service" "whatsapp" {
  name            = "petvet-whatsapp-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.whatsapp.arn
  desired_count   = var.whatsapp_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.whatsapp_service.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.whatsapp.arn
    container_name   = "whatsapp-handler"
    container_port   = 3001
  }

  # Service discovery for internal communication
  service_registries {
    registry_arn = aws_service_discovery_service.whatsapp.arn
  }

  deployment_configuration {
    minimum_healthy_percent = 100
    maximum_percent         = 200
  }

  # Important: Enable circuit breaker for faster failure detection
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# Auto scaling for WhatsApp handler
resource "aws_appautoscaling_target" "whatsapp" {
  max_capacity       = var.whatsapp_max_count
  min_capacity       = var.whatsapp_min_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.whatsapp.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "whatsapp_cpu" {
  name               = "whatsapp-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.whatsapp.resource_id
  scalable_dimension = aws_appautoscaling_target.whatsapp.scalable_dimension
  service_namespace  = aws_appautoscaling_target.whatsapp.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 60.0  # Lower threshold for WhatsApp responsiveness
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
```

## Task 4.5: Load Balancer Configuration
| Attribute | Details |
|-----------|---------|
| **Description** | Configure ALB with WhatsApp webhook endpoint |
| **Acceptance Criteria** | - ALB with HTTPS<br>- WhatsApp webhook path routing<br>- Health check endpoints<br>- SSL certificate via ACM |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 4.4 |
| **Tools** | Terraform, AWS ALB, ACM |
| **Risks/Blockers** | DNS and certificate setup |

### ALB Configuration

```hcl
# modules/compute/alb.tf

resource "aws_lb" "main" {
  name               = "petvet-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production"

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

# HTTPS Listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}

# WhatsApp webhook routing rule
resource "aws_lb_listener_rule" "whatsapp_webhook" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.whatsapp.arn
  }

  condition {
    path_pattern {
      values = ["/webhooks/whatsapp", "/webhooks/whatsapp/*"]
    }
  }

  condition {
    host_header {
      values = ["whatsapp.petvet.ai", "whatsapp-${var.environment}.petvet.ai"]
    }
  }
}

# API routing rule
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    host_header {
      values = ["api.petvet.ai", "api-${var.environment}.petvet.ai"]
    }
  }
}

# Target groups
resource "aws_lb_target_group" "whatsapp" {
  name        = "petvet-whatsapp-${var.environment}"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 15
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  # Important for WhatsApp webhook response times
  deregistration_delay = 30

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}

resource "aws_lb_target_group" "api" {
  name        = "petvet-api-${var.environment}"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 3
  }

  tags = {
    Project     = "petvet"
    Environment = var.environment
  }
}
```

## Task 4.6: S3 Storage Configuration
| Attribute | Details |
|-----------|---------|
| **Description** | Create S3 buckets for media, documents, and backups |
| **Acceptance Criteria** | - Media bucket with lifecycle policies<br>- Prescription PDFs bucket<br>- Backup bucket with versioning<br>- CORS for WhatsApp media uploads |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 1 day |
| **Dependencies** | Task 4.1 |
| **Tools** | Terraform, AWS S3 |
| **Risks/Blockers** | Public access misconfiguration |

### S3 Module

```hcl
# modules/storage/s3.tf

# Media bucket (pet photos, consultation images)
resource "aws_s3_bucket" "media" {
  bucket = "petvet-media-${var.environment}-${var.aws_account_id}"
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Prescriptions bucket (PDF storage)
resource "aws_s3_bucket" "prescriptions" {
  bucket = "petvet-prescriptions-${var.environment}-${var.aws_account_id}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "prescriptions" {
  bucket = aws_s3_bucket.prescriptions.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "prescriptions" {
  bucket = aws_s3_bucket.prescriptions.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

## Task 4.7: Secrets Management
| Attribute | Details |
|-----------|---------|
| **Description** | Configure AWS Secrets Manager for sensitive data |
| **Acceptance Criteria** | - WhatsApp API credentials stored<br>- LLM API keys stored<br>- Database credentials with rotation<br>- Stripe keys stored |
| **Required Roles** | DevOps Engineer, Security Engineer |
| **Estimated Effort** | 1 day |
| **Dependencies** | Task 4.1 |
| **Tools** | Terraform, AWS Secrets Manager |
| **Risks/Blockers** | Secret rotation complexity |

---

# Phase 5: Application Development

**Duration**: 6 weeks | **Priority**: P0 (Critical)

## Task 5.1: WhatsApp Handler - Webhook Implementation
| Attribute | Details |
|-----------|---------|
| **Description** | Implement WhatsApp webhook receiver and message processing |
| **Acceptance Criteria** | - Webhook verification endpoint<br>- Message type handlers (text, image, interactive)<br>- Signature validation<br>- Async processing queue |
| **Required Roles** | Backend Developer (2) |
| **Estimated Effort** | 8 days |
| **Dependencies** | Task 1.2, Phase 4 |
| **Tools** | Node.js, Express, Bull queue |
| **Risks/Blockers** | WhatsApp API rate limits |

### WhatsApp Webhook Handler

```typescript
// packages/whatsapp-handler/src/webhooks/whatsapp.controller.ts
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { messageQueue } from '../queues/message.queue';
import { logger } from '../utils/logger';

const router = Router();

// Webhook verification (GET)
router.get('/webhooks/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  
  logger.warn('WhatsApp webhook verification failed', { mode, token });
  return res.sendStatus(403);
});

// Webhook receiver (POST)
router.post('/webhooks/whatsapp', async (req: Request, res: Response) => {
  // Validate signature
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!validateSignature(req.body, signature)) {
    logger.warn('Invalid webhook signature');
    return res.sendStatus(401);
  }

  // Acknowledge immediately (Meta requires <20s response)
  res.sendStatus(200);

  // Process asynchronously
  try {
    const { entry } = req.body;
    
    for (const entryItem of entry) {
      for (const change of entryItem.changes) {
        if (change.field === 'messages') {
          const { messages, contacts, metadata } = change.value;
          
          if (messages) {
            for (const message of messages) {
              await messageQueue.add('process-message', {
                message,
                contact: contacts?.[0],
                metadata,
                receivedAt: new Date().toISOString()
              }, {
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 1000
                }
              });
            }
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error queuing webhook message', { error });
  }
});

function validateSignature(body: any, signature: string): boolean {
  if (!signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

export default router;
```

### Message Processor

```typescript
// packages/whatsapp-handler/src/handlers/message.handler.ts
import { Job } from 'bull';
import { sessionService } from '../services/session.service';
import { flowEngine } from '../flows/engine';
import { whatsappClient } from '../clients/whatsapp.client';
import { logger } from '../utils/logger';

interface MessageJob {
  message: WhatsAppMessage;
  contact: WhatsAppContact;
  metadata: WhatsAppMetadata;
  receivedAt: string;
}

export async function processMessage(job: Job<MessageJob>) {
  const { message, contact, metadata } = job.data;
  
  logger.info('Processing message', { 
    messageId: message.id, 
    from: message.from,
    type: message.type 
  });

  try {
    // Get or create session
    const session = await sessionService.getOrCreate(message.from, {
      contactName: contact?.profile?.name,
      phoneNumberId: metadata.phone_number_id
    });

    // Extract message content based on type
    const content = extractContent(message);

    // Process through flow engine
    const response = await flowEngine.process({
      session,
      messageType: message.type,
      content,
      messageId: message.id
    });

    // Send response(s)
    for (const responseMessage of response.messages) {
      await whatsappClient.sendMessage(message.from, responseMessage);
      
      // Respect rate limits
      await sleep(100);
    }

    // Update session state
    await sessionService.update(session.id, response.newState);

    logger.info('Message processed successfully', { messageId: message.id });
  } catch (error) {
    logger.error('Error processing message', { 
      messageId: message.id, 
      error 
    });
    throw error;
  }
}

function extractContent(message: WhatsAppMessage): MessageContent {
  switch (message.type) {
    case 'text':
      return { type: 'text', text: message.text.body };
    
    case 'image':
      return { 
        type: 'image', 
        mediaId: message.image.id,
        caption: message.image.caption 
      };
    
    case 'interactive':
      if (message.interactive.type === 'button_reply') {
        return { 
          type: 'button', 
          buttonId: message.interactive.button_reply.id,
          buttonText: message.interactive.button_reply.title
        };
      }
      if (message.interactive.type === 'list_reply') {
        return {
          type: 'list',
          listId: message.interactive.list_reply.id,
          listTitle: message.interactive.list_reply.title
        };
      }
      break;
    
    case 'document':
      return {
        type: 'document',
        mediaId: message.document.id,
        filename: message.document.filename,
        mimeType: message.document.mime_type
      };
  }
  
  return { type: 'unknown' };
}
```

## Task 5.2: WhatsApp Handler - Conversation Flows
| Attribute | Details |
|-----------|---------|
| **Description** | Implement conversation flow engine for structured interactions |
| **Acceptance Criteria** | - Main menu flow<br>- Pet registration flow<br>- Consultation flow<br>- Subscription flow<br>- Flow state persistence |
| **Required Roles** | Backend Developer |
| **Estimated Effort** | 10 days |
| **Dependencies** | Task 5.1 |
| **Tools** | Node.js, Redis |
| **Risks/Blockers** | Flow complexity |

### Flow Engine

```typescript
// packages/whatsapp-handler/src/flows/engine.ts
import { Redis } from 'ioredis';
import { mainMenuFlow } from './main-menu.flow';
import { consultationFlow } from './consultation.flow';
import { petRegistrationFlow } from './pet-registration.flow';
import { subscriptionFlow } from './subscription.flow';
import { logger } from '../utils/logger';

interface FlowContext {
  session: Session;
  messageType: string;
  content: MessageContent;
  messageId: string;
}

interface FlowResult {
  messages: WhatsAppOutboundMessage[];
  newState: SessionState;
}

const flows: Record<string, Flow> = {
  'main-menu': mainMenuFlow,
  'consultation': consultationFlow,
  'pet-registration': petRegistrationFlow,
  'subscription': subscriptionFlow
};

export const flowEngine = {
  async process(context: FlowContext): Promise<FlowResult> {
    const { session, content } = context;
    
    // Determine current flow
    const currentFlowName = session.state.currentFlow || 'main-menu';
    const currentFlow = flows[currentFlowName];
    
    if (!currentFlow) {
      logger.error('Unknown flow', { flowName: currentFlowName });
      return this.handleError(context);
    }

    // Check for global commands
    if (content.type === 'text') {
      const globalResult = await this.handleGlobalCommands(content.text, context);
      if (globalResult) return globalResult;
    }

    // Process through current flow
    try {
      return await currentFlow.process(context);
    } catch (error) {
      logger.error('Flow processing error', { error, flow: currentFlowName });
      return this.handleError(context);
    }
  },

  async handleGlobalCommands(text: string, context: FlowContext): Promise<FlowResult | null> {
    const normalized = text.toLowerCase().trim();
    
    // Menu command
    if (['menu', 'início', 'inicio', 'voltar'].includes(normalized)) {
      return mainMenuFlow.showMenu(context);
    }
    
    // Help command
    if (['ajuda', 'help', '?'].includes(normalized)) {
      return this.showHelp(context);
    }
    
    // Cancel command
    if (['cancelar', 'sair', 'cancel'].includes(normalized)) {
      return mainMenuFlow.showMenu(context, 'Operação cancelada.');
    }
    
    return null;
  },

  showHelp(context: FlowContext): FlowResult {
    return {
      messages: [{
        type: 'text',
        text: `🆘 *Ajuda - PetVet AI*\n\n` +
              `Comandos disponíveis:\n` +
              `• *menu* - Voltar ao menu principal\n` +
              `• *ajuda* - Mostrar esta mensagem\n` +
              `• *cancelar* - Cancelar operação atual\n\n` +
              `Para iniciar uma consulta, envie "menu" e selecione "Nova Consulta".\n\n` +
              `Dúvidas? Envie um email para suporte@petvet.ai`
      }],
      newState: context.session.state
    };
  },

  handleError(context: FlowContext): FlowResult {
    return {
      messages: [{
        type: 'text',
        text: `😔 Desculpe, ocorreu um erro. Por favor, tente novamente.\n\n` +
              `Digite *menu* para voltar ao início.`
      }],
      newState: { ...context.session.state, currentFlow: 'main-menu', currentStep: null }
    };
  }
};
```

### Consultation Flow

```typescript
// packages/whatsapp-handler/src/flows/consultation.flow.ts
import { apiClient } from '../clients/api.client';
import { aiClient } from '../clients/ai.client';
import { whatsappClient } from '../clients/whatsapp.client';

interface ConsultationState {
  currentFlow: 'consultation';
  currentStep: 'select-pet' | 'describe-symptoms' | 'clarifying-questions' | 'show-diagnosis' | 'treatment';
  selectedPetId?: string;
  symptoms?: string;
  clarifyingAnswers?: string[];
  consultationId?: string;
}

export const consultationFlow: Flow = {
  async process(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;
    const step = state.currentStep || 'select-pet';

    switch (step) {
      case 'select-pet':
        return this.handlePetSelection(context);
      case 'describe-symptoms':
        return this.handleSymptomDescription(context);
      case 'clarifying-questions':
        return this.handleClarifyingAnswers(context);
      case 'show-diagnosis':
        return this.handleDiagnosisResponse(context);
      case 'treatment':
        return this.handleTreatmentResponse(context);
      default:
        return this.startConsultation(context);
    }
  },

  async startConsultation(context: FlowContext): Promise<FlowResult> {
    // Fetch user's pets
    const pets = await apiClient.getPets(context.session.userId);
    
    if (pets.length === 0) {
      return {
        messages: [{
          type: 'text',
          text: `Você ainda não tem nenhum pet cadastrado. Vamos cadastrar agora?`
        }, {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Para fazer uma consulta, primeiro precisamos conhecer seu pet.' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'register-pet', title: '➕ Cadastrar Pet' } },
                { type: 'reply', reply: { id: 'menu', title: '🏠 Menu' } }
              ]
            }
          }
        }],
        newState: { currentFlow: 'pet-registration', currentStep: 'start' }
      };
    }

    // Show pet selection
    const petButtons = pets.slice(0, 3).map(pet => ({
      type: 'reply',
      reply: {
        id: `pet-${pet.id}`,
        title: `${pet.species === 'dog' ? '🐕' : '🐈'} ${pet.name}`
      }
    }));

    return {
      messages: [{
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: 'Para qual pet é a consulta?' },
          action: { buttons: petButtons }
        }
      }],
      newState: { 
        currentFlow: 'consultation', 
        currentStep: 'select-pet',
        pets: pets.map(p => ({ id: p.id, name: p.name }))
      }
    };
  },

  async handleSymptomDescription(context: FlowContext): Promise<FlowResult> {
    if (context.content.type !== 'text') {
      return {
        messages: [{
          type: 'text',
          text: 'Por favor, descreva os sintomas em texto. Você também pode enviar fotos depois.'
        }],
        newState: context.session.state
      };
    }

    const symptoms = context.content.text;
    const state = context.session.state as ConsultationState;

    // Start consultation in backend
    const consultation = await apiClient.startConsultation({
      petId: state.selectedPetId!,
      symptoms
    });

    // Send typing indicator
    await whatsappClient.sendTyping(context.session.phoneNumber);

    // Get AI analysis with clarifying questions
    const analysis = await aiClient.analyzeSymptoms({
      symptoms,
      petId: state.selectedPetId!,
      consultationId: consultation.id
    });

    if (analysis.needsClarification) {
      return {
        messages: [{
          type: 'text',
          text: `Entendi. Para um diagnóstico mais preciso, preciso de algumas informações:\n\n` +
                analysis.clarifyingQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
        }],
        newState: {
          ...state,
          currentStep: 'clarifying-questions',
          consultationId: consultation.id,
          symptoms,
          pendingQuestions: analysis.clarifyingQuestions
        }
      };
    }

    // Skip to diagnosis if no clarification needed
    return this.showDiagnosis(context, analysis.diagnosis, consultation.id);
  },

  async showDiagnosis(context: FlowContext, diagnosis: Diagnosis, consultationId: string): Promise<FlowResult> {
    const urgencyEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      emergency: '🔴'
    };

    const diagnosisMessage = 
      `${urgencyEmoji[diagnosis.urgencyLevel]} *ANÁLISE CLÍNICA*\n\n` +
      `📋 *Diagnósticos Diferenciais:*\n` +
      diagnosis.differentials.map((d, i) => `${i + 1}. ${d.condition} (${d.probability}%)`).join('\n') +
      `\n\n🔍 *Diagnóstico Mais Provável:*\n${diagnosis.primary}\n\n` +
      `⚠️ *Nível de Urgência:* ${diagnosis.urgencyLevel.toUpperCase()}`;

    return {
      messages: [
        { type: 'text', text: diagnosisMessage },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'O que você gostaria de fazer?' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'show-treatment', title: '💊 Ver Tratamento' } },
                { type: 'reply', reply: { id: 'get-prescription', title: '📄 Gerar Receita' } },
                { type: 'reply', reply: { id: 'menu', title: '🏠 Menu' } }
              ]
            }
          }
        }
      ],
      newState: {
        currentFlow: 'consultation',
        currentStep: 'show-diagnosis',
        consultationId,
        diagnosis
      }
    };
  },

  async showTreatment(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;
    
    // Get treatment protocol from AI
    const treatment = await aiClient.getTreatmentProtocol({
      consultationId: state.consultationId!,
      diagnosis: state.diagnosis
    });

    const medicationsText = treatment.medications.map(med => 
      `• *${med.name}*\n` +
      `  Dose: ${med.dosage}\n` +
      `  Via: ${med.route}\n` +
      `  Frequência: ${med.frequency}\n` +
      `  Duração: ${med.duration}`
    ).join('\n\n');

    const supportiveText = treatment.supportiveCare.map(care => `• ${care}`).join('\n');

    const treatmentMessage = 
      `💊 *PROTOCOLO DE TRATAMENTO*\n\n` +
      `*Medicações:*\n${medicationsText}\n\n` +
      `*Cuidados de Suporte:*\n${supportiveText}\n\n` +
      `⚠️ *Monitoramento:*\n` +
      `Se não houver melhora em 48-72h, procure um veterinário presencial.`;

    return {
      messages: [
        { type: 'text', text: treatmentMessage },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Deseja receber a receita em PDF?' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'get-prescription', title: '📄 Sim, enviar receita' } },
                { type: 'reply', reply: { id: 'menu', title: '🏠 Finalizar' } }
              ]
            }
          }
        }
      ],
      newState: {
        ...state,
        currentStep: 'treatment',
        treatment
      }
    };
  },

  async sendPrescription(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;
    
    // Generate prescription PDF
    const prescriptionUrl = await apiClient.generatePrescription(state.consultationId!);
    
    // Download and send via WhatsApp
    await whatsappClient.sendDocument(
      context.session.phoneNumber,
      prescriptionUrl,
      `Receita_PetVet_${new Date().toISOString().split('T')[0]}.pdf`,
      'Receita Veterinária - PetVet AI'
    );

    return {
      messages: [{
        type: 'text',
        text: `✅ Receita enviada!\n\n` +
              `Esta consulta foi salva no histórico de saúde do seu pet.\n\n` +
              `🔔 Vou te lembrar sobre os medicamentos nos horários corretos.\n\n` +
              `Melhoras para o seu pet! 🐾`
      }],
      newState: { currentFlow: 'main-menu', currentStep: null }
    };
  }
};
```

## Task 5.3: WhatsApp Handler - Session Management
| Attribute | Details |
|-----------|---------|
| **Description** | Implement Redis-based session management for conversations |
| **Acceptance Criteria** | - Session creation and retrieval<br>- 24h TTL with extension<br>- State persistence<br>- Multi-device handling |
| **Required Roles** | Backend Developer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Task 5.1 |
| **Tools** | Redis, ioredis |
| **Risks/Blockers** | Session consistency |

### Session Service

```typescript
// packages/whatsapp-handler/src/services/session.service.ts
import Redis from 'ioredis';
import { v4 as uuid } from 'uuid';
import { apiClient } from '../clients/api.client';

interface Session {
  id: string;
  phoneNumber: string;
  userId?: string;
  contactName?: string;
  state: SessionState;
  activePetId?: string;
  createdAt: string;
  lastActivityAt: string;
}

interface SessionState {
  currentFlow: string;
  currentStep: string | null;
  [key: string]: any;
}

const SESSION_TTL = 24 * 60 * 60; // 24 hours
const SESSION_PREFIX = 'whatsapp:session:';

class SessionService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async getOrCreate(phoneNumber: string, metadata?: { contactName?: string; phoneNumberId?: string }): Promise<Session> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    
    // Try to get existing session
    const existing = await this.redis.get(key);
    if (existing) {
      const session = JSON.parse(existing) as Session;
      
      // Update last activity and extend TTL
      session.lastActivityAt = new Date().toISOString();
      await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));
      
      return session;
    }

    // Create new session
    const session: Session = {
      id: uuid(),
      phoneNumber,
      contactName: metadata?.contactName,
      state: {
        currentFlow: 'main-menu',
        currentStep: null
      },
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    };

    // Try to find existing user by phone number
    try {
      const user = await apiClient.getUserByPhone(phoneNumber);
      if (user) {
        session.userId = user.id;
        
        // Get user's pets
        const pets = await apiClient.getPets(user.id);
        if (pets.length === 1) {
          session.activePetId = pets[0].id;
        }
      }
    } catch (error) {
      // User not found - will be created during onboarding
    }

    await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));
    return session;
  }

  async update(sessionId: string, newState: Partial<SessionState>): Promise<void> {
    // Find session by ID
    const keys = await this.redis.keys(`${SESSION_PREFIX}*`);
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const session = JSON.parse(data) as Session;
        if (session.id === sessionId) {
          session.state = { ...session.state, ...newState };
          session.lastActivityAt = new Date().toISOString();
          await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));
          return;
        }
      }
    }
  }

  async setUserId(phoneNumber: string, userId: string): Promise<void> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    const data = await this.redis.get(key);
    
    if (data) {
      const session = JSON.parse(data) as Session;
      session.userId = userId;
      await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));
    }
  }

  async setActivePet(phoneNumber: string, petId: string): Promise<void> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    const data = await this.redis.get(key);
    
    if (data) {
      const session = JSON.parse(data) as Session;
      session.activePetId = petId;
      await this.redis.setex(key, SESSION_TTL, JSON.stringify(session));
    }
  }

  async clear(phoneNumber: string): Promise<void> {
    const key = `${SESSION_PREFIX}${phoneNumber}`;
    await this.redis.del(key);
  }
}

export const sessionService = new SessionService();
```

## Task 5.4: WhatsApp Handler - Message Templates
| Attribute | Details |
|-----------|---------|
| **Description** | Implement WhatsApp message template sending for notifications |
| **Acceptance Criteria** | - Template message sending<br>- Variable substitution<br>- Reminder templates<br>- Payment templates |
| **Required Roles** | Backend Developer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Task 5.1, 1.2 |
| **Tools** | WhatsApp Business API |
| **Risks/Blockers** | Template approval from Meta |

### WhatsApp Client

```typescript
// packages/whatsapp-handler/src/clients/whatsapp.client.ts
import axios from 'axios';
import { logger } from '../utils/logger';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

interface TemplateMessage {
  name: string;
  language: string;
  components?: TemplateComponent[];
}

interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters: TemplateParameter[];
}

interface TemplateParameter {
  type: 'text' | 'image' | 'document';
  text?: string;
  image?: { link: string };
  document?: { link: string; filename: string };
}

class WhatsAppClient {
  private accessToken: string;
  private phoneNumberId: string;

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  }

  private async request(endpoint: string, data: any) {
    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${this.phoneNumberId}/${endpoint}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      logger.error('WhatsApp API error', {
        endpoint,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  // Send text message
  async sendText(to: string, text: string) {
    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text }
    });
  }

  // Send interactive message with buttons
  async sendButtons(to: string, body: string, buttons: { id: string; title: string }[]) {
    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title }
          }))
        }
      }
    });
  }

  // Send document (PDF prescription)
  async sendDocument(to: string, url: string, filename: string, caption?: string) {
    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'document',
      document: {
        link: url,
        filename,
        caption
      }
    });
  }

  // Send template message (for notifications outside 24h window)
  async sendTemplate(to: string, template: TemplateMessage) {
    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language },
        components: template.components
      }
    });
  }

  // Send vaccination reminder
  async sendVaccinationReminder(to: string, petName: string, vaccineName: string, dueDate: string) {
    return this.sendTemplate(to, {
      name: 'vaccination_reminder',
      language: 'pt_BR',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: petName },
            { type: 'text', text: vaccineName },
            { type: 'text', text: dueDate }
          ]
        }
      ]
    });
  }

  // Send medication reminder
  async sendMedicationReminder(to: string, petName: string, medicationName: string, dosage: string) {
    return this.sendTemplate(to, {
      name: 'medication_reminder',
      language: 'pt_BR',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: petName },
            { type: 'text', text: medicationName },
            { type: 'text', text: dosage }
          ]
        }
      ]
    });
  }

  // Send payment reminder
  async sendPaymentReminder(to: string, userName: string, amount: string, dueDate: string) {
    return this.sendTemplate(to, {
      name: 'payment_reminder',
      language: 'pt_BR',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: userName },
            { type: 'text', text: amount },
            { type: 'text', text: dueDate }
          ]
        }
      ]
    });
  }

  // Download media from WhatsApp
  async downloadMedia(mediaId: string): Promise<Buffer> {
    // First, get the media URL
    const mediaInfo = await axios.get(
      `${WHATSAPP_API_URL}/${mediaId}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );

    // Then download the actual file
    const response = await axios.get(mediaInfo.data.url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      responseType: 'arraybuffer'
    });

    return Buffer.from(response.data);
  }

  // Send typing indicator
  async sendTyping(to: string) {
    // WhatsApp doesn't have a direct typing indicator
    // But we can use read receipts
    // This is a placeholder for future implementation
  }
}

export const whatsappClient = new WhatsAppClient();
```

## Task 5.5: Core API - Backend Modules
| Attribute | Details |
|-----------|---------|
| **Description** | Develop core API modules (Auth, Pets, Health Records, Subscriptions) |
| **Acceptance Criteria** | - Phone-based authentication<br>- Pet CRUD operations<br>- Health record management<br>- Stripe subscription integration |
| **Required Roles** | Backend Developer (2) |
| **Estimated Effort** | 12 days |
| **Dependencies** | Phase 4 |
| **Tools** | Node.js, Express, TypeORM, Stripe |
| **Risks/Blockers** | Database schema changes |

## Task 5.6: AI Services - LLM Integration
| Attribute | Details |
|-----------|---------|
| **Description** | Implement LLM orchestration for veterinary diagnosis |
| **Acceptance Criteria** | - Multi-provider abstraction<br>- Veterinary prompt engineering<br>- Response caching<br>- Fallback mechanism |
| **Required Roles** | Backend Developer, AI Engineer |
| **Estimated Effort** | 10 days |
| **Dependencies** | Task 5.5 |
| **Tools** | Python, FastAPI, LangChain |
| **Risks/Blockers** | LLM cost management |

## Task 5.7: AI Services - Knowledge Base
| Attribute | Details |
|-----------|---------|
| **Description** | Implement MSD Veterinary Manual knowledge base |
| **Acceptance Criteria** | - Content extraction pipeline<br>- Vector database setup<br>- RAG implementation<br>- Semantic search |
| **Required Roles** | AI Engineer |
| **Estimated Effort** | 8 days |
| **Dependencies** | Task 5.6 |
| **Tools** | Python, Pinecone/Weaviate |
| **Risks/Blockers** | Content licensing |

## Task 5.8: AI Services - Prescription Generator
| Attribute | Details |
|-----------|---------|
| **Description** | Implement PDF prescription generation |
| **Acceptance Criteria** | - PDF template design<br>- Dynamic content population<br>- S3 storage integration<br>- WhatsApp delivery |
| **Required Roles** | Backend Developer |
| **Estimated Effort** | 4 days |
| **Dependencies** | Task 5.6 |
| **Tools** | Python, ReportLab/WeasyPrint |
| **Risks/Blockers** | PDF formatting |

## Task 5.9: Admin Dashboard
| Attribute | Details |
|-----------|---------|
| **Description** | Create admin web dashboard for operations |
| **Acceptance Criteria** | - User/pet management<br>- Conversation monitoring<br>- Analytics dashboard<br>- Subscription management |
| **Required Roles** | Frontend Developer |
| **Estimated Effort** | 8 days |
| **Dependencies** | Task 5.5 |
| **Tools** | React, Vite, TailwindCSS |
| **Risks/Blockers** | Requirements clarity |

---

# Phase 6: Testing Strategy

**Duration**: 2 weeks (parallel with Phase 5) | **Priority**: P0 (Critical)

## Task 6.1: Unit Testing
| Attribute | Details |
|-----------|---------|
| **Description** | Implement unit tests for all modules |
| **Acceptance Criteria** | - 80%+ code coverage<br>- WhatsApp flow tests<br>- AI service mocks<br>- Fast execution |
| **Required Roles** | All Developers |
| **Estimated Effort** | Continuous |
| **Dependencies** | Phase 5 |
| **Tools** | Jest, pytest |
| **Risks/Blockers** | Test maintenance |

## Task 6.2: Integration Testing
| Attribute | Details |
|-----------|---------|
| **Description** | Integration tests for WhatsApp webhook flow |
| **Acceptance Criteria** | - End-to-end message flow<br>- Database integration<br>- Redis session tests<br>- API endpoint tests |
| **Required Roles** | QA Engineer, Backend Developer |
| **Estimated Effort** | 5 days |
| **Dependencies** | Task 5.1-5.4 |
| **Tools** | Supertest, testcontainers |
| **Risks/Blockers** | WhatsApp API mocking |

## Task 6.3: WhatsApp Flow Testing
| Attribute | Details |
|-----------|---------|
| **Description** | Test complete conversation flows |
| **Acceptance Criteria** | - Onboarding flow<br>- Consultation flow<br>- Subscription flow<br>- Error handling |
| **Required Roles** | QA Engineer |
| **Estimated Effort** | 5 days |
| **Dependencies** | Task 5.2 |
| **Tools** | Custom test harness, WhatsApp simulator |
| **Risks/Blockers** | Flow complexity |

## Task 6.4: Load Testing
| Attribute | Details |
|-----------|---------|
| **Description** | Load test WhatsApp webhook endpoint |
| **Acceptance Criteria** | - 1000 concurrent webhooks<br>- Response time < 500ms<br>- Queue throughput validated<br>- Auto-scaling verified |
| **Required Roles** | QA Engineer, DevOps Engineer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Phase 4, Phase 5 |
| **Tools** | k6, Grafana |
| **Risks/Blockers** | WhatsApp rate limits |

---

# Phase 7: Monitoring & Observability

**Duration**: 2 weeks (parallel with Phase 5-6) | **Priority**: P0 (Critical)

## Task 7.1: Logging Infrastructure
| Attribute | Details |
|-----------|---------|
| **Description** | Configure centralized logging with WhatsApp-specific tracking |
| **Acceptance Criteria** | - Structured JSON logging<br>- Message flow correlation<br>- Error tracking<br>- Log retention policies |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Phase 4 |
| **Tools** | Winston, CloudWatch |
| **Risks/Blockers** | Log volume costs |

## Task 7.2: WhatsApp-Specific Metrics
| Attribute | Details |
|-----------|---------|
| **Description** | Create custom metrics for WhatsApp operations |
| **Acceptance Criteria** | - Messages received/sent count<br>- Webhook response time<br>- Session metrics<br>- Consultation completion rate |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Task 7.1 |
| **Tools** | CloudWatch Metrics |
| **Risks/Blockers** | Metric cardinality |

### Custom Metrics

```typescript
// packages/whatsapp-handler/src/utils/metrics.ts
import { CloudWatch } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatch({ region: 'us-east-1' });

export const metrics = {
  async recordWebhook(duration: number, success: boolean) {
    await cloudwatch.putMetricData({
      Namespace: 'PetVet/WhatsApp',
      MetricData: [
        {
          MetricName: 'WebhookCount',
          Value: 1,
          Unit: 'Count',
          Dimensions: [{ Name: 'Status', Value: success ? 'Success' : 'Error' }]
        },
        {
          MetricName: 'WebhookDuration',
          Value: duration,
          Unit: 'Milliseconds'
        }
      ]
    });
  },

  async recordMessage(type: string, direction: 'inbound' | 'outbound') {
    await cloudwatch.putMetricData({
      Namespace: 'PetVet/WhatsApp',
      MetricData: [{
        MetricName: 'MessageCount',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          { Name: 'Type', Value: type },
          { Name: 'Direction', Value: direction }
        ]
      }]
    });
  },

  async recordConsultation(completed: boolean, urgencyLevel: string) {
    await cloudwatch.putMetricData({
      Namespace: 'PetVet/Business',
      MetricData: [
        {
          MetricName: 'ConsultationCount',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            { Name: 'Status', Value: completed ? 'Completed' : 'Abandoned' },
            { Name: 'Urgency', Value: urgencyLevel }
          ]
        }
      ]
    });
  },

  async recordLLMLatency(provider: string, duration: number) {
    await cloudwatch.putMetricData({
      Namespace: 'PetVet/AI',
      MetricData: [{
        MetricName: 'LLMLatency',
        Value: duration,
        Unit: 'Milliseconds',
        Dimensions: [{ Name: 'Provider', Value: provider }]
      }]
    });
  }
};
```

## Task 7.3: Alerting Configuration
| Attribute | Details |
|-----------|---------|
| **Description** | Configure alerts for WhatsApp operations |
| **Acceptance Criteria** | - Webhook failure alerts<br>- High latency alerts<br>- Queue depth alerts<br>- LLM failure alerts |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 7.2 |
| **Tools** | CloudWatch Alarms, SNS, PagerDuty |
| **Risks/Blockers** | Alert fatigue |

## Task 7.4: Dashboard Creation
| Attribute | Details |
|-----------|---------|
| **Description** | Create operational dashboards |
| **Acceptance Criteria** | - Real-time WhatsApp metrics<br>- Business KPIs<br>- Infrastructure health<br>- LLM performance |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 7.2 |
| **Tools** | CloudWatch Dashboards |
| **Risks/Blockers** | Dashboard complexity |

---

# Phase 8: Documentation

**Duration**: 1 week (parallel with Phase 5-7) | **Priority**: P1 (High)

## Task 8.1: API Documentation
| Attribute | Details |
|-----------|---------|
| **Description** | Create comprehensive API documentation |
| **Acceptance Criteria** | - OpenAPI spec complete<br>- WhatsApp webhook documented<br>- Internal APIs documented<br>- Examples provided |
| **Required Roles** | Backend Developer, Technical Writer |
| **Estimated Effort** | 3 days |
| **Dependencies** | Phase 5 |
| **Tools** | Swagger/OpenAPI, Redoc |
| **Risks/Blockers** | Documentation drift |

## Task 8.2: WhatsApp Flow Documentation
| Attribute | Details |
|-----------|---------|
| **Description** | Document all conversation flows |
| **Acceptance Criteria** | - Flow diagrams for all journeys<br>- Message template catalog<br>- Error handling guide<br>- Testing guide |
| **Required Roles** | Tech Lead, Technical Writer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 5.2 |
| **Tools** | Miro, Markdown |
| **Risks/Blockers** | Flow updates |

## Task 8.3: Operational Runbooks
| Attribute | Details |
|-----------|---------|
| **Description** | Create runbooks for operations |
| **Acceptance Criteria** | - Deployment procedures<br>- Incident response<br>- WhatsApp webhook recovery<br>- Scaling procedures |
| **Required Roles** | DevOps Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Phase 4, Phase 7 |
| **Tools** | Confluence, Markdown |
| **Risks/Blockers** | Knowledge capture |

---

# Phase 9: Deployment Strategy

**Duration**: 1 week | **Priority**: P0 (Critical)

## Task 9.1: Staging Deployment
| Attribute | Details |
|-----------|---------|
| **Description** | Deploy complete system to staging |
| **Acceptance Criteria** | - All services deployed<br>- WhatsApp test number configured<br>- End-to-end flows working<br>- Performance validated |
| **Required Roles** | DevOps Engineer, QA Engineer |
| **Estimated Effort** | 2 days |
| **Dependencies** | Phase 3, 4, 5, 6 |
| **Tools** | GitHub Actions, Terraform |
| **Risks/Blockers** | Environment issues |

## Task 9.2: Beta Testing
| Attribute | Details |
|-----------|---------|
| **Description** | Conduct beta testing with real WhatsApp users |
| **Acceptance Criteria** | - 50+ beta users recruited<br>- Real WhatsApp conversations<br>- Feedback collected<br>- Critical bugs fixed |
| **Required Roles** | Product Owner, QA Engineer |
| **Estimated Effort** | 5 days |
| **Dependencies** | Task 9.1 |
| **Tools** | WhatsApp, feedback forms |
| **Risks/Blockers** | Beta user recruitment |

## Task 9.3: Production Deployment
| Attribute | Details |
|-----------|---------|
| **Description** | Deploy to production and configure WhatsApp webhook |
| **Acceptance Criteria** | - Production infrastructure ready<br>- WhatsApp webhook configured<br>- Health checks passing<br>- Monitoring active |
| **Required Roles** | DevOps Engineer, Tech Lead |
| **Estimated Effort** | 2 days |
| **Dependencies** | Task 9.2 |
| **Tools** | GitHub Actions, AWS |
| **Risks/Blockers** | Meta webhook registration |

### Production WhatsApp Webhook Configuration

```bash
# Register WhatsApp webhook with Meta
curl -X POST \
  "https://graph.facebook.com/v18.0/${APP_ID}/subscriptions" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "callback_url": "https://whatsapp.petvet.ai/webhooks/whatsapp",
    "verify_token": "'"${WHATSAPP_VERIFY_TOKEN}"'",
    "fields": ["messages", "messaging_postbacks", "messaging_optins"]
  }'
```

---

# Phase 10: Post-Launch

**Duration**: Ongoing | **Priority**: P1 (High)

## Task 10.1: Monitoring & Incident Response
| Attribute | Details |
|-----------|---------|
| **Description** | Establish operational monitoring |
| **Acceptance Criteria** | - 24/7 alerting<br>- Incident playbooks<br>- On-call rotation<br>- Post-mortem process |
| **Required Roles** | DevOps Engineer, Backend Developer |
| **Estimated Effort** | Ongoing |
| **Dependencies** | Phase 7, Phase 9 |
| **Tools** | PagerDuty, Slack |
| **Risks/Blockers** | Team burnout |

## Task 10.2: Mobile App Development (Phase 2)
| Attribute | Details |
|-----------|---------|
| **Description** | Develop React Native mobile app as secondary channel |
| **Acceptance Criteria** | - Authentication via phone number<br>- Pet management<br>- Health timeline visualization<br>- Push notifications |
| **Required Roles** | Mobile Developer (2) |
| **Estimated Effort** | 8 weeks |
| **Dependencies** | Phase 5 (API ready) |
| **Tools** | React Native, TypeScript |
| **Risks/Blockers** | App store approval |

## Task 10.3: Performance Optimization
| Attribute | Details |
|-----------|---------|
| **Description** | Continuous performance improvement |
| **Acceptance Criteria** | - Webhook latency optimization<br>- LLM response caching<br>- Database query optimization<br>- Cost optimization |
| **Required Roles** | Backend Developer, DevOps Engineer |
| **Estimated Effort** | Ongoing (2 days/sprint) |
| **Dependencies** | Phase 7 |
| **Tools** | CloudWatch, X-Ray |
| **Risks/Blockers** | Performance regression |

## Task 10.4: Feature Iteration
| Attribute | Details |
|-----------|---------|
| **Description** | Continuous feature development |
| **Acceptance Criteria** | - User feedback incorporated<br>- New flows added<br>- A/B testing<br>- Marketplace integration (future) |
| **Required Roles** | Full development team |
| **Estimated Effort** | Ongoing |
| **Dependencies** | All phases |
| **Tools** | Jira, analytics |
| **Risks/Blockers** | Scope creep |

---

# Cost Estimates

## AWS Monthly Cost (Estimated for 50k users)

| Service | Specification | Monthly Cost (USD) |
|---------|--------------|-------------------|
| **ECS Fargate** | 3 services, 2+ tasks each | $350 |
| **RDS PostgreSQL** | db.r6g.medium, Multi-AZ | $250 |
| **ElastiCache Redis** | cache.t4g.medium | $100 |
| **ALB** | 1 ALB + traffic | $50 |
| **S3** | 500GB + requests | $20 |
| **CloudFront** | 500GB transfer | $50 |
| **Route 53** | DNS | $10 |
| **CloudWatch** | Logs + Metrics | $80 |
| **Secrets Manager** | 10 secrets | $10 |
| **NAT Gateway** | Data processing | $80 |
| **Total AWS** | | **~$1,000/month** |

## LLM API Costs (Estimated)

| Provider | Usage | Monthly Cost (USD) |
|----------|-------|-------------------|
| OpenAI GPT-4 Turbo | Primary | $500-800 |
| Anthropic Claude | Fallback | $100-200 |
| **Total LLM** | | **~$600-1,000/month** |

## WhatsApp Business API

| Item | Cost |
|------|------|
| Conversation-based pricing | ~$0.05-0.08 per conversation (Brazil) |
| Estimated 50k conversations/month | **~$2,500-4,000/month** |

## Total Estimated Monthly Cost: ~$4,100-6,000/month

---

# Timeline Summary

```
Week 1-2:   Phase 1 (Planning) + Phase 2 (Dev Environment)
Week 3-4:   Phase 2 (continued) + Phase 3 (CI/CD start)
Week 5-7:   Phase 3 (CI/CD) + Phase 4 (Infrastructure)
Week 8-11:  Phase 4 (continued) + Phase 5 (Development)
Week 12:    Phase 5 (finalize) + Phase 6 (Testing)
Week 13:    Phase 6 (Testing) + Phase 7 (Monitoring)
Week 14:    Phase 8 (Docs) + Phase 9 (Deployment)
Week 15+:   Phase 10 (Post-Launch + Mobile App development)

TOTAL MVP (WhatsApp): 14 weeks
Mobile App (Phase 2): +8 weeks
```

---

# Team Composition

## Core Team

| Role | Count | Focus |
|------|-------|-------|
| Tech Lead | 1 | Architecture, WhatsApp integration |
| Backend Developer | 2 | WhatsApp handler, Core API |
| AI Engineer | 1 | LLM integration, Knowledge base |
| DevOps Engineer | 1 | Infrastructure, CI/CD |
| QA Engineer | 1 | Testing, Quality assurance |
| Product Owner | 1 | Requirements, User testing |

## Phase 2 Addition

| Role | Count | Focus |
|------|-------|-------|
| Mobile Developer | 2 | React Native app |

---

# Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| WhatsApp API approval delays | High | Medium | Start early, prepare documentation |
| Meta webhook rate limiting | High | Low | Async processing, message queues |
| LLM response latency | Medium | Medium | Caching, multiple providers |
| Template message rejection | Medium | Medium | Follow guidelines, pre-test |
| WhatsApp 24h window expiry | Low | High | Use template messages for notifications |
| User adoption | High | Medium | Strong onboarding flow |

---

*Document Version: 2.0*
*Last Updated: November 2025*
*Next Review: February 2026*
