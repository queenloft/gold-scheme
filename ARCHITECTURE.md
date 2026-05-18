# AI 🚀 SaaS Platform Blueprint

## 1) Full SaaS Architecture

### High-Level Modules
- **Client Apps (Web/PWA)**: React + Next.js + Tailwind, mobile-first dashboard, QR landing pages, customer forms.
- **Identity & Access**: Firebase Authentication with custom claims (`super_admin`, `user_admin`, `staff`).
- **Operational Data**: Firestore for tenants/business/customer/campaign/review analytics data.
- **Media Storage**: Firebase Storage for logos, QR exports, campaign assets (images/videos/docs).
- **Backend Logic**: Firebase Cloud Functions (HTTPS + triggers + scheduled jobs).
- **Notifications**: Firebase Cloud Messaging (FCM) for push + event notification fan-out.
- **AI Gateway**: Cloud Function abstraction over OpenAI/Gemini/Claude providers, with usage accounting.
- **WhatsApp Connector**: provider-agnostic service wrapper with webhook ingestion.
- **Google Sheets Sync Engine**: batched and realtime append/update mirror pipeline.
- **Subscription/Billing**: package entitlements, usage limits, renewal and grace-period handling.
- **Observability**: event logs, audit trails, per-tenant usage metrics, error alerts.

### Multi-tenant Strategy
- Tenant = `user_admin` organization.
- Each tenant owns multiple businesses.
- Firestore paths include `tenantId` and `businessId` for strict data partitioning.
- Security rules enforce role+tenant scoped access.

### Runtime Components
- **Next.js Frontend**: SSR for admin pages, client hydration for dashboard widgets.
- **Edge-safe API routes** (for UI orchestration) + **Firebase Functions** (trusted operations).
- **Event-driven flows**: Firestore triggers for analytics, sync, and notifications.
- **Cron/scheduler jobs**: drift campaign dispatch, retry queues, stale webhook reconciliation.

---

## 2) Database Schema (Domain Model)

### Core Entities
- **Tenant**: plan, limits, owner, status.
- **User**: auth profile, role, tenant membership.
- **Business**: brand profile, links, AI toggles, WhatsApp config, category settings.
- **Customer**: phone identity, demographics (optional), journey state, loyalty wallet.
- **Visit/Interaction**: each touchpoint with category (`sales/service/accessories/buyback`).
- **ReviewRequest**: rating, outcome, Google redirect status, generated suggestions.
- **InternalFeedback**: low-rating feedback, support status, escalation notes.
- **Campaign**: drift definition, day sequence, content blocks, media refs.
- **CampaignRun/Delivery**: per-customer send logs + state transitions.
- **LoyaltyLedger**: points credit/debit events with reason.
- **QRAsset**: static/dynamic QR metadata, destination flow config.
- **LinkEvent**: clicks/submissions with source and attribution.
- **AITokenUsage**: prompt/completion tokens, model/provider, billed units.
- **SheetsSyncJob**: sync checkpoints, statuses, retry count.
- **NotificationEvent**: push/email/in-app records.

---

## 3) Firebase Collections Structure

```text
tenants/{tenantId}
  profile
  billing
  settings
  users/{uid}
  businesses/{businessId}
    profile
    aiConfig
    links
    whatsappConfig
    categories/{categoryId}
      suggestions
    customers/{customerId}
      profile
      loyalty
      visits/{visitId}
      interactions/{interactionId}
      reviews/{reviewId}
      feedback/{feedbackId}
      linkEvents/{eventId}
    campaigns/{campaignId}
      steps/{stepId}
      runs/{runId}
      deliveries/{deliveryId}
    qr/{qrId}
      scans/{scanId}
    analytics/{dateKey}
    sheetsSync/{syncId}
    notifications/{notificationId}
platform
  plans/{planId}
  featureFlags/{flagId}
  aiProviders/{providerId}
  auditLogs/{logId}
```

Indexes:
- `customers(phone, businessId)` for duplicate detection.
- `deliveries(status, scheduledAt)` for dispatch workers.
- `linkEvents(type, createdAt)` for dashboard charts.
- `reviews(rating, createdAt)` for sentiment filters.

---

## 4) API Flow

### Auth + Role bootstrap
1. User signs in via Firebase Auth.
2. Callable function resolves tenant + custom claims.
3. Client stores session context and feature entitlements.

### Business creation flow
1. UI submits business profile.
2. Function validates tenant limits.
3. Storage upload for logo.
4. Firestore write to `businesses/{businessId}`.
5. AI bootstrap generation for category suggestions (if toggled ON).

### Customer interaction flow
1. Staff enters customer phone.
2. Query existing customer by normalized E.164 number.
3. If exists, return history popup + journey snapshot.
4. Save new visit/interaction with current category.
5. Trigger loyalty recalculation + analytics event.

### Rating flow
- 4/5 stars: create review suggestion bundle, send Google review redirect.
- 1/2/3 stars: block review redirect, collect internal feedback, notify admin email + push.

### Campaign execution flow
1. Campaign scheduled via builder.
2. Scheduler finds due steps and creates delivery jobs.
3. WhatsApp API send attempt.
4. Webhook updates sent/delivered/read/failed state.
5. Dashboard aggregates performance in near realtime.

---

## 5) User Flow

### Super Admin
- Manage plans, tenants, AI provider routing, global analytics, abuse controls.

### User Admin
- Onboard business, configure links/WhatsApp/API toggles, create campaigns, view analytics.

### Staff
- Capture visits, rate experience, trigger follow-up, view customer timeline.

### Customer
- Interacts via QR / WhatsApp / links / forms and receives personalized follow-ups.

---

## 6) Mobile UI Flow

- **Bottom nav**: Dashboard, Customers, Campaigns, QR, More.
- **Floating Action Button**: Add customer interaction quickly.
- **Dashboard cards**: customer count, reviews, loyalty, AI tokens, QR scans, delivery status.
- **Interaction sheet**: phone lookup → category selection → rating → outcome path.
- **Offline mode**: queue mutations locally and sync when online.

---

## 7) QR Workflow

### Dynamic QR
1. Scan opens hosted short URL.
2. Resolve QR config and business context.
3. Show star selector.
4. If 4/5 => review suggestions + copy + Google redirect.
5. If 1/2/3 => internal feedback form.
6. Log device type, timestamp, IP geo (if policy-allowed), and outcome.

### Static QR
- Fixed URL with same rating bifurcation logic; tracked with query params and scan events.

---

## 8) AI Workflow

### AI capabilities
- Review suggestion generation (5 options).
- Drift campaign auto-draft by category + objective.
- Loyalty reward ideas and retention recommendations.
- Comment/response generation.

### AI orchestration
1. UI requests generation with business context.
2. AI Gateway selects provider/model by tenant policy.
3. Prompt templates + safety filters applied.
4. Response returned and token usage recorded.
5. Usage decrements quota from package limits.

---

## 9) Google Sheets Sync Logic

### Sync pattern
- **Realtime trigger**: on Firestore writes, enqueue normalized rows.
- **Worker**: batch append/update to sheet tabs (Customers, Reviews, Campaigns, etc.).
- **Idempotency key**: `{collection}:{docId}:{updatedAt}` to prevent duplicates.
- **Retry policy**: exponential backoff with dead-letter queue.
- **Reconciliation job**: nightly compare Firestore watermark with Sheets checkpoint.

---

## 10) WhatsApp Automation Flow

1. Tenant configures API URL, Instance ID, Token, Webhook URL.
2. Credentials encrypted with Cloud KMS or Secret Manager reference.
3. Campaign/trigger emits outbound message request.
4. Connector sends payload with template/media mapping.
5. Webhook ingests status updates (`sent`, `delivered`, `read`, `failed`).
6. Failures trigger retry + admin alert if repeated.

---

## 11) Subscription System

### Plans
- Starter, Growth, Pro, Enterprise.
- Entitlements: businesses limit, AI tokens/month, campaign volume, QR count, seats.

### Lifecycle
- Trial → Active → Grace → Suspended.
- Usage guardrails enforced in callable functions.
- Overage policy: hard-stop or metered billing depending on plan.

---

## 12) Notification System

- **Channels**: FCM push, in-app, email fallback.
- **Triggers**: QR scan, review click, form submission, campaign events, low-rating alert.
- **Preferences**: per user enable/disable categories.
- **Delivery tracking**: opened/clicked timestamps.

---

## 13) Analytics System

### KPI groups
- Acquisition: new customers, source attribution.
- Engagement: link clicks, campaign CTR, WhatsApp read rate.
- Reputation: rating distribution, review conversion, negative feedback ratio.
- Retention: repeat visits, journey progression, loyalty redemption.

### Data design
- Raw event stream (`events`), plus daily materialized aggregates (`analytics/{dateKey}`).
- Use scheduled rollups for fast dashboard rendering.

---

## 14) PWA Configuration

- Web App Manifest: installable metadata, icons, theme colors.
- Service Worker:
  - Static asset precache.
  - Runtime caching for API GETs and dashboard shells.
  - Background sync queue for offline form submissions.
- Push integration with FCM web SDK.
- Mobile UX: touch targets, bottom safe-area, reduced motion option.

---

## 15) Deployment Instructions (Production-ready)

### Environments
- `dev`, `staging`, `prod` Firebase projects.
- Per-env config via `.env` + Firebase runtime config/secrets.

### CI/CD
1. Lint + test + type-check.
2. Build frontend.
3. Deploy Functions (region strategy: e.g., `us-central1`).
4. Deploy Hosting + rewrites.
5. Run post-deploy smoke tests.

### Security hardening
- Firestore rules with role + tenant scoping.
- App Check for API abuse mitigation.
- Rate limiting in callable/HTTP functions.
- Secrets in Secret Manager, never client-exposed.
- At-rest encryption (Firebase defaults) + sensitive field encryption where needed.

### Suggested phased rollout
- **Phase A**: Auth, business setup, CRM, manual campaigns, static QR.
- **Phase B**: AI suggestions, dynamic QR, WhatsApp automation, loyalty.
- **Phase C**: Sheets realtime sync, advanced analytics, subscription enforcement.
- **Phase D**: optimization, A/B testing, cross-business promotion engine.

---

## Implementation Notes for the Provided Stages

- Stage numbering in the request skips Stage 2; include it as **Auth/Roles Foundation** before Stage 3 implementation.
- Use feature flags so high-risk modules (AI provider switching, WhatsApp webhooks) can be rolled out gradually.
- Keep all external provider calls behind backend functions; never expose provider secrets to frontend.
