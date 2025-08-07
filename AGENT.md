# AGENT.md - MillionZap Development Guide

## Commands
- **Dev**: `npm run dev` or `pnpm dev` - Start development server
- **Build**: `npm run build` or `pnpm build` - TypeScript check + Vite build
- **Lint**: `npm run lint` or `pnpm lint` - ESLint check
- **Preview**: `npm run preview` or `pnpm preview` - Preview built app
- **Type Check**: `tsc -b` - TypeScript compilation check only

## Architecture
- **Framework**: React 19 + Vite + TypeScript
- **Routing**: React Router DOM v7
- **State**: TanStack Query for server state, React Hook Form for forms
- **UI**: Radix UI primitives + shadcn/ui components + Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation + zodResolver
- **Animations**: Framer Motion
- **Real-time**: Socket.IO client ready

## Code Style
- **Imports**: Use `@/` alias for src imports
- **Components**: PascalCase, exported as named exports
- **Files**: kebab-case for files, components in `/components`, pages in `/pages`
- **Forms**: Use React Hook Form + Zod schemas from `/validations`
- **Styling**: Tailwind classes, use `clsx` for conditional classes
- **Types**: Define interfaces in `/interfaces`, enums in `/enums`
- **Formatting**: Prettier with Tailwind plugin (configured in .prettierrc)
