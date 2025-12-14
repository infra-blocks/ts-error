# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-12-14

### Added

- `has` flavors for `findCause` and `findCauseByType`: `hasCause` and `hasCauseByType`.
Unlike their `find` homologous, the `has` functions simply test for a match and return a boolean.
This is to shorten `findCause(...) != null` to `hasCause(...)` when the return is not used.

## [0.1.0] - 2025-12-06

### Added

- `findCause` and `findCauseByType`

[0.2.0]: https://github.com/infra-blocks/ts-error/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/infra-blocks/ts-error/releases/tag/v0.1.0
