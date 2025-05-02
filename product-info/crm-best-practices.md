# Next.js 15 CRM Development Best Practices

## Introduction

This document outlines best practices, architecture decisions, and implementation guidelines for building enterprise-grade Customer Relationship Management (CRM) systems using Next.js 15. By following these standards, development teams can create scalable, maintainable, and high-performance applications that meet the complex requirements of modern CRM solutions.

## Table of Contents

1. [Architecture and Project Structure](#1-architecture-and-project-structure)
2. [Core Technical Practices](#2-core-technical-practices)
3. [UI Implementation](#3-ui-implementation)
4. [Performance Optimization](#4-performance-optimization)
5. [Security Practices](#5-security-practices)
6. [Testing and Quality Assurance](#6-testing-and-quality-assurance)
7. [Deployment and DevOps](#7-deployment-and-devops)
8. [Scalability Considerations](#8-scalability-considerations)
9. [Implementation Phases](#9-implementation-phases)
10. [Documentation Requirements](#10-documentation-requirements)

## 1. Architecture and Project Structure

### Recommended Directory Structure

```
app/
├── (auth)/               # Authentication routes
├── (dashboard)/          # Protected dashboard routes
│   ├── employees/        # Employee management
│   ├── documents/        # Document management
│   ├── settings/         # System settings
│   └── reports/          # Analytics and reporting
├── api/                  # API routes
components/
├── ui/                   # UI components from shadcn
├── forms/                # Form components
├── data-display/         # Tables, charts, etc.
└── layout/               # Layout components
lib/                      # Utility functions and services
├── auth/                 # Authentication utilities
├── db/                   # Database services
└── utils/                # Helper functions
types/                    # TypeScript type definitions
```

### Component Separation

Next.js 15 introduces improved support for React Server Components, enabling a clear separation between server and client components:

- **Server Components (Default)**

  - Use for data fetching and rendering
  - Better SEO and performance
  - Reduced client-side JavaScript

- **Client Components**
  - Mark with `'use client'` directive
  - Use only for interactive elements
  - Examples: forms, dropdowns, modals

### File Naming Conventions

- **Components**: `PascalCase.tsx`
- **Utilities**: `camelCase.ts`
- **Route Folders**: `kebab-case`
- **Layout Files**: `layout.tsx`, `page.tsx`, `error.tsx`
- **Server Actions**: `actions.ts`

## 2. Core Technical Practices

### Data Fetching Strategies

#### Server Component Data Fetching

```typescript
// app/customers/page.tsx
import { prisma } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1>Customers</h1>
      <CustomerList initialData={customers} />
    </div>
  );
}
```

#### Client-Side Data Fetching with TanStack Query

```typescript
// components/dashboard/RecentActivities.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecentActivities } from "@/lib/api";

export function RecentActivities() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["activities", "recent"],
    queryFn: () => getRecentActivities(),
    staleTime: 30_000, // 30 seconds
  });

  if (isLoading) return <ActivitySkeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return <ActivityList activities={data} />;
}
```

### State Management

For most CRM applications, a combination of these approaches is recommended:

1. **Local Component State**: For UI state that doesn't need to be shared
2. **React Context API**: For shared state across related components
3. **TanStack Query**: For server state (caching, revalidation)
4. **Server Actions**: For data mutations and form submissions

#### Example: Context Provider for User Preferences

```typescript
// contexts/PreferencesContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type Preferences = {
  compactView: boolean;
  showArchivedItems: boolean;
};

const PreferencesContext = createContext<{
  preferences: Preferences;
  updatePreferences: (newPrefs: Partial<Preferences>) => void;
}>(null!);

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState<Preferences>({
    compactView: false,
    showArchivedItems: false,
  });

  const updatePreferences = (newPrefs: Partial<Preferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);
```

### Server Actions for Mutations

```typescript
// app/leads/actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const LeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST"]),
});

export async function createLead(formData: FormData) {
  const validatedFields = LeadSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    status: formData.get("status") || "NEW",
  });

  await prisma.lead.create({
    data: validatedFields,
  });

  revalidatePath("/leads");
}
```

### Database Implementation

Prisma ORM with PostgreSQL provides type-safe database access:

#### Schema Definition

```prisma
// prisma/schema.prisma
model Customer {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  phone       String?
  status      CustomerStatus
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  contacts    Contact[]
  deals       Deal[]
}

model Contact {
  id          String      @id @default(cuid())
  firstName   String
  lastName    String
  email       String      @unique
  phone       String?
  jobTitle    String?
  customerId  String
  customer    Customer    @relation(fields: [customerId], references: [id], onDelete: Cascade)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum CustomerStatus {
  LEAD
  ACTIVE
  INACTIVE
  CHURNED
}
```

#### Database Service Layer

```typescript
// lib/db/customers.ts
import { prisma } from "@/lib/db";

export async function getCustomers({
  status,
  sort = "createdAt",
  order = "desc",
  page = 1,
  limit = 20,
}) {
  const customers = await prisma.customer.findMany({
    where: status ? { status } : undefined,
    orderBy: { [sort]: order },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      _count: {
        select: { deals: true, contacts: true },
      },
    },
  });

  const total = await prisma.customer.count({
    where: status ? { status } : undefined,
  });

  return {
    customers,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
}
```

## 3. UI Implementation

### Component Strategy

Leveraging Shadcn UI and Tailwind CSS provides a solid foundation:

1. **Base UI Components**: Use Shadcn UI for common elements
2. **Domain-Specific Components**: Build custom components for CRM-specific needs
3. **Composition**: Compose complex UI from smaller, reusable components

#### Example: Customer Card Component

```tsx
// components/customers/CustomerCard.tsx
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerStatusBadge } from "@/components/customers/CustomerStatusBadge";
import { formatDate } from "@/lib/utils/date";

export function CustomerCard({ customer }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row justify-between items-center">
        <h3 className="font-semibold text-lg">{customer.name}</h3>
        <CustomerStatusBadge status={customer.status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <MailIcon className="mr-2 h-4 w-4 opacity-70" />
            <span>{customer.email}</span>
          </div>
          {customer.phone && (
            <div className="flex items-center">
              <PhoneIcon className="mr-2 h-4 w-4 opacity-70" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div>Added {formatDate(customer.createdAt)}</div>
      </CardFooter>
    </Card>
  );
}
```

### Styling Approach

```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      // Custom spacing, breakpoints, etc.
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Accessibility Considerations

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Implement proper focus management
- Add ARIA attributes where necessary
- Ensure sufficient color contrast
- Test with keyboard navigation
- Support screen readers with appropriate text alternatives

## 4. Performance Optimization

### Core Techniques

- **Partial Prerendering (PPR)**: Mix static and dynamic content
- **Streaming**: Progressive rendering with `<Suspense>`
- **Image Optimization**: Use Next.js Image component
- **Route Segments**: Optimize loading of shared UI

#### Example: Streamed Content with Suspense

```tsx
import { Suspense } from "react";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { MetricsLoadingSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>

      {/* Static content renders immediately */}
      <section className="quick-links">{/* Static quick links */}</section>

      {/* Dynamic content streams in */}
      <Suspense fallback={<MetricsLoadingSkeleton />}>
        <DashboardMetrics />
      </Suspense>
    </main>
  );
}
```

### Caching Strategy

- **Route Cache**: For full page caching
- **Data Cache**: For fetched data
- **Full Route Cache**: For routes with static content
- **Dynamic Routes**: For personalized content

#### API Route Caching

```typescript
// app/api/customers/popular/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const popularCustomers = await prisma.customer.findMany({
    where: { status: "ACTIVE" },
    orderBy: { deals: { _count: "desc" } },
    take: 5,
  });

  // Cache for 1 hour
  return NextResponse.json(
    { customers: popularCustomers },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
```

## 5. Security Practices

### Authentication

Use NextAuth.js or a similar solution for secure authentication:

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { comparePasswords } from "@/lib/auth";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValidPassword = await comparePasswords(
          credentials.password,
          user.password
        );

        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Authorization with RBAC

```typescript
// lib/auth/permissions.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export const roles = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

export const permissions = {
  // Customers
  createCustomer: [roles.ADMIN, roles.MANAGER],
  updateCustomer: [roles.ADMIN, roles.MANAGER, roles.USER],
  deleteCustomer: [roles.ADMIN],

  // Deals
  createDeal: [roles.ADMIN, roles.MANAGER, roles.USER],
  updateDeal: [roles.ADMIN, roles.MANAGER, roles.USER],
  deleteDeal: [roles.ADMIN, roles.MANAGER],

  // Reports
  viewReports: [roles.ADMIN, roles.MANAGER],
  exportReports: [roles.ADMIN],
};

export async function hasPermission(permission) {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user.role;
  return permissions[permission].includes(userRole);
}

export async function canAccessResource(resourceType, resourceId, action) {
  const session = await getServerSession(authOptions);
  if (!session) return false;

  const userRole = session.user.role;
  const userId = session.user.id;

  // Admins can access everything
  if (userRole === roles.ADMIN) return true;

  // Check specific resource access
  switch (resourceType) {
    case "customer":
      // Managers can access all customers
      if (userRole === roles.MANAGER) return true;

      // Users can only access assigned customers
      if (userRole === roles.USER) {
        const assignment = await prisma.customerAssignment.findFirst({
          where: {
            customerId: resourceId,
            userId: userId,
          },
        });
        return !!assignment;
      }
      break;

    // Add other resource types as needed
  }

  return false;
}
```

### Data Protection

- **Sanitize Inputs**: Use Zod or similar for validation
- **CSRF Protection**: Implement anti-CSRF tokens
- **Rate Limiting**: Protect against brute force attacks
- **Secure Headers**: Set proper security headers

## 6. Testing and Quality Assurance

### Testing Strategy

A comprehensive testing approach includes:

1. **Unit Tests**: For isolated functions and utilities
2. **Component Tests**: For UI components
3. **Integration Tests**: For feature workflows
4. **E2E Tests**: For critical user journeys

#### Unit Test Example

```typescript
// lib/utils/formatting.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency, formatPhoneNumber } from "./formatting";

describe("Formatting utilities", () => {
  describe("formatCurrency", () => {
    it("formats USD correctly", () => {
      expect(formatCurrency(1234.56, "USD")).toBe("$1,234.56");
    });

    it("handles zero values", () => {
      expect(formatCurrency(0, "USD")).toBe("$0.00");
    });

    it("formats EUR correctly", () => {
      expect(formatCurrency(1234.56, "EUR")).toBe("€1,234.56");
    });
  });

  describe("formatPhoneNumber", () => {
    it("formats 10-digit US numbers", () => {
      expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
    });

    it("handles numbers with existing formatting", () => {
      expect(formatPhoneNumber("(123) 456-7890")).toBe("(123) 456-7890");
    });
  });
});
```

#### Component Test Example

```typescript
// components/customers/CustomerCard.test.tsx
import { render, screen } from "@testing-library/react";
import { CustomerCard } from "./CustomerCard";

const mockCustomer = {
  id: "123",
  name: "Acme Inc",
  email: "contact@acme.com",
  phone: "(123) 456-7890",
  status: "ACTIVE",
  createdAt: new Date("2023-01-01").toISOString(),
};

describe("CustomerCard", () => {
  it("renders customer information correctly", () => {
    render(<CustomerCard customer={mockCustomer} />);

    expect(screen.getByText("Acme Inc")).toBeInTheDocument();
    expect(screen.getByText("contact@acme.com")).toBeInTheDocument();
    expect(screen.getByText("(123) 456-7890")).toBeInTheDocument();
    expect(screen.getByText(/Added/)).toBeInTheDocument();
  });

  it("displays the correct status badge", () => {
    render(<CustomerCard customer={mockCustomer} />);

    const statusBadge = screen.getByText("Active");
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass("bg-green-100");
  });
});
```

### Recommended Testing Tools

- **Unit/Component**: Jest + React Testing Library
- **E2E**: Cypress or Playwright
- **API Testing**: Supertest
- **Visual Testing**: Storybook + Chromatic

## 7. Deployment and DevOps

### CI/CD Pipeline

A typical pipeline might include:

1. **Lint & Type Check**: ESLint, TypeScript
2. **Unit & Component Tests**: Jest, Testing Library
3. **Build Step**: Next.js build
4. **E2E Tests**: Run on staging deployment
5. **Deployment**: To production environment

#### GitHub Actions Workflow Example

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: .next

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: build-output
          path: .next
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
```

### Monitoring

- **Error Tracking**: Sentry, Bugsnag
- **Performance Monitoring**: Vercel Analytics, New Relic
- **Log Management**: Logtail, Papertrail
- **Uptime Monitoring**: UptimeRobot, Pingdom

## 8. Scalability Considerations

### Database Optimization

- **Indexing**: Add indexes for frequently queried fields
- **Connection Pooling**: Optimize database connections
- **Query Optimization**: Review and optimize complex queries
- **Pagination**: Implement for large datasets

### API Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Create a rate limiter that allows 10 requests per minute
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function middleware(request: NextRequest) {
  // Only rate limit the API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip = request.ip || "127.0.0.1";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      }
    );
  }

  const response = NextResponse.next();

  // Add rate limit headers to response
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", reset.toString());

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
```

### Edge Caching

For global performance improvements, consider edge caching:

```typescript
// app/api/public-data/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge"; // Run at the edge

export async function GET() {
  const data = {
    version: "1.0.0",
    features: ["contact-management", "deal-tracking", "reports"],
    demo: {
      available: true,
      url: "https://demo.example.com",
    },
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

- Set up project structure and configuration
- Implement authentication and authorization
- Create core data models and database schema
- Build base UI components and layouts

### Phase 2: Core Features (Weeks 3-4)

- Implement customer management
- Build lead tracking functionality
- Create basic reporting dashboard
- Set up user management and permissions

### Phase 3: Advanced Features (Weeks 5-6)

- Develop document management
- Implement workflow automation
- Build advanced analytics and reporting
- Create email integration and templates

### Phase 4: Refinement (Weeks 7-8)

- Optimize performance
- Enhance UI/UX
- Implement remaining features
- Comprehensive testing
- Documentation

## 10. Documentation Requirements

### Code Documentation

- **JSDoc Comments**: For functions and components
- **README Files**: For core directories and modules
- **Type Definitions**: Well-documented TypeScript types
- **Storybook**: For documenting UI components

### User Documentation

- **User Guide**: For end-users
- **Admin Guide**: For system administrators
- **API Documentation**: For developers integrating with the API
- **Video Tutorials**: For common workflows

### Deployment Documentation

- **Environment Setup**: Required environment variables
- **Infrastructure**: Server requirements
- **CI/CD Process**: Deployment workflow
- **Monitoring Setup**: How to monitor the application

## Conclusion

Building a CRM system with Next.js 15 requires careful planning, architecture, and implementation. By following these best practices, development teams can create a robust, scalable, and maintainable application that meets the complex requirements of modern customer relationship management.

These practices should be regularly reviewed and updated as new versions of Next.js are released and as the application's requirements evolve.
