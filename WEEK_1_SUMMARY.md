# Week 1 Review: Foundation & Professionalization

This document explains the technical changes made during Week 1 and why they are critical for a professional software project.

## 1. Repository Setup

### **CHANGELOG.md**

- **What it is**: A chronological list of user-facing changes, fixes, and additions.
- **Why it matters**: As your app grows, you (and your users) need to know exactly what changed between versions. It helps you track when a bug might have been introduced.
- **Professional Standard**: We follow the "Keep a Changelog" format, which is the industry standard.

### **CODEOWNERS**

- **What it is**: A special GitHub file that defines who is responsible for which parts of the code.
- **Why it matters**: Even as a solo developer, it's good practice. It tells GitHub who to automatically request reviews from when files change. If you ever add a teammate, this ensures the right person reviews the right code.

### **Git Tags (v0.1.0)**

- **What it is**: A "snapshot" of your code at a specific point in time.
- **Why it matters**: Branches (like `main`) change constantly. A tag is permanent. If you deploy `v0.1.0` and then break everything in `main`, you can always easily redeploy `v0.1.0`. It gives you a safety anchor.

## 2. CI/CD (Continuous Integration / Continuous Deployment)

### **GitHub Actions (`.github/workflows/ci.yml`)**

- **What it is**: An automated script that runs every time you push code.
- **What it does**:
  1.  **Lints**: Checks for code style issues.
  2.  **Type Checks**: Ensures TypeScript types are correct (prevents "undefined is not a function" errors).
  3.  **Tests**: Runs your unit tests to make sure logic is sound.
  4.  **Builds**: Verifies that the app actually compiles.
- **Why it matters**: It acts as a safety net. It prevents you from accidentally merging broken code. If the "CI" fails, you know you have work to do before shipping.

## 3. Error Handling

### **Global Error Boundary (`app/error.tsx`)**

- **What it is**: A React component that "catches" crashes anywhere in your app.
- **Why it matters**: Without this, if a single component crashes, the entire screen might go white (White Screen of Death). With this, the user sees a nice "Something went wrong" message and a "Try Again" button. It keeps the app feeling stable even when bugs happen.

## 4. Staging Environment

### **Staging Branch**

- **What it is**: A copy of your code that is _almost_ production, but not quite.
- **Why it matters**: You should never push straight to production (the live app) without testing.
- **The Workflow**:
  1.  Develop on a feature branch.
  2.  Merge to `staging`.
  3.  Test it on the staging URL.
  4.  If it looks good, merge `staging` to `main` (Production).

#### **Deep Dive: The "Life of a Feature"**

Imagine you want to change the "Sign Up" button color to blue.

1.  **Local**: You change the code on your laptop. It looks good to you.
2.  **Staging**: You push to the `staging` branch. Vercel automatically builds a "preview" site (e.g., `staging.tono.app`).
3.  **Verification**: You open that URL on your phone and realize the blue button is unreadable in Dark Mode. 😱
4.  **Fix**: You fix it locally and push to `staging` again. Now it looks perfect.
5.  **Production**: ONLY then do you merge to `main`. Your real users never saw the broken button.

## 5. Documentation

### **CONTRIBUTING.md**

- **What it is**: A guide for how to work on the project.
- **Why it matters**: It documents your setup steps, testing commands, and coding standards. It's a "manual" for your future self (or new team members) so you don't forget how to run the project.
