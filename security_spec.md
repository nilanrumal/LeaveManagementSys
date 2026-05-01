# Security Specification: Global Horizon University Leave Management

## Data Invariants
1. A staff member profile must exist for any leave request to be valid.
2. An employee cannot approve or reject their own leave request.
3. Once a leave request is 'Approved' or 'Rejected', it cannot be modified by the employee.
4. The `usedLeaveCount` in the user profile must eventually reflect approved leave days (handled via app logic/batch).

## The "Dirty Dozen" Payloads (Denial Expected)
1. Creating a user profile with `role: 'admin'` as a non-authenticated user.
2. Updating a user profile's `role` from 'employee' to 'admin' by the user themselves.
3. Creating a leave request for another employee's ID.
4. Approving a leave request by an 'employee'.
5. Injecting a 1MB string into the `reason` field.
6. Submitting a leave request with an `endDate` before `startDate` (handled via app logic and schema validation).
7. Modifying the `employeeId` of an existing leave request.
8. Deleting a 'Pending' leave request of another employee.
9. Listing all leave requests as an 'employee'.
10. Creating a user document with a custom ID that isn't the Auth UID.
11. Updating `totalLeaveDays` by an employee.
12. Accessing another user's PII (private profile data).

## Test Runner Plan
Use `firebase-rules-generator` / manual audit patterns.
