# Security Specification & Test-Driven Development (TDD) for MeetLog Firestore Rules

This document outlines the security invariants, a red-team adversarial payload audit suite ("The Dirty Dozen"), and custom test configurations to secure user-owned sorting projects and private analytical audio meetings.

## 1. Data Invariants

- **Ownership Multi-Tenancy**: Users can strictly edit, create, read, or delete only their own nested items under `/users/{request.auth.uid}/...`.
- **System-Generated Timestamps**: Document creation requires setting the exact structural server-side epoch time (`request.time`).
- **Entity Integrity Guards**: ID formats are constrained targeting string dimensions ($< 128$ characters regex-verified).
- **Immutable Constraints**: Critical primary parent keys (`userId`, `id`, `createdAt`) are unchangeable on resource update.

---

## 2. The "Dirty Dozen" Threat Payloads

The following payloads attempt to force security gaps and must be rejected with `PERMISSION_DENIED`:

1. **Privilege Escalation**: Creating a project with another subscriber's `userId`.
2. **Path Injection Guard**: Injecting malicious unicode segments into a document's key variables (`/users/{uid}/projects/../poisons/..`).
3. **Ghost Action Injection**: Pushing an unvalidated property or flag into the schema representation that bypasses the parser.
4. **Denial of Wallet (DoW) String Flood**: Flooding fields (e.g., meeting `title`) with a 10MB malicious character buffer.
5. **Time Spoofing (Client Drift)**: Overriding `createdAt` with an arbitrary client millisecond epoch offset.
6. **Immutable Key Hijacking**: Updating a meeting with an updated `userId` property aiming to move data ownership.
7. **Negative Duration Leak**: Creating a meeting list item containing a negative track duration (`durationSec = -999`).
8. **Anonymized Write Bypass**: Attempting to read or write project entities via unauthenticated requests.
9. **Cross-Tenant Storage Read**: Reading meeting details using a secondary authenticated session which is not the document owner.
10. **State Corruption Flood**: Appending random fields inside nested maps in meetings.
11. **Historic Revision Wipeout**: Clearing immutable timestamps `createdAt` on update operations.
12. **Infinite Data Recurrence**: Bypassing ID length constraints (`ID.size() > 1000`) for infinite collection indexing.

---

## 3. Firestore Security Rules Suite (`firestore.rules`)

Created securely under `/firestore.rules` for full project container deployment.
