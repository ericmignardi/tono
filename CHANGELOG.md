# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-11-25

### Added

- **AI-Powered Tone Generation**: Natural language tone requests powered by OpenAI GPT-4o
- **User Authentication**: Secure sign-up/sign-in with Clerk integration
- **Tone Library**: Save, manage, and search generated tones
- **Subscription System**: Free and Pro tiers with Stripe integration
- **Credit System**: Usage limits based on subscription tier
- **Rate Limiting**: API protection with Upstash Redis
- **Responsive Dashboard**: Mobile-first design with Tailwind CSS
- **Comprehensive Testing**: 146 unit/integration tests + E2E critical flows
- **Error Handling**: Global 404 and error pages
- **CI/CD Pipeline**: GitHub Actions for automated testing
- **Documentation**: Complete README, CONTRIBUTING, and CHANGELOG

### Changed

- Updated branding to lowercase "tono" throughout application
- Improved database cleanup logic for integration tests
- Enhanced error messages and user feedback

### Fixed

- Integration test database constraint violations
- Test helper file organization
- Import path consistency across components

## [0.1.0] - 2025-11-24

### Added

- Initial professional release baseline.
- Basic application structure with Next.js, Prisma, and Clerk.
- Tone generation and saving functionality.
