@AGENTS.md

# Photography Portfolio — Project Memory

## What This Is

A personal photography portfolio website featuring nature and travel photos from the past several years. Photos are browsable by trip, place, and time period. The site will evolve to include AI-powered features: auto-generated captions and natural language search via embeddings.

This is a real project, not a tutorial. Build for clarity and maintainability, not speed.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Image hosting | Cloudinary |
| AI features | Anthropic API (claude-sonnet-4-6) |
| Embeddings / search | Voyage AI (voyage-3) |
| Deployment | Vercel |
| Language | TypeScript throughout |

---

## Project Structure

```
photography-portfolio/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage / gallery grid
│   ├── trips/
│   │   └── [slug]/page.tsx # Individual trip view
│   └── search/
│       └── page.tsx        # Natural language search page (Phase 3)
├── components/             # Reusable UI components
│   ├── PhotoCard.tsx
│   ├── PhotoGrid.tsx
│   ├── FilterBar.tsx
│   └── SearchBar.tsx       # (Phase 3)
├── data/
│   └── photos.ts           # Source of truth for photo metadata (Phase 1-2)
├── lib/
│   ├── cloudinary.ts       # Cloudinary helpers
│   ├── anthropic.ts        # Anthropic API client
│   └── embeddings.ts       # Embedding + search logic (Phase 3)
├── public/                 # Static assets, placeholder images
├── scripts/                # One-off data processing scripts (Phase 3+)
│   ├── generate-captions.ts
│   └── generate-embeddings.ts
├── types/
│   └── index.ts            # Shared TypeScript types
└── CLAUDE.md               # This file
```

---

## Data Model

Photos use a **flat metadata approach** — every photo is an object in a single list. Multiple views (by trip, by place, by date) are built as filters on top of this flat list. Do not use nested folder structures or nested data hierarchies.

### Photo type (`types/index.ts`)

```typescript
export type Photo = {
  id: string;                  // unique slug, e.g. "patagonia-2023-001"
  title: string;               // human-readable title
  src: string;                 // Cloudinary URL (or /public path during dev)
  alt: string;                 // accessibility description
  trip: string;                // trip name slug, e.g. "patagonia-2023"
  tripLabel: string;           // human label, e.g. "Patagonia 2023"
  place: string;               // place slug, e.g. "torres-del-paine"
  placeLabel: string;          // human label, e.g. "Torres del Paine"
  dateTaken: string;           // ISO 8601, e.g. "2023-11-14"
  tags: string[];              // descriptive tags, e.g. ["mountains", "snow", "sunrise"]
  caption?: string;            // AI-generated or manually written (optional)
  embedding?: number[];        // vector embedding for search (Phase 3, omit until needed)
};
```

### Sample data (`data/photos.ts`)

During Phase 1, populate this file manually with 6–10 real or placeholder photos. Use `/public` paths for images until Cloudinary is integrated.

```typescript
import { Photo } from "@/types";

export const photos: Photo[] = [
  {
    id: "patagonia-2023-001",
    title: "Towers at Dawn",
    src: "/placeholder.jpg",
    alt: "The three towers of Torres del Paine at sunrise with pink sky",
    trip: "patagonia-2023",
    tripLabel: "Patagonia 2023",
    place: "torres-del-paine",
    placeLabel: "Torres del Paine",
    dateTaken: "2023-11-14",
    tags: ["mountains", "sunrise", "patagonia"],
  },
  // ... more photos
];
```

---

## Build Phases

Work through these phases in order. Do not skip ahead or combine phases.

### Phase 1 — Static site with mock data
- Homepage: responsive photo grid
- Filter bar: filter by trip, place, and date range (client-side, no API calls)
- Individual trip page: `/trips/[slug]`
- Data source: hardcoded `data/photos.ts`
- No Cloudinary, no AI, no search yet
- Goal: a working, browsable site with real layout decisions made

### Phase 2 — Cloudinary integration
- Replace `/public` image paths with real Cloudinary URLs
- Use `next/image` with Cloudinary loader for optimized delivery
- Upload a real batch of photos, update `data/photos.ts` with real URLs
- Goal: real photos loading fast

### Phase 3 — AI captions
- Add a script (`scripts/generate-captions.ts`) that:
  - Reads `data/photos.ts`
  - For each photo without a caption, calls Anthropic API with the image URL
  - Writes the caption back to the data file
- Captions are stored in `data/photos.ts` as the `caption` field
- Display captions on photo cards and trip pages
- Goal: every photo has a human-readable AI caption

### Phase 4 — Natural language search
- Add a script (`scripts/generate-embeddings.ts`) that:
  - For each photo, creates a text blob from title + place + tags + caption
  - Calls Voyage AI API (voyage-3) to generate a vector embedding
  - Stores the vector as the `embedding` field in `data/photos.ts`
- Search page (`/search`): user types a natural language query, query is embedded via Voyage AI, cosine similarity is computed against all photo embeddings, top results are returned
- Start with in-memory similarity — no external vector database needed at this scale
- If the photo collection grows large (500+), consider migrating to Supabase pgvector, but do not add this complexity upfront
- Goal: "show me snowy mountains at sunrise" returns the right photos

---

## Conventions

### General
- TypeScript everywhere — no `any` types
- Use `@/` path aliases throughout (already configured in `tsconfig.json`)
- Keep components small and single-purpose
- No unnecessary dependencies — check if something is already achievable with Next.js/React before installing a package

### Next.js
- Use the **App Router** only — never the Pages Router
- Server components by default; add `"use client"` only when interactivity requires it
- Use `next/image` for all images (automatic optimization)
- Environment variables: prefix with `NEXT_PUBLIC_` only if needed on the client

### Styling
- Tailwind CSS only — no CSS modules, no styled-components, no inline styles
- Design feel: minimal and gallery-focused — photos should dominate, UI should recede
- Dark mode support is optional for now; don't build it unless asked

### API calls
- All Anthropic API calls go through `lib/anthropic.ts` — never call the API directly from a component
- Never expose API keys client-side; all AI calls happen server-side or in scripts

### Git
- Commit after each phase milestone before starting the next
- Descriptive commit messages: "Add Phase 1 static grid and filter bar"

---

## Environment Variables

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
```

These live in `.env.local` and are never committed to git. A `.env.example` with empty values should exist in the repo.

---

## My Trips (reference for mock data)

Use these when generating placeholder photo data. All trips are nature-focused.

| Trip | Region | Example places |
|---|---|---|
| Europe — Alps / Dolomites | Europe | Dolomites (Italy), Swiss Alps |
| Europe — Scotland / Iceland | Europe | Scottish Highlands, Iceland landscapes |
| Southeast Asia | SE Asia | Vietnam, Thailand, possibly Borneo |
| Nepal | South Asia | Himalayas, Annapurna region, Everest base camp area |
| Japan | East Asia | Japanese Alps, forests, Mt. Fuji area |

When generating mock photos, draw names, places, and tags from this list rather than inventing generic locations. Approximate dates are fine — assign plausible years and seasons per region.

---

## What Not To Do

- Do not use the Pages Router
- Do not install a UI component library (shadcn, MUI, Chakra) — use Tailwind
- Do not use a vector database for Phase 4 — start with in-memory similarity; only introduce Supabase pgvector if explicitly asked
- Do not add `embedding` fields to `data/photos.ts` until Phase 4 begins
- Do not make API calls from client components
- Do not create deeply nested component hierarchies for simple layouts
- Do not add authentication — this is a public portfolio