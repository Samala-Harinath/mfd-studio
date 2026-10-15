# Llamaworx-Style MFD Website Platform: Plain-English Product and Technical Blueprint

## 1. What this document is for

This document turns the Llamaworx MFD presentation into a practical plan
for building a similar platform. It explains the product, the technology
choices, how multiple MFDs can safely create their own branded websites,
how logos and achievements are added, and which third-party services may
be needed.

**Important distinction** - **From the PPT:** the product is a digital
platform for Mutual Fund Distributors (MFDs). It describes branded
websites, investor tools, lead management, SEO, compliance features, AI
assistants, plans, pricing, and some features marked "coming soon." -
**Technical recommendations in this document:** these are suggested ways
to build such a product. They are not claims that the PPT already
implements them.

This is a product and engineering guide, not legal, tax, investment, or
regulatory advice. Get qualified review of the compliance, privacy, and
security design before launch.

------------------------------------------------------------------------

## 2. What are we building?

Imagine a platform where an MFD signs up, enters their business details,
uploads a logo, adds their services and achievements, chooses colours,
and publishes a professional website.

Each MFD gets their own website and private dashboard. For example:

-   `www.sharmainvestments.in`
-   `www.patelfinancial.in`

Both websites can run on the same software platform. However, Sharma
must never see Patel's customer enquiries, files, settings, or reports.

The platform has two main parts:

1.  **The MFD dashboard:** a private area where the distributor edits
    the website and manages enquiries.
2.  **The public website:** the site that investors and visitors see.

The business model is software-as-a-service (SaaS). In plain English,
the company builds and maintains one product that many MFDs use, usually
for a setup fee and recurring charges.

### The main user journey

1.  An MFD signs up.
2.  The MFD verifies their email and provides business details,
    including their ARN and contact information.
3.  The MFD chooses a plan.
4.  The MFD uploads a logo and photo, enters their company name,
    services, languages, contact details, and approved content.
5.  The platform creates a draft website from a template.
6.  The MFD previews it on a phone and computer.
7.  The MFD checks the information and compliance wording.
8.  The MFD clicks **Publish**.
9.  Visitors can view the website, use available calculators, and send
    enquiries.
10. The MFD manages enquiries from a private dashboard.

Do not automatically publish unreviewed content. A draft-and-approval
process is safer.

------------------------------------------------------------------------

## 3. What should the project be called?

Choose a name that is easy to say, spell, remember, and use as a domain.
Check trademarks, company names, app-store names, and domain
availability before making a final decision.

Possible working names:

-   **MFDWeb** --- direct and easy to understand, but generic.
-   **DistribuSite** --- communicates a website platform for
    distributors.
-   **MFD Studio** --- suggests a place where distributors build and
    manage their online presence.
-   **FinDistrib** --- broader, suitable if the product later includes
    more business tools.
-   **AdvisorDesk** --- may be misleading for MFDs because "adviser" can
    have regulatory implications; avoid unless reviewed by a compliance
    expert.

**Practical recommendation:** use **MFD Studio** as an internal working
name until trademark and domain checks are complete. Do not assume the
name is available. If this product is an official extension of
Llamaworx, keep the Llamaworx brand instead of creating a competing
name.

A possible repository name is `mfd-platform`. A repository is simply the
organised home for the application's source code.

------------------------------------------------------------------------

## 4. Is Next.js good for the frontend?

**Yes. Next.js is a strong choice for this product.**

The frontend is the part people see and interact with: pages, forms,
buttons, dashboards, previews, and public websites.

Next.js is based on React and is useful for: - Building the private MFD
dashboard. - Building public websites that search engines can read. -
Creating fast, mobile-friendly pages. - Handling pages for many MFDs
from one codebase. - Supporting custom domains. - Creating
server-rendered pages where appropriate.

### Recommended frontend setup

-   **Next.js + TypeScript:** TypeScript helps catch many coding
    mistakes before deployment.
-   **A component library** such as shadcn/ui or a comparable accessible
    UI kit: reusable buttons, forms, dialogs, tables, and menus.
-   **A form library** such as React Hook Form, plus a schema validator
    such as Zod: helps validate form input.
-   **Responsive design:** pages should work on mobile phones, tablets,
    and computers.
-   **Separate dashboard and public-site layouts:** the dashboard should
    be private; the public site should be accessible to visitors.

You do not need to build every screen from scratch. Reusable components
save time and make the interface consistent.

### One important design choice

Do not create a separate Next.js application for every MFD. Start with
one application that reads the correct MFD's settings and content based
on the website's domain or tenant identifier. This is cheaper to
maintain and easier to update.

A separate application or infrastructure may be justified later for a
customer with special security or hosting requirements, but it is not
the sensible default for an early product.

------------------------------------------------------------------------

## 5. Is FastAPI good for the backend?

**Yes. FastAPI is a good backend choice**, particularly if the team is
comfortable with Python.

The backend is the part visitors do not see directly. It checks
permissions, saves data, reads the database, processes uploads, creates
enquiries, and connects to other services.

FastAPI is useful for: - Building HTTP APIs that the Next.js frontend
calls. - Validating incoming data. - Handling authentication and
authorisation when configured properly. - Creating and updating website
content. - Managing tenants, users, leads, and subscriptions. -
Integrating with AI services and background jobs. - Generating API
documentation.

Recommended supporting tools: - **Pydantic:** validates data coming into
the backend. - **SQLAlchemy or SQLModel:** helps Python code work with
the database. - **Alembic:** manages database structure changes over
time. - **Pytest:** tests backend behaviour. - **A background-job
system:** for emails, image processing, reports, and other work that
should not delay a visitor's request.

### Suggested architecture

``` text
Visitor or MFD
      |
      v
Next.js frontend
  - Public MFD websites
  - Private MFD dashboard
      |
      v
FastAPI backend
  - Login and permissions
  - Website content
  - Leads and reminders
  - Plans and usage
  - Compliance records
      |
      +------ PostgreSQL database
      |
      +------ Object storage for logos and images
      |
      +------ Email / SMS / WhatsApp providers
      |
      +------ AI provider, if AI features are enabled
```

Keep the business rules in the backend. Hiding a button in the frontend
is not security; the backend must still reject unauthorised requests.

------------------------------------------------------------------------

## 6. The biggest architecture question: separate database or tenant ID?

A **tenant** means one customer organisation using your platform. In
this product, one MFD business is usually one tenant.

For example: - Tenant 101 = Sharma Investments - Tenant 102 = Patel
Financial Services

Each tenant has its own users, branding, website content, and leads.

There are three common database designs.

### Option A: One database, shared tables, with `tenant_id`

All MFDs use the same database tables. Every customer-owned row has a
`tenant_id` field.

Example:

  lead_id   tenant_id   investor_name
  --------- ----------- ---------------
  1         101         Riya
  2         102         Arjun
  3         101         Sameer

When Sharma signs in, the backend only returns records belonging to
tenant 101. Patel receives records belonging to tenant 102.

**Advantages** - Lowest operational complexity and cost. - One database
migration updates the shared tables. - Easy to operate as the number of
MFDs grows. - Suitable for an initial SaaS product.

**Risks** - A programming mistake can expose another tenant's data if
isolation is not enforced. - Backups and restores are generally
database-level rather than simple per-tenant restores. - Some large or
regulated customers may demand stronger isolation.

### Option B: One database server, separate database for each MFD

Each MFD has a separate database inside the same database service.

**Advantages** - Better logical separation. - Easier to restore one
customer's database in some setups. - Can suit customers needing
individual data-management arrangements.

**Disadvantages** - More databases to create, monitor, back up, migrate,
and maintain. - Schema updates become more complicated as customer count
grows. - Operational cost and complexity rise.

### Option C: Separate database server or deployment for each MFD

Each customer has its own dedicated database infrastructure.

**Advantages** - Stronger infrastructure isolation. - Useful for special
contractual, security, or data-residency requirements.

**Disadvantages** - Highest cost and maintenance burden. - Usually
excessive for a new platform serving small MFD businesses.

### Recommended starting point

**Use one PostgreSQL database with shared tables and a `tenant_id` on
every tenant-owned record. Enforce tenant isolation in the backend and,
preferably, with PostgreSQL Row-Level Security (RLS) as an additional
layer.**

Do not rely on developers remembering to add `WHERE tenant_id = ...` to
every query. Design isolation into the system.

You can move selected large customers to separate databases later if
there is a real business requirement.

### What must have a tenant ID?

Usually, these records need a tenant ID: - Website settings and pages -
Logos, photos, certificates, and uploaded files - Services and
achievements - Enquiries/leads - Lead notes, statuses, and reminders -
Blog posts and announcements - AI settings, approved answers, and
conversation records - User memberships and roles - Custom domains -
Consent records - Usage records and reports

A few records may be global, such as the list of plans or standard
public templates. Not every table needs a tenant ID, but every record
that belongs to a specific MFD must be securely linked to that MFD.

### How a tenant request should work

1.  A user logs in.
2.  The backend checks the user's identity.
3.  The backend checks which tenant or tenants the user is allowed to
    access.
4.  The backend determines the active tenant from a verified membership
    or trusted domain mapping.
5.  Every database operation is restricted to that tenant.
6.  The backend returns only that tenant's permitted data.

Never trust a `tenant_id` sent by the browser by itself. A user can
modify browser requests. The server must verify that the signed-in user
is allowed to access that tenant.

### Use database constraints and row-level security

Recommended protections: - Every tenant-owned table has a non-null
tenant ID. - Foreign keys and unique constraints include tenant identity
where appropriate. - The backend sets the current tenant for each
database transaction. - PostgreSQL RLS policies restrict reads and
writes to the active tenant. - The application database role should not
casually bypass RLS. - Automated tests try to access another tenant's
records and must fail. - Background jobs must carry and verify the
correct tenant ID. - Admin/support access should be limited, logged, and
justified.

RLS is a safety layer, not magic. A badly configured database role or
policy can defeat it. Test it deliberately.

------------------------------------------------------------------------

## 7. Suggested database structure

A first version can use these main tables. This is a conceptual design,
not final production SQL.

### `tenants`

One row for each MFD business.

Fields: - `id` - `business_name` - `slug` (a short identifier for the
website) - `arn` - `status` (setup, active, suspended, closed) -
`created_at`

### `users`

People who can log in.

Fields: - `id` - `name` - `email` - `password_hash` if you manage
passwords yourself, or an external identity-provider ID - `status` -
`created_at`

Never store plain-text passwords.

### `tenant_memberships`

Connects users to businesses.

Fields: - `tenant_id` - `user_id` - `role` (owner, admin, editor,
staff) - `created_at`

This supports a team where several employees work for one MFD business.

### `website_settings`

Branding and public contact details.

Fields: - `tenant_id` - `display_name` - `logo_file_id` -
`favicon_file_id` - `primary_colour` - `secondary_colour` -
`font_choice` - `phone` - `email` - `office_address` - `languages` -
`published_at`

### `pages`

Website pages such as Home, About Us, Services, Contact, and Investor
Education.

Fields: - `id` - `tenant_id` - `title` - `slug` - `content_json` -
`status` (draft, published, archived) - `updated_by` - `published_at`

Use a structured page format rather than allowing arbitrary code or raw
HTML from users. That is safer and easier to render consistently.

### `media_files`

Information about uploaded files.

Fields: - `id` - `tenant_id` - `storage_key` - `original_filename` -
`mime_type` - `size_bytes` - `purpose` - `created_at`

The actual image should usually live in object storage, not as a large
blob inside a normal database row.

### `services`

Examples: SIP assistance, financial goal planning education, investment
transaction support, or other services the MFD is permitted to describe.

Fields: - `id` - `tenant_id` - `title` - `description` - `sort_order` -
`status`

The MFD must ensure the description accurately represents the services
they are authorised to provide.

### `achievements`

Optional business milestones or credentials.

Fields: - `id` - `tenant_id` - `title` - `description` -
`achievement_date` - `image_file_id` - `evidence_file_id` if supporting
proof is collected - `approval_status` - `display_order`

Do not publish a claim just because a user typed it. Some claims need
evidence and compliance approval.

### `leads`

People who submit enquiries.

Fields: - `id` - `tenant_id` - `name` - `email` - `phone` -
`enquiry_message` - `source` - `consent_status` - `status` -
`assigned_user_id` - `created_at`

Treat lead information as private personal data. Only authorised users
of that tenant should see it.

### `domains`

Connects a domain name to a tenant.

Fields: - `id` - `tenant_id` - `domain_name` - `verification_status` -
`ssl_status` - `created_at`

### `subscriptions` and `usage_transactions`

Track the chosen plan, billing status, included AI credit, and actual
usage.

Do not calculate all billing from a mutable balance alone. Store
transactions so you can explain how the balance changed.

### `audit_logs` and `consent_records`

Keep records of important events: - Who changed website content. - Who
approved and published a page. - Who accessed sensitive support
features. - When an enquiry was submitted and what consent was
captured. - What version of a disclaimer or approved answer was used,
where appropriate.

Keep logs useful but avoid recording passwords, secret tokens, or
unnecessary sensitive content.

------------------------------------------------------------------------

## 8. How should the MFD add a logo, company name, and achievements?

The best design is a guided setup wizard. Do not give a new customer a
blank website editor and expect them to understand it.

### Step 1: Business information

Show a form with: - Business or display name - Legal/business name,
where applicable - ARN and registration status - Contact person's name -
Phone and email - Office address, if the MFD wants it displayed -
Languages supported - Short introduction to the business

Validate the required fields. For ARN verification, do not merely trust
that the entered number is valid. Define a verification process and use
an authoritative source or manual review where needed.

### Step 2: Logo upload

A simple user experience:

1.  The MFD clicks **Upload logo**.
2.  They select a PNG, JPG, or WebP image from their phone or computer.
3.  The backend checks file size and type.
4.  The image is scanned or safely processed where appropriate.
5.  The file is stored in private or controlled object storage.
6.  The platform creates an appropriately sized version and preview.
7.  The dashboard displays the logo on a sample website header.
8.  The MFD can replace it, remove it, or adjust how it fits.

Practical rules: - Explain recommended dimensions and
transparent-background support. - Limit upload size, for example to 5
MB, then adjust based on testing. - Check the real file format, not just
the filename extension. - Re-encode images where appropriate to remove
risky embedded content. - Do not allow SVG uploads by default unless
they are sanitised safely. - Generate thumbnails and serve images over
HTTPS. - Keep the storage key in the database, not the image bytes in
the normal website-settings row.

For larger uploads, the backend can create a short-lived signed upload
URL so the browser sends the file directly to storage. The server must
still verify the upload and associate it with the correct tenant.

### Step 3: Company name and brand colours

The MFD enters the display name and selects colours from a palette.

The system then uses those settings in approved locations: - Website
header - Footer - Buttons and links - Browser page title where
appropriate - Contact page - Favicon, if supplied

Use design templates and controlled colour choices. Do not allow
unrestricted custom CSS or JavaScript in the first version, because it
creates security, display, and support problems.

Keep the legal name, public display name, and regulated designation as
distinct fields. Do not let a theme editor remove mandatory identity
information or disclaimers.

### Step 4: Add services

The MFD selects from a set of standard service cards and writes short
descriptions.

Each service should have: - A title - A short plain-language
explanation - Optional icon or image - Display order - Draft/published
status

Provide examples and warnings against unsupported promises. For example,
do not permit claims of guaranteed returns.

### Step 5: Add achievements and credentials

Create an **Achievements** section with fields such as: - Achievement
title - Description - Date or year - Optional image or certificate -
Supporting evidence, if required - Checkbox confirming the information
is accurate - Draft/pending approval/published status

Examples might include a verified award, a professional qualification, a
years-of-service milestone, or a genuine business milestone. Do not
invent or imply official recognition that the MFD has not received.

The system should: 1. Save the achievement as a draft. 2. Validate the
content and attachment. 3. Flag claims that need review. 4. Require the
MFD's confirmation and, where appropriate, a compliance reviewer's
approval. 5. Publish only after approval. 6. Keep a record of who
approved it and when.

Do not automatically display an award logo, AMFI logo, regulator logo,
or third-party brand without checking the right to use it.

### Step 6: Add biography, photo, and office details

Allow the MFD to: - Upload a profile photo. - Write a short professional
biography. - Add working hours and contact details. - Add an office map
link, if desired. - Choose which details are public.

Show a preview before publishing. Provide a way to hide a personal
address or phone number if it should not be public.

### Step 7: Add investor education content

The MFD can create or choose approved content such as: - What is a
SIP? - What is inflation? - How does compounding work? - What are the
risks of mutual funds?

Provide a content editor with: - Title - Body - Image - Source or review
notes where relevant - Disclaimer - Draft/review/published state

For AI features, only approved pages and FAQs should be included in the
AI knowledge base.

### Step 8: Preview and publish

The final screen should show: - Desktop preview - Mobile preview -
Missing required fields - Broken links - Missing disclaimers -
Compliance warnings - Search title and description - A final approval
checkbox

Only then should the MFD click **Publish**.

Maintain a draft version so edits do not instantly change the live
website. Publishing should be a deliberate action.

------------------------------------------------------------------------

## 9. How does one platform display a different website for each MFD?

There are two common approaches.

### Approach A: A platform subdomain

For example: - `sharma.mfdstudio.example` - `patel.mfdstudio.example`

This is easiest for an initial launch. The platform identifies the
tenant from the subdomain.

### Approach B: The MFD's own domain

For example: - `www.sharmainvestments.in` - `www.patelfinancial.in`

The MFD buys or already owns the domain. They point it to the platform
using DNS settings. The platform verifies the domain, provisions HTTPS,
and maps the domain to the right tenant.

Recommended process: 1. MFD enters the domain. 2. Platform provides the
required DNS records. 3. MFD or their IT person adds those records at
the domain provider. 4. Platform verifies ownership. 5. Platform
configures HTTPS. 6. Platform maps the verified domain to the tenant. 7.
The public site starts displaying that tenant's published content.

Prevent domain takeover: do not activate a domain based only on a user
typing its name. Require domain verification.

------------------------------------------------------------------------

## 10. Third-party services you may need

You do not need every service on day one. Start with the essentials and
add providers when the relevant feature is ready.

  -------------------------------------------------------------------------
  Need             Typical option        Required at      Notes
                                         launch?          
  ---------------- --------------------- ---------------- -----------------
  Database         Managed PostgreSQL    Yes              Stores tenant,
                                                          user, page, and
                                                          lead records

  File storage     S3-compatible object  Yes              Stores logos,
                   storage                                photos, and
                                                          uploaded files

  Hosting          A managed cloud or    Yes              Runs Next.js and
                   application platform                   FastAPI

  Domain and DNS   A domain registrar    Yes for custom   Customer may
                   and DNS provider      domains          already own their
                                                          domain

  HTTPS            Hosting/DNS provider  Yes              Protects data in
  certificates     or certificate                         transit
                   automation                             

  Email delivery   Transactional email   Yes              Verification,
                   provider                               enquiry alerts,
                                                          password reset

  Authentication   Managed identity      Yes              Login, reset,
                   service or secure                      multi-factor
                   in-house                               authentication
                   implementation                         

  Error monitoring Error tracking        Strongly         Finds failures in
                   service               recommended      production

  Backups and      Database/cloud        Yes              Recovery and
  alerts           provider                               operational
                                                          reliability

  Payments         Payment gateway such  When taking      If payment is
                   as Razorpay or        online payments  offline/manual,
                   another suitable                       this can wait
                   provider                               

  AI model         A suitable API        Only if AI       Costs vary with
  provider         provider              launches         use; protect API
                                                          keys

  WhatsApp         Meta's WhatsApp       Only if WhatsApp Requires account
  Business         Business Platform or  feature launches setup, templates
                   an approved provider                   and applicable
                                                          messaging charges

  SMS/phone        A suitable Indian     Only if needed   Check Indian
                   telecom/telephony                      telecom and
                   provider                               consent
                                                          requirements

  Analytics        Privacy-conscious     Useful, not      Avoid collecting
                   analytics or a        essential        more personal
                   suitable analytics                     data than needed
                   provider                               

  Search data      Google Search Console Useful           Helps monitor
                   and related tools                      indexing and
                                                          search visibility

  Mutual fund NAV  AMFI source or a      If fund data is  Check usage
  data             properly              displayed        rights,
                   licensed/contracted                    freshness,
                   data provider                          reliability and
                                                          permitted display

  AI knowledge     PostgreSQL full-text  Not necessarily  Do not add a
  search           search initially;                      vector database
                   vector search if                       before there is a
                   needed                                 real need
  -------------------------------------------------------------------------

Provider names are examples, not endorsements or a claim that they
satisfy every legal or technical requirement. Verify current pricing,
availability, contracts, data-processing terms, and India-specific
requirements before selecting a provider.

### A sensible starting stack

-   Frontend: Next.js + TypeScript
-   Backend: FastAPI + Pydantic
-   Database: PostgreSQL
-   Database access: SQLAlchemy/SQLModel + Alembic
-   File storage: S3-compatible storage
-   Hosting: managed hosting for the frontend and a managed
    service/container platform for the API
-   Email: transactional email provider
-   Authentication: a managed provider or carefully implemented secure
    authentication
-   Monitoring: error reporting, application logs, uptime checks
-   CI/CD: automated tests and deployment pipeline

You can choose specific vendors after comparing cost, support, data
location, backups, access controls, and lock-in risk.

------------------------------------------------------------------------

## 11. How login and permissions should work

A platform with multiple MFDs needs more than a simple login page.

Suggested roles: - **Owner:** controls the business account, plan,
domain, and team. - **Admin:** manages website content, staff, and
enquiries. - **Editor:** edits website content but may not change
billing or team permissions. - **Staff:** handles assigned enquiries,
based on permissions. - **Platform support:** restricted internal role
for support tasks, with logged access.

Security requirements: - Use secure password hashing if passwords are
managed by your app. - Offer multi-factor authentication, especially for
owners and administrators. - Use secure, HTTP-only cookies for browser
sessions where appropriate. - Apply rate limits to login and
password-reset endpoints. - Never put secret API keys in browser code. -
Log important account and publishing actions. - Remove access when a
team member leaves. - Make password resets and account recovery
secure. - Test authorisation on the server for every protected
operation.

If a person belongs to two businesses, the app must make the active
business clear and switch tenant context securely.

------------------------------------------------------------------------

## 12. Example backend API routes

An API route is an address the frontend calls to perform an action.

Possible routes:

``` text
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
GET    /me

POST   /tenants
GET    /tenants/current
PATCH  /tenants/current/settings

POST   /media/upload-url
POST   /media/confirm-upload
DELETE /media/{file_id}

GET    /pages
POST   /pages
PATCH  /pages/{page_id}
POST   /pages/{page_id}/publish

GET    /services
POST   /services
PATCH  /services/{service_id}

GET    /achievements
POST   /achievements
PATCH  /achievements/{achievement_id}
POST   /achievements/{achievement_id}/submit-review

POST   /public/{site_slug}/enquiries
GET    /leads
PATCH  /leads/{lead_id}
POST   /leads/{lead_id}/notes

POST   /domains
POST   /domains/{domain_id}/verify
```

These are illustrative routes. Exact routes and naming can change.

Important rules: - Public enquiry routes must be protected against spam
and abuse. - Public visitors must not be able to read private lead
data. - All dashboard routes must check the user's role and tenant
membership. - The server should determine tenant access from verified
session/domain context, not blindly trust a request body. - Use
pagination for long lists. - Validate every request and return safe
error messages. - Add rate limiting and monitoring to public endpoints.

------------------------------------------------------------------------

## 13. Security, privacy, and compliance basics

This platform may store names, phone numbers, email addresses, investor
enquiries, and possibly portfolio statements. That information deserves
careful protection.

Minimum controls: 1. Tenant isolation enforced in backend logic and
database policies. 2. HTTPS for all public and dashboard traffic. 3.
Encryption at rest where supported by the chosen storage and database
services. 4. Least-privilege access for staff and platform support. 5.
Secure backups with tested restore procedures. 6. File upload validation
and malware checks where appropriate. 7. Audit logs for publishing,
access, and administrative actions. 8. Consent records for enquiries and
communications. 9. A privacy notice explaining what data is collected
and why. 10. A retention and deletion policy. 11. A process for handling
data access, correction, deletion, and incidents where applicable. 12.
Vendor contracts and data-processing terms for third-party services. 13.
A security review before handling real investor data.

For India, have qualified counsel review the applicable data-protection,
consumer, marketing, AMFI, SEBI, and telecom requirements. Requirements
depend on the actual activity and can change. Software warnings alone do
not make a business compliant.

### AI-specific controls

If an AI assistant is included: - Answer only from approved content for
the initial version. - State clearly that it is an automated
assistant. - Do not promise returns or recommend schemes. - Route
personal investment advice requests and complaints to the MFD. - Keep
the knowledge base tenant-specific. - Prevent one MFD's documents from
being retrieved for another MFD. - Do not send investor data to an AI
provider unless the use is justified, disclosed, and contractually
covered. - Store only the conversation information you actually need. -
Test for fabricated answers, prompt injection, data leakage, and unsafe
requests. - Let the MFD review and approve AI content before launch.

------------------------------------------------------------------------

## 14. How to handle the PPT's investor tools

The PPT describes calculators and mutual fund features, with some
advanced features marked as coming soon.

### Start with simple calculators

Examples: - SIP calculator - Step-up SIP calculator - Lumpsum
calculator - SWP and STP calculators - Retirement, education, home, and
marriage goal planners - Inflation and cost-of-delay calculators - ELSS
tax-saving estimator

Each calculator should show: - Inputs - Formula or calculation
assumptions - Result - Relevant risk disclaimer - A clear "Discuss this
with your distributor" action

Make it clear that estimated outcomes are not guaranteed.

### Mutual fund information

If displaying NAV or historical fund data: - Show the data source and
"as of" date. - Make data freshness visible. - Handle missing or delayed
data. - Check rights and conditions for using the data. - Do not
describe historical returns as a guarantee of future results. - Avoid
recommendations or rankings unless the product is properly authorised
and reviewed for that purpose.

### Portfolio review

A feature that accepts a CAS statement or another portfolio document is
more sensitive than a basic calculator. Build it later, after secure
upload, access control, deletion, data minimisation, and clear user
consent are in place. Do not use real investor statements as test data.

------------------------------------------------------------------------

## 15. SEO and website publishing

SEO means making a website easier for search engines to understand. AEO
means preparing useful, clearly structured answers that may be surfaced
by answer engines.

Useful features: - Editable page title and description. - Clean page
URLs. - Mobile-friendly pages. - Sitemap generation. - Correct canonical
URLs. - Structured data where appropriate. - A page for each genuine
service or location, where relevant. - Fast-loading images. - Google
Search Console connection. - Clear contact and business information.

These are foundations, not guarantees of search rankings. Do not
generate hundreds of thin, nearly identical pages for every MFD. Each
site needs accurate and useful content.

------------------------------------------------------------------------

## 16. Plans, billing, and AI wallet

The PPT's commercial model has three parts: 1. A one-time setup fee. 2.
An annual maintenance charge from year two. 3. Prepaid AI usage, where
applicable.

Build the billing system so that: - The chosen plan determines enabled
features and limits. - Each tenant has a clear subscription status. -
Included AI credits are recorded as transactions. - Every usage event
has a tenant ID, service, quantity, price, and timestamp. - Customers
can see usage by channel. - Alerts are sent before the balance runs
out. - The platform blocks or pauses chargeable usage when the balance
is insufficient, according to the agreed terms. - Billing changes are
logged. - Taxes and third-party fees are disclosed clearly.

Do not hard-code plan checks all over the frontend. Keep plan
entitlements in a central backend service so the same rules apply
consistently.

The platform should never imply "unlimited AI" when usage is charged by
conversation or minute.

------------------------------------------------------------------------

## 17. What should be built first?

Do not attempt all 16 modules from the PPT at once. That is a large
project, especially for a small team. Build the smallest product that
proves MFDs will use and pay for it.

### Phase 1: Core product

Build: - Signup and login - Tenant creation - Business profile and ARN
fields - Logo and photo uploads - Company name, colours, contact
details - Template-based website - Home, About, Services, and Contact
pages - Draft, preview, and publish - Custom domain connection - Enquiry
form and private lead inbox - Basic SEO settings - Disclaimers and
approval records - Backups, logs, and tenant isolation tests

### Phase 2: Investor tools and operations

Add: - Basic calculators - Fund search/NAV if reliable data access is
arranged - Lead status, notes, and reminders - Email alerts - Reports
and analytics - CSV export - Better content editing and blog

### Phase 3: AI assistant

Add: - Approved FAQ and content management - Website chat - Conversation
transcripts and summaries - Handoff to the MFD - Usage tracking and
prepaid wallet - Safety testing and cost limits

### Phase 4: Advanced integrations

Only after the core product is working, consider: - WhatsApp Business -
Meeting booking - Voice and phone AI - Instagram messages - Email
nurture - Portfolio review - AI content drafts - Team and sub-broker
pages

This sequence reduces the risk of spending months building features that
customers do not use.

------------------------------------------------------------------------

## 18. Testing before launch

At minimum, test these cases:

-   Sharma cannot see Patel's leads.
-   A staff user cannot change billing if their role does not allow it.
-   An unverified domain cannot be activated.
-   A draft page is not visible publicly.
-   A mandatory disclaimer cannot be removed.
-   A rejected achievement cannot be published.
-   A malicious or oversized upload is rejected.
-   A public visitor cannot access dashboard APIs.
-   A user removed from a tenant loses access.
-   A backup can actually be restored.
-   AI cannot retrieve another tenant's content.
-   The system handles expired subscriptions as described in the
    contract.
-   Usage is calculated correctly and cannot become negative without a
    deliberate policy.
-   A customer can export their own content and lead data according to
    the product's terms.

Use fake or anonymised data during development and testing.

------------------------------------------------------------------------

## 19. Questions to resolve before development

Write down decisions for: - Who verifies the MFD's ARN and business
identity? - What exact information is mandatory before publishing? - Who
reviews achievements and other potentially regulated claims? - Which
domains and DNS providers will be supported? - Which pages can an MFD
edit freely? - Which disclaimers are mandatory and who maintains them? -
Which data provider supplies NAV information and under what terms? -
Which AI provider, if any, is allowed to process data? - How long are
leads and AI transcripts retained? - Can an MFD export everything on
leaving the platform? - What happens to the website when a subscription
expires? - Which features are available at launch versus coming soon? -
What support response times are promised? - What are the real hosting,
support, and AI costs per tenant?

These decisions affect architecture, cost, compliance, and customer
trust. Do not leave them until after launch.

------------------------------------------------------------------------

## 20. Final recommendation

For a first version, use:

-   **Next.js + TypeScript** for the dashboard and public websites.
-   **FastAPI + Python** for the backend API.
-   **PostgreSQL** for application data.
-   **Shared tables with `tenant_id`, reinforced by PostgreSQL Row-Level
    Security**, for tenant isolation.
-   **Object storage** for logos, photos, and other uploaded files.
-   **A managed authentication solution or carefully implemented secure
    authentication**.
-   **Transactional email, backups, monitoring, and domain/HTTPS
    support** as core services.
-   Add payment, AI, WhatsApp, phone, and mutual-fund data integrations
    only when the corresponding feature is ready.

Build the website builder, branding editor, publishing workflow, lead
inbox, and security boundaries first. These are the foundation of the
product described in the PPT.

The single most important engineering rule is this: **every MFD must
have their own private business data, even though many MFDs share the
same application and database.** Treat tenant isolation as a core
security requirement, not a feature to add later.

------------------------------------------------------------------------

# PART 2 --- Step-by-Step Implementation Guide

This section is a practical build plan. It explains what to create,
where files go, how the frontend connects to Payload, and how every MFD
gets a tenant ID.

## 21. Understand the parts first

Think of the platform as a hotel:

-   **Next.js frontend:** the reception desk and rooms visitors see.
-   **Payload CMS:** the office where website information is managed.
-   **PostgreSQL:** the filing cabinet that stores records.
-   **Tenant:** one MFD business.
-   **Tenant ID:** the unique label attached to that business's records.
-   **Domain:** a website address such as `sharmainvestments.in`.
-   **Media storage:** the cupboard for logos, photos and certificates.
-   **Authentication:** checking who is signing in.
-   **Access control:** checking what that person may view or change.

For the first version, use **one Next.js application with Payload
installed inside it**, plus PostgreSQL. Payload is a Next.js full-stack
framework with an admin panel, APIs, authentication, access-control
tools, uploads and database migrations. You probably do not need a
separate FastAPI backend at the start. Add Python/FastAPI later only if
you have a clear Python-specific need.

Official references: - [What is
Payload?](https://payloadcms.com/docs/getting-started/what-is-payload) -
[Payload
installation](https://payloadcms.com/docs/getting-started/installation) -
[Payload multi-tenant
plugin](https://payloadcms.com/docs/plugins/multi-tenant)

### Two different interfaces

1.  **Your customer dashboard**, such as `/dashboard`, where an MFD
    edits their website and manages leads.
2.  **Payload admin**, usually `/admin`, which is useful for your
    internal team and trusted administrators.

You can build a simple, friendly Next.js dashboard for customers and use
Payload behind it. You do not have to make every customer work inside
the raw Payload admin panel.

## 22. Decide what version one will include

Do not build every feature in the PPT at once. Start with a complete,
secure website-building journey.

### Build in version one

-   Signup and login
-   One MFD business account (tenant)
-   Business name, ARN, contact details and language
-   Logo and profile photo upload
-   Brand colours
-   Home, About, Services, Achievements, Investor Education and Contact
    pages
-   Preview before publishing
-   Publish/unpublish controls
-   A platform-provided subdomain for each MFD
-   Public enquiry form
-   Private lead inbox
-   Basic SEO title and description
-   Required disclaimer areas
-   Tenant isolation and audit records
-   Export of website content and leads

### Add later

-   Phone AI, WhatsApp AI and Instagram automation
-   Portfolio/CAS analysis
-   Complex AI content generation
-   Free-form drag-and-drop page design
-   Separate database per MFD
-   Many CRM, payment and calendar integrations

Build the smallest useful product, test it with real MFDs, then expand.

## 23. Recommended folder structure

Payload installs inside the Next.js project. You can start with one
codebase rather than separate frontend and backend repositories.

``` text
mfd-platform/
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   ├── page.tsx                    # Platform homepage
│   │   │   ├── features/page.tsx            # Feature overview
│   │   │   ├── pricing/page.tsx             # Pricing
│   │   │   ├── login/page.tsx               # Sign in
│   │   │   ├── signup/page.tsx              # Create account
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx               # Private layout/navigation
│   │   │   │   ├── page.tsx                 # Overview
│   │   │   │   ├── setup/page.tsx            # Guided setup
│   │   │   │   ├── branding/page.tsx         # Logo, name, colours
│   │   │   │   ├── pages/page.tsx            # Website pages
│   │   │   │   ├── services/page.tsx         # Service cards
│   │   │   │   ├── achievements/page.tsx     # Awards/milestones
│   │   │   │   ├── media/page.tsx            # Uploaded files
│   │   │   │   ├── leads/page.tsx            # Enquiry inbox
│   │   │   │   ├── domain/page.tsx           # Website address
│   │   │   │   ├── team/page.tsx             # Staff and roles
│   │   │   │   ├── compliance/page.tsx       # Review and disclaimers
│   │   │   │   └── billing/page.tsx          # Plan and usage
│   │   │   └── site/[tenantSlug]/[[...path]]/page.tsx
│   │   │       # Public website rendered from tenant content
│   │   ├── (payload)/
│   │   │   ├── admin/[[...segments]]/page.tsx
│   │   │   └── api/[...slug]/route.ts
│   │   ├── api/
│   │   │   └── public-enquiries/route.ts     # Public enquiry endpoint
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Tenants.ts
│   │   ├── Pages.ts
│   │   ├── Media.ts
│   │   ├── Services.ts
│   │   ├── Achievements.ts
│   │   ├── Leads.ts
│   │   ├── Domains.ts
│   │   ├── Subscriptions.ts
│   │   └── AuditLogs.ts
│   ├── components/
│   │   ├── ui/                               # Buttons, inputs, dialogs
│   │   ├── dashboard/                        # Navigation and cards
│   │   ├── forms/                            # Reusable forms
│   │   ├── website/                          # Public site sections
│   │   └── branding/                         # Logo and theme editor
│   ├── lib/
│   │   ├── payload.ts                        # Server-side Payload helper
│   │   ├── tenant.ts                         # Tenant lookup
│   │   ├── auth.ts                           # Session helpers
│   │   ├── permissions.ts                    # Role checks
│   │   ├── validation.ts                     # Input validation
│   │   └── urls.ts                           # Domain/URL helpers
│   └── payload-types.ts                      # Generated types
├── payload.config.ts
├── next.config.mjs
├── .env.example
├── package.json
└── README.md
```

This is a recommended structure, not a requirement that every file
exists on day one. Use the official starter for the exact Payload
admin/API route files because these can change between versions.

## 24. Step 1 --- Create the project

1.  Install a currently supported Node.js version and a package manager
    such as pnpm.
2.  Follow the current [official Payload installation
    guide](https://payloadcms.com/docs/getting-started/installation).
3.  Create a Payload project using the official starter or
    `create-payload-app`.
4.  Select Next.js and PostgreSQL if the setup wizard offers those
    options.
5.  Start the development server.
6.  Open the admin route, usually `/admin`.
7.  Create your first platform administrator account.
8.  Confirm the app connects to the database before building more
    features.

Do not blindly copy old tutorial commands. Payload's supported Next.js
and Node.js versions change over time; follow the version requirements
on the official docs when you begin.

### Environment variables

Your local `.env` file contains connection details and secrets. For
example:

``` dotenv
DATABASE_URL=your_postgres_connection_string
PAYLOAD_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

These names are examples; follow the names expected by your starter. Do
not commit `.env` to source control. Put only placeholder values in
`.env.example`. Never expose `DATABASE_URL` or `PAYLOAD_SECRET` in a
variable prefixed with `NEXT_PUBLIC_`.

## 25. Step 2 --- Plan the data collections

A Payload collection is like a spreadsheet with a defined set of
columns.

  -------------------------------------------------------------------------------
  Collection              What one record means           Tenant-specific?
  ----------------------- ------------------------------- -----------------------
  `users`                 One person who can sign in      May belong to one or
                                                          more tenants

  `tenants`               One MFD business                This is the tenant list

  `pages`                 One website page                Yes

  `media`                 One logo/photo/file             Usually yes

  `services`              One service card                Yes

  `achievements`          One                             Yes
                          award/qualification/milestone   

  `leads`                 One visitor enquiry             Yes

  `domains`               One domain mapped to a tenant   Yes

  `subscriptions`         One tenant's plan and billing   Yes
                          state                           

  `audit-logs`            One important action            Usually yes, with some
                                                          platform-wide logs
  -------------------------------------------------------------------------------

Add calculators, AI conversations, FAQs, meetings and wallet
transactions after the core workflow works.

## 26. Step 3 --- Understand tenant ID, slug and domain

A **tenant ID** is a unique internal identifier for an MFD business. It
is not the ARN, email address, company name or website domain.

Example (fictional):

  Business             Example internal ID
  -------------------- ---------------------
  Sharma Investments   `tenant_7f31...`
  Patel Financial      `tenant_9a82...`

-   **Tenant ID:** internal ID used to link records safely.
-   **Tenant slug:** readable public identifier such as
    `sharma-investments`.
-   **Custom domain:** a website address such as
    `www.sharmainvestments.in`.

The database or server generates the tenant ID. The MFD should not
choose or type it.

### Who creates the tenant ID?

When a new MFD signs up, your server should:

1.  Validate the signup details.
2.  Create the user account.
3.  Create a tenant/business record with a generated ID.
4.  Link the user to that tenant with the `owner` role.
5.  Create a secure login session.
6.  Send the user to their private dashboard.

Use a transaction or another safe process so a partial failure does not
leave a business without an owner. Make signup safe against duplicate
submissions.

**Never trust a tenant ID sent by the browser as proof of permission.**
A malicious user can edit browser requests. The server must check the
logged-in user's membership.

## 27. Step 4 --- Create the Tenants collection

The tenant record can contain: - Business display name - Public slug -
ARN - Business status (`setup`, `active`, `suspended`) - Contact
details - Logo relationship - Brand colours - Default language - Setup
completion status - Publication status

A simplified Payload collection:

``` ts
import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'businessName' },
  fields: [
    { name: 'businessName', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'arn', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'setup',
      options: [
        { label: 'Setup', value: 'setup' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
  ],
}
```

This is only a starting example. Production code needs access controls,
validation, suitable indexes and ARN verification. Ordinary customers
must not be able to create platform super-admin accounts or delete
tenants freely.

## 28. Step 5 --- Install the Payload multi-tenant plugin

Payload's official `@payloadcms/plugin-multi-tenant` can add tenant
relationships to configured collections, filter admin results by tenant,
help assign tenant records, and reject writes that assign a tenant the
user does not belong to. Read the [official plugin
documentation](https://payloadcms.com/docs/plugins/multi-tenant).

Install it with your project's package manager:

``` bash
pnpm add @payloadcms/plugin-multi-tenant
```

Simplified configuration:

``` ts
import { buildConfig } from 'payload'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

import { Users } from './src/collections/Users'
import { Tenants } from './src/collections/Tenants'
import { Pages } from './src/collections/Pages'
import { Media } from './src/collections/Media'
import { Services } from './src/collections/Services'
import { Achievements } from './src/collections/Achievements'
import { Leads } from './src/collections/Leads'

export default buildConfig({
  collections: [
    Users,
    Tenants,
    Pages,
    Media,
    Services,
    Achievements,
    Leads,
  ],
  // Add the PostgreSQL adapter, editor and secret as shown in the
  // official installation template.
  plugins: [
    multiTenantPlugin({
      collections: {
        pages: {},
        media: {},
        services: {},
        achievements: {},
        leads: {},
      },
    }),
  ],
})
```

This is an illustrative configuration, not a complete copy-paste
application. Your project must also configure the PostgreSQL adapter,
auth collection, Payload secret, generated types and access controls.
Follow the exact configuration supported by the version you install.

### What the plugin does not automatically solve

You must still decide: - Who can create tenants. - How a user is
assigned to a tenant. - Which role can edit or publish. - What anonymous
visitors can read. - How public enquiry forms resolve the tenant. - How
custom domains are verified. - How platform support access is restricted
and logged. - What happens when a tenant is suspended or deleted.

Do not make all collections public just to display the public website.

## 29. Step 6 --- Users, memberships and roles

These are three different things: - **User:** the person who signs in. -
**Tenant:** the business. - **Membership:** the connection between the
user and business, including their role.

Suggested roles:

  -----------------------------------------------------------------------
  Role                                What they can do
  ----------------------------------- -----------------------------------
  Platform super-admin                Operates the whole platform;
                                      tightly restricted

  Tenant owner                        Manages their own business, plan
                                      and team

  Tenant admin                        Manages content and leads within
                                      permissions

  Editor                              Edits content, but may not publish
                                      or change billing

  Staff                               Handles permitted or assigned
                                      enquiries
  -----------------------------------------------------------------------

For an initial version, one owner per tenant may be enough. Add multiple
staff memberships later. Use the user/tenant structure described in the
plugin documentation rather than creating a conflicting second system.

## 30. Step 7 --- Configure the main collections

### Pages

Fields: - Title - URL slug, such as `about-us` - Page template/type -
Structured content blocks - Draft/published status - SEO title and
description - Tenant relationship - Last editor and publish date

Use controlled blocks: hero section, text section, service cards,
achievements, contact section and disclaimer. Do not let customers paste
arbitrary JavaScript into pages.

### Media

Use an upload collection for logos, profile photos, achievement images
and other files. Make sure media permissions stop one tenant from
viewing another tenant's private uploads.

### Services

Fields: - Service title and description - Optional image/icon - Display
order - Draft/published state - Tenant relationship

### Achievements

Fields: - Title - Description - Date/year - Optional image - Supporting
evidence, if needed - Review status - Tenant relationship

Do not automatically publish unsupported claims or third-party logos.
Add review for claims that require it.

### Leads

Fields: - Name and contact details - Enquiry message - Consent status
and timestamp - Source page - Status and assigned staff member - Tenant
relationship - Created timestamp

Leads are private information. Public visitors may submit a lead through
a restricted endpoint, but they must not have read access to the lead
collection.

## 31. Step 8 --- Frontend pages to build

These are recommended screens for version one. You can combine some
screens while prototyping.

### Public pages for your platform

1.  **Home:** what your platform does and a signup call to action.
2.  **Features:** website, branding, enquiries and investor tools.
3.  **Pricing:** plans, limits and clearly labelled upcoming features.
4.  **Login:** existing users sign in.
5.  **Signup:** new MFDs create accounts.
6.  **Terms and privacy:** explain service terms and data handling.

### Private MFD dashboard

1.  **Overview:** setup progress and enquiry counts.
2.  **Setup wizard:** enter business information.
3.  **Branding:** logo, company name, colours and contact details.
4.  **Website pages:** Home, About, Services, Achievements, Investor
    Education and Contact.
5.  **Services editor:** add, edit and reorder services.
6.  **Achievements editor:** add milestones and evidence.
7.  **Media library:** manage uploaded files.
8.  **Preview/publish:** review before the site goes live.
9.  **Leads:** search, update status and export enquiries.
10. **Domain:** configure and verify website address.
11. **Team:** manage staff and roles, once supported.
12. **Compliance:** review disclaimers and warnings.
13. **Billing:** plan, invoices and usage when billing is implemented.

### Public website for each MFD

Use reusable templates for: - Home - About - Services - Achievements -
Investor Education/Blog - Contact - Privacy and disclaimer pages as
appropriate

The same frontend renders the right content based on the requested
tenant. Do not create a separate codebase for each MFD.

## 32. Step 9 --- Build the setup wizard

Use small steps rather than one huge form:

1.  **Business:** name, ARN and contact person.
2.  **Branding:** logo, photo and colours.
3.  **About:** introduction and languages.
4.  **Services:** select and describe services.
5.  **Achievements:** add real milestones, or skip.
6.  **Contact:** phone, email, address and hours.
7.  **Pages:** choose which sections to show.
8.  **Review:** preview and check warnings.
9.  **Publish:** make the website public.

Save progress after each step so the user can leave and return. Keep the
site in draft until required details and approvals are complete.

## 33. Step 10 --- Connect Next.js to Payload

Since Payload is inside the same Next.js project, trusted server-side
code can use Payload's **Local API**. This lets server code read and
write collections without making an HTTP request to itself.

Create `src/lib/payload.ts`:

``` ts
// Server-side helper only. Confirm syntax against your installed version.
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPayloadClient() {
  return getPayload({ config })
}
```

A server-side page or server action can use this helper to load
tenant-specific records.

### Safe request flow

1.  User opens `/dashboard/branding`.
2.  Server checks the login session.
3.  Server finds the user's tenant membership.
4.  Server loads only the permitted tenant's data.
5.  The frontend displays the data.
6.  When the user saves, the server checks permission and tenant
    membership again.

Do not put Payload secrets or database credentials in browser code. Do
not use an unrestricted Local API call that bypasses access controls for
ordinary customer requests. If a privileged operation needs to bypass
access, keep it isolated, validate it, and log it.

## 34. Step 11 --- Create tenant IDs during signup

The intended process is:

``` text
MFD submits signup form
          |
          v
Server validates signup details
          |
          v
Server creates the user
          |
          v
Server creates the tenant/business record
          |
          v
Server links user to tenant as owner
          |
          v
Server creates secure session
          |
          v
User enters private dashboard
```

The exact code depends on your authentication design and Payload
version. Use supported Payload authentication and Local API patterns.

When Sharma creates an About page, the server derives Sharma's tenant
from the authenticated membership and attaches that tenant to the page.
Sharma should not have to copy the tenant ID into every form.

### Public enquiry forms are different

A visitor on Sharma's public website is not logged into Sharma's
dashboard. The server must map the verified public domain or slug to
Sharma's tenant and attach that tenant ID itself.

Never accept an arbitrary tenant ID from the public form. Validate the
domain/slug against your own tenant/domain records and accept enquiries
only for active, published sites.

## 35. Step 12 --- Render the correct website

Start with platform subdomains: - `sharma.yourplatform.example` -
`patel.yourplatform.example`

For each public request: 1. Read the host/subdomain on the server. 2.
Find the matching tenant. 3. Check that the tenant is active and the
site is published. 4. Fetch only that tenant's published content. 5.
Render the shared template with that tenant's logo, colours and text.

Later, add custom domains such as `www.sharmainvestments.in`.

Custom domain process: 1. MFD enters the domain in the dashboard. 2.
Platform displays DNS instructions. 3. MFD proves domain ownership with
a verification record. 4. Hosting/DNS is configured. 5. HTTPS is
provisioned. 6. Save a verified domain-to-tenant mapping. 7. Serve that
tenant's published website for that host.

Do not activate a domain only because a user typed its name. Domain
verification helps prevent domain takeover. Payload's [multi-tenant
documentation](https://payloadcms.com/docs/plugins/multi-tenant)
discusses tenant-based queries and Next.js domain rewrites.

## 36. Step 13 --- Handle logo and photo uploads

A good user flow:

1.  MFD clicks **Upload logo**.
2.  Selects an image from phone/computer.
3.  The system shows upload progress.
4.  Server validates the real file type and size.
5.  File is stored using Payload uploads/object storage.
6.  A media record is associated with the correct tenant.
7.  Dashboard shows a preview.
8.  MFD can replace/remove the logo.
9.  Branding is published only after approval.

Safety rules: - Restrict image types and file sizes. - Do not trust the
file extension alone. - Consider re-encoding and malware scanning. - Do
not allow arbitrary SVG uploads unless safely sanitised. - Keep private
evidence documents private. - Check media permissions as well as page
permissions.

See [Payload upload
documentation](https://payloadcms.com/docs/upload/overview).

## 37. Step 14 --- Use draft and publish states

Use clear states: - **Draft:** visible only to authorised users in the
dashboard. - **Needs review:** waiting for approval. - **Published:**
public visitors can see it. - **Archived:** no longer displayed
publicly.

Achievements, ARN details, disclaimers and investment-related content
may need additional review. Record who approved and published changes.
Public website queries must return published content only; preview
should require authorised access.

## 38. Step 15 --- Build the lead/enquiry flow

When a visitor submits the Contact form:

1.  Validate the fields.
2.  Resolve the website domain to the correct tenant.
3.  Check that the site is active.
4.  Apply spam protection and rate limits.
5.  Record consent and timestamp.
6.  Save the lead with the resolved tenant relationship.
7.  Send an email alert if configured.
8.  Show a safe confirmation to the visitor.

Inside the dashboard, authorised users can view their own tenant's
leads, add notes, update status and export them. Public visitors must
never be able to read the lead inbox.

## 39. Step 16 --- Third-party services

You do not need all of these on day one.

### Needed for a real deployment

-   **PostgreSQL hosting:** stores business data.
-   **Application hosting:** runs Next.js and Payload.
-   **File storage:** stores logos and images.
-   **Domain/DNS and HTTPS:** publishes websites securely.
-   **Email provider:** verification, password resets and enquiry
    alerts.
-   **Backups and monitoring:** recovery and failure detection.

### Add only when the feature is ready

-   **Payment gateway:** online subscription payments.
-   **AI model provider:** AI assistant.
-   **WhatsApp Business Platform:** WhatsApp features.
-   **Telephony provider:** phone and voice AI.
-   **Mutual fund data source:** NAV and historical information.
-   **Calendar integration:** meeting booking.
-   **Analytics:** site and enquiry statistics.

Compare current prices, data location, security, support, contracts and
exit/export options. Keep API secrets on the server. Do not send
investor information to third parties without a justified purpose,
appropriate disclosure and suitable agreements.

## 40. Step 17 --- Test that tenants cannot see each other

Create two test businesses, Sharma Investments and Patel Financial. Give
each a different logo, page, achievement and lead.

Test all of these: - Sharma cannot view Patel's pages. - Sharma cannot
change a request to use Patel's tenant ID. - Sharma cannot fetch Patel's
private media by guessing an ID. - Sharma cannot see or export Patel's
leads. - Patel cannot read Sharma's unpublished pages through an API
call. - Tenant owners cannot create platform super-admins. - An enquiry
sent through Sharma's domain is attached to Sharma by the server. -
Draft pages do not appear publicly. - Suspended tenants follow the
suspension policy. - Support access is restricted and logged. - Ordinary
tenant owners cannot delete tenants freely. - Backups can be restored
and data can be exported.

Automate these tests. Tenant isolation is a core security requirement.

## 41. Step 18 --- Deploy safely

Before launch: 1. Have separate development, staging and production
environments. 2. Use different secrets and database credentials in each
environment. 3. Enable HTTPS. 4. Configure backups and test restoring
them. 5. Set up error monitoring and uptime alerts. 6. Run database
migrations in a controlled deployment. 7. Restrict access to `/admin`.
8. Protect the platform super-admin with strong authentication. 9. Test
tenant isolation in staging. 10. Review privacy, security and compliance
before real investor data is stored.

Never test experimental tenant logic directly on the production
database.

## 42. Recommended build milestones

### Milestone 1 --- Application runs

-   Create Payload + Next.js project.
-   Connect PostgreSQL.
-   Create platform admin.
-   Configure environment secrets.

### Milestone 2 --- Users and tenants

-   Create Tenants collection.
-   Configure authentication and roles.
-   Install/configure multi-tenant plugin.
-   Build server-side signup and tenant creation.
-   Test two tenants.

### Milestone 3 --- Website content

-   Add Pages, Media, Services and Achievements.
-   Configure access and publishing states.
-   Build branding/content forms.

### Milestone 4 --- Public website

-   Build reusable templates.
-   Resolve a subdomain/slug to a tenant.
-   Render only published content for that tenant.
-   Add SEO fields and disclaimers.

### Milestone 5 --- Leads

-   Build enquiry form.
-   Attach tenant on the server.
-   Build private lead inbox and export.
-   Add spam controls and consent records.

### Milestone 6 --- Domains and operations

-   Add custom-domain verification.
-   Configure HTTPS, email, monitoring and backups.
-   Test restore and export.

### Milestone 7 --- Commercial features

-   Add plans and subscriptions.
-   Add AI usage records/wallet if AI is launching.
-   Add integrations only when the matching feature is ready.

## 43. Mistakes to avoid

1.  Building every feature in the PPT before validating the core
    product.
2.  Trusting the tenant ID sent by the browser.
3.  Assuming the plugin secures every custom API route.
4.  Making private leads and media public to simplify the website.
5.  Using one shared login for every customer.
6.  Creating one database per MFD without a real reason.
7.  Adding FastAPI when Payload already meets the current needs.
8.  Allowing raw JavaScript or arbitrary CSS in customer pages.
9.  Automatically publishing unverified achievements or investment
    claims.
10. Launching AI or portfolio uploads before reviewing privacy and
    security.

## 44. Final recommendation

Start with: - **Next.js + TypeScript:** dashboard and public website
templates. - **Payload CMS:** content backend, admin, APIs and
authentication foundation. - **PostgreSQL:** tenants, users, pages,
leads and settings. - **Payload multi-tenant plugin:** tenant
relationships and access support for configured collections. - **Payload
uploads/object storage:** logos, photos and files. - **Managed hosting,
email, backups and monitoring:** production operations.

Use one application and one shared database at first. Create each tenant
ID on the server during onboarding and link the first user to that
tenant as its owner. Every tenant-owned page, media item, service,
achievement and lead must be associated with the correct tenant.

**Golden rule:** an MFD should never manually choose a tenant ID for a
protected operation. The server derives the permitted tenant from the
user's verified membership. For a public website or enquiry, the server
resolves the tenant from a verified domain or public slug.

### Official implementation references

-   [Payload
    overview](https://payloadcms.com/docs/getting-started/what-is-payload)
-   [Payload
    installation](https://payloadcms.com/docs/getting-started/installation)
-   [Payload multi-tenant
    plugin](https://payloadcms.com/docs/plugins/multi-tenant)
-   [Payload uploads](https://payloadcms.com/docs/upload/overview)
-   [Next.js multi-tenant
    guide](https://nextjs.org/docs/app/guides/multi-tenant)

Use the official documentation for the version you install. The code
examples here are starting points, not a production-ready repository.
