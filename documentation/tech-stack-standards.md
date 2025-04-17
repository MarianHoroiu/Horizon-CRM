# Tech Stack Standards for Horizon-CRM

This document outlines the technical standards, best practices, and implementation guidelines for each technology used in the Horizon-CRM employee management system.

## Next.js 15+

### Configuration Standards

We'll use a properly configured next.config.js with strict mode enabled, image optimization, and appropriate experimental features.

### Architecture Standards

1. **App Router Structure**

   - Use route groups (folders with parentheses) for logical organization
   - Implement layout files for shared UI components
   - Create error boundaries at appropriate levels

2. **Server/Client Component Separation**

   - Default to Server Components
   - Use 'use client' directive only for components that:
     - Use React hooks
     - Require browser APIs
     - Need client-side event handlers

3. **Data Fetching**

   - Use React Server Components for initial data fetching
   - Implement proper caching with fetch options
   - Consider streaming for large data sets

4. **Server Actions**
   - Use for all form submissions and data mutations
   - Implement proper validation before database operations
   - Use revalidatePath/revalidateTag for cache invalidation

### Best Practices

1. **Performance**

   - Implement route-specific code splitting
   - Use Image component for all images
   - Implement progressive loading with Suspense

2. **Error Handling**

   - Create custom error components with error.js
   - Implement fallback UI for error states
   - Log errors appropriately on server

3. **SEO**
   - Implement proper metadata using Metadata API
   - Create dynamic OG images with ImageResponse
   - Generate proper sitemaps and robots.txt

## TypeScript

### Configuration Standards

We'll use a properly configured tsconfig.json with strict type checking, Next.js plugins, and appropriate module resolution.

### Type Standards

1. **General Typing**

   - Prefer interfaces for object types that may be extended
   - Use type for unions, intersections, and tuples
   - Use const objects with as const for predefined sets of values
   - Use generics for reusable components

2. **API Types**

   - Define request and response types for all API endpoints
   - Use Zod schemas for request validation
   - Create shared type definitions for common structures

3. **Component Props**
   - Define explicit prop interfaces for all components
   - Use React.FC type sparingly (prefer explicit return types)
   - Implement proper children typing

### Best Practices

1. **Type Safety**

   - Avoid using `any` type (use `unknown` when needed)
   - Use nullish coalescing (`??`) and optional chaining (`?.`)
   - Implement exhaustive type checking for discriminated unions

2. **Type Organization**

   - Create dedicated type files for domain models
   - Co-locate component prop types with components
   - Use barrel exports for related types

3. **Type Utilities**
   - Use built-in utility types (Partial, Required, Pick, etc.)
   - Create custom utility types for common patterns
   - Implement proper generic constraints

## TanStack (React Query)

### Configuration Standards

We'll configure QueryClient with appropriate defaults for stale times, cache garbage collection, and retry logic.

### Implementation Standards

1. **Query Hooks**

   - Create custom hooks for all queries
   - Implement proper error handling
   - Use consistent naming convention (use[Entity][Action])

2. **Mutations**

   - Create dedicated mutation hooks
   - Implement optimistic updates where appropriate
   - Use onMutate, onError, onSuccess callbacks

3. **Caching Strategy**
   - Define appropriate stale times based on data volatility
   - Implement manual invalidation for related queries
   - Use query keys consistently with proper structure

### Best Practices

1. **Performance**

   - Use query deduplication for shared data
   - Implement prefetching for anticipated data needs
   - Use suspense mode with proper error boundaries

2. **State Management**
   - Use with useOptimistic for optimistic UI updates
   - Implement proper loading and error states
   - Consider using query data normalization for complex data

## Shadcn UI & Tailwind CSS

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Add custom colors here
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### Component Standards

1. **UI Components**

   - Use Shadcn UI components as base
   - Extend rather than modify core components
   - Create composite components for repeated patterns

2. **Styling**

   - Use Tailwind's utility classes for styling
   - Maintain consistent spacing using Tailwind's spacing scale
   - Implement responsive design using Tailwind breakpoints

3. **Theme**
   - Use CSS variables for theming
   - Implement dark mode support
   - Create a consistent color palette

### Best Practices

1. **Accessibility**

   - Ensure proper contrast ratios
   - Implement keyboard navigation
   - Use semantic HTML elements

2. **Performance**

   - Purge unused styles in production
   - Minimize custom CSS
   - Use @apply sparingly

3. **Maintainability**
   - Create design tokens for common values
   - Document component API
   - Create a component storybook

## Prisma & SQLite

### Schema Standards

We'll implement a simplified Prisma schema focusing on core User, Department, and Project models with properly defined relationships and constraints.

### Implementation Standards

1. **Database Operations**

   - Create service layer for database operations
   - Implement transaction for related operations
   - Use proper error handling for database errors

2. **Migrations**

   - Generate migrations for all schema changes
   - Review migrations before applying
   - Test migrations in development environment

3. **Security**
   - Never expose sensitive data directly
   - Implement proper access control
   - Use pagination for large datasets

### Best Practices

1. **Performance**

   - Use select to limit returned fields
   - Implement proper indexes
   - Use include for related data instead of separate queries

2. **Data Integrity**

   - Implement proper relations
   - Use cascading deletes where appropriate
   - Define proper constraints

3. **Development Workflow**
   - Use seed data for development
   - Create mock data for testing
   - Document model relationships

## Authentication (JWT)

### Configuration Standards

We'll use NextAuth.js or a custom JWT implementation with appropriate security measures.

### Implementation Standards

1. **Authentication Flow**

   - Use JWT for stateless authentication
   - Implement secure cookie storage for tokens
   - Create middleware for protected routes

2. **User Management**

   - Implement proper password hashing (bcrypt)
   - Create account recovery flows
   - Implement email verification

3. **OAuth Integration**
   - Support Google authentication
   - Implement proper OAuth state validation
   - Store minimal user data from OAuth providers

### Best Practices

1. **Security**

   - Use HTTP-only cookies for token storage
   - Implement proper CSRF protection
   - Set appropriate token expiration

2. **User Experience**

   - Create seamless authentication flows
   - Implement proper error messages
   - Support "remember me" functionality

3. **Maintenance**
   - Implement token refresh mechanism
   - Create audit logs for authentication events
   - Support account locking for suspicious activity

## MinIO S3 Document Storage

### Configuration Standards

We'll implement MinIO or AWS S3 integration for secure document storage.

### Implementation Standards

1. **Document Operations**

   - Create service layer for document operations
   - Implement secure upload/download
   - Support document versioning

2. **Access Control**

   - Generate pre-signed URLs for secure access
   - Implement proper permission checking
   - Set appropriate expiration for URLs

3. **Metadata Management**
   - Store document metadata in database
   - Support tagging and categorization
   - Implement search functionality

### Best Practices

1. **Performance**

   - Use chunked uploads for large files
   - Implement client-side file compression
   - Use proper caching headers

2. **Security**

   - Scan uploads for malware
   - Validate file types
   - Implement proper backup strategy

3. **User Experience**
   - Show upload progress
   - Support drag-and-drop uploads
   - Implement preview functionality

## CASL for RBAC

### Configuration Standards

We'll implement CASL for role-based access control with custom ability definitions.

### Implementation Standards

1. **Permission Definitions**

   - Define abilities based on user roles
   - Implement subject-based permissions
   - Support field-level permissions

2. **Integration Points**

   - Use in API route handlers
   - Integrate with middleware
   - Use in UI components for conditional rendering

3. **Permission Management**
   - Create admin interface for managing permissions
   - Support custom role creation
   - Implement permission auditing

### Best Practices

1. **Performance**

   - Cache user permissions
   - Optimize permission checks
   - Use efficient rule structures

2. **Security**

   - Verify permissions server-side
   - Never trust client-side permission checks
   - Log permission denials

3. **Flexibility**
   - Design for future permission needs
   - Allow for role inheritance
   - Support dynamic permission adjustment

## Project Structure

We'll follow a well-organized directory structure that separates concerns and promotes clean architecture with the Next.js App Router.

### Coding Standards

1. **Component Structure**

   - One component per file
   - Use named exports
   - Co-locate related files

2. **File Naming**

   - Use kebab-case for files and directories
   - Use PascalCase for component files
   - Use camelCase for utility functions

3. **Import Order**
   - React and Next.js imports first
   - External library imports second
   - Internal module imports third
   - Type imports fourth
   - CSS imports last

### Documentation Standards

1. **Code Comments**

   - Document complex logic
   - Use JSDoc for function documentation
   - Comment non-obvious solutions

2. **README Files**

   - Create README.md for each major directory
   - Document component APIs
   - Provide usage examples

3. **API Documentation**
   - Document all API endpoints
   - Specify request and response formats
   - Document error codes and responses

## Conclusion

Following these technical standards will ensure consistency across the Horizon-CRM codebase, improve maintainability, and provide a solid foundation for scaling the application. These standards should be reviewed and updated regularly as the project evolves and new requirements emerge.
