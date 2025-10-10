# HouseHub - Comprehensive Requirements Document

**Product Name:** HouseHub  
**Version:** 1.0  
**Date:** October 2025

## Table of Contents
1. [Product Overview & Goals](#1-product-overview--goals)
2. [User Roles & Responsibilities](#2-roles--full-responsibilities--ui-surfaces)
3. [Full User Journeys](#3-full-user-journeys-highly-detailed-steps--screens)
4. [Feature List](#4-feature-list-exhaustive)
5. [API Contract](#5-api-contract-rest-style-endpoints--payloads)
6. [UI Components & Wireframes](#6-ui-components--page-wireframes)
7. [Business Logic & Rules](#7-business-logic-validations--edge-cases)
8. [Payment & Financial Flows](#8-payments--financial-flows)
9. [Auth, Security & Trust](#9-auth-security--trust)
10. [Notifications & Real-time](#10-notifications--realtime)
11. [Testing, QA, Monitoring & KPIs](#11-testing-qa-monitoring--kpis)
12. [Deployment & Infrastructure](#12-deployment-infra--operational-playbook)
13. [Roadmap & Monetization](#13-roadmap--monetization)
14. [Appendix: Data Objects](#14-appendix-data-objects--sample-messages)

---

## 1. Product Overview & Goals

### 1.1 Product Overview
HouseHub is a comprehensive property management and booking platform designed specifically for developing university towns. The platform connects landlords, agents, clients (students, staff, small business owners), admins, verifiers, and support staff in a unified ecosystem.

### 1.2 Target Users
- **Landlords**: Property owners who list and manage their properties
- **Agents**: Brokers/managers who represent properties
- **Clients**: Students, staff, and small business owners seeking accommodation
- **Admin/Verifier**: Super-admins and moderators
- **Support/Finance**: Customer support and financial management

### 1.3 Domain Constraints
- Low bandwidth environments
- Informal addressing systems
- Many short-term/semester leases for students
- Limited landlord digital literacy

### 1.4 Primary Goals
- Make it easy for landlords to list properties (single units or complexes) and manage bookings
- Make it easy for students/clients to find available units quickly and safely
- Provide agents with workflows to discover and represent properties
- Build trust through KYC, verification badges, reviews, photo/video, admin moderation
- Support unit-level booking in complexes (book a room, not block entire property)
- Mobile-first, lightweight PWA (works on low-end phones, offline-friendly)

---

## 2. Roles — Full Responsibilities & UI Surfaces

### 2.1 Admin (Super-Admin)
**Scope:** Full platform control & oversight

**Capabilities / UI surfaces:**
- Admin dashboard: global metrics, pending verifications, flagged content, payouts, transaction ledger
- User management: view & change roles (landlord, agent, support), suspend/ban accounts
- Verification queue: review & approve/reject KYC and property docs
- Content moderation: remove listings, revert fraudulent updates, send warnings
- Financial admin: refunds, payout approval, commission rules
- System settings: subscription plans, fees, featured listings, categories, town definitions

**Examples of actions:**
- Approve landlord KYC → triggers email push to user
- Unpublish property → triggers notifications to saved users

### 2.2 Verifier / Moderator (Subset of Admin)
**Scope:** Focused on verification and takedown

**UI:** Verification queue, flagged items list, canned messages for rejections  
**Actions:** Approve/reject KYC, mark property verified, request more evidence

### 2.3 Landlord (Property Owner)
**Scope:** Owner of properties — can manage property parent and child units

**UI:** Landlord dashboard with Listings (parent), Units (child), Inquiries, Bookings, Leases, Payouts, Analytics, KYC/Docs area

**Key capabilities:**
- Create property parent (name, address, map-pin, total units, global features)
- Create units (unit name/number, price, images, amenities, status). Units are individually bookable
- Mark unit statuses: Available / Booked (pending) / Occupied / Maintenance / Archived
- Approve booking requests; generate lease; request payout
- Invite agent or accept agent requests (see agent flows)
- Bulk upload units via CSV (for complexes)
- Auto relist on lease end, manual override

### 2.4 Agent
**Scope:** Brokers / managers who represent landlords or source leads

**UI:** Agent dashboard (Discover feed, Invitations, Requests Sent, My Listings, Commissions)

**Capabilities:**
- Discover unassigned owner-open properties
- Request representation with commission proposal and message
- Receive invites & accept representation
- Manage assigned listings, view inquiries, schedule viewings
- Log commissions and closings (admin/reconciler approves payouts)
- Create leads (agent_sourced) that owners can claim

### 2.5 Client / Student (Primary Consumer)
**Scope:** Browse, book viewings, apply or pay deposit for units

**UI:** Search feed (list & map), Property detail (parent + unit list), Unit detail, Favorites, Bookings, Messages, Profile

**Capabilities:**
- Search & filters (distance to university, price, rooms, furnished, amenities)
- View property parent (complex) summary + unit list (with per-unit statuses and photos)
- Book viewings or submit booking requests for specific units
- Pay deposit or reservation fee (optional)
- Leave review after lease
- Report listings, save favorites, share listings

### 2.6 Support / Finance
**Scope:** Resolve disputes, manage refunds/payouts

**UI:** Support inbox, case management, payout approvals, transaction reconciliation

**Capabilities:**
- Accept & process dispute cases
- Issue refunds and adjust balances
- Approve payouts to landlords/agents

---

## 3. Full User Journeys (Highly-Detailed Steps & Screens)

### 3.1 Client / Student — End-to-End (Example User Mary)
**Goal:** Find a 1-bedroom near the university, book a viewing, and reserve the room

#### Screens & Steps

**Landing / Search**
- Top: search box: "Search by area or property name" + quick filters: Near campus | ≤ ₦X | 1-2 BR | Furnished
- Map toggle: pin cluster for properties
- Card shows: primary photo, price range, available units count, distance to campus, "Verified" badge

**Property Detail (Parent)**
- Title, short description, badges (verified, owner, agent), slider gallery, map with campus pin
- Section "Units in this property": list of unit cards (Unit name, price, mini-gallery, status pill: Available/Booked/Occupied)
- CTA on each Available unit: "View Unit" or "Book"

**Unit Detail**
- Photos, amenities, exact price, deposit, lease term options (semester/month/year), move-in date selector
- Buttons: "Book Viewing", "Apply to Rent", "Reserve (pay deposit)", "Message Landlord/Agent"
- Microcopy: "Reservations hold a room for 48 hours until owner confirms"

**Book Viewing flow**
- Modal: pick date/time (owner's available slots — landlord/agent availability calendar)
- Confirm → creates inquiry/booking request with status Pending. Notifications sent to landlord/agent

**Reserve & Pay**
- Choose payment method. Pay deposit (gateway flow)
- On payment success, booking state becomes Booked (Pending Approval) and transaction recorded
- If owner accepts (within 48 hours), booking becomes Approved and unit status becomes Occupied (or Active lease starts on agreed date)

**After Move-in**
- Mary can leave review after 7 days
- If dispute arises (e.g., no water), she opens Support ticket

**Errors & Edge Cases**
- If two clients try to reserve same unit simultaneously, use atomic booking RPC (first succeeds, second receives "already booked")
- If owner fails to respond within deadline, auto-cancel reservation and refund per policy

### 3.2 Landlord — End-to-End (Owner Amina)
**Goal:** List an apartment complex of 8 rooms, accept bookings, manage payouts

#### Screens & Steps

**Signup & KYC**
- KYC page: upload national ID + proof of ownership (photo of title or receipt) + phone verification
- Statuses: Pending → Under Review → Verified / Rejected. Rejection includes reason + option to re-submit

**Create property (wizard)**
- Step 1: Basic (title, type = apartment_complex, address, default amenities)
- Step 2: Map pin (drag to correct point) — provide "nearby landmark" free text for towns with no addresses
- Step 3: Units — add units manually or "bulk add" with CSV (unit name, price, bedrooms, bathrooms, images)
- Step 4: Photos & Video upload (compress images client-side)
- Step 5: Pricing & terms (deposit, semester options, rules like no pets)
- Step 6: Review & Submit for publish (option: publish immediately as unverified or submit for verification for "Verified" badge)

**Manage bookings**
- Inbox lists pending bookings grouped by unit. Approve/Reject with message & ability to schedule viewing. Approve triggers lease generation and optional digital signature or contract template

**Payments & Payouts**
- View transactions for each unit. Request payout if funds held by platform. Configure payout method (bank or mobile money). Support team/finance reviews and approves payouts

**Analytics**
- Views per unit, inquiries, conversion rates, average time-to-occupy

**Edge Cases**
- Partial payment (client pays deposit via offline bank transfer) — landlord manually marks payment after documentation and platform marks booking Approved after verification
- Multiple owners or delegated managers — owner can add delegates (caretakers) with limited permission

### 3.3 Agent — End-to-End (Agent Musa)
**Goal:** Find properties to represent, request assignments, and manage commissions

#### Screens & Steps

**Agent signup & KYC**
- Upload ID, agent license (optional), upload portfolio

**Discover feed**
- Feed shows properties where allow_agents = true & agent_id = null. Filters: radius, price, type. Each card has "Request to represent" CTA

**Request representation**
- Modal: propose commission% (optional), add pitch message. Creates request. Owner sees request in their Owner dashboard

**Invite flow**
- Owners can invite agents by email; agent accepts invite → assignment done

**Post-assignment**
- Manage assigned properties: update listing details (if permitted), handle inquiries, schedule viewings. Commission ledger tracks gross & net commissions

**Edge Cases**
- Multiple agents requesting same property: Owner selects one or allows co-brokering (split %)
- Agent creates lead (scouts property). Owner can claim the lead and convert to live listing with agent pre-assigned

### 3.4 Admin / Verifier Flow
**Goal:** Maintain trust, approve KYC/listings, escalate fraud, manage financial exceptions

#### Screens & Steps
- Verification queue — list of pending user & property verifications with uploaded docs and quick actions (approve/reject/request-more-info). Admin notes stored
- Flagged content — ranking by severity; admin can suspend a listing and trigger email to user
- Payout & refund controls — see escrowed funds, release payouts after required hold period, process refunds
- Audit logs — every action by admin/landlord/agent recorded

**SLA & Policies**
- Verified KYC must be processed within 48 hours (target)
- Fraud escalations resolved within 72 hours

---

## 4. Feature List: Exhaustive

### 4.1 Core (MVP)
- Auth (email, phone, magic link, social login)
- Profiles (role selection, profile picture)
- Property parent + unit child creation UI (wizard)
- Unit-level availability & statuses
- Search (list + map toggle) with filters: price, type, proximity, furnished, bedrooms
- Property detail & unit detail pages
- Bookings: view request, approve/reject, unit status transitions
- Favorites/wishlists
- Basic messaging (client ↔ landlord/agent) — persisted threads
- KYC upload flow + verification queue (admin)
- Photo upload (storage) with compression and thumbnails
- Realtime notifications for booking requests and messages
- Admin dashboard (basic verification & takedown)
- Basic analytics for landlords (views, inquiries, occupancy)
- Payment gateway integration for deposit/reservation
- PWA: offline caching of last viewed listings

### 4.2 Phase 2 (Post-MVP)
- Agent discovery & request flow, invitations, commission ledger
- Payouts & commission management (support / finance flows)
- Advanced search: geospatial / radius search (PostGIS optional)
- Waitlist & auto-notify when unit becomes available
- Lease document generation & e-signature (PDF)
- Featured listings & paid promotion
- Reviews & rating system with moderation
- Bulk upload for landlords (CSV import)
- Webhooks for payment provider for reconciliations

### 4.3 Phase 3 (Scale)
- Virtual tours / 360° walkthroughs
- Roommate matching module
- Multi-town / multi-university expansion with localized content
- Co-brokerage workflows & split commissions
- ML-based duplicate detection & fraud detection
- API for third-party partners (furniture, movers)

---

## 5. API Contract (REST-Style Endpoints & Payloads)

### 5.1 Auth & Profiles
```
POST /auth/signup {email, password, name, phone} → 201 {user, session}
POST /auth/login {email, password} → 200 {session, user}
GET /profile/me → 200 {profile}
PUT /profile/me {full_name, phone, avatar_url, preferred_currency} → 200 {profile}
```

### 5.2 KYC & Verification
```
POST /kyc/upload multipart/form-data {file, type, metadata} → 201 {uploadId, url (signed)}
POST /kyc/request {userId, docs: [uploadId], idType} → 202 {status: pending}
GET /kyc/pending (admin) → 200 [{request}]
```

### 5.3 Properties
```
POST /properties {ownerId, title, type, address, city, latitude, longitude, total_units, price_from, price_to, allow_agents, is_published (bool)} → 201 {propertyId}
GET /properties ?filters (city, lat,lng,radius,priceMin,priceMax,type,is_published) → 200 [{propertySummary}] (supports pagination)
GET /properties/:id → 200 {property parent + units[] (with statuses)}
PUT /properties/:id (owner/agent) → 200 {updated property}
DELETE /properties/:id (owner/admin) → 204
```

### 5.4 Units
```
POST /properties/:propertyId/units {unitName, price, bedrooms, bathrooms, images[], amenities} → 201 {unit}
GET /properties/:propertyId/units → 200 [{unitSummary}]
GET /units/:id → 200 {unitDetail}
PUT /units/:id (owner/agent) → 200 {updated}
PATCH /units/:id/status {status: Available|Booked|Occupied|Maintenance} → 200 {unit}
```

### 5.5 Bookings & Leases
```
POST /units/:id/book {clientId, startDate, endDate, requestedTerm, paymentIntent?} → 201 {bookingId, status}
// This calls atomic RPC to set unit to Booked or return error if not available
GET /bookings/me → 200 [{bookings}]
PATCH /bookings/:id {action: approve|reject|cancel, note} → 200 {booking}
POST /leases {bookingId, unitId, tenantId, startDate, endDate, rentAmount, deposit} → 201 {leaseId}
GET /leases/:id → 200 {lease}
```

### 5.6 Messages / Chat
```
POST /messages {threadId?, toUserId, propertyId?, unitId?, body} → 201 {message}
GET /messages/thread/:threadId → 200 [{messages}]
```

### 5.7 Agents
```
POST /agent-requests {propertyId, agentId, commissionOffer, message} → 201 {request}
GET /agent-requests/owner/:ownerId → 200 [{requests}]
PATCH /agent-requests/:id {action: accept|reject, agreedCommission?} → 200 {request}
```

### 5.8 Favorites & Reports
```
POST /favorites {userId, propertyId} → 201
POST /reports {reporterId, propertyId, reason, attachments[]} → 202 {caseId}
```

### 5.9 Payments
```
POST /payments/create-intent {amount, currency, type, metadata} → 200 {paymentIntentId, providerCheckoutUrl}
POST /payments/webhook (provider call) → 200 {ok} — handles status updates
```

### 5.10 Admin
```
GET /admin/metrics → 200 {totalProperties, pendingVerifications, dailyActiveUsers ...}
POST /admin/refund {transactionId, reason} → 200 {refundStatus}
POST /admin/payouts/approve {payoutId} → 200 {payoutStatus}
```

---

## 6. UI Components & Page Wireframes

### 6.1 Global Components
- Header with search field, role switcher, notifications bell, profile menu
- Bottom nav (mobile): Home, Search, Post (landlords/agents), Inbox, Profile
- Global modals: Login modal, Quick Post (small listing), Booking modal, Payment modal

### 6.2 Core Components
- PropertyCard: image, price range, available units count, verified badge, quick actions
- UnitCard: small gallery, price, status pill, CTA (Book / Message)
- FilterDrawer: price slider, distance toggle (use approximate radius), amenities toggles
- MapView: cluster pins, click opens side drawer with property summary
- ListingWizard: multi-step form for property + unit creation, with local autosave
- KYCUploader: upload files + status progress
- Inbox: threads, unread badges
- BookingModal: select date, optional payment, confirm

### 6.3 Wireframe Snippets

**Search Page (mobile):** Top: search + quick filters; Middle: list; Bottom: map toggle

**Property Page:** Gallery → Title & badges → Unit list (accordion) → Reviews → Nearby map

**Dashboard (landlord):** Stats top → Listings grid → Inbox & Bookings panel on side

**Agent Discover:** Map + list of open properties + Request button on card

---

## 7. Business Logic, Validations & Edge Cases

### 7.1 Unit Booking Atomic Behavior (Very Important)
Booking must be transactional: check unit.status == Available → create booking row with status = pending → set unit.status = Booked. This must be atomic; use server side function/Edge Function.

### 7.2 Booking Timeouts & Expirations
Reservations expire after N hours (configurable). On expiry: refund (if paid) and set unit.status = Available. Send notifications to waitlist.

### 7.3 Waitlist
If no availability, allow clients to join waitlist for property or specific unit. When a unit becomes available, auto-notify waitlist in FIFO.

### 7.4 Payment Flows & Reconciliations
Use provider webhooks to reconcile: patch transaction status to paid/failed. On paid, proceed to Booked. On failed, cancel booking.

### 7.5 Commission Calculation (Agents)
Commission applied on first payment or as percentage of total rent. Record agreements in agent request acceptance. Commission payouts after lease commencement.

### 7.6 Duplicate & Fraud Detection
Basic heuristics: same images across listings, similar address text, same phone/email used to post many listings. Flag for admin review.

### 7.7 Multi-language and Localization
Primary language English; support additional translations later.

### 7.8 Accessibility
WCAG AA: semantic HTML, keyboard navigation, alt text for images, contrast ratios, and screen reader support.

---

## 8. Payments & Financial Flows

### 8.1 Payment Types
- Reservation deposit (recommended): small percentage to hold the unit
- Full payment: pay first month or semester
- Platform fees & commissions

### 8.2 Flow Examples: Client Reserves a Unit
1. Client selects Reserve → POST /payments/create-intent with amount & metadata
2. Frontend redirects to provider or opens checkout
3. Provider calls webhook → server marks transaction as paid and booking as Booked (pending owner confirmation)
4. If owner approves → finalizes lease; platform calculates commission and schedules payout

### 8.3 Escrow Model (Optional)
Platform holds deposit for protected time window, pays landlord after tenant move-in confirmation or after hold period.

### 8.4 Refunds
Partial/conditional per policy (deductions for damages). Admin processes refunds via POST /admin/refund.

### 8.5 Payouts
Finance reviews payouts weekly/bi-weekly. Payouts can be automatic if landlord configured. Payouts recorded and status tracked.

### 8.6 Reconciliations
Daily job to reconcile provider transactions vs platform ledger; exceptions flagged.

---

## 9. Auth, Security & Trust

### 9.1 Authentication & Session
Use Supabase Auth (or provider) with JWT. Support magic links, email/password, OAuth.

### 9.2 Authorization
Role-based logic enforced on server side (Edge Functions). Frontend should hide UI for unauthorized actions but server enforces final checks.

### 9.3 KYC & Verification
Private storage for ID docs, short signed URLs for reviewer access only.
Verification statuses: pending, verified, rejected.
Verification badges visible on profiles & properties.

### 9.4 Moderation & Abuse Prevention
Reporting flows, admin takedown, rate-limiting for posting/listings.
Throttle number of listings per new account.
Two-factor or phone verification for high-risk actions.

### 9.5 Data Privacy & PII
Mask sensitive info (bank accounts) in UI. Store payment details only using provider tokens or encrypted storage.
Provide privacy policy & T&Cs; explicit acceptance on signup for landlord/agent.

---

## 10. Notifications & Realtime

### 10.1 Channels
In-app realtime (WebSockets via Supabase Realtime), push notifications (PWA), email (SendGrid), SMS (Twilio/AfricasTalking).

### 10.2 Events
- Booking requested/approved/rejected
- New message
- Agent request accepted/rejected
- Verification result
- Waitlist notification (unit available)
- Payment success/failure

### 10.3 Delivery & Fallback
Try realtime → fallback to email → fallback to SMS (critical actions like payment/fraud).

---

## 11. Testing, QA, Monitoring & KPIs

### 11.1 Testing
- Unit tests for Edge Functions and booking RPCs
- Integration tests for payments using provider sandbox
- E2E tests (Cypress) simulating full booking and payout flows
- RLS & permission tests: run as different roles to verify access

### 11.2 QA Scenarios (Must Include)
- Simultaneous booking attempts (race conditions)
- KYC rejected & resubmitted
- Partial offline behavior (PWA)
- Image upload failure & retry flow
- Payment cancellation mid-flow

### 11.3 Monitoring
- Sentry for frontend & server
- Transaction logs & audit trails
- Health checks for background jobs + webhook endpoints

### 11.4 KPIs
- Time from listing → first inquiry
- Conversion rate (views → inquiries → bookings)
- Avg response time (owner → inquiry)
- Verified landlord % vs total landlords
- Chargebacks/refunds rate
- Monthly active users (MAU)

---

## 12. Deployment, Infra & Operational Playbook

### 12.1 Hosting
- Frontend: Vercel or Netlify (edge CDN)
- Backend: Supabase (Auth, Storage, Realtime, Edge Functions)
- Edge Functions for server logic, webhook handlers, admin endpoints (do not expose service keys)
- Payment provider: Paystack/Flutterwave for Nigeria; Stripe for global

### 12.2 CI/CD
GitHub Actions pipeline:
- Lint & unit tests
- Build frontend & deploy to staging
- Run E2E tests on staging
- Deploy to production on main merge

### 12.3 Backups & DR
Routine exports of Supabase DB / storage snapshots.
Procedure for emergency takedown (admin lock or maintenance page).

### 12.4 Support & Ops
On-call rota for payment & webhook issues.
Playbooks: refund, fraud escalation, user ban/reinstate.

---

## 13. Roadmap & Monetization

### 13.1 Monetization
- Freemium model: basic listing free for early adoption; premium (featured) paid
- Subscription: monthly plan for landlords/agents with analytics & priority placement
- Commission: % on first payment or sale price
- Ads & marketplace: local vendors (furniture, movers) integration
- Value-adds: professional photos, virtual tours, legal templates for a fee

### 13.2 Growth Playbook
- Campus partnerships: accommodation office, orientation welcome packs
- WhatsApp groups & student ambassadors
- On-ground onboarding team to educate landlords
- Initial free listings program—then introduce paid features

---

## 14. Appendix: Data Objects & Sample Messages

### 14.1 Sample User Object
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+234...",
  "role": "landlord|agent|client|admin|support",
  "avatar_url": "https://...",
  "verification_status": "pending|verified|rejected",
  "created_at": "timestamp"
}
```

### 14.2 Sample Property Object
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "title": "Apartment Complex Name",
  "type": "apartment_complex|building|house",
  "address": "Physical address or landmark",
  "city": "City name",
  "latitude": 6.4567,
  "longitude": 3.4567,
  "total_units": 8,
  "price_from": 200000,
  "price_to": 500000,
  "allow_agents": true,
  "is_published": true,
  "verification_status": "pending|verified|rejected",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 14.3 Sample Unit Object
```json
{
  "id": "uuid",
  "property_id": "uuid",
  "unit_name": "Unit A1",
  "price": 250000,
  "bedrooms": 2,
  "bathrooms": 1,
  "images": ["url1", "url2"],
  "amenities": ["wifi", "parking", "security"],
  "status": "available|booked|occupied|maintenance|archived",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 14.4 Sample Booking Object
```json
{
  "id": "uuid",
  "unit_id": "uuid",
  "client_id": "uuid",
  "start_date": "date",
  "end_date": "date",
  "requested_term": "semester|monthly|yearly",
  "status": "pending|approved|rejected|cancelled",
  "payment_intent_id": "payment_intent_id",
  "notes": "Additional notes",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### 14.5 Sample Admin Notification Message
```
Subject: Verification Request Approved
Message: Your KYC documents have been approved. You can now list properties on HouseHub.
```

### 14.6 Sample Booking Request Message
```
Subject: New Booking Request for [Unit Name]
Message: [Client Name] has requested to book [Unit Name] from [Start Date] to [End Date].
Please review and approve/reject this request within 48 hours.
```
