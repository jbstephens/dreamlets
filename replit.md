# Dreamlets MVP - AI-Powered Bedtime Story Generator

## Overview

Dreamlets is a full-stack web application that generates personalized illustrated bedtime stories for children. The app allows parents to define their kids and recurring characters, input story ideas, and generate 3-page illustrated stories with AI-generated text and images.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom color scheme (coral, lavender, mint, sunset, cream, navy)
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based (demo user for MVP)
- **AI Integration**: 
  - OpenAI Assistants API for authenticated users (persistent context)
  - OpenAI Completions API for guest users (stateless)
  - OpenAI DALL-E for image generation
- **API Design**: RESTful endpoints for CRUD operations

### Data Storage
- **Database**: PostgreSQL via Neon Database (currently using Replit's PostgreSQL)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Four main tables - users, kids, characters, stories
- **Migrations**: Managed through Drizzle Kit
- **Production Storage**: PostgreSQL database with persistent data storage

## Key Components

### Database Schema
- **Users**: Basic user authentication, subscription tiers, and OpenAI Assistant thread management
- **Kids**: Child profiles with name, age, and detailed physical descriptions
- **Characters**: Recurring story characters (manual or image-based)
- **Stories**: Generated stories with three parts, images, metadata, and OpenAI run tracking

### Core Features
1. **Character Management**: Add and manage kids and story characters
2. **Story Generation**: Personalized story creation with customizable tone
3. **Image Generation**: Custom illustrations for each story part
4. **Story Display**: Formatted 3-page story view with print capability
5. **Story History**: View and access previously generated stories

### API Endpoints
- `/api/kids` - CRUD operations for child profiles
- `/api/characters` - CRUD operations for story characters
- `/api/stories` - Story generation and retrieval
- `/api/stories/generate` - AI story generation endpoint

## Data Flow

1. **User Setup**: Parents create profiles for their children and recurring characters
2. **Story Request**: User selects kids, characters, enters story idea, and chooses tone
3. **Story Processing**: OpenAI generates story text in three parts plus image prompts
4. **Image Generation**: System creates illustrations based on story content
5. **Story Storage**: Complete story with text and images saved to database
6. **Story Display**: Formatted presentation with print functionality

## External Dependencies

### AI Services
- **OpenAI GPT-4**: Story text generation
- **OpenAI DALL-E**: Image generation for story illustrations

### Database
- **PostgreSQL**: Standard PostgreSQL database (created via Replit)
- **Connection**: Via `@neondatabase/serverless` driver for production
- **Development**: In-memory storage with automatic fallback to PostgreSQL

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: Express server with TypeScript compilation via tsx
- **Database**: Development uses in-memory storage with fallback to PostgreSQL

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code for Node.js
- **Database**: PostgreSQL via Neon Database connection
- **Environment**: Configured for Replit deployment

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API authentication
- `NODE_ENV`: Environment configuration

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Changed app name from StoryForge to Dreamlets throughout codebase
- July 08, 2025. Fixed routing system - stories now use unique URLs (/story/1, /story/2, etc.)
- July 08, 2025. Switched from in-memory storage to PostgreSQL database for data persistence
- July 08, 2025. Fixed authentication infinite loop for guest users
- July 08, 2025. Implemented guest session system allowing one free story without signup
- July 08, 2025. Fixed image generation to create consistent characters across all three story images by establishing character descriptions that are used in all image prompts
- July 09, 2025. Fixed critical guest user story generation - kid and character names now properly retrieved from session storage and passed to OpenAI
- July 09, 2025. Simplified character creation form - removed type dropdown, now only requires name and description
- July 09, 2025. Improved image display - stories now show beautiful gradient placeholders when image generation fails instead of broken images
- July 09, 2025. Changed "Try Free Story" to "Create Your Story" button on landing page for reduced friction
- July 09, 2025. Moved pricing to separate /pricing page with no navigation links to reduce sales pressure
- July 09, 2025. Removed guest notification component to eliminate friction for first story creation
- July 09, 2025. Made logo/navbar text clickable to link to homepage always
- July 09, 2025. Removed "AI" terminology throughout app - replaced with parent-friendly terms like "Personalized" and "Custom"
- July 09, 2025. Added delightful loading modal with progress bar and kid-friendly messages like "Wrangling unicorns" and "Teaching dragons to dance" during story generation
- July 09, 2025. Fixed image cropping issue completely - removed height restrictions and object-cover to show full OpenAI-generated images without cutting off heads
- July 09, 2025. Added pricing page link to navbar dropdown menu for easy access to subscription plans
- July 09, 2025. Added comprehensive Open Graph meta tags and custom SVG image for beautiful social media sharing on iMessage, Facebook, and Twitter
- July 09, 2025. Added classy account creation stripe at bottom of story pages for non-logged in users with "Save My Story" call-to-action
- July 09, 2025. Updated account creation messaging to clarify "5 total stories per month" instead of just "5 total stories" for accuracy
- July 09, 2025. Fixed critical issue where guest users lost their first story after creating accounts - implemented guest session data migration system that transfers kids, characters, and stories from guest sessions to newly authenticated user accounts
- July 10, 2025. Increased story limit for non-logged users from 1 to 5 stories within first 30 days - guests can now create up to 5 stories before needing to authenticate, with automatic 30-day expiration of old stories (later reduced to 3 free stories)
- July 10, 2025. Replaced Replit OAuth with simple email/password authentication to fix guest data migration issues and improve user experience
- July 10, 2025. Restored proper page structure: `/` for homepage/marketing, `/create` for story creation interface (shared by guests and authenticated users), with stories persisting permanently only for authenticated users
- July 11, 2025. Implemented comprehensive Google Analytics tracking across all pages with automatic page view tracking, custom event tracking for user actions (registration, login, story creation, CTA clicks), and proper GA4 integration
- July 11, 2025. Fixed critical button styling issue by adding complete custom color definitions to Tailwind configuration - buttons now display properly with coral background and white text instead of being invisible
- July 11, 2025. Completed Stripe-managed billing integration with production Price ID (price_1Rj60z2cvO7jK0BO92TxjE0c) for $19.99/month Premium subscriptions - added checkout session creation, subscription status checking, and "Get More Stories" upgrade button for seamless payment flow
- July 11, 2025. Fixed critical subscription upgrade bug - corrected Stripe success URL to properly trigger user upgrade after payment completion, added comprehensive webhook handling for production reliability, and manually upgraded user jbstephens+5@gmail.com to premium_unlimited status
- July 12, 2025. Added comprehensive Terms and Conditions page with Q5 Labs contact information and footer links on all pages for legal compliance
- July 13, 2025. Reduced free story limit from 5 to 3 stories for better conversion - updated all messaging, error handling, and story counters throughout the app
- July 13, 2025. Fixed critical "failed to add kid" authentication bug - resolved Zod validation error where userId wasn't properly included for authenticated users
- July 13, 2025. Updated Premium pricing from $19.99 to $5.99/month for better market fit - updated pricing page display and new Stripe price ID (price_1RkWpsGRcygDG6rXARfLqABr)
- July 14, 2025. Fixed critical character creation bug for authenticated users - userId validation was failing because userId wasn't included in request validation (same issue as kids creation)
- July 14, 2025. Simplified OpenAI image generation prompts to eliminate unwanted text in images and reduce complexity - focused on simple, clean children's book illustrations without text, labels, or complex multi-panel layouts
- July 14, 2025. Enhanced landing page with comprehensive salesmanship elements: sample story section with real AI-generated illustration, "How It Works" 3-step process, pricing cards moved from separate page, and multiple strategic CTAs throughout for better conversion
- July 14, 2025. Fixed sample image loading issue by implementing static image serving from /public directory - eliminated expensive OpenAI API calls on every landing page visit and replaced with locally stored PNG files for instant loading
- July 15, 2025. Updated sample story carousel with authentic, high-quality AI-generated illustrations - replaced placeholder images with properly labeled story images for Emma & Dragon, Max's Pirate Adventure, and Luna's Dream Kingdom
- July 15, 2025. Fixed critical image expiration issue - OpenAI DALL-E URLs expire after 1-2 hours causing all story images to break. Implemented automatic image downloading and local storage in /public/story-images/ for permanent image hosting
- July 16, 2025. Enhanced story generation prompt for longer stories with approximately twice the length, emphasizing meaningful middle sections and contextually appropriate character trait mentions rather than forced inclusion
- July 16, 2025. Improved story page UI - fixed Print button styling to use coral theme colors, enhanced Back button visibility with proper contrast, and removed duplicate title from header for cleaner layout
- July 24, 2025. Fixed critical broken story images issue - OpenAI DALL-E URLs were expiring but image download process was failing silently, leaving users with broken blue placeholder icons. Implemented robust error handling, improved image download reliability, and created comprehensive repair endpoint to regenerate all missing story images
- August 12, 2025. **MAJOR UPGRADE**: Successfully implemented OpenAI Assistants API with persistent conversation threads for authenticated users. Each user now has a dedicated AI storytelling companion that remembers all their kids, characters, story preferences, and previous adventures. Stories build contextually on past interactions, creating personalized narrative continuity and character development over time. Guest users continue using traditional completion API, while authenticated users get the enhanced experience with memory and relationship building. Fixed concurrent run handling and thread validation for robust Assistant API integration.