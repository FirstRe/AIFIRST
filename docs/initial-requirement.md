## Project: Requirement & Effort Tracker MVP

### Product Goal

To provide users with a simple, unauthenticated web application for quickly capturing project requirements, assigning effort values, and dynamically tracking the total effort of only the currently **active** requirements.

| ID     | User Story                                                   | Acceptance Criteria (AC)                                     |
| ------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| FR.1   | Access & Persistence                                         |                                                              |
| FR.1.1 | As a user, I want to access the web application without requiring any authentication, so I can start working immediately. | 1. The application loads immediately without any login screen or required credentials. |
| FR.1.2 | As a user, I want to save the project data locally in my browser so that my work is retained when I revisit the application later. | 1. Project name and all requirements/efforts are persisted (e.g., using localStorage or similar browser mechanism). |
| FR.2   | Project Setup                                                |                                                              |
| FR.2.1 | As a user, I want to create and name a new project, so I can organize my requirements under a specific title. | 1. The user is prompted to enter a Project Name upon first use or when starting a new project. |
| FR.2.2 | As a user, I want the Project Name to be clearly displayed at the top of the application screen. | 1. The input Project Name is displayed as a heading (e.g., "Project: [Project Name]"). |
| FR.3   | Requirement Management                                       |                                                              |
| FR.3.1 | As a user, I want to add new requirements and assign a numerical effort value by clicking an 'Add' button, so I can document my project scope. | 1. Input fields for Requirement Description (text) and Effort (must be a number) are available. 2. A primary action button (e.g., "Add Requirement") successfully captures the input and clears the fields. |
| FR.3.2 | As a user, I want to see a dynamically updating list of all requirements and efforts I have added, so I can keep track of my input. | 1. A table/list displays the Requirement Description, Effort, and Status Toggle for every saved item. 2. The list updates instantly when a new requirement is added. |
| FR.4   | Effort Summary & Status                                      |                                                              |
| FR.4.1 | As a user, I want to see a calculated summary of the total effort from all active requirements, so I can track the committed scope. | 1. A section labeled "Total Effort" or "Active Effort Summary" is prominently displayed. 2. This value must be the sum of all Effort values where the Status Toggle is set to ON (Active). |
| FR.4.2 | As a user, I want to be able to toggle the status of a requirement record ON/OFF, so I can temporarily exclude specific items from the committed scope. | 1. Each row has a distinct toggle (e.g., checkbox or switch). 2. When the toggle is set to OFF (Inactive), the record's effort is immediately excluded from the Total Effort Summary (FR.4.1). 3. When the toggle is set to ON (Active), the record's effort is immediately included in the Total Effort Summary. |
| FR.4.3 | As a user, when I mark a requirement as inactive (toggle OFF), I want that record to be visually grayed out, so I can easily identify items not currently in the committed scope. | 1. The background and/or text color of the entire row changes to a subtle gray when the status toggle is OFF. 2. The row returns to its standard appearance when the toggle is ON. |
| FR.5   | Display Control                                              |                                                              |
| FR.5.1 | As a user, I want a control to hide or show the 'Effort' column, so I can focus purely on the requirements when discussing scope. | 1. A dedicated button or checkbox (e.g., "Show/Hide Effort") is available in the header area. 2. Clicking this control toggles the visibility of the entire 'Effort' column (including the header) in the main list. |
|        |                                                              |                                                              |
| ID     | Category                                                     | Requirement                                                  |
| NF.1   | Design/UX                                                    | The application must be fully responsive and usable on desktop, tablet, and mobile devices. |
| NF.2   | Usability                                                    | The interface must be clear and intuitive, requiring minimal explanation. Primary actions (Add, Toggle) should be easily discoverable. |
| NF.3   | Validation                                                   | The Effort field must enforce numerical input and display a clear error message if non-numeric characters are entered. |
| NF.4   | Performance                                                  | All calculations (e.g., Total Effort summary) must update instantaneously after any change (add, edit, toggle status). |

 