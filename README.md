# Dreamlets

**Personalized AI-Powered Bedtime Stories for Children**

Dreamlets creates magical, illustrated bedtime stories tailored to your children. Parents can define their kids' appearances, add recurring characters, and generate unique 3-page stories with custom AI-generated illustrations.

![Dreamlets](public/og-image.png)

## Features

- **Personalized Stories**: Stories featuring your children by name with accurate physical descriptions
- **Custom Characters**: Add recurring characters (pets, imaginary friends, etc.) that appear across stories
- **AI Illustrations**: Beautiful DALL-E 3 generated images for each story page
- **Persistent Memory**: For authenticated users, the AI remembers your family and builds on previous stories
- **Multiple Tones**: Choose from cozy, adventurous, magical, and more
- **Story Library**: Save and revisit your favorite stories
- **Guest Mode**: Try 3 free stories without creating an account
- **Premium Subscriptions**: Unlimited stories via Stripe-powered subscriptions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix) |
| Backend | Express.js, TypeScript, Node.js 20+ |
| Database | PostgreSQL via Neon Serverless |
| ORM | Drizzle ORM |
| AI | OpenAI GPT-4o (stories), DALL-E 3 (illustrations) |
| Auth | Email/password with bcrypt, express-session |
| Payments | Stripe Subscriptions |
| Routing | Wouter (client), Express (server) |

## Project Structure

```
dreamlets/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── simpleAuth.ts       # Authentication
│   └── services/           # OpenAI integration
├── shared/                 # Shared types/schema
│   └── schema.ts           # Drizzle schema
├── public/                 # Static assets
├── storage/                # User-generated content
│   └── users/              # Per-user image storage
└── docs/                   # Documentation
```

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) account)
- OpenAI API key
- Stripe account (for payments)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dreamlets.git
   cd dreamlets
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SESSION_SECRET` | Secret for session encryption (32+ chars) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o and DALL-E | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_PRICE_ID` | Stripe Price ID for subscription | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Production |
| `NODE_ENV` | `development` or `production` | No |
| `PORT` | Server port (default: 5000) | No |
| `ASSET_STORAGE_ROOT` | Path for image storage (default: ./storage) | No |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate Drizzle migrations |

## Deployment (Render.com)

This project is configured for deployment on Render.com.

1. **Create a new Web Service** on Render connected to your GitHub repo

2. **Configure settings**:
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start`
   - Node Version: 20

3. **Add environment variables** in Render dashboard

4. **Add a PostgreSQL database** or use external Neon database

5. **Add a persistent disk** mounted at `/opt/render/project/src/storage` for image storage

See [`render.yaml`](render.yaml) for the complete blueprint configuration.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Kids
- `GET /api/kids` - List kids
- `POST /api/kids` - Create kid
- `PUT /api/kids/:id` - Update kid
- `DELETE /api/kids/:id` - Delete kid

### Characters
- `GET /api/characters` - List characters
- `POST /api/characters` - Create character
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

### Stories
- `GET /api/stories` - List stories
- `GET /api/stories/:id` - Get story
- `POST /api/stories/generate` - Generate new story
- `DELETE /api/stories/:id` - Delete story

### Subscriptions
- `POST /api/create-checkout-session` - Create Stripe checkout
- `GET /api/subscription-status` - Check subscription status
- `POST /api/create-customer-portal` - Stripe customer portal

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - System design and technical details
- [Migration Guide](docs/MIGRATION.md) - History of platform migration from Replit
- [Security Guide](docs/SECURITY.md) - Security implementation details

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with love for bedtime storytelling.
