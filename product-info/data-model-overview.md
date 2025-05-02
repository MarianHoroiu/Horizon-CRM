# Horizon CRM Data Model Overview

This document provides a detailed explanation of the data models and enumerations used in the Horizon CRM system.

## Models

### User Model

```prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String
  password  String
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  contacts  Contact[]
  tasks     Task[]
  Session   Session[]
}
```

The User model represents internal staff members who use the CRM system:

- **Basic Information**:

  - `id`: Unique identifier for the user (UUID)
  - `email`: User's email address, used for login and identification (unique)
  - `name`: User's full name

- **System Role**:

  - `role`: User's permission level in the system (ADMIN, MANAGER, USER)

- **Tracking**:

  - `createdAt`: When the user account was created
  - `updatedAt`: When the user information was last modified

- **Relationships**:
  - `contacts`: All contacts assigned to this user for management
  - `tasks`: All tasks assigned to this user to complete

**Business Context**: Users are the internal staff (sales representatives, account managers, etc.) who manage relationships with contacts and perform tasks. Different role levels provide appropriate permissions for different job functions.

### Contact Model

```prisma
model Contact {
  id         String   @id @default(uuid())
  name       String
  email      String?
  phone      String?
  company    String?
  status     Status   @default(LEAD)
  assignedTo User     @relation(fields: [userId], references: [id])
  userId     String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  tasks      Task[]
}
```

The Contact model represents individuals or organizations that your company interacts with as part of your business operations:

- **Basic Information**:

  - `id`: Unique identifier for the contact (UUID)
  - `name`: Contact's full name (required)
  - `email`: Professional email address (optional)
  - `phone`: Contact phone number (optional)
  - `company`: Organization the contact belongs to (optional)

- **Relationship Management**:

  - `status`: Current stage in the customer journey (LEAD, PROSPECT, CUSTOMER, INACTIVE)
  - `assignedTo`/`userId`: Links to the internal User who's responsible for managing this relationship
  - `tasks`: All activities/follow-ups planned for this contact

- **Tracking**:
  - `createdAt`: When the contact was added to the system
  - `updatedAt`: When the contact was last modified

**Business Context**: Contacts progress through your sales pipeline, starting as leads and potentially becoming customers. Each contact is assigned to a specific user who manages the relationship and ensures proper follow-up.

### Task Model

```prisma
model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  dueDate     DateTime?
  assignedTo  User       @relation(fields: [userId], references: [id])
  userId      String
  contact     Contact    @relation(fields: [contactId], references: [id])
  contactId   String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

The Task model represents activities, follow-ups, or to-dos related to contacts:

- **Basic Information**:

  - `id`: Unique identifier for the task (UUID)
  - `title`: Short description of what needs to be done
  - `description`: Detailed explanation of the task (optional)
  - `dueDate`: When the task should be completed (optional)

- **Status Tracking**:

  - `status`: Current state of the task (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - `createdAt`: When the task was created
  - `updatedAt`: When the task was last modified

- **Relationships**:
  - `assignedTo`/`userId`: The user responsible for completing the task
  - `contact`/`contactId`: The contact this task relates to

**Business Context**: Tasks ensure proper follow-up with contacts, helping users track what needs to be done, when, and for whom. They are the actionable items that move contacts through the sales pipeline.

### Session Model

```prisma
model Session {
  id        String   @id @default(uuid()) // Secure random session ID
  userId    String   // Foreign key to User
  expiresAt DateTime // Session expiration timestamp
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade) // Relation to User

  @@index([userId]) // Index userId for faster lookups
}
```

The Session model represents an active login session for a user:

- **Session Identification**:

  - `id`: Unique, cryptographically secure identifier for the session (UUID)

- **Session State**:

  - `expiresAt`: Timestamp indicating when the session becomes invalid

- **Relationships**:
  - `user`/`userId`: Links the session to the specific User who is logged in

**Business Context**: Sessions are created upon successful login and stored in the database. A corresponding session ID is stored in the user's browser cookie. On subsequent requests, the session ID from the cookie is validated against the database record and its expiration time to authenticate the user. Sessions provide a secure way to manage user logins and allow for server-side invalidation (e.g., on logout or password change).

## Enumerations

### Role Enum

```prisma
enum Role {
  ADMIN
  MANAGER
  USER
}
```

The Role enum defines permission levels within the CRM system:

1. **ADMIN**:

   - Highest permission level
   - Can manage all aspects of the system
   - Can create/edit/delete users
   - Has access to all reports and settings
   - Typically reserved for system administrators and executives

2. **MANAGER**:

   - Mid-level permissions
   - Can view and manage all contacts and tasks within their department
   - Can view reports and some settings
   - Can reassign contacts among their team members
   - Typically for team leaders and department heads

3. **USER** (Default role):
   - Standard permission level
   - Can manage their assigned contacts and tasks
   - Limited access to reports
   - No access to system settings
   - Typically for sales representatives and account managers

### Status Enum

```prisma
enum Status {
  LEAD
  PROSPECT
  CUSTOMER
  INACTIVE
}
```

The Status enum tracks a contact's progression through your sales pipeline:

1. **LEAD** (Default stage):

   - A new potential customer who has shown initial interest
   - Example: Someone who filled out a contact form on your website
   - Actions: Initial qualification, determining if they have a legitimate need
   - Goal: Convert to prospect by establishing two-way communication

2. **PROSPECT**:

   - A qualified lead who is actively considering your products/services
   - Example: Someone who has had a demo or sales call
   - Actions: Providing detailed information, proposals, addressing objections
   - Goal: Convert to customer by closing the sale

3. **CUSTOMER**:

   - Someone who has purchased your product/service
   - Example: An active client with a current contract
   - Actions: Onboarding, support, account management, upselling
   - Goal: Maintain relationship, ensure retention, discover growth opportunities

4. **INACTIVE**:
   - A contact who is no longer actively engaged
   - Example: A former customer whose contract has ended
   - Actions: Re-engagement campaigns, feedback collection
   - Goal: Potentially reactivate or learn from the lost relationship

### TaskStatus Enum

```prisma
enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

The TaskStatus enum tracks the workflow state of tasks:

1. **PENDING** (Default state):

   - Task has been created but work hasn't started
   - It's waiting to be addressed
   - Appears in "to-do" lists
   - May have a future due date

2. **IN_PROGRESS**:

   - Work on the task has begun
   - It's currently being addressed
   - Not yet completed
   - Typically shows in "doing" or "in progress" views

3. **COMPLETED**:

   - The task has been successfully finished
   - No further action is required
   - May be used for reporting and tracking productivity
   - Shows in "done" or "completed" views

4. **CANCELLED**:
   - The task is no longer relevant or needed
   - It was not completed, but no further action is required
   - Differs from COMPLETED as it represents abandoned rather than accomplished work
   - Useful for record-keeping without affecting completion metrics

## Relationship Overview

The Horizon CRM database models relate to each other in the following ways:

1. **User → Contact**: One-to-many

   - One user can be assigned to manage many contacts
   - Each contact has exactly one user managing their relationship

2. **User → Task**: One-to-many

   - One user can be assigned many tasks to complete
   - Each task is assigned to exactly one user

3. **Contact → Task**: One-to-many

   - One contact can have many associated tasks
   - Each task is related to exactly one contact

4. **User → Session**: One-to-many
   - One user can have multiple active sessions (e.g., logged in from different devices)
   - Each session belongs to exactly one user

This relational structure ensures clear ownership and accountability while maintaining the flexibility needed for effective customer relationship management and secure authentication.
