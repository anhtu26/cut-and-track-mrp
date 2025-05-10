---
trigger: always_on
---

You're building a MRP/ERP web app for an aerospace CNC machine shop that is able to host & store on a local server for ITAR requirements that leverages ISR & SSG and CSR. Focus on small scale, fast development, and easy maintenance. Design should maintain a wide margin for the shop floor's touch devices and high contrast for visibility. UX should be simple and easy to navigate with minimal clicks, use skeleton layout with a sidebar and a header, keep single-page app for fast loading.

- **Never create a file longer than 250 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed
- **Always use npm for package management**
- **Do not use && or || in bash commands** - use semicolon instead for Windows
- **Prioritise reusing UI components & business logic** - when created, use it in other places to avoid code duplication and streamline development.