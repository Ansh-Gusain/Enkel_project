
# ENKEL — A SMALL BUSINESS MANAGEMENT WEB APPLICATION WITH BIOMETRIC ATTENDANCE

A Minor Project Report submitted in partial fulfillment of the requirement for the award of the degree

**BACHELOR OF TECHNOLOGY (COMPUTER SCIENCE AND ENGINEERING)**

---

**Submitted By**

Dhruv (Project Lead)

---

**UNDER THE SUPERVISION OF**

Ms. Varshika Gautam

**SCHOOL OF INFORMATION AND COMMUNICATION TECHNOLOGY,
GAUTAM BUDDHA UNIVERSITY
GREATER NOIDA - 201312, GAUTAM BUDDHA NAGAR
UTTAR PRADESH, INDIA
OCTOBER 2026**

---

## Candidate's Declaration

We hereby certify that the work embodied in this project report entitled "Enkel — A Small Business Management Web Application with Biometric Attendance" in partial fulfillment of the requirements for the award of B. Tech (Computer Science and Engineering), submitted to the School of Information and Communication Technology, Gautam Buddha University, Greater Noida, is an authentic record of our own work. The matter presented in this report has not been submitted in any other University / Institute for the award of any other degree or diploma. Responsibility for any plagiarism-related issue stands solely with us.

| **NAME** | **ROLL No.** | **SIGNATURE** |
|---|---|---|
| Dhruv | — | |

---

## Certificate

It is certified that the work done entitled "Enkel — A Small Business Management Web Application with Biometric Attendance," a full-stack business management platform with local biometric attendance, for the award of Bachelor of Technology (Computer Science and Engineering) from Gautam Buddha University, Greater Noida (UP) has been carried out under my supervision.

The contents of this report are not based on the award of any other degree to the candidate or to anyone else.

| **NAME** | **ROLL No.** |
|---|---|
| Dhruv | — |

**Signature of the Supervisor:**

**Name with Designation:** Ms. Varshika Gautam

**Date:** October 2026

**Place:** Greater Noida

---

## Acknowledgement

We have taken sincere efforts to complete this project. However, it would not have been possible without the kind support and help of many individuals. We would like to extend our heartfelt thanks to all of them.

We are highly indebted to Ms. Varshika Gautam for her guidance and constant supervision, as well as for providing necessary information regarding the project, and for her support in completing this project.

We would like to thank the Dean of School of ICT Dr. Arpit Bhardwaj and the HOD of CSE Dr. Arun Solanki, whose work and guidance helped us complete this project. We would also like to express our gratitude towards our friends and family members for their kind co-operation and encouragement, which helped us in the completion of this project.

---

## Abstract

**Title:** Enkel — A Small Business Management Web Application with Local Biometric Attendance

"Enkel" (meaning *simple* in Scandinavian languages) is a minor project that aims to solve the problem faced by Indian small business owners and agency teams who keep their business context scattered across WhatsApp, email, spreadsheets, Google Drive, and notes. The platform gives everything one connected home, so nothing gets missed.

The system is a full-stack web application covering 13 functional modules: client CRM, lead pipeline, task management, reminders, service catalogue, notes/ideas, HR records, invoice and sales, expense tracking, file management, a design and creative tool, and a biometric face-recognition attendance system. The frontend is built with React 19 and Vite, styled with Tailwind CSS v4, and persists all data client-side via localStorage, making it deployable as a fully static site on Vercel. The biometric attendance module is powered by a separate local FastAPI (Python) backend that uses OpenCV's LBPH (Local Binary Pattern Histogram) face recognition algorithm, keeping all biometric data on the user's own machine and never transmitting it to any server.

This report documents the design, architecture, dataset strategy, scope, feasibility analysis, and evaluation of the system.

---

## Abbreviations

1. **CRM** — Customer Relationship Management
2. **API** — Application Programming Interface
3. **IST** — Indian Standard Time (UTC+5:30)
4. **LBPH** — Local Binary Pattern Histogram (face recognition algorithm)
5. **LSTM** — Long Short-Term Memory (referenced in context of CV literature)
6. **CV** — Computer Vision
7. **SPA** — Single Page Application
8. **JSX** — JavaScript XML (React template syntax)
9. **HMR** — Hot Module Replacement
10. **CDN** — Content Delivery Network
11. **CORS** — Cross-Origin Resource Sharing
12. **GST** — Goods and Services Tax
13. **ISL** — Not applicable (project uses OpenCV, not ISL)
14. **LLM** — Large Language Model (referenced but not implemented)
15. **FPS** — Frames Per Second
16. **RAM** — Random Access Memory
17. **CPU** — Central Processing Unit
18. **UI** — User Interface
19. **UX** — User Experience
20. **CSV** — Comma-Separated Values

---

## List of Figures

| Figure | Title | Section |
|---|---|---|
| Fig 3.1 | Overall System Architecture | 3.1 |
| Fig 3.2 | Biometric Attendance Pipeline | 3.3 |
| Fig 3.3 | Frontend Module Architecture | 3.2 |
| Fig 3.4 | Drawer Panel UX Pattern | 3.2 |

---

## List of Tables

| Table | Title | Section |
|---|---|---|
| Table 2.1 | Hardware Configuration | 2.2 |
| Table 2.2 | Software Used | 2.3 |
| Table 2.3 | Programming Languages / Frameworks and their Use | 2.4 |
| Table 3.1 | localStorage Key Summary | 3.4 |
| Table 3.2 | API Endpoint Reference | 3.3 |
| Table 3.3 | Scope Definition (MoSCoW) | 3.5 |
| Table 4.1 | Source Code Metrics | 4.1 |

---

## Contents

| Section | Page |
|---|---|
| Candidate's Declaration | 1 |
| Certificate | 2 |
| Acknowledgements | 3 |
| Abstract | 4 |
| Abbreviations | 5 |
| List of Figures | 6 |
| List of Tables | 7 |
| Chapter 1: Introduction | 9 |
| Chapter 2: Project Requirements | 12 |
| Chapter 3: Proposed System Architecture | 15 |
| Chapter 4: Project Advantages, Applications and Limitations | 22 |
| Chapter 5: Conclusion | 25 |
| References | 27 |

---

# Chapter 1: Introduction

*This chapter gives the introduction to the project, its motivation and objectives, and the challenges identified before beginning development.*

## 1.1 Introduction

Running a small business in India today means keeping context across six or more disconnected tools simultaneously — client contact details in WhatsApp, invoices in a spreadsheet, follow-ups in a notebook, receipts in email, and HR records in a separate application. This fragmentation leads to missed follow-ups, forgotten invoices, repeated questions, and significant daily friction for owner-operators and small agency teams.

"Enkel" is a minor project that explores a software-based approach to unifying this context. The platform provides 13 integrated modules — from client CRM and lead pipeline management to invoice creation, expense tracking, file management, and a biometric face-recognition attendance system — all connected in one browser-based application. Data is persisted in the user's browser via localStorage, with no server required for the core 12 modules. The biometric attendance module runs a separate local Python service, keeping all facial data on the user's machine.

The frontend is a React 19 single-page application built with Vite 8 and Tailwind CSS v4, deployable as a static site on Vercel. The attendance backend is a FastAPI service using OpenCV's LBPH algorithm for offline, CPU-only face recognition.

## 1.2 Motivation

India has a large and growing population of small business owners, freelancers, and small agency teams — particularly in tier-2 and tier-3 cities — who manage their entire business across free tools not designed to work together. The result is:

- Overdue invoices that go unnoticed because there is no single place to see what is outstanding
- Missed client follow-ups because next-action notes are buried in WhatsApp or email
- HR records scattered across spreadsheets with no expiry tracking for documents
- Attendance management done manually with paper registers, with no digital audit trail

Existing solutions are either enterprise-grade (too complex and expensive for a 5-person agency) or single-purpose (an invoicing app does not know about your client's next follow-up). We were motivated to explore whether a simple, connected, browser-based tool — one that requires no signup, stores data locally, and can be deployed with a single command — could meaningfully improve this situation for Indian small businesses.

The biometric attendance module was specifically motivated by the fact that small offices often use paper registers or basic Excel sheets for attendance, with no way to prevent buddy-punching or generate clean exportable records. Using the user's existing webcam and OpenCV's LBPH algorithm — which is fast, offline, and requires no cloud API — makes this feasible on commodity hardware.

## 1.3 Project Objectives

The objectives of this project are:

- To design and build a unified, browser-based platform covering the 13 most common operational needs of a small Indian business or agency team
- To implement a client-side persistence architecture using localStorage with typed data models and a migration strategy, so that the application requires no backend for 12 of its 13 modules
- To build a complete, full-page invoice creation workflow with line items, GST calculation, discount toggle, and live invoice summary — suitable for Indian B2B invoicing
- To implement a privacy-preserving local biometric attendance system using OpenCV's LBPH face recognition algorithm, where all biometric data stays on the user's machine
- To design and implement a right-side slide-in DrawerPanel UX pattern for all add/edit forms across every module, consistent with modern SaaS design conventions
- To achieve a production-ready static build deployable on Vercel, with all 12 non-attendance modules working fully in the deployed version
- To honestly document the scope, limitations, and feasibility of the system, distinguishing what the prototype can demonstrate from long-term goals

## 1.4 Challenges

Building a unified small business platform presented several challenges identified during planning and development:

- **localStorage data migration:** As the data models evolved between development iterations, records stored in older shapes caused runtime crashes in newer components. A versioned migration system in `main.tsx` was required to detect and wipe stale records.
- **Biometric attendance on Windows with Python 3.13:** OpenCV's `cv2.face.LBPHFaceRecognizer_create()` is only available in the `opencv-contrib-python-headless` package, and FastAPI 0.115.12 introduced stricter validation for HTTP 204 responses that required patching.
- **Real-time face quality gating:** Preventing blurry, dark, too-similar, multi-face, and too-small frames from being accepted as training samples required implementing five distinct quality gates in the image normalization pipeline.
- **IST timezone for attendance:** The Python backend needed explicit UTC+5:30 timezone handling to ensure all attendance timestamps are recorded in Indian Standard Time rather than UTC.
- **UX consistency across 13 modules:** Designing a single reusable DrawerPanel component with Field, ChipGroup, and DrawerSection sub-components that works for forms ranging from a 3-field reminder to a 15-field employee record with compensation details.
- **Sales invoice vs. drawer pattern:** The invoice creation workflow required a full-page layout (not a drawer) due to the complexity of line items, discount toggles, and the live summary box — requiring a separate `InvoicePage` sub-component and a view-state router within `Sales.tsx`.

## 1.5 Methodology of the Project

The project is built as a React 19 + Vite 8 + TypeScript single-page application with Tailwind CSS v4 for styling. The `useStoredState` custom hook wraps `useState` with localStorage persistence under the `enkel:` namespace, providing the data layer for all 12 client-side modules. The application uses hash-based routing (`#app/clients`, `#app/sales`, etc.) without any router library, with back/forward navigation handled by `popstate` and `hashchange` event listeners.

The biometric attendance module communicates with a local FastAPI (Python) backend over HTTP REST. The browser captures webcam frames, sends JPEG-encoded frames to the backend, and the backend runs OpenCV's LBPH face recogniser. Enrollment captures 100 quality-gated face samples (200×200 grayscale, histogram-equalized), trains an LBPH model, and saves it to disk. Recognition requires three consecutive solid matches (LBPH distance < 50) before recording an IST-timestamped attendance entry in SQLite.

The frontend uses a consistent DrawerPanel component for all add/edit forms, with ChipGroup for selectable options and Field/DrawerSection for layout. The Catalogue module uses an inline card grid with an edit drawer. The Sales module uses a full-page invoice creation flow. The Attendance module uses a tab-based layout with camera view and setup panel.

## 1.6 Organization of the Report

The report is organised into five chapters, each covering a specific aspect of the project.

**Chapter 1, Introduction,** introduces the project, its motivation, objectives, and the challenges identified during planning and development.

**Chapter 2, Project Requirements,** lists the hardware, software, and programming languages/frameworks required for the project.

**Chapter 3, Proposed System Architecture,** describes the system's architecture, frontend module design, biometric attendance pipeline, data layer, and defined scope using architecture diagrams and tables.

**Chapter 4, Project Advantages, Applications and Limitations,** discusses the benefits and real-world applications of the system, source code metrics, and an honest discussion of its limitations and feasibility.

**Chapter 5, Conclusion,** summarises the project and describes its scope for future development.

---

# Chapter 2: Project Requirements

*This chapter lists the hardware, software, and programming languages/frameworks required to build and run the proposed system.*

## 2.1 Project Model Scenario

The objective of this project is to design a browser-based small business management platform that gives Indian owner-operators and small teams one connected home for their clients, leads, tasks, invoices, expenses, files, HR records, and attendance — replacing the fragmented use of six or more disconnected tools with a single, simple, locally-persisted application that can be deployed as a static website.

## 2.2 Hardware Requirement and their Uses

**Table 2.1: Hardware Configuration Needed**

| S.No. | Hardware Component | Requirement |
|---|---|---|
| 1. | Processor (CPU) | Modern multi-core processor (for running the development server and Python backend) |
| 2. | Memory (RAM) | At least 8 GB (for running pnpm dev, the Vite build, and the Python FastAPI service simultaneously) |
| 3. | Webcam | Standard HD webcam (built-in or external) for biometric attendance enrollment and recognition |
| 4. | Storage | Adequate storage for node_modules (~200 MB), Python venv (~500 MB for OpenCV), face sample PNGs, and SQLite database |
| 5. | Operating System | Windows 10/11, Linux, or macOS |
| 6. | Internet Connection | Required for initial package installation (pnpm install, pip install); not required at runtime for any module except the LLM grammar pass in attendance (optional) |

## 2.3 Software Requirement and their Uses

**Table 2.2: Software Used**

| S.No. | Software | Use |
|---|---|---|
| 1. | Visual Studio Code (Kiro IDE) | Primary IDE used for all frontend and backend development, with integrated terminal and TypeScript language support |
| 2. | Node.js 24+ | JavaScript runtime required by pnpm and Vite |
| 3. | pnpm 12+ | Fast, disk-efficient package manager for the JavaScript/React frontend |
| 4. | Python 3.13 | Backend runtime for the FastAPI attendance service and OpenCV face recognition |
| 5. | pip | Python package manager for installing FastAPI, OpenCV, NumPy, and Pydantic |
| 6. | Browser (Chrome/Edge) | Required to run the React SPA and access the webcam via `navigator.mediaDevices.getUserMedia` |
| 7. | Git | Version control for the project source code |
| 8. | Vercel CLI | For deploying the static frontend build to Vercel |

## 2.4 Programming Languages / Frameworks Used

**Table 2.3: Programming Languages / Frameworks and their Use**

| S.No. | Language / Framework | Use |
|---|---|---|
| 1. | TypeScript 5.9 | Typed superset of JavaScript used for all frontend code; provides compile-time safety for data models and component props |
| 2. | React 19 | UI framework used to build the entire frontend as a component-based single-page application with hooks-based state management |
| 3. | Vite 8 | Build tool and development server providing fast HMR, TypeScript transformation, and static site generation |
| 4. | Tailwind CSS v4 | Utility-first CSS framework used for spacing, layout utilities, and responsive design |
| 5. | CSS (custom) | Hand-written CSS in `index.css` for the full design system: colour tokens, sidebar, drawer, table, pill tabs, file grid, invoice summary, and all component styles |
| 6. | Python 3.13 | Backend language for the FastAPI attendance service and OpenCV model training/inference |
| 7. | FastAPI 0.115.12 | Lightweight Python web framework used to serve the biometric attendance REST API with CORS configured for localhost:8443 |
| 8. | OpenCV 4.11 (contrib-headless) | Computer vision library providing the Haar Cascade face detector and the LBPH face recogniser |
| 9. | SQLite3 | Embedded relational database used by the attendance service to store profiles and check-in records |
| 10. | Pydantic 2.11 | Data validation library used by FastAPI for request body schemas |
| 11. | NumPy 2.2 | Numerical array library used for image processing in the OpenCV pipeline |
| 12. | Uvicorn 0.34 | ASGI server used to run the FastAPI application on port 8787 |

---

# Chapter 3: Proposed System Architecture

*This chapter describes the system's architecture, module design, biometric pipeline, data layer, and defined scope.*

## 3.1 System Overview

Enkel follows a hybrid architecture. Twelve of its thirteen modules are entirely client-side — data is stored in the browser's localStorage and all rendering and logic runs in the React SPA with no network requests. The thirteenth module, Attendance, communicates with a local Python/FastAPI backend over HTTP REST. The backend binds to `127.0.0.1:8787` and is intentionally not exposed to the internet.

```
┌──────────────────────────────────────────────────────┐
│                   BROWSER (React SPA)                │
│                                                      │
│  Sidebar → 13 Module Pages                          │
│  ├── 12 modules: localStorage only (no network)     │
│  └── Attendance: HTTP REST to local Python backend  │
│                                                      │
│  DrawerPanel (add/edit forms for all modules)       │
│  Hash-based router (#app/clients, etc.)             │
└──────────────────┬───────────────────────────────────┘
                   │ HTTP REST (port 8787)
                   │ (Attendance module only)
┌──────────────────▼───────────────────────────────────┐
│            LOCAL PYTHON BACKEND (FastAPI)            │
│                                                      │
│  POST /profiles/{id}/samples  → quality-gate frame  │
│  POST /train                  → train LBPH model    │
│  POST /recognize              → identify face       │
│  GET  /dashboard              → stats + history     │
│  GET  /attendance.csv         → export CSV          │
│                                                      │
│  Data: SQLite (attendance.sqlite3)                  │
│        PNG samples (server/data/samples/)           │
│        LBPH model (server/data/models/lbph.yml)    │
└──────────────────────────────────────────────────────┘
```
**Fig 3.1: Overall System Architecture**

## 3.2 Frontend Module Architecture

The frontend is structured into three layers:

**Layer 1 — Shared Infrastructure**
- `src/main.tsx` — Entry point with versioned data migration (clears stale localStorage on version bump)
- `src/App.tsx` — Root component, hash-based router, app shell (sidebar + mobile bar)
- `src/types.ts` — Shared TypeScript types (Page, Client, Lead, Invoice, Expense, etc.)
- `src/hooks/useStoredState.ts` — Custom hook: `useState` + automatic localStorage persistence

**Layer 2 — Shared Components**
- `src/components/ui.tsx` — Icon (15-icon SVG library), Button, Search, Logo, Tabs, DataTable, Person, Metric, PageHeader
- `src/components/Sidebar.tsx` — Left navigation with 13 module links
- `src/components/DrawerPanel.tsx` — Right slide-in panel: DrawerPanel, Field, ChipGroup, DrawerSection, inputStyle, textareaStyle, selectStyle
- `src/components/Landing.tsx` — Marketing landing page (shown before sign-in)

**Layer 3 — Page Components** (one per module)
- `Home`, `Reminders`, `Clients`, `Leads`, `Tasks`, `Catalogue`, `Creative`, `Notes`, `HR`, `Attendance`, `Sales`, `Expenses`, `Files`

The DrawerPanel pattern is used consistently across all add/edit workflows. When a user clicks "+ New client" or "···→ Edit" on any row, a right-side panel slides in with the full form. This pattern was chosen because it keeps the list context visible on the left while editing on the right — matching the UX shown in the Claude design reference.

```
[Page with list/table]          [DrawerPanel slides in from right]
┌────────────────────────┐      ┌───────────────────────────────┐
│ NEW CLIENT        ×    │      │ BASIC INFORMATION             │
│                        │      │ Client / company name *       │
│ Meridian Labs  ···     │  →   │ [Meridian Labs          ]     │
│ Wavelength FM  ···     │      │ Primary contact name          │
│ Kulkarni Clinic ···    │      │ [Rahul Sethi            ]     │
│                        │      │ ...                           │
│ + New client           │      │         [Cancel] [Save client]│
└────────────────────────┘      └───────────────────────────────┘
```
**Fig 3.4: DrawerPanel UX Pattern**

## 3.3 Biometric Attendance Pipeline

The biometric attendance system is a complete offline pipeline with no cloud dependency.

```
Webcam frame (JPEG, sent as base64)
     │
     ▼
Haar Cascade Face Detector
  scaleFactor=1.1 · minNeighbors=4 · minSize=(60,60)
     │
     ▼
Quality Gates (5 checks per frame)
  ├── No face detected     → HTTP 422 "No face detected"
  ├── Multiple faces       → Pick largest (not rejected)
  ├── Face width < 60px    → HTTP 422 "Face is too small"
  ├── Mean brightness < 40 → HTTP 422 "Image is too dark"
  ├── Laplacian var < 40   → HTTP 422 "Image is too blurry"
  └── Diff from prev < 2.0 → HTTP 422 "Too similar to previous" (enrollment only)
     │
     ▼
Crop → Resize to 200×200 → equalizeHist (grayscale)
     │
  ┌──┴──────────────────┐
  │                     │
ENROLL               RECOGNIZE
  │                     │
100 samples         LBPH predict(face)
saved as            → (label, distance)
PNG + JPG               │
  │             3-tier confidence decision:
POST /train         ├── dist < 50   → solid match (teal)
  │                 ├── 50–85       → uncertain (amber)
LBPH model          └── ≥ 85        → unknown, rejected
written to              │
lbph.yml +         3 consecutive solid matches required
trainer.yml             │
                   INSERT INTO attendance
                   (employee_id, date IST, time IST, distance)
                   UNIQUE(employee_id, attendance_date)
```
**Fig 3.2: Biometric Attendance Pipeline**

**Table 3.2: API Endpoint Reference**

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service status, OpenCV version, model readiness, face size, thresholds |
| GET | `/dashboard` | Profiles, attendance records, today's stats (checked in / not checked in) |
| POST | `/profiles` | Create or return existing biometric profile (idempotent) |
| POST | `/profiles/{id}/samples` | Add a quality-gated 200×200 grayscale face sample |
| POST | `/train` | Train LBPH model across all enrolled profiles (atomic file write) |
| POST | `/recognize` | Identify face, accumulate streak, record attendance on 3rd solid match |
| PATCH | `/attendance/{id}` | Correct a check-in time with reason |
| DELETE | `/attendance/{id}` | Delete a single attendance record |
| GET | `/attendance.csv` | Export full history as CSV (IST timestamps, confidence %) |
| DELETE | `/profiles/{id}` | Delete profile, samples, and invalidate model |
| DELETE | `/data` | Wipe all biometric data and records |

## 3.4 Data Architecture

**Client-side (localStorage)**

All frontend state is persisted under the `enkel:` namespace. A version flag (`enkel:data-version = 2`) in `main.tsx` triggers automatic migration when data shapes change between versions.

**Table 3.1: localStorage Key Summary**

| Key | Module | Record Shape |
|---|---|---|
| `enkel:clients` | Clients | name, contact, phone, email, tags[], action, actionTime, last, status, attention, notes, owner |
| `enkel:leads` | Leads | name, company, industry, email, stage, owner, source, priority, action, actionTime, notes |
| `enkel:reminders` | Reminders | title, client, date, time, priority, status, repeat, notification, notes |
| `enkel:task-lists` | Tasks | string[][] — first element is list name, rest are task titles |
| `enkel:completed-tasks` | Tasks | string[] — titles of checked tasks |
| `enkel:catalogue` | Catalogue | name, category, description, price, priceUnit, status |
| `enkel:brand-drafts` | Catalogue | title, body |
| `enkel:notes` | Notes | title, content, tags, pinned, state |
| `enkel:employees` | HR | firstName, lastName, email, designation, department, employmentType, joiningDate, salary |
| `enkel:invoices` | Sales | client, items[], discount, status, dates, paymentInfo, terms, placeOfSupply |
| `enkel:expenses` | Expenses | name, category, paidBy, client, amount, status, gst, method, notes |
| `enkel:files` | Files | name, category, uploader, size, date, expiryDate, client, notes |
| `enkel:dismissed-attention` | Home | string[] — dismissed attention item titles |
| `enkel:data-version` | main.tsx | number — schema migration version |

**Server-side (SQLite — Attendance only)**

Two tables: `profiles` (employee_id, name, label, consent_at, sample_count, state, updated_at) and `attendance` (id, employee_id, attendance_date IST, check_in_time IST, distance, confidence, corrected, correction_reason) with a UNIQUE constraint on (employee_id, attendance_date) to prevent duplicate check-ins per day.

## 3.5 Scope Definition

**Table 3.3: Scope Definition (MoSCoW)**

| Category | Included Items |
|---|---|
| **Must Have** | Client CRM with add/edit drawer and status tracking; lead pipeline with stage and owner; task lists with inline add bar; reminders with client link; invoice creation with line items and GST; expense logging with billable tracking; file store with expiry tracking; HR employee records; biometric attendance enrollment + recognition; localStorage persistence for all modules |
| **Should Have** | Pill filter tabs (Clients, Leads, Sales, Files); overflow (···) menu per row; full-page invoice creation (not a drawer); "Owner view / My expenses" toggle; confidence tier display in Attendance (teal/amber/orange); Attendance Sheet with date picker |
| **Could Have** | LLM-based sentence formation from attendance gloss; ONNX export for LBPH model; custom fields per client/lead; speech-to-text in notes |
| **Won't Have (this version)** | Multi-user / multi-device sync; cloud storage for biometric data; liveness detection; full PDF generation; accounting / GST filing; replacing a human HR system |

---

# Chapter 4: Project Advantages, Applications and Limitations

*This chapter discusses the advantages and real-world applications of the proposed system, together with an honest account of its limitations and feasibility boundaries.*

## 4.1 Advantages

**Table 4.1: Source Code Metrics**

| File | Lines |
|---|---|
| `src/pages/Attendance.tsx` | 677 |
| `src/index.css` | 385 |
| `src/pages/Sales.tsx` | 340 |
| `src/pages/Clients.tsx` | 314 |
| `src/components/Landing.tsx` | 239 |
| `src/pages/Tasks.tsx` | 226 |
| `src/pages/Leads.tsx` | 220 |
| `src/components/ui.tsx` | 216 |
| `src/pages/Files.tsx` | 210 |
| `src/pages/Notes.tsx` | 206 |
| `src/pages/Expenses.tsx` | 198 |
| `src/components/DrawerPanel.tsx` | 192 |
| `src/pages/HR.tsx` | 171 |
| `src/pages/Reminders.tsx` | 169 |
| `src/pages/Home.tsx` | 154 |
| `src/pages/Catalogue.tsx` | 135 |
| `src/App.tsx` | 129 |
| `server/main.py` | 475 |
| **Total** | **~4,700 lines** |

The proposed system offers the following advantages over existing alternatives such as enterprise CRM tools or disconnected free applications:

- **Zero Backend for 12 Modules:** Twelve of the thirteen modules require no server, no database setup, and no signup. A user can open the Vercel-deployed URL and immediately start adding clients, writing notes, and creating invoices.
- **Privacy-Preserving Biometric Design:** All face samples, the trained LBPH model, and attendance records stay on the local machine in `server/data/`, which is gitignored. Raw webcam video is never transmitted; only JPEG frames are sent to the local service and immediately discarded after processing.
- **Low Hardware Barrier:** Running entirely in a standard browser on a webcam, the system requires no depth sensors, wearable devices, or GPU. The LBPH model trains on CPU in under 10 seconds for four employees.
- **Transparent Confidence Reporting:** The recognition panel shows a live confidence progress bar colour-coded by tier (teal for solid, amber for uncertain, orange for unknown), with 3 streak dots filling as consecutive matches accumulate. Low-confidence predictions are flagged rather than silently accepted.
- **Consistent UX Pattern:** The DrawerPanel component is used across all 13 modules for add/edit workflows, giving users a predictable interaction model regardless of which module they are in.
- **Indian Business Context:** The invoice module supports HSN/SAC codes, CGST/SGST split, place of supply (Indian states), and the ₹ currency throughout. The expense module tracks GST rates and billable expenses. The attendance module timestamps all records in IST.

## 4.2 Applications

Once matured beyond the prototype stage, a system of this kind could support several real-world use cases:

- **Small Digital Agencies:** Managing client relationships, leads, service catalogues, invoicing, and team attendance in one place without subscribing to five separate SaaS tools.
- **Freelancers and Consultants:** Tracking clients, sending invoices with GST, logging billable expenses, and maintaining follow-up reminders — all from a single browser tab.
- **Small Retail and Service Businesses:** Using the attendance module to replace a paper register for a 5-10 person team, with CSV export for payroll calculation.
- **Educational Institutions and Coaching Centres:** Managing student-as-client records, fee invoicing, staff attendance, and file/document storage.
- **HR and Compliance Use:** Storing employee handbooks, ISO certifications, and license documents with expiry tracking and "Remind me" notifications before renewal deadlines.

It is important to note that these are aspirational goals. As discussed in Section 4.3, the prototype described in this report is not yet ready for deployment in a regulated business environment.

## 4.3 Limitations and Feasibility

A realistic assessment of what is, and is not, feasible within this project's scope is essential to avoid overstating its capabilities.

- **No authentication:** Any user who opens the URL can access all data. There is no login, session management, or role-based access control in this version.
- **localStorage only:** Data is stored in a single browser's localStorage and is not synced across devices, browsers, or users. Clearing browser data wipes all records.
- **Biometric attendance is local-only:** The FastAPI backend cannot be deployed to Vercel or any cloud platform without adding persistent disk storage and addressing the webcam dependency. It is intentionally local.
- **No liveness detection:** The LBPH system can be spoofed with a printed photograph held in front of the camera. The system is labelled as a prototype, not a high-security authentication system.
- **No real PDF generation:** The "Download PDF" and "Preview" buttons on the invoice page are UI stubs and do not generate actual PDF files.
- **Tasks date tracking is partial:** Task cards show "1 overdue" as a demo label rather than computing it from a stored due date, since the task data model stores titles as plain strings without due dates at the list level.
- **Attendance backend not cloud-deployable as-is:** The Python service requires a persistent filesystem for `server/data/`, which is not available on Vercel's serverless runtime.

Accordingly, the project can honestly claim to deliver a working, connected small business management platform for local/single-device use, with a biometric attendance module that functions correctly on commodity hardware. The project does not, and should not, claim to deliver a production-grade multi-user business platform, a cloud-hosted biometric system, or a replacement for dedicated accounting software.

---

# Chapter 5: Conclusion

*This chapter summarises the project and describes its scope for future development.*

## 5.1 Scope of the Project (Future Work)

"Enkel" was built as an incremental project, starting from a single-file React prototype and evolving into a 36-module, 4,700-line full-stack application. The build followed a deliberate sequence: establish the data layer and module shell → implement all 12 client-side modules → add the DrawerPanel UX pattern → implement the biometric attendance backend → apply the Claude design system → conduct a pre-deployment audit and fix all identified issues.

Success for this project is defined as: all 13 modules rendering without runtime errors, all add/edit forms saving and persisting data correctly, the biometric attendance pipeline enrolling and recognising employees on commodity hardware, and the static frontend deploying cleanly to Vercel.

Looking beyond this minor project, the system has clear directions for future extension:

- **Authentication and multi-user support:** Adding a login layer (e.g., Supabase Auth or Firebase Auth) and migrating localStorage data to a cloud database would enable multi-device sync and role-based access.
- **Real PDF invoice generation:** Integrating a library such as `react-pdf` or `jsPDF` to render the invoice form as a downloadable, printable PDF.
- **Cloud-hosted attendance:** Migrating the biometric backend to a VM with persistent disk (Railway, Render, or AWS EC2) and adding liveness detection would make the attendance module production-deployable.
- **GST filing integration:** Connecting the invoice and expense modules to India's GST portal via the GSTN API to enable direct return filing.
- **AI-powered follow-up suggestions:** Using an LLM to analyse the client and lead context stored in the system and suggest next actions, similar to the "Ask Enkel" concept that was removed from this version.
- **Mobile-first redesign:** Refining the responsive layout for the Clients, Leads, and Tasks modules on mobile, where the table layout currently collapses to a less usable form.

In conclusion, this project does not attempt to replace enterprise CRM or accounting software. Its contribution is a realistically scoped, honestly documented, full-stack prototype that demonstrates that a connected small business management platform — covering client relationships, sales, expenses, HR, and biometric attendance — is achievable as a browser-based application with a local Python service, on commodity hardware, with no cloud dependency for the core data, forming a foundation that can be meaningfully extended in future work.

---

# References

[1] React Documentation. Available: https://react.dev/

[2] Vite Documentation. Available: https://vitejs.dev/

[3] Tailwind CSS v4 Documentation. Available: https://tailwindcss.com/docs

[4] FastAPI Documentation. Available: https://fastapi.tiangolo.com/

[5] OpenCV Documentation — Face Recognition with Local Binary Pattern Histograms. Available: https://docs.opencv.org/4.x/da/d60/tutorial_face_main.html

[6] OpenCV, "Haar Cascade Object Detection." Available: https://docs.opencv.org/4.x/db/d28/tutorial_cascade_classifier.html

[7] Ahonen, T., Hadid, A., and Pietikainen, M., "Face Description with Local Binary Patterns: Application to Face Recognition," IEEE Transactions on Pattern Analysis and Machine Intelligence, 2006.

[8] Python Software Foundation, "sqlite3 — DB-API 2.0 interface for SQLite databases." Available: https://docs.python.org/3/library/sqlite3.html

[9] Pydantic Documentation v2. Available: https://docs.pydantic.dev/

[10] Uvicorn Documentation. Available: https://www.uvicorn.org/

[11] TypeScript Documentation. Available: https://www.typescriptlang.org/docs/

[12] Vercel Documentation — Deploying Vite. Available: https://vercel.com/docs/frameworks/vite

[13] Mozilla Developer Network, "MediaDevices.getUserMedia() — Web APIs." Available: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

[14] Mozilla Developer Network, "Web Storage API — localStorage." Available: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

*Report prepared: October 2026 · Enkel v1.0.0 · School of Information and Communication Technology, Gautam Buddha University, Greater Noida*
