# Dreamlets Migration Guide

This document captures the history of Dreamlets' migration from Replit to a standalone deployment on Render.com.

## Project History

Dreamlets was originally developed on [Replit](https://replit.com), a cloud-based development platform. The project evolved significantly during its time on Replit:

- **July 2025**: Initial development as "StoryForge", later renamed to "Dreamlets"
- **July-August 2025**: Feature development including guest sessions, Stripe integration, OpenAI Assistants
- **January 2026**: Migration to platform-independent architecture
- **January 2026**: Full migration to Render.com

## Original Replit Setup

### Replit Features Used

| Feature | Purpose | Replacement |
|---------|---------|-------------|
| Replit Auth (OIDC) | User authentication | Email/password auth with bcrypt |
| PostgreSQL Database | Data storage | Neon PostgreSQL (external) |
| Object Storage | File uploads | Local filesystem storage |
| Deployments | Hosting | Render.com |
| Secrets | Environment variables | Render environment config |

### Replit-Specific Files (Removed)

```
.replit                          # Replit workflow configuration
replit.md                        # Replit agent documentation  
server/replitAuth.ts             # Replit OIDC authentication
server/replit_integrations/      # Object storage integration
  └── object_storage/
      ├── index.ts
      ├── objectAcl.ts
      ├── objectStorage.ts
      └── routes.ts
```

### Replit Dependencies (Removed)

```json
{
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.2.7",
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3"
  }
}
```

### Replit HTML Script (Removed)

```html
<!-- Was in client/index.html -->
<script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
```

## Migration Decisions

### Authentication: Replit Auth → Email/Password

**Why Changed**: 
- Replit Auth only works on Replit-hosted domains
- Users need to have Replit accounts
- Complex OAuth flow with session management issues

**New Approach**:
- Simple email/password authentication
- bcrypt password hashing (12 rounds)
- express-session with PostgreSQL store
- No external OAuth dependencies

**Files Changed**:
- `server/simpleAuth.ts` (new implementation)
- `server/replitAuth.ts` (deleted)
- `client/src/hooks/useAuth.ts` (simplified)

### Image Storage: Replit Object Storage → Local Filesystem

**Why Changed**:
- Replit Object Storage requires Replit sidecar service
- Not accessible outside Replit environment
- Complex ACL management

**New Approach**:
- Images stored in `storage/users/{userId}/images/`
- Served via Express static route `/user-assets/:userId/images/:filename`
- Works on any platform with filesystem access

**Benefits**:
- Simple to understand and debug
- No cloud service dependencies
- Easy to migrate to S3/Cloudinary later if needed

### Database: Replit PostgreSQL → Neon PostgreSQL

**Why This Works**:
- Already using `@neondatabase/serverless` driver
- Neon offers generous free tier
- No code changes needed
- Just update `DATABASE_URL` environment variable

**Alternative**: Use Render's managed PostgreSQL (paid)

## Configuration Changes

### vite.config.ts

**Before**:
```typescript
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())]
      : []),
  ],
  // ...
});
```

**After**:
```typescript
export default defineConfig({
  plugins: [react()],
  // ...
});
```

### server/index.ts

**Before**:
```typescript
const port = 5000; // Hardcoded for Replit
```

**After**:
```typescript
const port = parseInt(process.env.PORT || "5000", 10);
```

### client/index.html

**Before**:
```html
<script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
```

**After**: Script removed entirely.

## Environment Variables

### Replit Secrets → Standard .env

| Replit Secret | New Variable | Notes |
|---------------|--------------|-------|
| `DATABASE_URL` | `DATABASE_URL` | Same format |
| `OPENAI_API_KEY` | `OPENAI_API_KEY` | Same format |
| `SESSION_SECRET` | `SESSION_SECRET` | Same format |
| `STRIPE_SECRET_KEY` | `STRIPE_SECRET_KEY` | Same format |
| `STRIPE_PRICE_ID` | `STRIPE_PRICE_ID` | Same format |
| `REPL_ID` | (removed) | Not needed |
| `REPLIT_DOMAINS` | (removed) | Not needed |
| `ISSUER_URL` | (removed) | Was for Replit Auth |

## Known Issues & Workarounds

### Issue: OpenAI Image URLs Expire

**Problem**: DALL-E 3 image URLs expire after 1-2 hours.

**Solution**: Download images immediately after generation and store locally.

```typescript
// server/services/openai.ts
async function downloadAndSaveImage(imageUrl: string, filename: string, userId: string) {
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const userImagesDir = path.join(STORAGE_ROOT, "users", userId, "images");
  await fs.mkdir(userImagesDir, { recursive: true });
  await fs.writeFile(path.join(userImagesDir, filename), buffer);
  return `/user-assets/${userId}/images/${filename}`;
}
```

### Issue: Session Data Loss on Auth

**Problem**: Guest session data was lost when users authenticated with Replit Auth.

**Solution**: Migrate guest data during registration/login.

```typescript
// server/simpleAuth.ts
const guestData = {
  kids: req.session.guestKids,
  characters: req.session.guestCharacters,
  stories: req.session.guestStories
};

if (guestData.kids?.length > 0 || guestData.characters?.length > 0 || guestData.stories?.length > 0) {
  await storage.migrateGuestDataToUser(user.id, guestData);
  delete req.session.guestKids;
  delete req.session.guestCharacters;
  delete req.session.guestStories;
}
```

### Issue: OpenAI Assistant Thread Corruption

**Problem**: Invalid thread IDs were being stored in database.

**Solution**: Validate thread/assistant IDs before storing.

```typescript
// server/storage.ts
if (!assistantId.startsWith('asst_')) {
  throw new Error(`Invalid assistantId: ${assistantId}`);
}
if (!threadId.startsWith('thread_')) {
  throw new Error(`Invalid threadId: ${threadId}`);
}
```

## Future Improvements

### Recommended Enhancements

1. **Image Storage**: Consider migrating to Cloudinary or S3 for better scalability
2. **Caching**: Add Redis for session storage and API response caching
3. **Rate Limiting**: Implement `express-rate-limit` for API protection
4. **Monitoring**: Add application monitoring (Sentry, LogRocket)
5. **CDN**: Use a CDN for static assets and images

### Potential Migrations

| Current | Future Option | Benefit |
|---------|---------------|---------|
| Local image storage | Cloudflare R2 / S3 | Scalability, CDN |
| Neon PostgreSQL | PlanetScale | Edge locations |
| express-session | Iron Session | Stateless sessions |
| Render.com | Vercel / Railway | Edge functions |

## Testing the Migration

After migration, verify:

1. **Authentication**: Register, login, logout all work
2. **Guest Mode**: Can create 3 free stories without account
3. **Story Generation**: Stories generate with images
4. **Image Persistence**: Images survive server restarts
5. **Subscriptions**: Stripe checkout and webhooks work
6. **Database**: All CRUD operations function correctly

## Rollback Plan

If issues occur:

1. Revert to Replit deployment
2. Restore Replit-specific files from git history
3. Re-add Replit dependencies to package.json
4. Deploy on Replit

Git commands to restore files:
```bash
git checkout HEAD~1 -- .replit replit.md server/replitAuth.ts
git checkout HEAD~1 -- server/replit_integrations/
```
