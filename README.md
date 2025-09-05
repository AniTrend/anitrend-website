# AniTrend Website

A modern landing website for the AniTrend anime tracking ecosystem, built with Next.js 15 and shadcn/ui components.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with App Router & Turbopack
- **UI Components**: shadcn/ui with Tailwind CSS
- **Typography**: Space Grotesk (headlines) & Inter (body)
- **Deployment**: Firebase App Hosting
- **Development**: TypeScript, ESLint, Yarn

## 🚀 Tech Stack

- **Frontend**: Next.js 15 with App Router & Turbopack
- **AI Framework**: Google Genkit with Gemini 2.0 Flash
- **UI Components**: shadcn/ui with Tailwind CSS
- **Typography**: Space Grotesk (headlines) & Inter (body)
- **Data Source**: MyAnimeList via Jikan API
- **Deployment**: Firebase App Hosting
- **Development**: TypeScript, ESLint, Yarn

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/AniTrend/anitrend-website.git
cd anitrend-website
```

2. Install dependencies:

```bash
yarn install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
yarn dev
```

Visit [http://localhost:9002](http://localhost:9002) to see the application.

## 📜 Development Commands

```bash
yarn dev    # Start Next.js dev server on port 9002
yarn build  # Production build
yarn start  # Start production server
yarn typecheck  # TypeScript validation
yarn lint   # ESLint code checking
```

## 🏗️ Architecture

### Project Structure

- **`src/app/`** - Next.js App Router pages and layouts
- **`src/components/`** - Reusable UI components
- **`src/lib/`** - Utilities, types, and service integrations
- **`public/`** - Static assets and app icons

### Key Routing

- `/` - Landing page with marketing sections
- `/discover` - Server-rendered anime grid with client-side interactivity
- `/recommend` - AI-powered recommendation interface
- `/anime/[id]` - Dynamic anime detail pages
- Deep linking: `app.anitrend://action/anime/{id}` for mobile app

<!-- External integrations handled via services; Jikan API integration in code under src/lib/anime-service -->

## 🚢 Deployment

The project is configured for Firebase App Hosting with automatic builds:

- **Configuration**: `apphosting.yaml`
- **Build**: Automatic from repository pushes
- **Environment**: Single instance deployment

## 🎨 Design System

- **Theme**: Dark mode with purple primary (`#BB86FC`) and teal accents
- **Components**: shadcn/ui with custom AniTrend styling
- **Responsive**: Mobile-first approach with container-based layouts
- **Images**: Optimized Next.js Image component with configured domains

## 🤝 Contributing

We follow strict commit and branch naming conventions enforced by Husky hooks and commitlint:

- **Branch names** must match: `type/description` (e.g., `feat/add-login`, `fix/bug-fix`)
  - Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
  - See [`.github/branch-lint.sh`](.github/branch-lint.sh) and `.husky/pre-push` for enforcement
- **Commit messages** must follow Conventional Commits:
  - See `commitlint.config.js` for rules (type(scope?): subject)

Examples:

```bash
# Start a new feature branch
git checkout -b feat/user-authentication

# Commit changes
git add .
git commit -m "feat(auth): add user login flow"
```

## 📄 License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See [`LICENSE`](LICENSE) for full details.
