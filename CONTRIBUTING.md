# Contributing

Thanks for helping. Kiln's rules are in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) and its prop conventions in [`docs/API.md`](docs/API.md); a pull request that breaks them won't be merged.

## Branches

- `main` is the next release. It only changes through pull requests that pass CI. Nothing deploys on merge: publishing a GitHub release (tag `vX.Y.Z`, matching `packages/kiln/package.json`) publishes the npm package and deploys the site, with its copy-in registry and installer, from the same tag. So npm and the CLI always ship the same library, and CI checks it (`npm run check:parity`).
- `dev` is the working branch. It's rebase-merged into `main`, so every commit lands as written, and then deleted. Start each round fresh:

```bash
git fetch origin
git switch -C dev origin/main
git push -u origin dev
```

## Changelog

A change people would notice (a component, a prop, a fix, a behaviour) gets a line under `## [Unreleased]` in [`CHANGELOG.md`](CHANGELOG.md), in the same pull request, under Added, Changed, Deprecated, Removed, Fixed or Security. The gallery's What's new page reads that file. To release, rename `[Unreleased]` to the new version and date, add an empty `[Unreleased]` above it, update the compare links at the foot, bump `packages/kiln/package.json`, then publish the GitHub release.

## Commits

Keep every commit atomic: one logical change, with a message that says what it changes. A fix, a feature and a docs update are three commits, not one.

## Before opening a pull request

```bash
npm ci
npm run lint
npm run build
npm run build:lib
```

Then check your change in a real browser, in light and dark, at desktop width and at 390px.

## Reporting

Bugs and feature requests: use the issue forms. Security problems: report them privately (see [`SECURITY.md`](SECURITY.md)).
