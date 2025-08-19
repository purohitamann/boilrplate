# Technical Notes

## Environment Variables

- `BOILRPLATE_ACCESS_CODE`: Access code required to unlock AI-powered project generation. The CLI reads this value from the environment.
- `BACKEND_URL`: Base URL used for documentation and waitlist links. Configure this to point at the backend service.

The CLI now relies on these variables instead of hard-coded strings in `bin/index.js`.
