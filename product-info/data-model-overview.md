# Horizon CRM Data Model Overview

This document provides a detailed explanation of the data models and enumerations used in the Horizon CRM system.

## Models

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  firstName     String
  lastName      String
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  password      String
  role          String    @default("USER")
  image         String?
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  accounts      Account[]
  sessions      Session[]
  contacts      Contact[]
  tasks         Task[]
}
```

The User model represents internal staff members who use the CRM system:

- **Basic Information**:

  - `id`: Unique identifier for the user (CUID)
  - `firstName`: User's first name
  - `lastName`: User's last name
  - `email`: User's email address, used for login and identification (unique)
  - `emailVerified`: When the user's email was verified (optional)
  - `password`: User's hashed password
  - `image`: Profile image URL (optional)

- **System Role**:

  - `role`: User's permission level in the system (stored as a string with default "USER")

- **Tracking**:

  - `createdAt`: When the user account was created (mapped to "created_at" in database)
  - `updatedAt`: When the user information was last modified (mapped to "updated_at" in database)

- **Relationships**:
  - `accounts`: External authentication accounts linked to this user
  - `sessions`: Active login sessions for this user
  - `contacts`: All contacts assigned to this user for management
  - `tasks`: All tasks assigned to this user to complete

**Business Context**: Users are the internal staff (sales representatives, account managers, etc.) who manage relationships with contacts and perform tasks. Different role levels provide appropriate permissions for different job functions.

### Account Model

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

The Account model represents external authentication providers linked to a user:

- **Authentication Information**:
  - `id`: Unique identifier for the account (CUID)
  - `userId`: References the user this account belongs to (mapped to "user_id" in database)
  - `type`: The type of account
  - `provider`: The authentication provider (e.g., Google, Facebook)
  - `providerAccountId`: The unique ID from the provider (mapped to "provider_account_id" in database)
- **Authentication Tokens**:

  - `refresh_token`: Token used to obtain new access tokens (optional)
  - `access_token`: Token used to access provider APIs (optional)
  - `expires_at`: Expiration timestamp for access token (optional)
  - `token_type`: Type of access token (optional)
  - `scope`: Permissions granted to the token (optional)
  - `id_token`: JWT ID token for OpenID Connect (optional)
  - `session_state`: Session state for some providers (optional)

- **Tracking**:

  - `createdAt`: When the account link was created (mapped to "created_at" in database)
  - `updatedAt`: When the account was last modified (mapped to "updated_at" in database)

- **Relationships**:
  - `user`: The user who owns this account link with cascade deletion

**Business Context**: Accounts enable social login and OAuth-based authentication, allowing users to sign in using their existing accounts from other providers rather than creating a new password.

### Session Model

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

The Session model represents an active login session for a user:

- **Session Identification**:

  - `id`: Unique identifier for the session (CUID)
  - `sessionToken`: Unique token stored in the user's browser cookie (mapped to "session_token" in database)

- **Session State**:

  - `userId`: References the user this session belongs to (mapped to "user_id" in database)
  - `expires`: Timestamp indicating when the session becomes invalid

- **Tracking**:

  - `createdAt`: When the session was created (mapped to "created_at" in database)
  - `updatedAt`: When the session was last modified (mapped to "updated_at" in database)

- **Relationships**:
  - `user`: Links the session to the specific User who is logged in with cascade deletion

**Business Context**: Sessions are created upon successful login and stored in the database. A corresponding session token is stored in the user's browser cookie. On subsequent requests, the session token from the cookie is validated against the database record and its expiration time to authenticate the user. Sessions provide a secure way to manage user logins and allow for server-side invalidation (e.g., on logout or password change).

### VerificationToken Model

```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
}
```

The VerificationToken model is used for email verification and password reset functionality:

- **Token Information**:
  - `identifier`: Usually the user's email address
  - `token`: A unique token sent to the user via email
  - `expires`: When the token becomes invalid

**Business Context**: When a user signs up or requests a password reset, a verification token is created and sent to their email. The user then clicks a link containing this token, which the system validates against the stored VerificationToken record. This confirms the user has access to the email address in question.

### Contact Model

```prisma
model Contact {
  id         String   @id @default(uuid())
  firstName  String
  lastName   String
  email      String
  phone      String
  company    String
  status     String   @default("LEAD")
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
  - `firstName`: Contact's first name
  - `lastName`: Contact's last name
  - `email`: Professional email address
  - `phone`: Contact phone number
  - `company`: Organization the contact belongs to

- **Relationship Management**:

  - `status`: Current stage in the customer journey (stored as string with default "LEAD")
  - `assignedTo`/`userId`: Links to the internal User who's responsible for managing this relationship
  - `tasks`: All activities/follow-ups planned for this contact

- **Tracking**:
  - `createdAt`: When the contact was added to the system
  - `updatedAt`: When the contact was last modified

**Business Context**: Contacts progress through your sales pipeline, starting as leads and potentially becoming customers. Each contact is assigned to a specific user who manages the relationship and ensures proper follow-up.

### Task Model

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  status      String   @default("PENDING")
  dueDate     DateTime
  assignedTo  User     @relation(fields: [userId], references: [id])
  userId      String
  contact     Contact  @relation(fields: [contactId], references: [id], onDelete: Cascade)
  contactId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

The Task model represents activities, follow-ups, or to-dos related to contacts:

- **Basic Information**:

  - `id`: Unique identifier for the task (UUID)
  - `title`: Short description of what needs to be done
  - `description`: Detailed explanation of the task
  - `dueDate`: When the task should be completed

- **Status Tracking**:

  - `status`: Current state of the task (stored as string with default "PENDING")
  - `createdAt`: When the task was created
  - `updatedAt`: When the task was last modified

- **Relationships**:
  - `assignedTo`/`userId`: The user responsible for completing the task
  - `contact`/`contactId`: The contact this task relates to (with cascade deletion)

**Business Context**: Tasks ensure proper follow-up with contacts, helping users track what needs to be done, when, and for whom. They are the actionable items that move contacts through the sales pipeline.

## String Enumerations

While the schema uses string values instead of Prisma enums, the application follows these conventions:

### Role Values

The role field in the User model uses these string values:

1. **"ADMIN"**:

   - Highest permission level
   - Can manage all aspects of the system
   - Can create/edit/delete users
   - Has access to all reports and settings
   - Typically reserved for system administrators and executives

2. **"MANAGER"**:

   - Mid-level permissions
   - Can view and manage all contacts and tasks within their department
   - Can view reports and some settings
   - Can reassign contacts among their team members
   - Typically for team leaders and department heads

3. **"USER"** (Default value):
   - Standard permission level
   - Can manage their assigned contacts and tasks
   - Limited access to reports
   - No access to system settings
   - Typically for sales representatives and account managers

### Status Values

The status field in the Contact model uses these string values:

1. **"LEAD"** (Default value):

   - A new potential customer who has shown initial interest
   - Example: Someone who filled out a contact form on your website
   - Actions: Initial qualification, determining if they have a legitimate need
   - Goal: Convert to prospect by establishing two-way communication

2. **"PROSPECT"**:

   - A qualified lead who is actively considering your products/services
   - Example: Someone who has had a demo or sales call
   - Actions: Providing detailed information, proposals, addressing objections
   - Goal: Convert to customer by closing the sale

3. **"CUSTOMER"**:

   - Someone who has purchased your product/service
   - Example: An active client with a current contract
   - Actions: Onboarding, support, account management, upselling
   - Goal: Maintain relationship, ensure retention, discover growth opportunities

4. **"INACTIVE"**:
   - A contact who is no longer actively engaged
   - Example: A former customer whose contract has ended
   - Actions: Re-engagement campaigns, feedback collection
   - Goal: Potentially reactivate or learn from the lost relationship

### Task Status Values

The status field in the Task model uses these string values:

1. **"PENDING"** (Default value):

   - Task has been created but work hasn't started
   - It's waiting to be addressed
   - Appears in "to-do" lists
   - May have a future due date

2. **"IN_PROGRESS"**:

   - Work on the task has begun
   - It's currently being addressed
   - Not yet completed
   - Typically shows in "doing" or "in progress" views

3. **"COMPLETED"**:

   - The task has been successfully finished
   - No further action is required
   - May be used for reporting and tracking productivity
   - Shows in "done" or "completed" views

4. **"CANCELLED"**:
   - The task is no longer relevant or needed
   - It was not completed, but no further action is required
   - Differs from COMPLETED as it represents abandoned rather than accomplished work
   - Useful for record-keeping without affecting completion metrics

## Relationship Overview

The Horizon CRM database models relate to each other in the following ways:

1. **User → Account**: One-to-many

   - One user can have multiple authentication provider accounts
   - Each authentication account belongs to exactly one user

2. **User → Session**: One-to-many

   - One user can have multiple active sessions (e.g., logged in from different devices)
   - Each session belongs to exactly one user

3. **User → Contact**: One-to-many

   - One user can be assigned to manage many contacts
   - Each contact has exactly one user managing their relationship

4. **User → Task**: One-to-many

   - One user can be assigned many tasks to complete
   - Each task is assigned to exactly one user

5. **Contact → Task**: One-to-many
   - One contact can have many associated tasks
   - Each task is related to exactly one contact

This relational structure ensures clear ownership and accountability while maintaining the flexibility needed for effective customer relationship management and secure authentication.
