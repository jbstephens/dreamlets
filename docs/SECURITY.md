# Dreamlets Security Guide

This document outlines the security measures implemented in Dreamlets and best practices for maintaining security.

## Authentication

### Password Security

Passwords are hashed using bcrypt with 12 rounds:

```typescript
// server/simpleAuth.ts
const hashedPassword = await bcrypt.hash(password, 12);
```

**Why 12 rounds?**
- Provides strong security against brute force attacks
- Takes ~250ms per hash on modern hardware
- Balances security with user experience

### Password Verification

```typescript
const isValidPassword = await bcrypt.compare(password, user.password);
```

### Never Expose Password Hashes

All user responses strip the password field:

```typescript
const { password: _, ...userWithoutPassword } = user;
res.json(userWithoutPassword);
```

## Session Management

### Session Configuration

```typescript
// server/simpleAuth.ts
session({
  secret: process.env.SESSION_SECRET!,
  store: new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,                    // Prevents XSS access to cookies
    secure: process.env.NODE_ENV === "production",  // HTTPS only in production
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 1 week
  },
})
```

### Session Store

Sessions are stored in PostgreSQL, not in memory:
- Survives server restarts
- Enables horizontal scaling
- Automatic expiration cleanup

### Session Secret

**Requirements**:
- Minimum 32 characters
- Cryptographically random
- Never commit to version control

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Security

### Authentication Middleware

```typescript
// server/simpleAuth.ts
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    req.session.userId = null;
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};
```

### Resource Authorization

Ensure users can only access their own resources:

```typescript
// server/routes.ts
app.get("/api/stories/:id", async (req: any, res) => {
  const story = await storage.getStoryById(id);
  
  // Verify ownership
  if (story.userId !== req.session.userId) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  res.json(story);
});
```

## Input Validation

### Zod Schema Validation

All API inputs are validated with Zod schemas:

```typescript
// shared/schema.ts
export const insertKidSchema = createInsertSchema(kids).omit({
  id: true,
  createdAt: true,
});

// server/routes.ts
const validatedData = insertKidSchema.parse(req.body);
```

### Drizzle ORM

Using Drizzle ORM prevents SQL injection:

```typescript
// Parameterized queries - safe
await db.select().from(users).where(eq(users.email, email));
```

## Stripe Webhook Security

### Current Implementation (Needs Improvement)

The current webhook handler does not verify Stripe signatures:

```typescript
// INSECURE - currently in routes.ts
app.post("/api/webhook/stripe", async (req, res) => {
  const event = req.body;  // Not verified!
  // ...
});
```

### Recommended Implementation

```typescript
// SECURE - recommended implementation
app.post(
  "/api/webhook/stripe",
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    let event: Stripe.Event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle verified event
    switch (event.type) {
      case 'checkout.session.completed':
        // ...
    }
    
    res.json({ received: true });
  }
);
```

### Required Environment Variable

Add `STRIPE_WEBHOOK_SECRET` from the Stripe Dashboard:
1. Go to Developers → Webhooks
2. Create endpoint for your production URL
3. Copy the signing secret

## Rate Limiting (Recommended)

Add rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: { error: 'Too many login attempts, please try again later.' }
});

// Story generation limit (expensive operation)
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 generations per hour
  message: { error: 'Generation limit reached, please try again later.' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/stories/generate', generateLimiter);
```

## CORS Configuration (Recommended)

For production, add explicit CORS configuration:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com']
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## Environment Variables

### Required Secrets

| Variable | Purpose | Security Level |
|----------|---------|----------------|
| `DATABASE_URL` | Database connection | Critical |
| `SESSION_SECRET` | Session encryption | Critical |
| `OPENAI_API_KEY` | OpenAI API access | Critical |
| `STRIPE_SECRET_KEY` | Stripe API access | Critical |
| `STRIPE_WEBHOOK_SECRET` | Webhook verification | Critical |

### Best Practices

1. **Never commit secrets** to version control
2. **Use different keys** for development and production
3. **Rotate secrets** periodically
4. **Use secret managers** in production (Render secrets, AWS Secrets Manager)

### .gitignore

Ensure these are ignored:
```
.env
.env.local
.env.production
```

## Error Handling

### Production Error Responses

Never expose stack traces in production:

```typescript
// server/index.ts
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  
  // Log full error for debugging
  console.error(err);
  
  // Send safe response
  res.status(status).json({ 
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message 
  });
});
```

## Content Security

### XSS Prevention

- React automatically escapes output
- Use `httpOnly` cookies
- Validate all user input

### Image Security

Story images are user-generated content considerations:
- Images come from OpenAI DALL-E (trusted source)
- Downloaded and stored locally
- Served with appropriate content-type headers

## Security Checklist

### Before Deployment

- [ ] Strong `SESSION_SECRET` set (64+ characters)
- [ ] `STRIPE_WEBHOOK_SECRET` configured
- [ ] HTTPS enforced (Render provides this)
- [ ] Database connection uses SSL
- [ ] All secrets in environment variables
- [ ] `.env` files in `.gitignore`

### Recommended Improvements

- [ ] Add rate limiting (`express-rate-limit`)
- [ ] Add CORS configuration
- [ ] Implement Stripe webhook signature verification
- [ ] Add security headers (`helmet`)
- [ ] Set up monitoring/alerting
- [ ] Regular dependency updates

### Helmet Security Headers (Recommended)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com"],
    },
  },
}));
```

## Incident Response

### If Credentials Are Compromised

1. **Rotate the affected secret immediately**
2. Check Stripe Dashboard for unauthorized activity
3. Check OpenAI usage for unusual activity
4. Review database access logs
5. Invalidate all sessions (clear sessions table)
6. Notify affected users if necessary

### Useful Commands

```bash
# Invalidate all sessions
psql $DATABASE_URL -c "DELETE FROM sessions;"

# Check for unusual database activity
psql $DATABASE_URL -c "SELECT * FROM users ORDER BY created_at DESC LIMIT 10;"
```
