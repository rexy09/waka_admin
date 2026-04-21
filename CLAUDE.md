# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Setup**
```bash
yarn install     # Install dependencies (requires Node 20+)
```

**Development**
```bash
yarn dev         # Start development server (http://localhost:5173)
yarn build       # Build for production (outputs to dist/)
yarn lint        # Run ESLint
yarn preview     # Preview production build
```

**Node Version**
- Use Node.js version 20 (see .nvmrc)
- Run `nvm use 20` if using nvm

## Architecture Overview

This is a React 18 + TypeScript + Vite admin dashboard application for managing a job marketplace with the following key architectural patterns:

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Mantine v7 (components, forms, notifications, charts, dropzone, dates, carousel, tiptap)
- **Routing**: React Router v6 + react-auth-kit for authentication
- **State Management**: Zustand + React Auth Kit
- **Styling**: CSS Modules + Sass + Tailwind CSS
- **Authentication**: Firebase + react-auth-kit (cookie-based)
- **Maps**: Google Maps API + @react-google-maps/api
- **Search**: Algolia (react-instantsearch)
- **Rich Text**: TipTap editor
- **HTTP Client**: Axios with custom interceptors

### Project Structure
```
src/
├── App.tsx              # Main app with providers (Mantine, Auth, Router)
├── routes/              # React Router configuration
│   └── Router.tsx       # Route definitions with auth guards
├── pages/               # Page-level components
│   ├── auth/           # Authentication pages
│   └── dashboard/      # Protected dashboard pages
├── features/           # Feature-based organization
│   ├── auth/           # Authentication logic
│   ├── dashboard/      # Dashboard features (home, jobs, profile, settings, notifications, banner, users, jobReports, userVerification)
│   ├── services/       # Shared API services (useApiClient hook)
│   ├── hooks/          # Shared hooks
│   └── notifications/  # Global notification state
├── common/             # Shared components and utilities
│   ├── layouts/        # Layout components (Dashboard, Auth, Public)
│   ├── theme.ts        # Mantine theme configuration
│   └── icons.tsx       # Icon components
└── config/             # Configuration files
    ├── env.ts          # Environment variables
    └── firebase.ts     # Firebase configuration
```

### Feature-Based Architecture
Each feature follows this structure:
```
features/<feature-name>/
├── components/         # Feature-specific components
├── ui/                # UI components
├── hooks.ts           # Feature-specific hooks
├── services.ts        # API calls and business logic
├── stores.ts          # Zustand stores
├── types.ts           # TypeScript interfaces
└── data.ts            # Mock/static data
```

### Key Patterns

**Authentication Flow**
- Uses react-auth-kit with cookie-based storage
- Firebase integration for OAuth providers and push notifications
- Protected routes use `RequireAuth` wrapper from @auth-kit/react-router
- API client automatically includes auth headers via useAuthHeader hook
- Service worker registration for push notifications (see src/serviceWorker.ts)

**API Communication**
- Central `useApiClient` hook (src/features/services/ApiClient.ts) with axios interceptors
- Base URL configured via environment variables (src/config/env.ts)
- Automatic error handling for 400/401/403/404 responses
- Auth header injection for authenticated requests
- Returns a `sendRequest` function that accepts method, url, data, params, and headers

**State Management**
- Zustand for local feature state
- React Auth Kit for authentication state
- Mantine notifications for global notifications

**UI Patterns**
- Consistent Mantine theme with custom Button/TextInput/Select defaults (see src/App.tsx)
- Custom color palette and font family defined in src/common/theme.ts
- CSS Modules for component-specific styles
- Tailwind for utility classes
- Icons from lucide-react (see src/common/icons.tsx)
- Responsive design patterns

## Environment Variables
Required environment variables (configure in `.env`):
- `VITE_BASE_URL` - API base URL
- `VITE_FIREBASE_API` - Firebase API key
- `VITE_APP_VAPID_KEY` - Firebase messaging VAPID key
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `VITE_ALGOLIA_APP_ID` - Algolia app ID
- `VITE_ALGOLIA_SEARCH_KEY` - Algolia search key
- `VITE_ALGOLIA_INDEX_NAME` - Algolia index name
- `VITE_NODE_ENV` - Environment (production/development)

## Important Notes

**Authentication**
- User authentication state is managed by react-auth-kit
- Firebase handles OAuth providers
- API calls automatically include authentication headers via useApiClient hook

**Routing**
- All routes except `/signin` are protected (require authentication)
- Auth route: `/signin`
- Protected routes (require authentication):
  - `/` - Dashboard home
  - `/jobs` - Jobs listing
  - `/hired_jobs` - Hired jobs management
  - `/jobs/:id` - Job details
  - `/post_job` - Post new job
  - `/my_jobs` - User's jobs
  - `/my_jobs/:id/applied` - Applied job details
  - `/my_jobs/:id/posted` - Posted job details
  - `/profile` - User profile
  - `/complete_profile` - Complete profile setup
  - `/users` - User management
  - `/users/:id` - User details
  - `/notification_center` - Notification center
  - `/banner` - Banner management
  - `/job_reports` - Job reports
  - `/user_verification` - User verification management

**Development**
- Uses feature-based folder structure for better organization
- Each feature is self-contained with its own components, services, and stores
- API client handles error responses and authentication automatically
- Mantine provides the component library with custom theme configuration