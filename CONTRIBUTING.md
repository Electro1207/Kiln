# Contributing

Thanks for helping. Kiln's rules are in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) and its prop conventions in [`docs/API.md`](docs/API.md); a pull request that breaks them won't be merged.

## Branches

- `main` is what's live. Every merge to `main` is built and deployed. It only changes through pull requests that pass CI.
- `dev` is the working branch. It's squash-merged into `main` and then deleted, so start each round fresh:

```bash
git fetch origin
git switch -C dev origin/main
git push -u origin dev
```

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
