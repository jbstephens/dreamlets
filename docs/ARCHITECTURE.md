# Dreamlets Architecture

This document provides a comprehensive overview of the Dreamlets system architecture.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client Browser                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     React SPA (Vite + TypeScript)                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │  Wouter  │ │ TanStack │ │ shadcn/  │ │ Tailwind │ │  Framer  │  │   │
│  │  │ Routing  │ │  Query   │ │    ui    │ │   CSS    │ │  Motion  │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Express.js Server                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   Session    │ │  API Routes  │ │    Auth      │ │   Static     │       │
│  │  Middleware  │ │   Handler    │ │  Middleware  │ │   Assets     │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│    PostgreSQL    │ │     OpenAI       │ │      Stripe      │
│   (Neon / Render)│ │  GPT-4o + DALL-E │ │   Subscriptions  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## Frontend Architecture

### Technology Stack

- **React 18**: UI library with hooks
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Radix-based component library
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management
- **Framer Motion**: Animations

### Directory Structure

```
client/src/
├── App.tsx              # Root component with routes
├── main.tsx             # Application entry point
├── index.css            # Global styles and Tailwind imports
├── components/
│   ├── ui/              # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── navbar.tsx       # Navigation bar
│   ├── footer.tsx       # Site footer
│   ├── story-form.tsx   # Story creation form
│   ├── story-display.tsx # Story rendering
│   ├── story-loading-modal.tsx # Generation progress
│   ├── character-form.tsx # Kid/character forms
│   └── auth-modal.tsx   # Login/register modal
├── pages/
│   ├── landing.tsx      # Marketing homepage
│   ├── home.tsx         # Authenticated home/create page
│   ├── story-view.tsx   # Individual story page
│   ├── pricing.tsx      # Subscription plans
│   ├── profile.tsx      # User profile
│   ├── login.tsx        # Login page
│   ├── register.tsx     # Registration page
│   └── terms.tsx        # Terms & conditions
├── hooks/
│   ├── useAuth.ts       # Authentication hook
│   ├── use-toast.ts     # Toast notifications
│   └── use-analytics.tsx # Google Analytics
└── lib/
    ├── queryClient.ts   # TanStack Query config
    ├── utils.ts         # Utility functions
    └── types.ts         # TypeScript types
```

### Routing

Routes are defined in `App.tsx` using Wouter:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Landing` | Marketing homepage |
| `/create` | `Home` | Story creation (auth + guest) |
| `/story/:id` | `StoryView` | View generated story |
| `/pricing` | `Pricing` | Subscription plans |
| `/profile` | `Profile` | User settings |
| `/login` | `Login` | Login form |
| `/register` | `Register` | Registration form |
| `/terms` | `Terms` | Terms & conditions |

### State Management

- **Server State**: Managed by TanStack Query with automatic caching, refetching, and invalidation
- **Auth State**: Custom `useAuth` hook queries `/api/auth/user`
- **Form State**: React Hook Form with Zod validation
- **UI State**: Local component state with `useState`

## Backend Architecture

### Technology Stack

- **Express.js**: Web framework
- **TypeScript**: Type safety
- **Drizzle ORM**: Type-safe database queries
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **bcrypt**: Password hashing

### Directory Structure

```
server/
├── index.ts             # Server entry point
├── routes.ts            # API route definitions
├── storage.ts           # Database operations (Drizzle)
├── simpleAuth.ts        # Authentication setup
├── vite.ts              # Vite dev server integration
└── services/
    ├── openai.ts        # GPT-4o + DALL-E integration
    └── assistant.ts     # OpenAI Assistants API
```

### Request Flow

```
Request → Express Middleware → Session Check → Route Handler → Storage/Service → Response
              │                     │               │
              ├── JSON parsing      ├── Guest vs    ├── Database
              ├── URL encoding      │   Auth user   ├── OpenAI API
              └── Logging           └── User lookup └── Stripe API
```

### API Design

RESTful endpoints organized by resource:

- `/api/auth/*` - Authentication (register, login, logout, user)
- `/api/kids/*` - Child profiles CRUD
- `/api/characters/*` - Story characters CRUD
- `/api/stories/*` - Stories CRUD + generation
- `/api/*` - Stripe integration endpoints

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │     sessions     │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ sid (PK)         │
│ email            │       │ sess (JSONB)     │
│ password         │       │ expire           │
│ firstName        │       └──────────────────┘
│ lastName         │
│ subscriptionTier │
│ storiesThisMonth │
│ openaiThreadId   │
│ openaiAssistantId│
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│       kids       │       │    characters    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ userId (FK)      │       │ userId (FK)      │
│ name             │       │ name             │
│ age              │       │ type             │
│ description      │       │ description      │
│ hairColor        │       │ createdAt        │
│ eyeColor         │       └──────────────────┘
│ hairLength       │
│ skinTone         │
│ createdAt        │
└──────────────────┘
         │
         │ M:N (via kidIds array)
         ▼
┌──────────────────┐
│     stories      │
├──────────────────┤
│ id (PK)          │
│ userId (FK)      │
│ title            │
│ kidIds (JSONB)   │
│ characterIds     │
│ storyPart1       │
│ storyPart2       │
│ storyPart3       │
│ imageUrl1        │
│ imageUrl2        │
│ imageUrl3        │
│ tone             │
│ openaiRunId      │
│ openaiMessageId  │
│ createdAt        │
└──────────────────┘
```

### Tables

Defined in `shared/schema.ts` using Drizzle:

- **users**: User accounts with subscription info and OpenAI thread references
- **sessions**: Express session storage
- **kids**: Child profiles with physical descriptions
- **characters**: Recurring story characters
- **stories**: Generated stories with text and image URLs

## Authentication Flow

### Guest Users

```
1. User visits site → Session created (saveUninitialized: true)
2. User creates kids/characters → Stored in session (guestKids, guestCharacters)
3. User generates story → Stored in session (guestStories)
4. Limit: 3 stories within 30 days
```

### Authenticated Users

```
1. User registers/logs in → Session updated with userId
2. Guest data migrated to database (if any)
3. Kids/characters/stories → Stored in PostgreSQL
4. OpenAI Assistant thread created for persistent context
5. Subscription tier controls story limits
```

### Session Structure

```typescript
interface Session {
  userId?: string;           // Authenticated user ID
  guestKids?: Kid[];         // Guest session kids
  guestCharacters?: Character[];
  guestStories?: Story[];
}
```

## AI Integration

### Story Generation

Two approaches based on user type:

#### Guest Users: Completions API

```typescript
openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: storyPrompt }],
  response_format: { type: "json_object" }
})
```

- Stateless, no memory between sessions
- Returns structured JSON with story parts and image prompts

#### Authenticated Users: Assistants API

```typescript
// Create persistent thread
const thread = await openai.beta.threads.create();

// Add message and run assistant
await openai.beta.threads.messages.create(threadId, { role: "user", content: prompt });
const run = await openai.beta.threads.runs.create(threadId, { assistant_id: assistantId });
```

- Persistent conversation thread per user
- AI remembers family members, past stories, preferences
- Stories can reference and build on previous adventures

### Image Generation

```typescript
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: enhancedPrompt,
  n: 1,
  size: "1024x1024",
  quality: "standard"
});
```

Images are:
1. Generated via DALL-E 3
2. Downloaded from temporary OpenAI URL
3. Saved to local storage (`storage/users/{userId}/images/`)
4. Served via Express static route

## Image Storage

### Storage Strategy

```
storage/
└── users/
    └── {userId}/
        └── images/
            └── story-{timestamp}-{index}.png
```

### Serving Images

```typescript
// Route: /user-assets/:userId/images/:filename
app.get("/user-assets/:userId/images/:filename", (req, res) => {
  const filePath = path.join(storageRoot, "users", userId, "images", filename);
  res.sendFile(filePath);
});
```

## Subscription Flow (Stripe)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│   Dreamlets │───▶│   Stripe    │
│ clicks      │    │   creates   │    │   Checkout  │
│ "Upgrade"   │    │   session   │    │   page      │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Premium   │◀───│   Update    │◀───│   Webhook   │
│   access    │    │   user DB   │    │   received  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Subscription Tiers

| Tier | Stories/Month | Price |
|------|---------------|-------|
| Free | 3 | $0 |
| Premium | Unlimited | $5.99/month |

## Development vs Production

### Development Mode

- Vite dev server with HMR
- Express API on same port (5000)
- Source maps enabled
- Detailed error messages

### Production Mode

- Vite builds static assets to `dist/public`
- Express serves static files
- esbuild bundles server code
- Minimized error exposure

## Performance Considerations

1. **Database**: Neon serverless driver handles connection pooling
2. **Images**: Local storage with long cache headers
3. **Sessions**: PostgreSQL-backed for persistence
4. **API**: No explicit caching (consider Redis for scale)
5. **Client**: TanStack Query handles request deduplication and caching
