TRADEOS

Master Product Specification, PRD, MVP, EPR, UI/UX Design System & Technical Architecture

Document version: 1.0
Planning date: October 2026
Product: TradeOS
Initial market: Nigeria
Market-entry model: Multi-category product, geographically concentrated launch
Product type: Business operating system, commerce platform and installable Progressive Web App
Primary objective: Help businesses operate more efficiently, maintain trustworthy business records, and progressively connect with customers, suppliers and other businesses.

PART 1 — MASTER BUILD PROMPT

1.1 Your role

Act as a senior product strategist, software architect, database engineer, security engineer, UX/UI designer and full-stack Vue.js developer.

Your responsibility is to design and implement TradeOS as a production-oriented business software platform, not a static dashboard, generic admin template or collection of disconnected pages.

Before writing implementation code:

Understand this specification completely.

Establish the application architecture and module boundaries.

Define the database schema and relationships.

Define authentication, business membership, roles and permissions.

Define subscription plans, entitlements and billing behaviour.

Define the UI design system and responsive navigation.

Define API contracts and server-side validation.

Define the implementation phases and acceptance tests.

Identify any integration capability that needs external documentation or account credentials.

Build incrementally, validating each phase before proceeding.

Do not invent missing requirements, provider endpoints, API capabilities, account details, business information or completed functionality. Where a decision is necessary but unspecified, document the assumption and choose the simplest safe, reversible implementation.

1.2 Non-negotiable product rules

Authenticity and data integrity

Never use AI-generated images.

Never invent users, businesses, staff, transactions, customers, suppliers, invoices, stock quantities, balances, testimonials or activity.

Never hard-code a fictional user name into a greeting.

Never create a demo account automatically.

Never display fabricated dashboard statistics or fake chart data.

Never simulate a successful payment as though money has actually been received.

Never label an unimplemented feature as operational.

Never hide a failed database request by presenting an empty state.

Distinguish zero results from loading, access-denied and service-error states.

Populate the application only through authenticated registration, explicitly requested setup processes or real business activity.

Test data must be isolated from production and clearly labelled as test data.

Do not place actual customer or business information into development fixtures.

Engineering rules

Use Vue.js, TypeScript and Vite for the frontend.

Use Tailwind CSS and Bootstrap without allowing their styles to conflict.

Use Vercel for frontend deployment and appropriate serverless API functions.

Use Neon PostgreSQL as the authoritative business-data database.

Use Supabase Auth for Google and email authentication.

Use Vercel Blob for suitable uploaded files.

Use Resend for transactional email.

Use a suitable server-side PDF rendering service.

Integrate Bachs.io only after verifying its official API documentation and supported capabilities.

Do not expose secret keys, database credentials or privileged tokens to the browser.

Do not use Laravel.

Do not introduce an unnecessary microservice architecture at MVP stage.

Do not build every planned module before the core product has been validated.

1.3 Product definition

TradeOS is a configurable business operating system for small and growing businesses.

It provides one connected workspace for:

Sales and point of sale.

Products and inventory.

Customers and suppliers.

Invoices, quotations and receipts.

Customer debts and supplier liabilities.

Expenses and cashbook.

Business reports.

Employees and branch permissions.

Subscription management.

Future online storefronts and business-to-business commerce.

The product must support multiple retail categories from launch while concentrating customer acquisition and support in one initial geographic market.

Initial categories include:

Provision shops.

Foodstuff retailers.

Cosmetics businesses.

Electronics dealers.

Fashion retailers.

General merchandise stores.

Other suitable retail and trading businesses.

Do not build a separate application for each category. Implement shared business primitives with configurable category-specific fields and workflows.

1.4 Product positioning

TradeOS — Run your business. Know your numbers. Grow with confidence.

The platform should help business owners answer five questions:

What have I sold?

What stock do I have?

Who owes my business money?

What does my business owe?

How is my business performing?

The product should earn trust through reliable records, understandable workflows, transparent pricing and secure access control.

PART 2 — PRODUCT REQUIREMENTS DOCUMENT (PRD)

2.1 Problem statement

Many small businesses manage daily operations across notebooks, spreadsheets, messaging applications, calculators and separate financial tools.

This can create difficulties with:

Tracking daily sales and cash received.

Knowing current stock levels.

Calculating stock costs and margins.

Following up on customer debts.

Tracking supplier bills and outstanding obligations.

Creating consistent invoices and quotations.

Maintaining accurate records across branches.

Sharing information with authorised staff.

Understanding business performance.

TradeOS will consolidate these workflows into one accessible system.

These problems are product hypotheses to validate through interviews and pilot usage. Do not assume every business experiences every problem equally.

2.2 Target users

Primary user: Business owner

Needs to manage the business, maintain records, monitor performance and control access.

Secondary user: Business manager

Needs to supervise daily operations and assigned staff.

Finance user

Needs to manage financial records, invoices, payments, debts, expenses and reports within their assigned permissions.

Sales staff or cashier

Needs to record sales, issue receipts and handle authorised transactions.

Inventory staff

Needs to manage products, stock receipts, stock counts and inventory movements.

TradeOS Admin

Handles platform operations, customer support, verification, permitted moderation and investigations.

TradeOS Super Admin

Controls platform-wide configuration, subscription pricing, plan duration, feature entitlements, provider credentials, internal administrator access and security settings.

These roles must remain separate. A business owner is not automatically a TradeOS platform administrator.

2.3 Product objectives

MVP objectives

Let a real user register and sign in securely.

Allow the user to create a business workspace.

Provide a reliable product and inventory system.

Record sales and payments accurately.

Generate branded invoices, quotations and receipts.

Track customer debts and supplier liabilities.

Record expenses and basic cashbook activity.

Provide useful reports from actual records.

Support business staff and branch-scoped permissions.

Provide an installable, responsive PWA.

Introduce configurable Free and paid plans.

Give the platform owner operational control through a secure Super Admin portal.

Long-term objectives

Supplier discovery and purchasing.

Online storefronts.

B2B ordering and wholesale workflows.

Payment and logistics integrations.

Developer APIs and webhooks.

Cross-business commerce.

International expansion.

2.4 Success measurements

Track actual product analytics, not invented dashboard metrics.

Key measurements:

Registration completion rate.

Business creation completion rate.

Time to first real product.

Time to first real sale.

Weekly active businesses.

Repeat usage by business.

Inventory accuracy.

Number of invoices issued.

Customer debt collection activity.

Support time per active business.

Free-to-paid conversion.

Paid subscription retention.

Subscription revenue and gross margin.

Failed payment and webhook recovery rates.

Security incidents and unauthorised access attempts.

All metrics must have explicit definitions and reliable sources.

PART 3 — MVP SCOPE

3.1 Authentication and onboarding

Implement:

Email registration and sign-in.

Google OAuth through Supabase Auth.

Password recovery for email-based accounts.

Email verification where required.

Secure logout and session handling.

Profile management.

Account status and recovery flows.

First-business onboarding.

Business invitations.

Business switching.

Branch membership.

Account deletion requests and appropriate retention workflows.

First-time experience

An unauthenticated visitor sees the public landing page and sign-in options.

A newly registered user with no business sees an onboarding screen and a Create Business action.

A returning user sees their authorised workspace or a business selector if they belong to multiple businesses.

Never silently create a business, select an arbitrary business or invent a profile name.

3.2 Business management

Each business has its own:

Legal or trading name.

Business type and category.

Contact details.

Address.

Currency.

Time zone.

Document numbering rules.

Tax settings where applicable.

Logo and branding.

Staff memberships.

Branches.

Products and stock records.

Customers and suppliers.

Sales and financial records.

Subscription entitlement context.

A user may belong to multiple businesses. Permissions are assigned separately for each business membership.

3.3 Products and inventory

Required features:

Product creation and editing.

SKU and optional barcode.

Product categories.

Product image uploads.

Cost price and selling price.

Units of measurement.

Opening stock.

Stock receipts.

Stock adjustments with reasons.

Stock transfers between branches.

Stock movement history.

Low-stock thresholds.

Product search and filters.

Bulk import and export.

Stock valuation using a defined costing policy.

Support for services that do not require stock.

Where appropriate, support multiple units, such as carton, pack and individual item. Unit conversions must be explicitly configured.

Category-specific extensions can include fashion sizes, electronics serial numbers and warranties, foodstuff quantities, and expiry tracking.

Do not force every category to use the same fields.

3.4 Sales and POS

Required features:

Create a sale.

Add products and quantities.

Apply authorised discounts.

Calculate totals server-side.

Record payment method and payment status.

Support split payments where required.

Issue a receipt.

Update stock through a controlled stock movement.

Search sales history.

Record returns and refunds.

Cancel or reverse transactions through an auditable workflow.

Prevent duplicate processing.

Track cashier and branch.

Close and reconcile cash shifts where enabled.

Payment accounting rules

A recorded payment method is not proof that money has been received from an external provider.

A sale paid in cash can be recorded as cash received by an authorised user. A card or gateway transaction must be verified through its authoritative payment provider before being marked as confirmed.

A credit sale must not be treated as fully collected cash.

3.5 Invoices and quotations

Implement:

Invoice creation.

Quotation creation.

Configurable document numbering.

Draft, issued, partially paid, paid, overdue, cancelled and other applicable statuses.

Convert an accepted quotation to an invoice.

Record due dates.

Record partial payments.

Generate receipts for recorded payments.

Download and print PDFs.

Email documents through Resend.

Share document links securely.

Record payment instructions.

Track customer statements.

Store the relevant business branding.

Maintain document history.

A previously issued document must retain its historical details. Editing current business branding must not silently change old invoices.

3.6 Customer management and debtors

Required features:

Customer profiles.

Contact details.

Customer sales history.

Outstanding balance.

Credit sales.

Due dates.

Partial repayments.

Payment history.

Customer statements.

Overdue debt reports.

Optional credit limits.

Reminder history and consent settings.

3.7 Suppliers and creditors

Required features:

Supplier profiles.

Purchase records.

Supplier bills.

Due dates.

Outstanding liabilities.

Partial payments.

Purchase returns.

Supplier statements.

Payment history.

Outstanding creditor reports.

Customer debts and supplier liabilities must be maintained separately.

3.8 Expenses and cashbook

Required features:

Record income and expenses.

Expense categories.

Payment method.

Transaction date.

Description and reference.

Optional receipt attachment.

Cashbook entries.

Opening balances where explicitly configured.

Daily and monthly summaries.

Exportable records.

Audit trail for corrections.

Avoid silently changing a financial record after it has been posted. Use controlled reversal and correction entries where appropriate.

3.9 Reports

MVP reports:

Sales by day and period.

Payments received.

Outstanding customer balances.

Supplier liabilities.

Expense summaries.

Stock on hand.

Low-stock products.

Stock valuation.

Product sales.

Business performance summary.

Reports must state their date range, currency, branch scope and calculation basis.

Revenue, cash collected, profit and outstanding debt are different metrics. Do not label one as another.

3.10 Staff and branch access

A business owner can:

Invite staff.

Assign business roles.

Assign one or more branch memberships.

Grant or revoke permissions.

Disable a membership.

Review staff activity within the business.

Restrict financial reports, refunds, stock adjustments and settings.

Each person uses their own login. Adding a branch does not automatically create an account or require a separate login.

PART 4 — EXPANDED PRODUCT REQUIREMENTS (EPR)

This section defines the intended long-term feature catalogue. It does not require every feature to be implemented in the MVP.

4.1 Business operations

Multiple businesses per user according to subscription.

Multiple branches per business.

Business switching.

Centralised and branch-level reporting.

Business documents and custom fields.

Bulk import and export.

Activity timeline.

Branch transfers.

Staff roles and permissions.

Business branding.

Category-specific configurations.

4.2 Advanced inventory

Batch and expiry tracking.

Serial numbers and warranties.

Product variants.

Bundles and kits.

Multiple measurement units.

Stock transfer approvals.

Stocktake sessions.

Damaged and returned goods.

Advanced costing.

Dead-stock reporting.

Reorder workflows.

Purchase forecasting based on actual data.

Supplier-specific product catalogues.

4.3 Purchasing and procurement

Purchase requisitions.

Supplier quotations.

Purchase orders.

Goods received records.

Supplier invoice matching.

Partial goods receipt.

Supplier returns.

Purchase approvals.

Recurring purchase workflows.

Supplier price comparisons.

Bulk purchase requests.

4.4 Online commerce

Business storefront.

Product catalogue.

Storefront branding.

Optional custom domain.

Online cart and checkout.

Payment provider integration.

Delivery and pickup options.

Promotions.

Product availability.

Order tracking.

Reviews subject to authenticity and moderation.

POS and online order synchronisation.

Social commerce integrations.

4.5 B2B commerce network

Buyer and seller profiles.

Wholesale prices.

Minimum order quantities.

Request for quotation.

Quote comparison.

Negotiation history.

Purchase orders.

Order acceptance and fulfilment.

Repeat orders.

Business messaging.

Verified transaction evidence.

Dispute handling.

Supplier discovery.

Supplier performance based on substantiated records.

4.6 Advanced financial management

Chart of accounts.

Accounts receivable and payable.

Cash-flow statements.

Profit and loss reporting.

Balance-sheet support.

Payment reconciliation.

Bank transaction imports.

Financial closing periods.

Accountant exports.

Tax reporting support.

Multi-currency transactions.

Exchange-rate records.

Financial approvals.

Audit-ready transaction history.

Do not advertise full statutory accounting or tax compliance until the relevant workflows have been validated by qualified professionals.

4.7 Integrations and API ecosystem

Versioned REST API.

API key or OAuth-based access according to use case.

Scoped permissions.

Webhooks.

Signed webhook payloads.

Retry handling.

Idempotency.

API usage quotas.

Developer documentation.

Sandbox environment.

Integration management.

Partner onboarding.

Usage and billing records.

4.8 Logistics

Delivery address book.

Delivery zones.

Delivery pricing.

Pickup and dispatch.

Carrier integrations.

Proof of delivery.

Delivery status updates.

Failed-delivery workflows.

Returns.

Delivery cost reconciliation.

4.9 Trust and business identity

Business profile and QR code.

Verification workflows.

Consent-based business record sharing.

Verified order and invoice evidence.

Dispute and appeal processes.

Business data export.

Third-party access grants.

Consent revocation.

Correction requests.

Tamper-evident audit events.

Do not publish private customer financial information or assign public trust scores without a transparent, fair and privacy-conscious process.

4.10 Industry extensions

Future modules may support:

Fashion variants and size inventory.

Electronics serial numbers and warranties.

Foodstuff quantities and bulk measurements.

Pharmacy batches and expiry, subject to applicable requirements.

Restaurant ingredients and recipe costing.

Manufacturing bills of materials.

Agriculture lots.

Service appointments.

Repair jobs.

Franchise operations.

4.11 International expansion

Local currencies.

Language and date localisation.

Country-specific taxes.

Regional payment providers.

International suppliers.

Cross-border document formats.

Country-specific verification.

Data residency where legally required.

Regional support and compliance workflows.

PART 5 — SUBSCRIPTIONS AND MONETISATION

5.1 Business plans

Free

Designed to provide genuine utility:

One business workspace.

Basic sales and POS.

Basic inventory.

Invoices and quotations.

Receipts and standard PDFs.

Customers and suppliers.

Debtors and creditors.

Income and expenses.

Basic cashbook.

Standard reports.

Basic staff permissions.

Manual payment recording.

Essential exports within configured limits.

Pro

Potential capabilities:

Additional business workspaces according to plan.

More branches and staff.

Advanced financial reporting.

Advanced stock valuation.

Payment reminders.

Purchase approvals.

Custom document templates.

Scheduled exports.

Expanded storage and document limits.

Advanced role permissions.

Supported integrations.

Business Group / Enterprise

Potential capabilities:

Higher business, branch and staff limits.

Consolidated reporting.

Advanced approvals.

API access and webhooks.

Enterprise integrations.

Expanded audit and governance controls.

Priority support.

Custom contract terms where supported.

5.2 Super Admin subscription controls

The Super Admin can configure:

Plan name.

Description.

Currency.

Price.

Billing interval.

Trial duration.

Business limit.

Branch limit.

Staff limit.

Storage quota.

Document quota.

Feature entitlements.

API quotas.

Discount rules.

Grace period.

Renewal behaviour.

Publication status.

Plans and prices must be versioned.

A plan edit must not unexpectedly rewrite the terms of an existing subscription. Apply changes to existing customers only according to the documented renewal and customer-notification policy.

5.3 Expired subscriptions

When a subscription expires:

Do not delete the business.

Do not delete business records.

Do not hold customer data hostage.

Show the actual subscription status.

Apply the configured grace period.

Restrict new usage above plan limits where appropriate.

Provide clear renewal instructions.

Preserve legally required financial records.

Permit appropriate data export.

Restore entitled features after valid payment confirmation.

PART 6 — ADMIN AND SUPER ADMIN ARCHITECTURE

6.1 TradeOS Admin

Responsible for delegated operational duties:

Customer support.

Business verification.

Marketplace moderation.

Complaint handling.

Dispute investigations.

Operational reports.

Approved account restrictions.

Subscription support.

Service-health monitoring.

An Admin does not automatically control platform pricing, global settings or gateway credentials.

6.2 TradeOS Super Admin

Controls:

Internal Admin account creation.

Administrator roles and permissions.

Subscription pricing and duration.

Feature entitlements.

Business and branch limits.

Payment gateway configuration.

Email and notification configuration.

Platform branding.

Legal-document publication.

Global security settings.

API policies.

Platform-wide reporting.

Incident response and maintenance settings.

Audit and retention policies.

6.3 Admin security

No public Admin registration.

Secure initial Super Admin provisioning.

Mandatory MFA for internal administrators.

Reauthentication for sensitive actions.

Server-side role checks.

Least-privilege access.

Audit every sensitive administrative change.

Prevent self-promotion.

Protect the last active Super Admin account.

Require an explanation for sensitive restrictions and adjustments.

Use a second approver for selected high-risk actions.

Never permit administrator accounts to read passwords or erase their own audit history.

PART 7 — TECHNICAL ARCHITECTURE

7.1 Approved technology stack

Layer

Technology

Responsibility

Frontend

Vue.js + TypeScript

Application UI and interactions

Build tooling

Vite

Development and production builds

Styling

Tailwind CSS + Bootstrap

Layout, responsive styling and selected components

Hosting

Vercel

Frontend deployment and supported serverless execution

API

Vercel serverless functions

Trusted application logic

Database

Neon PostgreSQL

Authoritative business records

Authentication

Supabase Auth

Identity, Google OAuth and email authentication

File storage

Vercel Blob

Business-uploaded files

Email

Resend

Transactional email

PDF generation

Dedicated Puppeteer/Chromium service or compatible server-side runtime

PDF rendering

Payment gateway

Bachs.io adapter after API verification

Supported payment flows

PWA

Web manifest and service worker

Installation and scoped offline capabilities

Monitoring

Selected error monitoring and structured server logs

Reliability and incident diagnosis

7.2 Database ownership

Neon is the authoritative source for TradeOS business records.

Supabase Auth handles identity authentication. Map its authenticated identity to an internal TradeOS user record.

Do not duplicate the same authoritative sales, inventory or financial data across Neon and Supabase databases.

The server must validate the authenticated identity and retrieve business membership and permissions from trusted records before granting access.

7.3 High-level request flow

Vue.js Web App / Installed PWA
               |
               v
        Vercel API Layer
               |
      Authentication Validation
               |
      Business Membership Check
               |
       Role / Permission Check
               |
               v
         Neon PostgreSQL
               |
       Business Transactions
               |
        Background Workflows
        /        |         \
     Resend   PDF Service   Payment Providers
                              |
                              v
                    Verified Webhook Events
                              |
                              v
                     Subscription Updates

File uploads should use authorised server-generated upload permissions or an equivalent controlled process. Blob URLs must not become an alternative route to private business data.

7.4 Application modules

Organise the backend into clear modules:

Authentication and profiles.

Businesses and branches.

Memberships and permissions.

Products and inventory.

Sales and POS.

Customers and suppliers.

Invoices and quotations.

Payments and refunds.

Expenses and cashbook.

Reports.

Subscriptions and entitlements.

Notifications.

Document generation.

Platform administration.

Integrations and webhooks.

Audit and security.

Use modular boundaries without forcing each module into a separate microservice.

7.5 Database schema

The following is a logical schema catalogue. Detailed columns, constraints and migrations must be defined before implementation.

Identity and access

users

user_profiles

businesses

business_memberships

business_roles

permissions

role_permissions

membership_role_assignments

branches

branch_memberships

business_invitations

user_sessions where application-managed session tracking is required

Supabase Auth owns authentication credentials. Do not duplicate password storage unnecessarily in Neon.

Products and inventory

product_categories

products

product_variants

product_units

product_unit_conversions

branch_inventory

stock_movements

stock_counts

stock_count_items

stock_transfers

stock_transfer_items

inventory_batches where required

product_serial_numbers where required

Sales and purchasing

sales

sale_items

sale_payments

sale_returns

sale_return_items

customers

suppliers

purchase_orders

purchase_order_items

goods_receipts

goods_receipt_items

supplier_bills

supplier_bill_items

supplier_payments

Documents and finances

invoices

invoice_items

quotations

quotation_items

receipts

customer_payments

customer_payment_allocations

expenses

cashbook_entries

document_branding_settings

document_number_sequences

financial_periods

audit_logs

Subscriptions and payments

subscription_plans

subscription_plan_versions

plan_entitlements

subscriptions

subscription_events

payment_providers

provider_credentials or references to a managed secrets store

payment_transactions

refunds

webhook_events

billing_invoices

Administration and integrations

platform_admins

platform_admin_roles

platform_admin_permissions

platform_settings

platform_setting_versions

support_tickets

disputes

verification_cases

notifications

notification_delivery_attempts

api_clients

api_usage_records

webhook_endpoints

webhook_delivery_attempts

7.6 Data integrity requirements

Use primary and foreign keys.

Add tenant and branch scoping to relevant records.

Add indexes for common lookup and reporting patterns.

Use database transactions for related financial and stock operations.

Use unique constraints for document numbering within its defined scope.

Use idempotency keys for retryable financial operations.

Use explicit decimal/numeric types for monetary amounts.

Preserve transaction currency and exchange-rate information where relevant.

Store timestamps consistently and display them using business or user locale settings.

Maintain audit history for important changes.

Use migrations and version-controlled schema changes.

Do not rely on frontend validation for security or financial correctness.

7.7 Financial transaction design

A completed sale may create several linked records:

Sale and sale items.

Stock movements.

Payment records or outstanding customer balance.

Cashbook or accounting entries where applicable.

Audit events.

These operations must be coordinated so the application does not record a sale while silently failing to update the corresponding stock or payment state.

If a transaction spans systems that cannot share one database transaction, use idempotent events, explicit statuses, retry handling and reconciliation.

Do not delete posted financial records to correct errors. Use authorised reversal and correction workflows.

PART 8 — PAYMENT GATEWAY ARCHITECTURE

8.1 Payment adapter

Create a payment-provider abstraction so the business logic is not tied to one gateway.

A provider adapter may support the following operations where the actual provider API permits them:

Create checkout session.

Verify payment.

Process webhook.

Retrieve transaction status.

Initiate refund.

Retrieve refund status.

Reconcile transactions.

Determine supported currencies and payment methods.

Do not assume Bachs.io supports all of these operations until its official documentation confirms them.

8.2 Subscription payment flow

The user selects a published plan.

TradeOS retrieves the current price and entitlement version from the server.

The server creates a pending billing record.

The server initiates checkout through the configured provider.

The user completes payment through the provider.

TradeOS verifies the transaction using the provider's authoritative API or authenticated webhook.

The server checks the expected amount, currency, reference and intended subscription.

The subscription becomes active only after successful verification.

The event is recorded idempotently.

Failed, delayed, duplicate or reversed events follow explicit recovery workflows.

Never activate a subscription merely because the browser returns to a success URL.

8.3 API credential management

Keep credentials server-side.

Mask secrets in the interface.

Require permission and reauthentication to replace credentials.

Distinguish sandbox and live credentials.

Audit every credential change.

Support a tested rollback process.

Never include secret keys in logs.

Never expose private provider credentials through public configuration endpoints.

PART 9 — PDF GENERATION AND DOCUMENT BRANDING

9.1 PDF service

Use server-side HTML-to-PDF rendering with Puppeteer/Chromium or a suitable compatible service.

Do not assume every Vercel serverless runtime can execute Chromium reliably. Validate runtime size, execution time, memory and deployment limits. Use a dedicated rendering service when necessary.

9.2 Supported documents

Invoices.

Quotations.

Receipts.

Customer statements.

Supplier statements.

Purchase orders.

Delivery notes.

Financial reports.

Stock reports.

9.3 Business branding

Each business can configure:

Logo.

Business name and contact details.

Document colours.

Document numbering.

Footer and notes.

Payment instructions.

Watermark image and opacity.

Signature image or drawn signature.

Signatory name and designation.

Currency and tax display.

Available templates.

A signature image is visual identification, not automatically a verified legal electronic signature.

9.4 Historical integrity

Store an appropriate document snapshot when a document is issued. Changes to current branding, product details or business settings must not silently alter previously issued financial documents.

PART 10 — UI/UX DESIGN SYSTEM

10.1 Brand direction

TradeOS should look like mature business software: practical, credible, efficient and easy to understand.

Avoid:

Generic AI-SaaS styling.

Excessive gradients.

Glowing cards and decorative blur.

Unnecessary animations.

Oversized headings inside operational dashboards.

Excessive rounded cards.

Fake activity feeds.

Fake customer logos.

Stock imagery used as invented product or business evidence.

Text-only logo treatments where a real graphic identity is required.

Use a restrained design system, strong information hierarchy, real whitespace, readable tables and efficient business workflows.

10.2 Colour palette

Primary palette

Token

Hex

Use

TradeOS Navy

#142B4A

Primary brand, navigation and important headings

TradeOS Blue

#2563EB

Primary actions, active states and links

TradeOS Blue Dark

#1D4ED8

Hover and emphasis states

TradeOS Orange

#F59E0B

Limited highlights and selected attention states

White

#FFFFFF

Main surfaces

Background

#F6F8FB

Main application background

Surface

#FFFFFF

Panels and forms

Border

#E2E8F0

Dividers, input borders and table boundaries

Text Primary

#172033

Main text

Text Secondary

#64748B

Supporting text

Semantic colours

Token

Hex

Meaning

Success

#15803D

Confirmed successful actions

Warning

#B45309

Attention required

Danger

#B91C1C

Errors and destructive actions

Information

#0369A1

Informational messages

Do not communicate state using colour alone. Use text labels and icons, with sufficient contrast.

The palette is a starting design decision and should be checked for accessibility contrast before release.

10.3 Typography

Primary font: Bricolage Grotesque.

Use it for:

Brand wordmark typography.

Page titles.

Section headings.

Dashboard summaries.

Prominent figures where readability remains strong.

Use a legible system sans-serif or a compatible text face for dense tables, forms and operational data if needed. Limit the interface to two font families.

Document output may use a separate readable print font where appropriate. Do not assume the interface font is mandatory for every PDF.

Use a consistent type scale, restrained font weights and sufficient line height. Financial values should align consistently and use tabular numerals where available.

10.4 Layout

Desktop

Collapsible left sidebar.

Top bar for business selector, search, notifications and account menu.

Main content area with clear page title and primary action.

Dense but readable data tables.

Filters above the results they control.

Side panels or dialogs for focused tasks where appropriate.

Mobile

Compact header.

Touch-friendly bottom navigation or compact menu.

Full-screen forms for complex tasks when appropriate.

Tables that adapt into readable cards or controlled horizontal scrolling.

Large enough controls for touch interaction.

No horizontal page overflow.

Clear status indicators and offline-sync state.

Main navigation

Overview.

Sales & POS.

Products & Inventory.

Invoices & Quotations.

Customers & Debtors.

Suppliers & Creditors.

Income & Expenses.

Financial Reports.

Staff & Permissions.

Branches.

Business Settings.

Subscription & Billing.

Show only items the authenticated user is authorised to access.

Platform administration navigation

Overview.

Users & Businesses.

Verification.

Support Tickets.

Fraud & Disputes.

Marketplace Moderation.

Subscriptions & Payments.

Operational Reports.

Admin Management, restricted to Super Admin.

Payment Providers, restricted to authorised administrators.

Platform Settings.

Integrations & API.

Audit Activity.

Security.

System Health.

10.5 Landing page

The public landing page should explain:

What TradeOS does.

Which businesses it supports.

How sales, inventory and financial records work together.

Why accurate business records matter.

Available plans and their actual terms.

How to register.

Where to find help and legal documents.

Use genuine photography with appropriate licensing or original graphics built manually with CSS/SVG. Do not generate AI images.

Do not display fabricated testimonials, customer logos, business counts or success claims.

10.6 Empty, loading and error states

Examples:

“No products yet. Add your first product to begin tracking stock.”

“No sales recorded for this period.”

“No invoices match these filters.”

“You do not have permission to view this report.”

“We could not load your sales records. Please try again.”

“Payment confirmation is pending. We will update the status when it is verified.”

Never present a loading failure as a genuine zero balance.

10.7 Document design

Invoices and quotations should be professional, printable and readable in black and white as well as colour.

Support:

Business logo.

Business contact information.

Customer details.

Document number and issue date.

Item descriptions.

Quantity and unit price.

Discounts and applicable taxes.

Totals and amounts paid.

Outstanding balance.

Payment instructions.

Notes and terms.

Signature and watermark where configured.

PART 11 — PWA REQUIREMENTS

11.1 Application behaviour

TradeOS must work as both a browser-based web application and an installable PWA.

Use one shared codebase and one authoritative backend.

Support:

Responsive desktop and mobile layouts.

Web app manifest.

Installable application icon.

Standalone display mode.

Service worker.

Safe caching of static assets.

Offline status indication.

Supported offline sales workflows.

Pending-sync indicators.

Conflict handling.

Retryable synchronisation.

Protection against duplicate transaction submission.

11.2 Offline limitations

Offline mode must not promise capabilities that require an online server.

For example:

Google authentication requires an online authentication flow.

Gateway payment verification requires provider/server connectivity.

Subscription changes require server confirmation.

Sensitive reports must not be exposed through uncontrolled caching.

Offline sales may be queued, but the interface must show their pending status.

Conflicting stock updates must be reconciled rather than silently overwriting another user's changes.

Use minimal local data, appropriate device protections and explicit logout/cache-clearing behaviour.

PART 12 — SECURITY AND PRIVACY

12.1 Identity and session security

Use Supabase Auth for authentication.

Validate tokens and sessions on the server.

Use secure session handling and appropriate expiration.

Require MFA for internal administrators.

Protect password recovery and account changes.

Apply rate limits to sensitive endpoints.

Prevent account enumeration where practical.

Require explicit authorisation for business membership changes.

12.2 Tenant isolation

Every business-owned resource must be scoped to an authorised business and, where applicable, branch.

The backend must verify membership and permissions for every protected request.

Never trust a client-supplied business_id, branch_id, role or permission without checking it against the authenticated user's access.

12.3 Application security

HTTPS.

Prepared SQL statements.

Server-side validation.

Output encoding and XSS protection.

CSRF protection where applicable.

Security headers.

Rate limiting.

Least-privilege service credentials.

Protected file access.

Safe file type and size validation.

Dependency scanning.

Secure error handling.

No secret keys in frontend bundles.

No sensitive data in logs.

Backups and recovery tests.

12.4 Financial integrity

Server-calculated totals.

Explicit payment statuses.

Idempotent payment processing.

Verified provider webhooks.

Audit records for financial changes.

Controlled reversals and refunds.

Reconciliation of provider transactions.

Separate tracking of revenue, cash received and outstanding balances.

12.5 Privacy

Collect only necessary personal data.

Explain data usage.

Record consent where required.

Provide suitable data export and deletion workflows.

Define retention rules for business and financial records.

Restrict administrator access to customer data.

Audit exceptional access.

Publish privacy and cookie policies consistent with actual system behaviour.

Review applicable Nigerian data-protection obligations before launch.

PART 13 — EMAIL AND NOTIFICATIONS

Use Resend for transactional email.

Required email flows:

Email verification where configured.

Password recovery.

Business invitations.

Invoice delivery.

Quotation delivery.

Payment receipts.

Subscription confirmation.

Subscription renewal or expiration notices.

Security alerts.

Relevant support updates.

Use verified sending domains, server-side templates, delivery status tracking and retry controls.

Avoid sending duplicate notifications when a webhook is retried.

Additional channels, such as SMS and approved WhatsApp Business messaging, should be added through separately configured providers and consent-aware workflows.

PART 14 — LEGAL AND PUBLIC PAGES

Required public pages:

Terms of Service.

Privacy Policy.

Cookie Policy.

FAQ.

Acceptable Use Policy.

Refund and Cancellation Policy.

Contact and Support.

Service Status.

Marketplace Policy when the marketplace launches.

API Terms when public API access launches.

Verification and Dispute Policy where relevant.

Maintain version history for published legal documents. Record the accepted version where required.

Cookie consent controls must reflect the actual scripts and tracking technologies used. Do not load optional tracking scripts before the applicable consent requirements are met.

Legal content must be reviewed for the markets and services in which TradeOS operates.

PART 15 — IMPLEMENTATION PHASES

Phase 0: Specification and foundation

Deliver:

Final architecture.

Database ERD.

Database migrations.

Authentication design.

Permission matrix.

API contracts.

Design tokens.

Routing plan.

Deployment and environment configuration.

Automated test strategy.

Acceptance gate: architecture and security decisions reviewed before core feature implementation.

Phase 1: Identity and business workspace

Implement:

Registration and login.

Google OAuth.

User profile.

Business creation.

Business membership.

Branch structure.

Invitations.

Role and permission enforcement.

Free-plan entitlements.

Acceptance gate: users can create and access only the businesses they are authorised to access.

Phase 2: Core business operations

Implement:

Products.

Inventory.

Sales and POS.

Customers.

Suppliers.

Invoices.

Quotations.

Receipts.

Debtors.

Creditors.

Expenses.

Cashbook.

Standard reports.

Acceptance gate: critical sales, stock and financial workflows pass integration tests.

Phase 3: Documents and PWA

Implement:

PDF generation.

Business branding.

Email delivery.

Responsive layouts.

PWA installation.

Scoped offline support.

Safe synchronisation.

Acceptance gate: documents match server-side records, and offline actions cannot silently duplicate transactions.

Phase 4: Subscription and administration

Implement:

Subscription plans.

Configurable billing intervals.

Feature entitlements.

Subscription state transitions.

TradeOS Admin portal.

Super Admin portal.

Payment provider configuration.

Audit logs.

Operational monitoring.

Acceptance gate: plan limits are enforced server-side, and subscriptions activate only after verified payment where payment is required.

Phase 5: Controlled market pilot

Run a concentrated pilot with businesses across several retail categories.

Validate:

Onboarding.

Daily usage.

Record accuracy.

Support needs.

Retention.

Willingness to pay.

Operational costs.

Acceptance gate: the pilot meets documented product and reliability targets before major expansion.

Phase 6: Commerce network

Introduce in measured steps:

Storefronts.

Supplier discovery.

Purchase orders.

Wholesale requests.

B2B orders.

Logistics integrations.

Public API and webhooks.

Additional industry modules.

Acceptance gate: each new module has validated demand, a defined operating model and appropriate security controls.

PART 16 — TESTING AND RELEASE CRITERIA

Functional testing

Test:

Registration and login.

Google authentication.

Business creation.

Multiple business membership.

Branch switching.

Staff invitations.

Role changes.

Product creation.

Stock receipts and adjustments.

Sales and returns.

Invoices and quotations.

Partial payments.

Debtor and creditor calculations.

Expenses and cashbook.

PDF generation.

Email delivery.

Subscription expiration.

Payment webhook retries.

PWA installation and offline recovery.

Security testing

Verify:

A user cannot read another business's records.

A branch-restricted staff member cannot access an unassigned branch.

A cashier cannot perform unauthorised refunds.

A normal user cannot access internal Admin routes.

An Admin cannot change Super Admin-only settings.

A browser cannot alter trusted financial totals.

A fake payment success redirect cannot activate a subscription.

Duplicate webhooks cannot create duplicate payments.

Private API keys never appear in frontend responses or logs.

Reliability testing

Test:

Network interruption during a sale.

Retry after a timeout.

Database transaction failure.

Duplicate submission.

Expired authentication.

Concurrent stock updates.

Failed PDF generation.

Failed email delivery.

Payment provider downtime.

Backup restoration.

Release gate

Do not call the MVP production-ready until:

Critical workflows pass automated tests.

Permissions are enforced server-side.

Tenant isolation has been tested.

Financial calculations have been verified.

Payment integrations have been tested in sandbox.

Backups and restoration have been tested.

Monitoring and error handling are configured.

Legal pages are published as appropriate.

No fabricated users or business records are present.

Known limitations are documented.

PART 17 — FINAL INSTRUCTIONS TO THE DEVELOPMENT TEAM

Build TradeOS as a modular, secure, responsive business operating system.

Follow the specification in priority order. Do not implement the entire long-term catalogue in the first release.

Do not invent user data, business records, statistics, credentials, API responses or provider capabilities.

Use actual database records for every business dashboard, financial calculation, invoice and report.

Keep business data authoritative in Neon PostgreSQL, identity authentication in Supabase Auth, suitable uploaded files in Vercel Blob, transactional email in Resend, and payment-provider secrets on the server.

Implement every permission on the backend. Separate business-level roles from TradeOS internal administrator roles.

Build the PWA around real operational requirements. Offline actions must be visibly pending until synchronisation is confirmed. Financial and stock operations must be retry-safe.

Use the approved visual direction: Bricolage Grotesque as the primary interface font, a restrained navy-and-blue palette with limited orange accents, clean business tables, responsive layouts and genuine visual assets. Do not use AI-generated images or fabricated testimonials.

Maintain a clear distinction between completed features, partially implemented features and future roadmap items.

Before starting each phase, define its database changes, API contracts, permission requirements, UI states, error states and acceptance tests. Complete and verify the phase before moving to the next.

The definition of success is not the number of features built. It is a reliable product that real businesses can use daily, trust with their records, and eventually pay for.