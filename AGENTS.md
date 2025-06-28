# Agent Development Guidelines

## Build Commands
- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production with Turbo  
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix linting issues
- `pnpm typecheck` - TypeScript type checking
- `pnpm check` - Combined lint + typecheck
- `pnpm format:check` - Check Prettier formatting
- `pnpm format:write` - Fix formatting

## Code Style
- **TypeScript**: Strict mode enabled, prefer type imports with `import { type Foo }`
- **Imports**: Use `~/*` for src paths, `@/*` for root, `#env` for env, `#flags` for flags
- **Formatting**: 2 spaces, no tabs, Prettier with Tailwind plugin
- **Components**: React.forwardRef pattern, export interfaces, use `cn()` for className merging
- **File naming**: camelCase for components, kebab-case for routes
- **Error handling**: Use neverthrow library for Result types

## Testing
- No test framework currently configured

## Database
- `pnpm db:push` - Push schema changes
- `pnpm db:migrate:dev` - Create/apply migrations in dev
- `pnpm db:studio` - Open Prisma Studio