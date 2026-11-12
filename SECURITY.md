# Security policy

## Reporting a vulnerability

Please do **not** open a public issue for security problems.

Report it privately through GitHub: **Security → Report a vulnerability** on this repository (private vulnerability reporting). Include what you found, how to reproduce it, and the affected version or commit.

You'll get an acknowledgement within 7 days. Fixes are released as soon as they're ready, and reporters are credited unless they ask not to be.

## Scope

Kiln is a client-side React component library. Relevant issues include XSS through component props or rendered content (for example the rich text editor or markdown/code rendering), unsafe URL handling in links, and vulnerable dependencies.
