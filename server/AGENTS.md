# Backend Agent Engineering Rules --- Node.js & Express

> **Purpose:** Build production-ready Node.js and Express backends that
> are secure, reliable, observable, testable, maintainable, and
> performant. Prefer the simplest correct implementation that fits the
> existing project. These rules are decision guidance, not a reason to
> over-engineer.

------------------------------------------------------------------------

## 1. Core Engineering Principles

1.  Understand the requirement, domain rules, and existing code before
    changing anything.
2.  Prioritize correctness, security, data integrity, reliability, and
    maintainability over speed or cleverness.
3.  Follow the repository's existing architecture and conventions unless
    there is a clear reason to improve them.
4.  Make the smallest focused change that fully solves the task.
5.  Do not refactor unrelated code without a clear benefit.
6.  Never invent endpoints, database tables, business rules, environment
    variables, or package APIs.
7.  Treat all external input as untrusted, including request bodies,
    query strings, route parameters, headers, cookies, uploaded files,
    webhooks, and third-party API responses.
8.  Validate assumptions and handle realistic failure scenarios before
    implementation.
9.  Do not claim that code works, tests pass, or a task is complete
    unless the relevant checks were actually performed.
10. Prefer built-in Node.js and platform capabilities over dependencies
    when they are sufficient and clear.
11. Keep business rules independent from transport and framework details
    where practical.
12. Optimize for understandable, observable, and supportable production
    behavior---not merely fewer lines of code.

## 2. Runtime, Framework, and Language Awareness

-   Inspect `package.json`, lockfiles, runtime configuration, and
    existing code before assuming versions.
-   Use the Node.js version supported by the project and deployment
    environment.
-   Use the installed Express version and its matching documentation.
-   Prefer Express 5 patterns when Express 5 is installed; do not
    blindly apply Express 4 or Express 5 behavior to the wrong version.
-   Use TypeScript for new projects or where the repository already uses
    it. Preserve JavaScript in established JavaScript projects unless
    migration is explicitly requested.
-   For TypeScript:
    -   Enable strict type checking where feasible.
    -   Avoid `any`; use `unknown` at untrusted boundaries and narrow it
        through validation.
    -   Define types for request DTOs, service inputs/outputs, domain
        entities, configuration, and API responses.
    -   Do not confuse TypeScript types with runtime validation.
    -   Avoid unsafe casts, non-null assertions, and `@ts-ignore`.
-   Use ESM or CommonJS according to the existing project configuration.
    Do not mix module systems casually.
-   Verify version-sensitive APIs against official documentation when
    behavior is unfamiliar.
-   Never invent package methods, options, or framework behavior.

## 3. Required Agent Workflow

Follow this workflow for every meaningful task.

### 3.1 Understand

-   Identify the requested outcome, API behavior, acceptance criteria,
    and domain constraints.
-   Identify the actors, resources, permissions, and expected data
    changes.
-   Clarify ambiguity when it materially changes security, data
    integrity, or API behavior. Otherwise, make a safe assumption and
    state it.

### 3.2 Inspect

-   Inspect the relevant routes, controllers, services, models,
    middleware, schemas, tests, and configuration.
-   Understand the current request lifecycle and error-handling
    conventions.
-   Check installed dependencies and versions before using them.
-   Inspect database schema, migrations, indexes, and transaction
    utilities before changing persistence behavior.
-   Reuse existing utilities and patterns when they are sound.

### 3.3 Plan

-   Define the endpoint contract and expected status codes.
-   Decide where validation, authentication, authorization, business
    logic, and persistence belong.
-   Consider transaction boundaries, concurrency, idempotency, caching,
    rate limits, and failure handling where relevant.
-   Identify tests and verification commands.
-   Keep the plan proportional to the task.

### 3.4 Implement

-   Make focused changes in small steps.
-   Keep route handlers thin.
-   Put business rules in an appropriate service/domain layer.
-   Validate input at the boundary.
-   Enforce authorization on the server for every protected operation.
-   Preserve data integrity and established API contracts unless a
    breaking change is requested.

### 3.5 Verify

-   Run relevant type checks, linting, tests, and build/start checks
    available in the repository.
-   Test success cases, invalid input, unauthorized access, missing
    resources, conflicts, and failure paths as applicable.
-   Inspect the final diff for security issues, accidental changes,
    debug code, and incomplete work.
-   State clearly when a check could not be run.

### 3.6 Report

At completion, briefly report: - What changed and which endpoints or
modules were affected. - Important architectural or security
decisions. - Which checks were actually run and their results. - Any
assumptions, limitations, migrations, or remaining work.

------------------------------------------------------------------------

## 4. Recommended Backend Architecture

Follow the existing project structure. For a new or reorganized project,
use clear separation of responsibilities, for example:

-   **Routes:** URL and HTTP method mapping; attach middleware and
    controllers.
-   **Controllers/Handlers:** Translate HTTP requests into application
    calls and format HTTP responses.
-   **Services/Use Cases:** Implement application workflows and business
    rules.
-   **Repositories/Data Access:** Encapsulate database queries and
    persistence when useful.
-   **Models/Entities:** Represent persisted or domain data according to
    the chosen ORM/database.
-   **Schemas/DTOs:** Runtime request validation and typed input/output
    contracts.
-   **Middleware:** Cross-cutting HTTP concerns such as authentication,
    authorization, validation, rate limiting, and request context.
-   **Config:** Validated environment configuration and infrastructure
    setup.
-   **Utils/Lib:** Small, reusable technical helpers---not a dumping
    ground for business logic.
-   **Tests:** Unit, integration, and end-to-end coverage.

Rules: - Do not create every layer for every small feature. Add
abstractions when they clarify responsibility or enable reuse/testing. -
Keep HTTP-specific concerns out of domain logic. - Keep
database-specific concerns out of controllers. - Avoid circular
dependencies and hidden dependency access. - Prefer explicit
dependencies and predictable module boundaries. - Do not create generic
repositories or base classes without a real use case. - Keep
feature-related files close together when the project uses feature-based
organization.

## 5. Express Application Design

-   Keep application creation separate from server startup where
    practical. This makes the Express app easier to test without opening
    a network port.
-   Centralize middleware registration and make middleware order
    intentional.
-   Register security and parsing middleware before routes that depend
    on them.
-   Register not-found handling after application routes.
-   Register centralized error middleware last.
-   Use routers to group related endpoints.
-   Keep route definitions declarative and handlers focused.
-   Do not put complex database queries or business workflows directly
    in route files.
-   Avoid unnecessary middleware and duplicate processing.
-   Set appropriate request body size limits.
-   Configure proxy trust only for the actual trusted proxy topology;
    never enable it blindly.
-   Disable or minimize framework-identifying headers where appropriate.
-   Use graceful startup and shutdown behavior.
-   Do not start listening as a side effect of importing the app module.

## 6. API Contract and HTTP Semantics

-   Design consistent, predictable REST-style endpoints when REST is the
    project convention.
-   Use HTTP methods according to their semantics:
    -   `GET` for safe reads.
    -   `POST` for creation or commands that do not fit other methods.
    -   `PUT` for full replacement where appropriate.
    -   `PATCH` for partial updates.
    -   `DELETE` for deletion.
-   Use meaningful and consistent status codes.
-   Common examples:
    -   `200` for successful requests with a response body.
    -   `201` for resource creation.
    -   `202` when work is accepted for asynchronous processing.
    -   `204` for success with no response body.
    -   `400` for malformed or invalid request data.
    -   `401` for missing or invalid authentication.
    -   `403` for authenticated callers lacking permission.
    -   `404` for unavailable or intentionally undisclosed resources.
    -   `409` for state conflicts or uniqueness conflicts.
    -   `422` when the API convention distinguishes semantically invalid
        content.
    -   `429` for rate limiting.
    -   `500` for unexpected internal failures.
    -   `503` when the service is temporarily unavailable.
-   Do not return `200` for every outcome.
-   Keep response shapes consistent across endpoints.
-   Document request parameters, response bodies, status codes, and
    error cases.
-   Use pagination for potentially large collections.
-   Set reasonable maximum page sizes and validate pagination
    parameters.
-   Use stable sorting and deterministic pagination; consider cursor
    pagination for large or frequently changing datasets.
-   Avoid leaking internal database structure in public API responses.
-   Do not silently change existing API contracts. Treat breaking
    changes as deliberate versioned work.

## 7. Input Validation and Data Normalization

-   Validate every untrusted input at the application boundary.
-   Use a runtime validation library such as Zod, Joi, or the project's
    established equivalent.
-   Validate route parameters, query parameters, request bodies,
    headers, and uploaded-file metadata as appropriate.
-   Reject unknown or unexpected fields when the endpoint contract
    requires strict input.
-   Normalize data deliberately: trim strings, normalize case, parse
    numbers, and standardize dates only where domain rules require it.
-   Enforce length, range, format, enum, and collection-size limits.
-   Validate identifiers before database access.
-   Do not rely on TypeScript interfaces for runtime validation.
-   Do not trust client-supplied prices, roles, permissions, ownership,
    account IDs, or calculated totals.
-   Avoid mass assignment: map allowed DTO fields explicitly rather than
    passing arbitrary request objects to persistence methods.
-   Validate third-party API responses when their shape is not
    guaranteed.
-   Return safe, field-specific validation errors without exposing
    implementation details.

## 8. Authentication and Authorization

-   Authentication answers who the caller is; authorization determines
    what the caller may do. Implement both.
-   Enforce authorization on every protected route and resource
    operation.
-   Never rely only on frontend route protection or hidden UI controls.
-   Derive the current identity from verified authentication context,
    not arbitrary body or query fields.
-   Check resource ownership and tenant boundaries on every relevant
    read, update, and delete.
-   Prevent insecure direct object reference (IDOR) vulnerabilities.
-   Use established, well-maintained authentication libraries or
    identity providers where possible.
-   For JWTs:
    -   Verify signatures using an explicitly allowed algorithm.
    -   Validate issuer, audience, expiration, and other required
        claims.
    -   Do not trust decoded-but-unverified tokens.
    -   Keep signing keys and secrets outside source control.
    -   Plan key rotation and token revocation according to the threat
        model.
-   For sessions:
    -   Use secure, HTTP-only, appropriately configured cookies.
    -   Configure `SameSite`, `Secure`, domain, path, and expiration
        intentionally.
    -   Regenerate session identifiers after authentication or privilege
        changes.
    -   Protect state-changing requests against CSRF when cookie-based
        authentication is used.
-   Store passwords using a suitable password-hashing algorithm such as
    Argon2id or bcrypt with appropriate parameters. Never store
    plaintext or reversibly encrypted passwords.
-   Use generic authentication failure messages where detailed responses
    could enable account enumeration.
-   Apply stronger protections to password reset, email verification,
    MFA, and account recovery flows.
-   Never log passwords, raw tokens, session identifiers, or secrets.

## 9. Security Baseline

Treat security as a design requirement, not a final checklist.

### HTTP and Express Security

-   Use Helmet or an equivalent carefully configured security-header
    solution.
-   Configure CORS with explicit trusted origins when cross-origin
    access is needed.
-   Do not use wildcard origins with credentialed requests.
-   Remember that CORS is not authentication or authorization.
-   Limit request body sizes and reject unexpected content types.
-   Apply rate limiting to public and sensitive endpoints, especially
    login, registration, password reset, OTP, search, and expensive
    operations.
-   Consider stricter limits per account, IP, or API key based on the
    deployment architecture.
-   Do not trust `X-Forwarded-For` unless proxy trust is correctly
    configured.
-   Avoid exposing stack traces, framework versions, internal paths, and
    sensitive metadata.

### Injection and Unsafe Input

-   Use parameterized queries or safe ORM query APIs.
-   Never concatenate untrusted input into SQL, shell commands, or
    database query strings.
-   Avoid unsafe dynamic query construction; allowlist sortable fields,
    filters, and identifiers.
-   Sanitize or safely encode data at the output boundary when rendering
    or generating HTML.
-   Avoid unsafe deserialization and prototype-pollution-prone object
    merging.
-   Do not pass arbitrary user objects into configuration,
    authorization, or persistence operations.
-   Use safe file paths and prevent path traversal.
-   Avoid executing user-controlled code or shell commands.

### Secrets and Configuration

-   Keep secrets in environment variables or a dedicated secrets
    manager.
-   Never commit `.env` files containing real credentials.
-   Provide a safe `.env.example` containing placeholders only.
-   Validate required environment variables at startup and fail fast
    with clear, non-secret error messages.
-   Do not expose secrets in API responses, logs, error messages, or
    client bundles.
-   Use least-privilege credentials for databases and external services.
-   Rotate secrets when exposure is suspected.

### File Uploads

-   Set upload size and count limits.
-   Validate file type using content inspection where appropriate; do
    not trust filename extensions or client MIME headers alone.
-   Generate server-side filenames rather than trusting user-provided
    paths.
-   Store uploads outside executable/public locations unless public
    serving is explicitly required.
-   Restrict allowed formats and consider malware scanning for
    higher-risk use cases.
-   Prevent path traversal and unauthorized file access.
-   Avoid loading very large files fully into memory; use streaming
    where appropriate.
-   Remove temporary files reliably.

### SSRF and External Requests

-   Validate and restrict user-controlled URLs before server-side
    fetching.
-   Block access to loopback, private, link-local, and cloud metadata
    addresses unless explicitly required and safely controlled.
-   Restrict protocols and redirects.
-   Apply timeouts, response-size limits, and allowlists for trusted
    upstreams where possible.
-   Do not let user input select arbitrary internal services.

## 10. Database Design and Data Integrity

-   Inspect the existing database, ORM, schema, migrations, and query
    conventions before changing data access.
-   Use the project's existing database technology unless a change is
    requested and justified.
-   Keep database access out of controllers when the architecture
    separates persistence.
-   Use parameterized queries or safe ORM methods.
-   Define constraints in the database as well as validating at the
    application layer where appropriate.
-   Use foreign keys, unique constraints, check constraints, and indexes
    to protect invariants.
-   Add indexes based on actual query patterns and measured needs; avoid
    indexing every column.
-   Select only the fields needed for the operation.
-   Avoid N+1 query patterns; use joins, batching, or eager loading
    appropriately.
-   Use transactions when multiple writes must succeed or fail together.
-   Keep transactions as short as practical.
-   Do not perform slow external network calls while holding database
    transactions open.
-   Handle transaction rollback and cleanup reliably.
-   Consider race conditions and concurrent requests. Application-level
    checks alone do not guarantee uniqueness or consistency.
-   Use database constraints and atomic operations for critical
    invariants.
-   Use optimistic or pessimistic locking when the domain requires it
    and the database supports it.
-   Use decimal-safe representations for money; do not rely on
    floating-point arithmetic for financial values.
-   Store timestamps consistently, usually in UTC, and convert to user
    time zones at presentation boundaries.
-   Define deletion behavior intentionally: hard delete, soft delete,
    retention, and cascading effects.
-   Never run destructive schema changes without understanding their
    impact.
-   Use migrations for schema changes; do not rely on ad hoc production
    schema edits.
-   Make migrations reviewable and consider backward-compatible rollout
    strategies for zero-downtime deployments.
-   Never reset, truncate, or drop production data as a shortcut.

## 11. Transactions, Concurrency, and Idempotency

-   Identify operations that can be retried, duplicated, or executed
    concurrently.
-   Use transactions for related database changes that must be atomic.
-   Use unique constraints or idempotency keys for operations where
    duplicate execution would cause harm, such as payments, order
    creation, or webhook processing.
-   Define idempotency-key scope, expiration, and stored result
    behavior.
-   Do not assume a request is executed exactly once.
-   Make retry behavior safe and bounded.
-   Use atomic database operations instead of read-then-write sequences
    when possible.
-   Handle duplicate-key and serialization/concurrency conflicts
    intentionally.
-   Use queues or background jobs for long-running tasks when
    appropriate.
-   Do not return success before a required durable operation has
    actually succeeded.
-   For external side effects, consider the outbox pattern or another
    reliable delivery strategy when consistency requires it.

## 12. Error Handling

-   Use one centralized Express error-handling strategy.
-   In Express 5, rejected promises from async route handlers are
    forwarded to error handling; follow the installed version's behavior
    and project conventions.
-   For Express versions or wrappers that require it, explicitly forward
    asynchronous errors.
-   Error middleware must have the correct Express signature and be
    registered after routes and not-found handling.
-   Distinguish expected operational errors (validation, not found,
    conflict, authentication) from unexpected programming or
    infrastructure errors.
-   Use typed or well-defined application errors where helpful.
-   Do not expose stack traces, SQL errors, internal URLs, secrets, or
    raw upstream responses in production.
-   Preserve the original error as a cause when wrapping errors, where
    supported.
-   Do not silently swallow errors.
-   Do not add broad `try/catch` blocks that turn failures into fake
    success responses.
-   Catch errors only when the current layer can recover, add useful
    context, or translate them into a stable application error.
-   Log unexpected failures safely with a correlation/request ID.
-   Ensure errors during streaming or after response headers are sent
    are handled according to Express and Node.js behavior.
-   Handle process-level failures with a deliberate shutdown/restart
    strategy; do not pretend the process can safely continue after every
    uncaught failure.
-   Never leak sensitive internal details in client-facing messages.

## 13. Consistent API Responses and Error Format

-   Use a consistent response contract across the API.
-   Keep success and error shapes predictable.
-   Include only necessary fields.
-   Avoid returning internal model objects directly when they contain
    private or implementation-specific fields.
-   Use explicit response DTOs or serializers when needed.
-   Include pagination metadata consistently for paginated endpoints.
-   Consider a stable error structure with a machine-readable code, safe
    message, and optional field details.
-   Do not expose raw exception messages as public API messages.
-   Do not include stack traces in production responses.
-   Keep response status codes aligned with the actual outcome.
-   Avoid wrapping every response in multiple redundant layers if the
    existing API contract does not require it.

## 14. Logging, Monitoring, and Observability

-   Use structured logging in production rather than scattered
    `console.log` statements.
-   Follow the project's logging library and conventions.
-   Include useful context such as request ID, route, method, status
    code, duration, and safe actor/resource identifiers when
    appropriate.
-   Redact passwords, tokens, cookies, authorization headers, secrets,
    payment data, and sensitive personal information.
-   Do not log entire request bodies by default.
-   Use appropriate log levels: debug, info, warn, and error.
-   Avoid logging the same error repeatedly at every layer.
-   Add request correlation IDs or trace context where appropriate.
-   Ensure health endpoints do not reveal sensitive infrastructure
    details.
-   Distinguish liveness checks from readiness checks.
-   Monitor latency, error rates, throughput, saturation, queue depth,
    and database health as appropriate.
-   Use distributed tracing when service boundaries and operational
    complexity justify it.
-   Do not add observability dependencies without considering their
    operational cost and maintenance.

## 15. Performance and Scalability

-   Optimize based on evidence and expected workload, not guesswork.
-   Avoid blocking the Node.js event loop with CPU-heavy synchronous
    work.
-   Use streaming for large payloads and files where appropriate.
-   Set timeouts for inbound operations and outbound network calls.
-   Limit request sizes, result sizes, and expensive query parameters.
-   Use pagination for large result sets.
-   Avoid N+1 database queries and repeated expensive work.
-   Reuse database connection pools and HTTP agents appropriately.
-   Configure pool sizes according to deployment capacity; do not
    blindly increase them.
-   Use caching only when correctness, invalidation, and user isolation
    are clear.
-   Do not cache private responses in shared caches.
-   Use background queues for slow or retryable work when appropriate.
-   Apply backpressure and bounded concurrency to batch jobs and
    external API calls.
-   Avoid unbounded `Promise.all` over large collections; use
    concurrency limits.
-   Use compression where it benefits the workload and does not create
    security or CPU issues.
-   Avoid premature micro-optimizations and unnecessary dependencies.
-   Measure query plans, CPU, memory, and latency before complex
    optimization.

## 16. External Services and Integrations

-   Encapsulate third-party API communication behind focused clients or
    service modules.
-   Set connection and response timeouts.
-   Validate and normalize external responses.
-   Handle rate limits, transient failures, and provider outages
    intentionally.
-   Retry only safe operations and use bounded exponential backoff with
    jitter where appropriate.
-   Do not blindly retry non-idempotent operations.
-   Apply circuit breakers or bulkheads when service reliability
    requirements justify them.
-   Keep provider credentials server-side.
-   Avoid coupling domain logic to a provider's raw response format.
-   Map provider errors to stable internal errors without leaking
    secrets.
-   Record external request IDs when useful for support, while redacting
    sensitive values.

## 17. Background Jobs, Queues, and Scheduled Tasks

-   Use a queue or job system for long-running, retryable, or
    resource-intensive work when appropriate.
-   Keep HTTP request handlers responsive; do not hold a request open
    for work that should run asynchronously.
-   Make jobs idempotent where possible.
-   Define retry limits, backoff, timeout, and dead-letter behavior.
-   Track job status and failure reasons safely.
-   Prevent overlapping scheduled jobs when overlap would cause
    incorrect results.
-   Ensure multiple application instances do not unintentionally run the
    same singleton task.
-   Handle graceful worker shutdown and in-flight jobs.
-   Do not store critical job state only in process memory.
-   Validate job payloads just like HTTP input.

## 18. Configuration and Environment Management

-   Centralize configuration loading.
-   Validate environment variables at startup using a schema.
-   Fail fast for missing or invalid required configuration.
-   Provide safe defaults only when they are genuinely appropriate.
-   Separate development, test, staging, and production configuration.
-   Never hardcode credentials, hostnames, or environment-specific
    secrets.
-   Avoid scattering direct `process.env` access throughout business
    logic; expose validated configuration from one module.
-   Do not expose internal configuration through public endpoints.
-   Document required variables in `.env.example` with placeholders.
-   Ensure production configuration is supplied through the deployment
    platform or secrets manager.

## 19. Node.js Process Lifecycle and Reliability

-   Handle `SIGTERM` and `SIGINT` for graceful shutdown.
-   Stop accepting new requests before closing resources.
-   Allow in-flight requests and jobs a bounded time to finish.
-   Close database pools, queues, message consumers, and other
    resources.
-   Set a shutdown deadline and force exit only after the deadline when
    necessary.
-   Avoid calling `process.exit()` during normal request handling.
-   Use a deliberate strategy for uncaught exceptions and unhandled
    rejections; alert and restart rather than continuing in an unknown
    state.
-   Ensure startup failures are visible and cause an appropriate
    non-zero exit.
-   Do not rely on in-memory state for data that must survive restarts
    or multiple instances.
-   Make the service safe to run with multiple replicas.

## 20. Testing Strategy

-   Inspect the existing test framework and scripts before adding or
    changing tests.
-   Write tests for business rules and important failure cases, not only
    happy paths.
-   Use unit tests for isolated domain logic and utilities.
-   Use integration tests for routes, middleware, database behavior, and
    external boundaries.
-   Use end-to-end tests for critical user-facing workflows when
    appropriate.
-   Test authentication and authorization, including cross-user and
    cross-tenant access attempts.
-   Test invalid payloads, missing resources, conflicts, rate limits,
    and unexpected dependencies.
-   Test transaction rollback and duplicate/concurrent operations when
    they are important to correctness.
-   Use isolated test databases or controlled test fixtures.
-   Do not point tests at production services or production databases.
-   Mock external services at clear boundaries; do not mock away the
    behavior the test is intended to verify.
-   Ensure tests clean up created resources and do not depend on
    execution order.
-   Avoid flaky tests, arbitrary sleeps, and shared mutable fixtures.
-   Do not weaken or delete meaningful tests just to make an
    implementation pass.

## 21. API Documentation and Contracts

-   Document public and internal APIs according to project needs.
-   Use OpenAPI/Swagger when it improves collaboration, client
    generation, or API discoverability.
-   Keep documentation aligned with actual validation schemas and
    runtime behavior.
-   Document authentication requirements, permissions, request
    parameters, response schemas, status codes, pagination, and error
    formats.
-   Treat API contract changes as compatibility decisions.
-   Prefer backward-compatible additions when possible.
-   Version APIs when breaking changes cannot be avoided and the project
    requires versioning.
-   Do not claim an endpoint is documented if the documentation is stale
    or incomplete.

## 22. Code Quality, Formatting, and Naming

-   Follow the repository's ESLint, Prettier, and formatting
    configuration.
-   Do not introduce conflicting style rules or reformat unrelated
    files.
-   Use meaningful names for variables, functions, classes, types,
    files, and modules.
-   Prefer `camelCase` for variables and functions.
-   Prefer `PascalCase` for classes and TypeScript types/interfaces
    where appropriate.
-   Follow existing conventions for constants and filenames.
-   Use short names only in small, obvious scopes.
-   Avoid cryptic abbreviations and misleading names.
-   Keep functions focused and reasonably small.
-   Prefer early returns when they make control flow easier to
    understand.
-   Avoid deep nesting and giant controllers or service functions.
-   Avoid duplicated logic when a shared abstraction is genuinely
    useful.
-   Do not create abstractions solely to satisfy DRY at the expense of
    clarity.
-   Remove dead code when safe and relevant.
-   Do not leave temporary debugging code, commented-out
    implementations, or unused imports.
-   Avoid hidden side effects and unexpected mutation.

## 23. JavaScript and TypeScript Practices

-   Prefer `async/await` for readable asynchronous control flow when
    appropriate.
-   Handle rejected promises deliberately.
-   Use `unknown` for untrusted values and narrow them through
    validation.
-   Prefer discriminated unions for multi-state results when they
    improve safety.
-   Avoid `any`, broad casts, and non-null assertions.
-   Use `Map` and `Set` when their semantics fit the task.
-   Choose `for...of`, `map`, `filter`, `reduce`, and other iteration
    methods based on intent and readability; no single loop form is
    universally best.
-   Avoid unbounded concurrency.
-   Avoid mutating shared objects unexpectedly.
-   Use immutable transformations when they make behavior more
    predictable.
-   Use built-in APIs when suitable and supported by the project's
    Node.js version.
-   Use `structuredClone` only for supported values when a deep clone is
    genuinely needed.
-   Do not use JSON stringify/parse as a universal deep-cloning
    technique.
-   Handle dates, time zones, numeric precision, and serialization
    deliberately.
-   Do not use floating-point arithmetic for currency calculations.

## 24. Middleware Design

-   Keep middleware focused on one cross-cutting responsibility.
-   Make middleware order explicit and documented when order is
    non-obvious.
-   Ensure middleware either completes the response or passes control
    exactly as intended.
-   Avoid calling `next()` after sending a response.
-   Avoid calling `next(error)` multiple times for the same failure.
-   Do not perform expensive database or network work in generic
    middleware unless required.
-   Keep authentication and authorization middleware distinct when their
    responsibilities differ.
-   Validate request data before controllers or services consume it.
-   Avoid mutating request objects with undocumented properties; use
    typed request extensions or a well-defined request context.
-   Ensure middleware works correctly for async errors and the installed
    Express version.

## 25. Security and Privacy in Data Handling

-   Apply data minimization: collect, store, return, and log only what
    is needed.
-   Classify sensitive fields and restrict access to them.
-   Exclude password hashes, reset tokens, internal flags, and private
    fields from public serializers.
-   Encrypt sensitive data at rest when required by the threat model or
    applicable obligations.
-   Use TLS for network traffic in production.
-   Set appropriate retention and deletion policies.
-   Avoid exposing personal data in URLs, logs, analytics, and error
    messages.
-   Use secure backup and restore practices.
-   Treat backups and exports as sensitive data.
-   Consider privacy and regulatory requirements relevant to the product
    and deployment region.

## 26. Dependency Management and Supply Chain

-   Prefer maintained, reputable dependencies with a clear purpose.
-   Check compatibility with the installed Node.js and Express versions.
-   Consider package size, transitive dependencies, maintenance status,
    and known vulnerabilities.
-   Avoid installing multiple packages that solve the same problem.
-   Pin or constrain versions according to repository policy and commit
    the correct lockfile changes.
-   Review security audit output; do not blindly apply breaking
    automated fixes.
-   Remove unused dependencies when safe.
-   Never install a package just to avoid writing a few clear lines of
    code.
-   Do not copy code from untrusted sources without reviewing it.

## 27. Deployment and Production Readiness

-   Ensure the app listens on the deployment-provided port and
    appropriate host configuration.
-   Do not assume local filesystem persistence in ephemeral or
    serverless environments.
-   Store persistent files in appropriate object or durable storage.
-   Ensure the process handles restarts and multiple instances safely.
-   Configure health and readiness checks appropriately.
-   Ensure migrations run through a controlled deployment process, not
    unpredictably on every app instance.
-   Keep secrets in the deployment platform or secrets manager.
-   Use production-safe logging and error responses.
-   Set resource limits and timeouts appropriate to the environment.
-   Verify build, startup, database connectivity, and critical routes in
    a staging-like environment when available.
-   Document operational assumptions and required infrastructure.

## 28. Before Making Changes: Checklist

Use this as a decision guide; do not mechanically print it for every
task.

1.  Have I understood the endpoint behavior and business rules?
2.  Have I inspected the existing routes, services, middleware, models,
    and tests?
3.  Am I using the installed Node.js and Express versions correctly?
4.  Is the route handler thin and the business logic in the right layer?
5.  Is every untrusted input validated at runtime?
6.  Are authentication and authorization enforced server-side?
7.  Are ownership and tenant boundaries checked?
8.  Are database operations parameterized and data integrity protected?
9.  Do related writes need a transaction?
10. Could retries or concurrent requests create duplicates or
    inconsistent state?
11. Are status codes and response shapes consistent?
12. Are errors handled centrally and safely?
13. Are secrets and personal data protected from responses and logs?
14. Are rate limits, timeouts, and payload limits appropriate?
15. Is caching safe and correctly invalidated?
16. Are external calls bounded and resilient?
17. Are tests added or updated for success and failure paths?
18. Have I run the relevant checks and reviewed the final diff?

## 29. Final Decision Principles

When multiple implementations are valid, prefer the one that:

1.  Preserves correctness and data integrity.
2.  Enforces authentication, authorization, and input validation on the
    server.
3.  Minimizes the attack surface and protects secrets and personal data.
4.  Keeps HTTP, business logic, and persistence responsibilities clear.
5.  Uses database constraints and transactions where correctness
    requires them.
6.  Handles retries, concurrency, and partial failures intentionally.
7.  Produces stable, documented API contracts.
8.  Is observable and diagnosable in production.
9.  Uses resources efficiently without premature optimization.
10. Is strongly typed and runtime-validated.
11. Fits the existing project and avoids unnecessary dependencies.
12. Is testable, maintainable, and straightforward to operate.

------------------------------------------------------------------------

## 30. Final Principle

A good backend is not merely an API that returns the expected response
on the happy path. It is a reliable system that protects data, enforces
permissions, handles invalid input and partial failures, behaves
correctly under concurrency, can be tested and observed, and remains
understandable to the next developer.

Build the simplest system that satisfies the real requirements safely.
Never trade security, data integrity, or correctness for convenience.
