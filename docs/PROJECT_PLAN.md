# Radau project plan

University project by **404 Found**: Lukas, Aleks, Andrej and Rokas. No monetization goal.

## Project idea, problem and target users

Radau collects lost and found item listings in one place. Students currently check separate chats, social networks and reception desks. The first intended users are students and staff at one educational institution. Institutional adoption is proposed, not verified.

## Goal

Deliver an understandable MVP that can be demonstrated in five minutes: publish a lost/found item, locate it through search/filters, view the photo/contact, and mark it returned. The team should explain the code, validate requirements and document its work.

Suggested timeframe: six weeks from an agreed start, not a lecturer-approved deadline. A future usability exercise can ask five students to create and find a listing independently; this has not been conducted.

## MVP scope

Home, lost/found lists, creation with optional image, category, location, date, description and contact, search, combined filters, detail pages, returned status, durable storage and a production build. No account is required. A secret code authorizes resolution of one listing.

Deferred: accounts, editing/deletion UI, messages, notifications, moderation dashboard, maps, saved listings and matching. No paid APIs or AI service.

## Functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| FR-01 | Create lost and found listings with required details | Both browser flows and API tests |
| FR-02 | One optional JPEG/PNG/WebP, at most 5 MiB | Decode/re-encode valid image; reject false and oversized files |
| FR-03 | Combine type/category/location/status/event-date filters | API and browser filter checks |
| FR-04 | Search title, description and location without case sensitivity | Lithuanian uppercase search test |
| FR-05 | Detail view with image, status, description, location, date and contact | Direct route reload and image check |
| FR-06 | Only the correct management code resolves a listing | Wrong-code rejection and successful resolution |
| FR-07 | Returned records remain in history | Returned filter finds resolved records |
| FR-08 | Records survive process restart | Production stop/start test |
| FR-09 | Lithuanian feedback for invalid forms, network failures and missing data | Browser error/retry/404 scenarios |

## Non-functional requirements

- Node.js 24.x and reproducible `npm ci`, `npm run build`, `npm start`.
- Desktop and 375 px mobile layout without horizontal overflow.
- Plain-text user input, parameterized SQL, private management hashes.
- Bounded upload size and decoded pixels, no arbitrary uploaded file serving.
- One application server and SQLite, understandable to four students.
- Persistent storage and backups of records and photos together.
- No unmeasured accessibility, performance or deployment-availability claims.

## User stories

1. As a person who lost an item, I want to publish details so someone who found it can contact me.
2. As a person who found an item, I want to publish it so its owner can identify it.
3. As a student, I want location and date filters so I can narrow my search.
4. As a creator, I want to mark a listing returned so others know the search ended.
5. As a visitor, I want clear feedback when no records match or the service is unavailable.

## Team roles

| Member | Responsibility | Evidence/status |
|---|---|---|
| Lukas | Project Manager / coordination | Assigned in the current brief |
| Aleks | UI/UX, requirements and frontend | Proposed in existing documentation; individual contributions not verified |
| Andrej | API, backend validation and uploads | Proposed; individual contributions not verified |
| Rokas | Database and testing | Proposed; individual contributions not verified |

The initial implementation and this revision used Codex assistance. This does not establish individual members' authorship. Confirm preferences together and record actual work in issues, reviews and commit history.

## Milestones

| Stage | Suggested timing | Deliverable/current evidence |
|---|---|---|
| Requirements | Week 1 | Scope and acceptance criteria documented; team sign-off pending |
| Prototype | Weeks 1–2 | Existing visual design and demo records |
| Frontend | Weeks 2–3 | Lithuanian pages, forms and responsive states implemented |
| Backend | Week 3 | Express, validation, SQLite and uploads implemented |
| Integration | Week 4 | Full create/browse/resolve cycle exercised |
| Testing | Weeks 4–5 | API/restart/browser checks; real-user review pending |
| Deployment | Week 5 | User reports existing deployment; revised release verified locally only |
| Presentation | Week 6 | Five-minute script ready; rehearsal pending |

Weeks are a plan, not fabricated history. Track small tasks with an owner, acceptance condition, reviewer and status. Hold a weekly 20-minute review and agree scope changes before extending MVP.

## Project risks

| Risk | Response | Proposed owner |
|---|---|---|
| Incorrect information or ownership claim | Confirm identifying details before physical handover | Aleks |
| Inappropriate uploads/spam | Decode/restrict images; arrange moderation and abuse limits before wider public use | Andrej |
| Duplicate listings | Manual review for this small MVP | Lukas |
| Limited time | Freeze scope and reserve time for fixes/rehearsal | Lukas |
| Lost code | Display, copy and browser-local storage; no recovery feature | Aleks |
| Lost database/photos | Back up both stores and test restoration | Rokas |
| Private material published accidentally | Inspect staged files and publication checklist | Lukas |

## Definition of done

Core flows and build pass, mobile UI is usable, errors are understandable, documents describe actual behavior, and the team can demonstrate without personal data. Publishing code remains a separate manual decision.

The supplied September 2026 lectures cover PM/BA roles, SMART, scope, WBS, risks, communication and functional/non-functional requirements. The [original Lithuanian plan](PROJEKTO-PLANAS.md) maps these topics to slide numbers.
