I need to create a template for task implementation documents.

You need to create a new folder within the story folder. The folder name should match this pattern: `task-[story-number]-[task-number]-[task-name]`.
For example, if the task is from story 01, and it's the first task with name "Create New Task Modal", the folder name should be `task-01-01-create-new-task-modal`.

Within the folder, you need to create a new file to match the folder name. For example, if the folder name is `task-01-01-create-new-task-modal`, the file should be `task-01-01-create-new-task-modal.md`.

The markdown file needs to contain the following information:

- Task title
- Parent story reference
- Task description
- Implementation details
  - Files to modify
  - Required components
  - API endpoints needed
- Acceptance criteria
- Testing approach
- Dependencies
- Estimated completion time

## Template Structure

```markdown
# Task [STORY_NUMBER]-[TASK_NUMBER]: [TASK_TITLE]

## Parent Story

Story [STORY_NUMBER]: [STORY_TITLE]

## Task Description

[DETAILED_DESCRIPTION_OF_THE_TASK]

## Implementation Details

### Files to Modify

- [FILE_PATH_1] - [MODIFICATION_DESCRIPTION]
- [FILE_PATH_2] - [MODIFICATION_DESCRIPTION]
- Create new component: [NEW_COMPONENT_PATH]

### Required Components

- [COMPONENT_1]
- [COMPONENT_2]
- [COMPONENT_3]

### API Endpoints Needed

- [HTTP_METHOD] [ENDPOINT_PATH] - [ENDPOINT_DESCRIPTION]

## Acceptance Criteria

- [CRITERION_1]
- [CRITERION_2]
- [CRITERION_3]
- [CRITERION_4]
- [CRITERION_5]

## Testing Approach

- [TEST_TYPE_1] for [FEATURE_1]
- [TEST_TYPE_2] for [FEATURE_2]
- [TEST_TYPE_3] for [FEATURE_3]

## Dependencies

- [DEPENDENCY_1]
- [DEPENDENCY_2]

## Estimated Completion Time

[HOURS] hours
```

## Example (Filled Template)

```markdown
# Task 01-01: Create New Task Modal

## Parent Story

Story 01: Enhance Tasks Page

## Task Description

Create a modal dialog component for adding new tasks to the system.

## Implementation Details

### Files to Modify

- `app/dashboard/tasks/page.tsx` - Add button and modal trigger
- Create new component: `app/components/tasks/CreateTaskModal.tsx`

### Required Components

- Modal dialog
- Form with fields for title, description, status, due date, contact selection
- Submit and cancel buttons

### API Endpoints Needed

- POST /api/tasks - Create a new task

## Acceptance Criteria

- Modal opens when "Create Task" button is clicked
- All required fields are validated
- Task is created when form is submitted successfully
- User receives feedback on success/failure
- Modal closes after successful submission

## Testing Approach

- Unit test for form validation
- Integration test for API connection
- UI test for modal opening/closing

## Dependencies

- Contact selection requires contact data fetching
- User assignment based on current authentication

## Estimated Completion Time

4 hours
```
