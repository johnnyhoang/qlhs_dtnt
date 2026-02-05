# Global Development Rules - QLHS DTNT

This file contains the core principles and conventions for this project. The agent MUST read this file before any task and follow these rules strictly.

## 1. Naming Conventions
- **Variables & DB Columns**: All variable names, database table/column names, and object properties MUST be in **Vietnamese without accents** (tiếng Việt không dấu).
    - *Example*: `ten_hoc_sinh` instead of `studentName`, `ngay_sinh` instead of `dob`.
    - *Style*: Use `snake_case` for database columns and `camelCase` for code variables (unless otherwise specified).
- **Functions & Classes**: Should remain descriptive and follow the naming convention above.

## 2. Rule Hierarchy & Maintenance
- **Order of Operations**: 
    1. Read this `global_rules.md` first.
    2. Read module-specific specs, rules, or prompts (e.g., `src/modules/.../README.md`).
- **Dynamic Updates**: If a task reveals a better pattern or changes a spec, the agent MUST update the corresponding module-level documentation to reflect the new truth.

## 3. Code Quality & Philosophy
- **KISS (Keep It Simple, Stupid)**: Write clear, simple code that addresses the exact need. Avoid over-engineering or "covering all bases" unless explicitly required.
- **Modularity**:
    - Independent actions or logic used more than twice MUST be extracted into helpers, utils, or dedicated services.
    - Keep functions focused and small.
- **Avoid Overlapping Logic**: Ensure that business logic is not duplicated or scattered across multiple layers (Controller vs. Service). Maintain a clear single source of truth for logic.

## 4. Documentation
- Comments should be in Vietnamese (with accents) to explain "why" rather than "what", as the code itself should be clear.

---
*User will update more rules later.*
