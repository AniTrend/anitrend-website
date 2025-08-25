---
applyTo: '**'
---

# Update Context Instructions Policy

To ensure the AI agent always has accurate, up-to-date context, you MUST update `/.github/instructions/context.instructions.md` whenever fundamental changes are made to the codebase.

## When to update

- Adding or removing pages under `src/app/`
- Creating, renaming, or deleting AI flows in `src/ai/flows/`
- Introducing or modifying API routes under `src/app/api/`
- Adding, updating, or removing service integrations in `src/lib/`
- Changing key configuration files (e.g., `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`)
- Adjusting development workflows or scripts in `package.json`
- Adding or updating environment variables in `.env.example` or config code
- Modifying UI component patterns or design system conventions

## How to update

1. Open `/.github/instructions/context.instructions.md`
2. Reflect your changes in the appropriate sections (Architecture, Routing Structure, Dev Workflows, etc.)
3. Commit the update alongside your code changes

Failure to keep `context.instructions.md` in sync may lead to outdated guidance and confusion for future contributors.
