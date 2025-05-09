# Task 01-01: Create New Task Modal

## Parent Story

Story 01: Enhance Tasks Page

## Task Description

Create a modal dialog component that allows users to add new tasks to the system. The modal should include a form with all required fields based on the Task model, provide validation, and connect to the backend API to create new tasks.

## Implementation Details

### Files to Modify

- `app/dashboard/tasks/page.tsx` - Add "Create Task" button and modal trigger
- Create new component: `app/components/tasks/NewTaskModal.tsx`
- Create new API route: `app/api/tasks/route.ts`

### Required Components

- Modal dialog with overlay
- Form with fields for:
  - Title (text input)
  - Description (textarea)
  - Status dropdown (Pending, In Progress, Completed, Cancelled)
  - Due date (date picker)
  - Contact selection (dropdown or search component)
- Submit and cancel buttons
- Loading state and error handling

### API Endpoints Needed

- POST /api/tasks - Create a new task with validation

## Acceptance Criteria

- Modal opens when the "Create Task" button is clicked
- All required fields (title, description, status, due date, contact) are properly validated
- Error messages are displayed for invalid inputs
- The task is created in the database when the form is submitted successfully
- User receives visual feedback during submission (loading state)
- Modal closes after successful submission
- Success message is shown with a Toast component after successful creation
- The tasks list is updated to include the new task without page reload
- The UI should be similar to the "Create Contact" functionality

## Dependencies

- Contact selection requires fetching contacts from the database
- Task creation requires the current authenticated user to assign as owner
- Form validation library (if using one)
- Date picker component for the due date field

## Estimated Completion Time

6 hours
