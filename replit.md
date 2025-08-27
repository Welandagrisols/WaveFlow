# Yasinga - Smart M-Pesa Restaurant Business Tracker

## Overview

Yasinga is a mobile-first Progressive Web App (PWA) designed for restaurant owners and business operators who use M-Pesa for both business and personal transactions. The application automatically processes M-Pesa SMS messages to detect transactions, then prompts users to quickly confirm what was purchased, who it was from, and whether it was a business or personal expense. Features intelligent learning to remember suppliers, common items, and automatically suggest categorization for repeat transactions. Built specifically for dual-SIM users managing separate business and personal M-Pesa accounts from a single interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based architecture with the following key components:
- **React 18** with functional components and hooks for state management
- **Vite** as the build tool and development server for fast hot module replacement
- **Wouter** for lightweight client-side routing instead of React Router
- **TailwindCSS** for utility-first styling with custom Yasinga brand colors
- **Shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **React Query (TanStack Query)** for server state management, caching, and API synchronization
- **React Hook Form** with Zod validation for type-safe form handling
- **PWA capabilities** configured through Vite with service worker and manifest for installable app experience

### Backend Architecture  
The server follows a Node.js/Express pattern with the following design decisions:
- **Express.js** REST API with middleware-based request processing
- **TypeScript** throughout for type safety and better developer experience
- **Zod schemas** for request validation and type inference
- **Session-based authentication** using Replit's OpenID Connect integration
- **Modular route handling** with separate route registration and middleware setup
- **Error handling middleware** with structured error responses
- **Development-specific tooling** including request logging and Vite integration

### Data Storage
The application uses a PostgreSQL-based storage solution:
- **Neon Database** (serverless PostgreSQL) as the primary database
- **Drizzle ORM** for type-safe database operations and schema management
- **Connection pooling** through @neondatabase/serverless for efficient resource usage
- **Schema-driven development** with shared TypeScript types between client and server
- **Session storage** using connect-pg-simple for persistent user sessions

### Database Schema Design
The schema supports the core expense tracking functionality:
- **Users table** for Replit Auth integration with profile information
- **Categories table** for expense classification with business/personal flags
- **Transactions table** for M-Pesa transaction records with direction, amounts, and metadata
- **Payment reminders table** for tracking recurring payments and bills
- **Sessions table** for secure session management

### Authentication & Authorization
Security is implemented through multiple layers:
- **Replit Auth integration** using OpenID Connect for user authentication
- **Session-based authorization** with secure HTTP-only cookies
- **Middleware protection** on all API routes requiring authentication
- **User context** automatically injected into authenticated requests
- **Automatic logout** handling for expired or invalid sessions

### API Design Patterns
The REST API follows consistent patterns:
- **Resource-based URLs** following REST conventions
- **Consistent error responses** with proper HTTP status codes
- **Request/response validation** using Zod schemas
- **User scoping** for all data operations to ensure data isolation
- **Pagination support** for large datasets like transaction histories

### Mobile-First Design
The UI architecture prioritizes mobile experience:
- **Responsive layout system** using TailwindCSS breakpoints
- **Touch-optimized interactions** with large tap targets and swipe actions
- **Mobile navigation patterns** with collapsible sidebar and bottom navigation
- **PWA features** including offline capability and home screen installation
- **Performance optimization** with lazy loading and efficient rendering

## External Dependencies

### Database & ORM
- **Neon Database** - Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM** - Type-safe database toolkit for schema management and queries
- **connect-pg-simple** - PostgreSQL session store for Express sessions

### Authentication
- **Replit Auth** - OpenID Connect authentication provider
- **Passport.js** - Authentication middleware for Node.js
- **openid-client** - OpenID Connect client implementation

### Frontend Libraries  
- **React Query** - Server state management and caching
- **React Hook Form** - Form state management and validation
- **Wouter** - Lightweight client-side routing
- **date-fns** - Date manipulation and formatting utilities
- **Radix UI** - Accessible component primitives for the design system

### Development Tools
- **Vite** - Build tool and development server with HMR
- **TypeScript** - Static type checking and enhanced developer experience  
- **TailwindCSS** - Utility-first CSS framework
- **Zod** - Runtime type validation and schema definition

### Utility Libraries
- **clsx** - Conditional CSS class composition
- **nanoid** - URL-safe unique ID generation
- **memoizee** - Function memoization for performance optimization

The architecture prioritizes type safety, developer experience, and scalability while maintaining focus on the mobile-first user experience for expense tracking workflows.

## Recent Changes

### Critical Service Worker Fix (August 27, 2025)
- **RESOLVED 2-week 404 error issue** - Service worker was serving stale cached content
- Completely removed problematic service worker registration from main.tsx
- Fixed client-side routing logic in App.tsx for proper authentication handling  
- Updated Supabase client configuration to handle missing environment variables gracefully
- App now loads fresh content every time, no more cache-related issues
- Landing page displays correctly for unauthenticated users
- **IMPORTANT**: Service worker functionality disabled to prevent future caching issues

### Migration to Replit (August 22, 2025)
- Successfully migrated project from Replit Agent to Replit environment
- Configured Supabase database integration with user-provided credentials
- Set up PostgreSQL database with all required tables and schema
- Established proper client/server separation with Express backend and React frontend
- Implemented Replit Auth integration with OpenID Connect
- All core functionality verified and working: authentication, transactions, categories, SMS parsing, and reporting features
- All action buttons and user interactions confirmed working correctly
- Default categories automatically created for hotel business expense tracking
- Project now fully operational on Relit with secure database connections and complete UI functionality