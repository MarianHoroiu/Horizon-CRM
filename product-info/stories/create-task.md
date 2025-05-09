I need to create a template for task implementation documents.

You need to create a new file to match the folder name. For example, if the folder name starts with `story-01-[story name]`, the file should be `task-01-[task number]-[task name].md`, where `[task number]` is the task number in the story file.

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

## Dependencies

- Contact selection requires contact data fetching
- User assignment based on current authentication

## Estimated Completion Time

4 hours
```
