# AGENTS.md — agent instructions and operational contract

This file exists so automated contributors (Copilot agents, bots, scripts) follow the same guardrails as human maintainers when working in `hoverkraft-tech/compose-action`. It summarizes what to read, which commands to run, and what is out of scope for agents.

## Organization-wide guidelines

- Always read and obey [hoverkraft-tech/.github/AGENTS.md](https://github.com/hoverkraft-tech/.github/blob/main/AGENTS.md) before touching this repository.
- Apply any additional instructions surfaced by the workspace (global Visual Studio Code prompts, repo-specific notices) alongside this contract.

## Canonical docs

- [README.md](./README.md) — product overview, supported inputs, and workflow examples. This is the primary contract for action users.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — PR expectations, release hygiene, and how to collaborate with maintainers.
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — behavioral expectations for every interaction.

## Instructional docs

- Source of truth for runtime logic lives under [`src/`](./src). Tests mirror the same structure under [`src/**/*.test.ts`](./src).
- GitHub Action fixtures and sample compose files live under [`test/`](./test). Use them when reproducing CI flows locally.
- Build artifacts belong in `dist/`. Never edit generated files by hand; instead update the matching TypeScript source and rerun the packaging commands described below.

## High-level rules (mandatory)

- Favor small, reviewable diffs. Coordinate large refactors with maintainers before starting.
- Keep behavior changes documented: update `README.md` and any affected workflow snippets.
- Never hardcode secrets, tokens, or personal data. Use GitHub Actions secrets or ask maintainers to provision them.
- Node 20+ is required. Match the tooling versions declared in `package.json`.

## Agent operational contract (when modifying code)

Before opening a PR or pushing a branch:

1. Read the relevant sections of `README.md` and inspect any affected files in `src/` and `test/`.
2. Implement changes in TypeScript source only; regenerate bundles with `npm run package` when shipping executable artifacts.
3. Run local validation limited to impacted areas at minimum:
   - `npm run lint` (or `npm run lint:ci` when you need JSON output for CI).
   - `npm run build` (type-check only).
   - `npm run test` for quick feedback; `npm run test:ci` to reproduce CI (coverage + serial runs).
4. For action behavior changes, exercise the representative workflow under `test/` (e.g., `test/docker-compose.yml`) to confirm compose invocations behave as expected.
5. Add or update unit tests alongside any new logic, covering at least the happy path plus one failure or edge scenario.
6. Keep commits self-contained and use conventional commit messages compatible with `@commitlint/config-conventional`.

When opening a PR:

- Target a feature branch off `main`.
- Describe intent, touched areas, and the manual + automated test plan.
- Reference the docs you followed (for example: "Validated against readme > Usage" or "Followed CONTRIBUTING.md".).
- Ensure CI (lint, build, tests, package) is green before requesting human review.

## Validation & quality gates

- **Build:** `npm run build` must succeed (TypeScript compile cleanly, no `tsc` errors).
- **Lint:** `npm run lint:ci` must pass with no new warnings. Attach `eslint-report.json` to CI artifacts when relevant.
- **Tests:** `npm run test:ci` must pass and update coverage artifacts (see `coverage/`).
- **Bundle:** `npm run package` must regenerate `dist/` outputs; include updated bundles in the PR if runtime code changed.

## Allowed agent actions (examples)

- Fix documentation, typos, or metadata referenced by the GitHub Marketplace listing.
- Add or update unit tests, mocks, and fixtures in `src/` or `test/`.
- Refactor TypeScript modules in small, behavior-preserving increments (with tests and package outputs refreshed).
- Adjust CI/workflow helpers under `test/` to improve local reproducibility.

## Disallowed actions (must not do)

- Do not commit generated `dist/` artifacts without updating the corresponding TypeScript source and documenting the command used.
- Do not introduce new runtime dependencies without maintainer approval; prefer built-in Node APIs or existing deps.
- Do not modify Dockerfiles or GitHub Actions workflows to add secrets, credentials, or privileged steps.
- Do not land breaking changes to the public action inputs/outputs without updating `README.md` and gaining explicit maintainer sign-off.

## Guidance summary (quick checklist)

1. Read `README.md` + relevant source/test files.
2. Make the minimal change; add tests.
3. Run `npm run lint`, `npm run build`, `npm run test:ci`, and `npm run package`.
4. Open a PR referencing the docs you followed and include the test plan.

## If uncertain

Open an issue or draft PR in this repository describing the scenario, what docs you read, and the question you still have. Ping maintainers instead of guessing. When in doubt about the workflow contract, defer to the `README.md` and organization-wide AGENTS file.
