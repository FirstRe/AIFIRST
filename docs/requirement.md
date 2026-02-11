# Functional Requirements Document

## Project: Requirement & Effort Tracker MVP

### Document Information

- **Version**: 1.1
- **Last Updated**: 2026-02-11
- **Status**: Draft

---

## 1. Product Overview

### 1.1 Product Goal

To provide users with a simple, unauthenticated web application for quickly capturing project requirements, assigning effort values, and dynamically tracking the total effort of only the currently **active** requirements.

### 1.2 Target Users

- Project managers, product owners, developers, and any stakeholders who need to quickly capture and track project requirements without the overhead of complex tools or authentication.

---

## 2. Functional Requirements

### 2.1 Application Access (FR.1)

| ID     | User Story                                                                                                                                   | Acceptance Criteria                                                                                                                                                                                                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR.1.1 | As a user, I want to access the web application without requiring any authentication, so I can start working immediately.                    | 1. The application loads directly without any login screen, registration form, or required credentials.<br>2. All features are immediately accessible upon page load.                                                                                                                             |
| FR.1.2 | As a user, I want my project data to be automatically saved in my browser, so that my work is retained when I revisit the application later. | 1. All project data (project name, requirements, efforts, statuses, display preferences) are automatically persisted.<br>2. Data persists across browser sessions until explicitly cleared by the user.<br>3. Data is saved automatically after each user action without requiring a manual save. |
| FR.1.3 | As a first-time user, I want to see an empty project setup screen, so I can begin creating my project.                                       | 1. On first visit (no existing data), the user sees a project name input prompt.<br>2. The requirements list area shows an empty state message (e.g., "No requirements added yet").                                                                                                               |
| FR.1.4 | As a returning user, I want my previously saved project to load automatically, so I can continue where I left off.                           | 1. On subsequent visits, the saved project name and all requirements are automatically loaded and displayed.<br>2. All requirement statuses (active/inactive) are restored to their saved state.<br>3. Display preferences (e.g., effort column visibility) are restored to their saved state.    |

---

### 2.2 Project Setup (FR.2)

| ID     | User Story                                                                                                                               | Acceptance Criteria                                                                                                                                                                                                                                                                                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR.2.1 | As a user, I want to create and name a new project, so I can organize my requirements under a specific title.                            | 1. A project name input field is displayed when no project exists.<br>2. The project name field accepts text input up to 100 characters.<br>3. The project name is required and cannot be empty or whitespace-only.<br>4. Upon entering a valid project name, the main application interface becomes available.                  |
| FR.2.2 | As a user, I want the project name to be clearly displayed at the top of the application, so I always know which project I'm working on. | 1. The project name is displayed as a prominent heading (e.g., "Project: [Project Name]").<br>2. The project name remains visible at all times while using the application.                                                                                                                                                      |
| FR.2.3 | As a user, I want to edit the project name, so I can correct mistakes or update the title as the project evolves.                        | 1. An edit option (button or icon) is available near the project name display.<br>2. Clicking edit allows inline editing of the project name.<br>3. The same validation rules apply (required, max 100 characters).<br>4. Changes are saved automatically when the user confirms or clicks away.                                 |
| FR.2.4 | As a user, I want to start a new project and clear all existing data, so I can begin fresh when needed.                                  | 1. A "New Project" or "Reset" option is available in the application.<br>2. Clicking this option displays a confirmation dialog warning that all data will be lost.<br>3. Upon confirmation, all existing data is cleared and the user is returned to the initial project setup screen.<br>4. If cancelled, no changes are made. |

---

### 2.3 Requirement Management (FR.3)

| ID     | User Story                                                                                                                   | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR.3.1 | As a user, I want to add new requirements with a description and effort value, so I can document my project scope.           | 1. Input fields for "Requirement Description" (text) and "Effort" (number) are always visible.<br>2. An "Add Requirement" button submits the new requirement.<br>3. Pressing Enter in either input field also submits the requirement.<br>4. After successful addition, both input fields are cleared and ready for the next entry.<br>5. New requirements are added to the bottom of the list.<br>6. New requirements are set to "Active" status by default. |
| FR.3.2 | As a user, I want requirement descriptions to be validated, so I don't accidentally create empty requirements.               | 1. The description field is required and cannot be empty or whitespace-only.<br>2. The description field accepts up to 500 characters.<br>3. If validation fails, an error message is displayed and the requirement is not added.<br>4. The cursor remains in the invalid field for correction.                                                                                                                                                               |
| FR.3.3 | As a user, I want effort values to be validated as positive numbers, so the effort summary calculations are accurate.        | 1. The effort field is required and cannot be empty.<br>2. The effort field accepts only numeric values (integers or decimals up to 2 decimal places).<br>3. The effort value must be greater than zero (0).<br>4. The maximum effort value is 9999.<br>5. If validation fails, a clear error message is displayed indicating the issue.                                                                                                                      |
| FR.3.4 | As a user, I want to edit existing requirements, so I can correct mistakes or update details without deleting and re-adding. | 1. Each requirement row has an "Edit" action (button or icon).<br>2. Clicking edit enables inline editing of the description and effort fields for that requirement.<br>3. The same validation rules apply as when adding a new requirement.<br>4. A "Save" action confirms the changes; a "Cancel" action discards changes.<br>5. The requirement's active/inactive status is not affected by editing.                                                       |
| FR.3.5 | As a user, I want to delete requirements I no longer need, so I can keep my list clean and accurate.                         | 1. Each requirement row has a "Delete" action (button or icon).<br>2. Clicking delete displays a confirmation dialog (e.g., "Are you sure you want to delete this requirement?").<br>3. Upon confirmation, the requirement is permanently removed from the list.<br>4. The total effort is recalculated immediately after deletion.<br>5. If cancelled, the requirement remains unchanged.                                                                    |
| FR.3.6 | As a user, I want each requirement to display a unique identifier, so I can easily reference specific requirements.          | 1. Each requirement is assigned a sequential number (e.g., #1, #2, #3) based on its creation order.<br>2. The identifier is displayed at the beginning of each requirement row.<br>3. Identifiers are not reassigned when requirements are deleted (to maintain traceability).                                                                                                                                                                                |

---

### 2.4 Requirement Status Management (FR.4)

| ID     | User Story                                                                                                                                          | Acceptance Criteria                                                                                                                                                                                                                                                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR.4.1 | As a user, I want to toggle a requirement between "Active" and "Inactive" status, so I can include or exclude it from the total effort calculation. | 1. Each requirement row displays a toggle control (e.g., checkbox, switch, or toggle button).<br>2. Clicking the toggle switches the requirement between Active and Inactive states.<br>3. The visual appearance of inactive requirements is differentiated (e.g., muted colors, strikethrough).<br>4. The toggle state is saved automatically. |
| FR.4.2 | As a user, I want the total effort to update automatically when I toggle a requirement's status, so I see real-time impact of my decisions.         | 1. When a requirement is toggled to Inactive, its effort is subtracted from the total.<br>2. When a requirement is toggled to Active, its effort is added to the total.<br>3. The update occurs immediately without requiring page refresh or manual recalculation.                                                                             |
| FR.4.3 | As a user, I want to see a summary showing both active and total counts, so I understand my project scope at a glance.                              | 1. The application displays: Total number of requirements, Number of active requirements, Number of inactive requirements.<br>2. The counts update automatically when requirements are added, deleted, or toggled.                                                                                                                              |

---

### 2.5 Effort Summary & Display (FR.5)

| ID     | User Story                                                                                                                                            | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR.5.1 | As a user, I want to see the total effort of all active requirements prominently displayed, so I can quickly understand the current scope commitment. | 1. A "Total Active Effort" value is displayed prominently (e.g., in a summary header or footer).<br>2. The value shows the sum of effort from all requirements currently marked as Active.<br>3. The value displays with appropriate formatting (e.g., "Total Active Effort: 42.5").                                                                                                                               |
| FR.5.2 | As a user, I want to show or hide the effort column in the requirements list, so I can focus on descriptions when I don't need to see effort values.  | 1. A toggle or button labeled "Show/Hide Effort" is available.<br>2. When effort is hidden, the effort column is removed from the requirements list display.<br>3. When effort is shown, the effort column is visible in the requirements list.<br>4. The Total Active Effort summary remains visible regardless of column visibility.<br>5. The visibility preference is saved and restored on subsequent visits. |
| FR.5.3 | As a user, I want to see effort values displayed consistently, so the list is easy to read and compare.                                               | 1. Effort values are right-aligned in the effort column.<br>2. Decimal values display up to 2 decimal places.<br>3. Whole numbers display without decimal places (e.g., "5" not "5.00").                                                                                                                                                                                                                           |

---

### 2.6 Requirements List Display (FR.6)

| ID     | User Story                                                                                                                            | Acceptance Criteria                                                                                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR.6.1 | As a user, I want to see all my requirements in a list format, so I can review the entire scope at once.                              | 1. Requirements are displayed in a vertical list or table format.<br>2. Each requirement shows: Identifier, Description, Effort value (when visible), Status toggle.<br>3. The list updates dynamically as requirements are added, edited, or deleted. |
| FR.6.2 | As a user, I want requirements to be displayed in the order they were created, so I can see a chronological view of my project scope. | 1. Requirements are displayed in creation order (oldest first, newest at bottom).<br>2. The order is maintained consistently across sessions.                                                                                                          |
| FR.6.3 | As a user, I want to see a clear message when no requirements exist, so I understand the list is empty rather than broken.            | 1. When no requirements exist, an empty state message is displayed (e.g., "No requirements yet. Add your first requirement above.").<br>2. The message is replaced by the requirements list as soon as the first requirement is added.                 |
| FR.6.4 | As a user, I want to scroll through a long list of requirements, so I can work with projects of any size.                             | 1. When requirements exceed the visible area, a scrollable list is provided.<br>2. The input fields and summary remain visible while scrolling through requirements.                                                                                   |

---

### 2.7 Internationalization & Language Support (FR.7)

| ID     | User Story                                                                                                                       | Acceptance Criteria                                                                                                                                                                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR.7.1 | As a user, I want to switch between English and Thai languages, so I can use the application in my preferred language.           | 1. A language toggle/dropdown is displayed in the application header.<br>2. The toggle clearly shows the current language selection (EN/TH).<br>3. Clicking the toggle displays available language options with flag icons (🇺🇸/🇹🇭).<br>4. Selecting a language immediately updates all UI text. |
| FR.7.2 | As a user, I want my language preference to be saved, so I don't have to select it every time I use the application.             | 1. The selected language preference is automatically saved to browser storage.<br>2. On subsequent visits, the application loads in the previously selected language.<br>3. Language preference persists across browser sessions.                                                               |
| FR.7.3 | As a user, I want all application text to be displayed in my selected language, so I can fully understand and use all features.  | 1. All user-facing text is translated (labels, buttons, messages, placeholders).<br>2. Error messages are displayed in the selected language.<br>3. Confirmation dialogs are displayed in the selected language.<br>4. Empty state messages are displayed in the selected language.             |
| FR.7.4 | As a user, I want Thai text to be displayed with proper Thai characters and fonts, so the text is readable and visually correct. | 1. Thai characters are rendered correctly with appropriate font support.<br>2. The UI layout accommodates different text lengths between languages.<br>3. Text remains readable and properly aligned in both languages.                                                                         |

---

## 3. Data Requirements

### 3.1 Project Data

The system shall capture and maintain the following project data:

- **Project Name**: Text, required, maximum 100 characters

### 3.2 Requirement Data

For each requirement, the system shall capture and maintain:

- **Identifier**: Auto-generated sequential number, immutable after creation
- **Description**: Text, required, maximum 500 characters
- **Effort**: Numeric value, required, range 0.01 to 9999, up to 2 decimal places
- **Status**: Active or Inactive, default Active
- **Creation Order**: Implicit ordering based on when the requirement was added

### 3.3 User Preferences

The system shall capture and maintain:

- **Effort Column Visibility**: Show or Hide, default Show
- **Language Preference**: English (en) or Thai (th), default English

---

## 4. Business Rules

| Rule ID | Description                                                                                 |
| ------- | ------------------------------------------------------------------------------------------- |
| BR.1    | Only requirements with "Active" status are included in the Total Active Effort calculation. |
| BR.2    | Requirement identifiers are assigned sequentially and never reused, even after deletion.    |
| BR.3    | All data modifications are automatically saved without requiring explicit user action.      |
| BR.4    | The application operates in single-project mode; only one project exists at a time.         |
| BR.5    | Creating a new project requires confirmation and permanently deletes all existing data.     |
| BR.6    | New requirements are always added with "Active" status.                                     |
| BR.7    | Validation errors prevent data submission until corrected.                                  |
| BR.8    | Language preference changes are applied immediately and globally across all components.     |
| BR.9    | The default language is English if no language preference is stored or detected.            |
| BR.10   | Language preference persists independently of project data (not cleared on project reset).  |

---

## 5. User Interface Behavior Requirements

### 5.1 Input Field Behavior

| Requirement | Description                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| UI.1.1      | Text input fields shall trim leading and trailing whitespace before validation and storage.                     |
| UI.1.2      | Numeric input fields shall accept keyboard input including digits, decimal point, and standard navigation keys. |
| UI.1.3      | The Enter key shall submit the current form (add requirement or save edit).                                     |
| UI.1.4      | The Escape key shall cancel the current edit operation (when in edit mode).                                     |

### 5.2 Feedback & Messaging

| Requirement | Description                                                                                                          |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| UI.2.1      | Validation error messages shall be displayed immediately adjacent to the invalid field.                              |
| UI.2.2      | Error messages shall clearly explain what is wrong and how to fix it.                                                |
| UI.2.3      | Successful operations (add, edit, delete) shall provide visual feedback (e.g., list update, field clearing).         |
| UI.2.4      | Confirmation dialogs for destructive actions shall clearly state the consequence and provide Cancel/Confirm options. |

### 5.3 Visual States

| Requirement | Description                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| UI.3.1      | Active requirements shall be displayed with normal visual styling.                                              |
| UI.3.2      | Inactive requirements shall be visually differentiated (e.g., muted colors, strikethrough, or reduced opacity). |
| UI.3.3      | Input fields with validation errors shall be visually highlighted (e.g., red border).                           |
| UI.3.4      | Interactive elements (buttons, toggles, edit/delete actions) shall have visible hover and focus states.         |

---

## 6. Glossary

| Term                    | Definition                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Requirement**         | A single item in the project scope that includes a description and an associated effort value.                              |
| **Effort**              | A numeric value representing the estimated work needed for a requirement (unit is user-defined, e.g., hours, story points). |
| **Active (Status)**     | A requirement state indicating it should be included in the total effort calculation.                                       |
| **Inactive (Status)**   | A requirement state indicating it should be excluded from the total effort calculation.                                     |
| **Total Active Effort** | The sum of effort values from all requirements currently marked as Active.                                                  |
| **Project**             | A named container for organizing a set of related requirements.                                                             |
| **i18n**                | Abbreviation for "internationalization" - the process of designing software to support multiple languages.                  |
| **Locale**              | A set of parameters that defines the user's language and regional preferences.                                              |
| **Translation Key**     | A unique identifier used to reference translated text strings in the application.                                           |
| **Language Preference** | The user's selected language setting, stored in browser storage for persistence.                                            |

---

## 7. Appendix: Requirements Traceability

### Original Requirements Coverage

The following table maps original requirements from the initial document to this specification:

| Original Requirement                         | Covered By             |
| -------------------------------------------- | ---------------------- |
| No authentication needed                     | FR.1.1                 |
| Project naming on first use                  | FR.2.1                 |
| Project name display                         | FR.2.2                 |
| Add requirements with description and effort | FR.3.1, FR.3.2, FR.3.3 |
| Toggle status ON/OFF                         | FR.4.1                 |
| Total effort calculation (active only)       | FR.5.1, FR.4.2         |
| Show/Hide effort column                      | FR.5.2                 |
| Data persistence in browser                  | FR.1.2, FR.1.4         |

### New Requirements Added

The following requirements were added to address gaps in the original specification:

| New Requirement                     | Rationale                                              |
| ----------------------------------- | ------------------------------------------------------ |
| FR.1.3 (First-time user experience) | Original did not specify empty state behavior          |
| FR.2.3 (Edit project name)          | Original did not allow project name changes            |
| FR.2.4 (Reset/New project)          | Original did not provide way to start fresh            |
| FR.3.4 (Edit requirements)          | Original only covered adding, not editing              |
| FR.3.5 (Delete requirements)        | Original did not address removal capability            |
| FR.3.6 (Requirement identifiers)    | Original did not specify how to reference requirements |
| FR.4.3 (Counts summary)             | Added for better project overview                      |
| FR.5.3 (Effort display formatting)  | Original did not specify number formatting             |
| FR.6.2 (List ordering)              | Original did not specify display order                 |
| FR.6.3 (Empty state message)        | Original did not specify empty list behavior           |
| FR.6.4 (Scrolling)                  | Original did not address long lists                    |
| FR.7.1 (Language switching)         | Added for internationalization support                 |
| FR.7.2 (Language persistence)       | Added to save user language preference                 |
| FR.7.3 (Translation coverage)       | Added to ensure complete language support              |
| FR.7.4 (Thai font support)          | Added for proper Thai character rendering              |

---

_End of Document_
