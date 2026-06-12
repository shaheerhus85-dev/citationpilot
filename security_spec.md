# Security Specification: CitationPilot Fortress Rules Security Spec

This document details the security specification and threat modeling for CitationPilot's Firestore database schemas, as described in `/firebase-blueprint.json` and secured by `/firestore.rules`.

## 1. Data Invariants
1. **Scope Alignment**: A Business Profile or Campaign belongs strictly to a Workspace (`workspaceId`). Submissions belong to Campaigns. Access to submissions or tasks is derived and gated appropriately.
2. **Identity Integrity**: No user may spoof their ID or modify others' workspace assets.
3. **Immutability of Key IDs**: The `id`, `campaignId`, and `workspaceId` cannot be changed after creation.
4. **Length and Regex Sanitization**: All document keys must be validated with size and character structures to protect against resource attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads (Pillar 2, 8 & 11)
Here are 12 JSON write payloads representing unauthorized accesses that our rules are statically designed to reject.

### Threat Vector: Identity Spoofing & Escalation
1. **Payload 1 (Spoof Business Profile Workspace)**: Setting a business profile to someone else's space.
2. **Payload 2 (Privilege Self-Assignment)**: Creating an unauthorized workspace setup to escalate permissions.
3. **Payload 3 (System Field Overwrite)**: Modifiers spoofing system-only status fields directly.

### Threat Vector: State Machine Shortcuts
4. **Payload 4 (Direct Campaign Status Jump)**: Skipping progress percentages and marking empty campaign status as completed directly.
5. **Payload 5 (Bypassing Captcha Task Validation)**: Resolving critical manual review tasks without updating correct attempts.
6. **Payload 6 (Form Poisoning/Ghost Fields)**: Injecting unvalidated attributes like `isCheatCode: true` on campaigns.

### Threat Vector: Denial of Wallet (DoW) ID Poisoning
7. **Payload 7 (Massive Key Poisoning)**: Document path IDs that are too large (e.g. 5KB path variables) to exhaust queries.
8. **Payload 8 (String Overflow Fields)**: Storing custom notes values that exceed `1024` chars on fields like manual review task notes.
9. **Payload 9 (Array Size Flooding)**: Flooding submission logs array to 10,000 recursive records.

### Threat Vector: Relational Integrity & Orphan Writes
10. **Payload 10 (Orphan Submission creation)**: Registering directory submissions for campaigns that don't exist under the workspace.
11. **Payload 11 (Client List Scraping)**: Initiating query scrapes for other businesses listings.
12. **Payload 12 (Unauthorized Deletion Gate)**: Deleting directories database configurations.

---

## 3. Test Suite Outline
A separate suite checks these targets to confirm `PERMISSION_DENIED` responses on all 12 malicious vectors, assuring zero leak conditions!
