# Contributing to Tono

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to Tono. These are mostly guidelines, not rules. Use your best judgment and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Tono. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples** to demonstrate the steps.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Tono, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Explain why this enhancement would be useful** to most Tono users.

## Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript / TypeScript Styleguide

- All JavaScript must adhere to [Prettier](https://prettier.io/) Standard Style.
- Run `npm run lint` before committing to ensure your code is clean.

## Development Workflow

1.  Clone the repo: `git clone https://github.com/ericmignardi/tono.git`
2.  Install dependencies: `npm install`
3.  Create a branch: `git checkout -b my-feature-branch`
4.  Make your changes and commit them: `git commit -m 'feat: add some feature'`
5.  Push to the original branch: `git push origin my-feature-branch`
6.  Create the pull request.

## Testing

- Run `npm run test` to run the test suite.
- Run `npm run test:e2e` for end-to-end tests.
