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
- **AI Integration**: OpenAI API for story generation and image creation
- **API Design**: RESTful endpoints for CRUD operations

### Data Storage
- **Database**: PostgreSQL via Neon Database (currently using Replit's PostgreSQL)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema**: Four main tables - users, kids, characters, stories
- **Migrations**: Managed through Drizzle Kit
- **Production Storage**: PostgreSQL database with persistent data storage

## Key Components

### Database Schema
- **Users**: Basic user authentication and identification
- **Kids**: Child profiles with name, age, and description
- **Characters**: Recurring story characters (manual or image-based)
- **Stories**: Generated stories with three parts, images, and metadata

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