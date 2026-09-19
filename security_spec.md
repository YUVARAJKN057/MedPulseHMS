# HMS Security Specification

## Data Invariants
- A User document must match their Auth UID.
- Roles can only be set during initialization by the server or an admin.
- Patients can only read their own appointments, bills, and medical records.
- Doctors can read medical records and appointments where they are the assigned doctor.
- Admins can read everything.
- Receptionists can manage users and appointments but not medical records.

## The Dirty Dozen Payloads
1. Create a user document with `role: 'admin'` as a normal user. (Denied)
2. Update someone else's appointment status to 'confirmed'. (Denied)
3. Read medical records of another patient. (Denied)
4. Delete a billing record that has been paid. (Denied)
5. Create an appointment with a 1MB string in the reason field. (Denied)
6. Inject a non-existent `doctorId` into an appointment. (Denied)
7. Update `createdAt` field on any document. (Denied)
8. List all users without filters. (Denied)
9. Create a doctor record as a patient. (Denied)
10. Update billing `amount` after payment. (Denied)
11. Inject malicious characters in `departmentId`. (Denied)
12. Read private user info (email) as another user. (Denied)

## Test Runner (Logic Outline)
- Setup Firestore Emulator.
- Authenticate as various users (Admin, Doctor, Patient).
- Execute the payloads and assert `PERMISSION_DENIED`.
