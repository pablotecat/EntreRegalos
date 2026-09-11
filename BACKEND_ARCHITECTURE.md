# Backend Architecture

## Source Structure

```text
backend/
├── app.js                    # Production entry point for Passenger
├── prisma/
│   ├── schema.prisma         # PostgreSQL models and relationships
│   └── migrations/           # Committed database migrations
└── src/
    ├── main.ts               # Creates and configures the NestJS application
    ├── app.module.ts         # Composes feature and infrastructure modules
    ├── auth/                 # Login, tokens, JWT strategies, and global guards
    ├── users/                # User operations
    ├── invitations/          # Registration invitation lifecycle
    ├── lists/                # Gift-list operations and access rules
    ├── items/                # Items contained by lists
    ├── prisma/               # Shared Prisma database client
    └── common/decorators/    # Public, role, and current-user metadata
```

## Application Bootstrap

```text
createApp
  NestFactory.create(AppModule)
  set prefix /api/v1
  register global ValidationPipe
  register cookie parser
  enable credentialed CORS
  return configured application

local development
  main.ts -> bootstrap -> app.listen(PORT or 3001)

production on HelioHost
  Passenger -> app.js -> dist/main.createApp -> app.listen(PORT)
```

The validation pipe removes unknown DTO fields, rejects non-whitelisted fields, and transforms incoming values. `ServeStaticModule` serves the compiled React application from `backend/public` while excluding `/api/v1`.

## Modules

```text
AppModule
├── ConfigModule             # Global environment configuration
├── ServeStaticModule        # Compiled frontend and SPA fallback
├── PrismaModule             # Shared PostgreSQL connection
├── AuthModule               # Authentication and global guards
├── UsersModule
├── InvitationsModule
├── ListsModule
├── ItemsModule
└── HealthController         # GET /api/v1/health
```

Feature modules generally follow this separation:

```text
Controller
  receives HTTP input and selects the current user
Service
  applies business rules and authorization checks
Repository
  defines Prisma queries and persistence operations
DTO
  validates request payloads
```

## Request Data Flow

```mermaid
flowchart LR
    F[React frontend] -->|HTTP /api/v1| N[NestJS application]
    N --> V[ValidationPipe]
    V --> J[Global JwtAuthGuard]
    J --> R[Global RolesGuard]
    R --> C[Feature controller]
    C --> S[Feature service]
    S --> P[Feature repository]
    P --> PC[PrismaService]
    PC --> DB[(PostgreSQL)]

    DB --> PC
    PC --> P
    P --> S
    S --> C
    C -->|JSON response| F

    AT[Bearer access token] --> J
    CK[HttpOnly refresh cookie] --> N
    DTO[Request DTO] --> V
```

For example, loading one list follows:

```text
GET /api/v1/lists/:id
  ValidationPipe
  JwtAuthGuard
    JwtStrategy validates bearer token
    request.user is populated
  RolesGuard
  ListsController.findOne
    ListsService.findById
      reject missing list
      reject private list owned by another user
      ListsRepository.findById
        PrismaService.list.findUnique
          PostgreSQL
```

Creating a list follows:

```text
POST /api/v1/lists
  validate CreateListDto
  authenticate current user
  ListsController.create
    ListsService.create
      default visibility to PRIVATE
      connect list to current user
    ListsRepository.create
      PrismaService.list.create
  return 201 Created
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant AuthController
    participant AuthService
    participant PostgreSQL

    Frontend->>AuthController: POST /auth/login
    AuthController->>AuthService: login(credentials)
    AuthService->>PostgreSQL: verify user and store refresh token
    PostgreSQL-->>AuthService: user/token data
    AuthService-->>AuthController: access token + refresh token
    AuthController-->>Frontend: access token + HttpOnly refresh cookie

    Frontend->>AuthController: authenticated request with Bearer token
    AuthController-->>Frontend: protected resource

    Frontend->>AuthController: POST /auth/refresh with cookie
    AuthController->>AuthService: refresh(cookie token)
    AuthService-->>Frontend: new access token
```

Authentication is protected by default:

```text
JwtAuthGuard (global)
  if endpoint has @Public()
    allow request without an access token
  otherwise
    validate JWT and populate request.user

RolesGuard (global)
  if endpoint has no @Roles(...)
    allow authenticated request
  otherwise
    require request.user.role to match
```

Public endpoints are marked deliberately with `@Public()`, including login, registration, token refresh, and password-reset operations.

## Database Relationships

```mermaid
erDiagram
    User ||--o{ List : owns
    List ||--o{ Item : contains
    User ||--o{ RefreshToken : has
    User ||--o{ Invitation : creates
    Invitation o|--o| User : registers
    User ||--o{ PasswordResetToken : has

    User {
        string id PK
        string username UK
        Role role
        boolean isActive
    }
    List {
        string id PK
        string ownerId FK
        string name
        Visibility visibility
    }
    Item {
        string id PK
        string listId FK
        string name
        int order
    }
    RefreshToken {
        string id PK
        string userId FK
        string token UK
        boolean revoked
    }
    Invitation {
        string id PK
        string createdById FK
        string token UK
        boolean used
    }
    PasswordResetToken {
        string id PK
        string userId FK
        string token UK
        boolean used
    }
```

Deleting a list cascades to its items. Deleting a user cascades to password-reset tokens; other user relationships use the database behavior defined by their Prisma relations.
