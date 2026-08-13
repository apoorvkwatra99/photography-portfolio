# Photography Portfolio — Project Memory

## What This Is

A personal photography portfolio website featuring nature and travel photos from the past several years. Photos are browsable by trip, place, and time period. The site includes AI-powered features: AI-assisted tagging (human-reviewed) and natural language search via image embeddings, plus similar-photo recommendations.

Captions are written by hand, not AI-generated — they're personal/curatorial text and not something to automate.

This is a real project, not a tutorial. Build for clarity and maintainability, not speed.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Image hosting | Cloudinary |
| AI features | Anthropic API (claude-sonnet-4-6) |
| Embeddings / search | Voyage AI (voyage-multimodal-3) |
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
│       └── page.tsx        # Natural language search page (Phase 4)
├── components/             # Reusable UI components
│   ├── PhotoCard.tsx
│   ├── PhotoGrid.tsx
│   ├── FilterBar.tsx
│   ├── SearchBar.tsx       # (Phase 4)
│   └── SimilarPhotos.tsx   # (Phase 4)
├── data/
│   └── photos.ts           # Source of truth for photo metadata (Phase 1-2)
├── lib/
│   ├── cloudinary.ts       # Cloudinary helpers
│   ├── anthropic.ts        # Anthropic API client (tagging)
│   └── embeddings.ts       # Voyage embedding + search logic (Phase 4)
├── public/                 # Static assets, placeholder images
├── scripts/                # One-off data processing scripts (Phase 3+)
│   ├── generate-tags.ts
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
  id: string;                  // unique slug, e.g. "berlin-2023-001"
  title: string;                // human-readable title
  src: string;                  // Cloudinary URL (or /public path during dev)
  alt: string;                  // accessibility description
  country: string;              // country slug, e.g. "germany" — primary grouping for "All Photos" tab
  countryLabel: string;         // human label, e.g. "Germany"
  place: string;                // place slug, e.g. "berlin" — granular location within country
  placeLabel: string;           // human label, e.g. "Berlin"
  trip: string;                 // trip/visit slug, e.g. "berlin-2023" — used for sub-grouping and filters, not primary nav
  tripLabel: string;            // human label, e.g. "Berlin, Spring 2023"
  dateTaken: string;            // ISO 8601, e.g. "2023-11-14"
  tags: string[];               // AI-suggested, human-reviewed tags, e.g. ["mountains", "snow", "sunrise"]
  caption?: string;             // hand-written by me, optional, never AI-generated
  featured?: boolean;           // manually curated — true shows on homepage favorites grid
  embedding?: number[];         // image embedding for search (Phase 4, omit until needed)
  needsReembedding?: boolean;   // set true if photo is re-edited after embedding; rerun script for this id
};
```

### Sample data (`data/photos.ts`)

During Phase 1, populate this file manually with 6–10 real or placeholder photos. Use `/public` paths for images until Cloudinary is integrated.

```typescript
import { Photo } from "@/types";

export const photos: Photo[] = [
  {
    id: "berlin-2023-001",
    title: "Spree at Dusk",
    src: "/placeholder.jpg",
    alt: "The Spree river in Berlin at dusk with city lights reflecting on the water",
    country: "germany",
    countryLabel: "Germany",
    place: "berlin",
    placeLabel: "Berlin",
    trip: "berlin-2023",
    tripLabel: "Berlin, Spring 2023",
    dateTaken: "2023-04-14",
    tags: ["city", "river", "dusk", "germany"],
    featured: true,
  },
  // ... more photos
];
```

---

## Build Phases

Work through these phases in order. Do not skip ahead or combine phases.

### Phase 1 — Static site with mock data ✅ complete
- Homepage: responsive photo grid
- Filter bar: filter by trip, place, and date range (client-side, no API calls)
- Individual trip page: `/trips/[slug]`
- Data source: hardcoded `data/photos.ts`
- No Cloudinary, no AI, no search yet

### Phase 2 — Cloudinary integration ✅ complete
- Replace `/public` image paths with real Cloudinary URLs
- Use `next/image` with Cloudinary loader for optimized delivery
- Upload a real batch of photos, update `data/photos.ts` with real URLs

### Photo curation (between Phase 2 and Phase 3 — manual, not code)
- Select and edit the final ~80 photos before starting Phase 3
- Upload final edited versions to Cloudinary — Phase 3 and 4 both operate on actual image content, so this must happen before either script runs
- If a photo is re-edited after Phase 3/4 have already run on it, set `needsReembedding: true` and rerun both scripts for that photo's id only — re-running is cheap (seconds, near-zero cost), but redoing all 80 unnecessarily is wasted effort

### Phase 3 — AI-assisted tagging
- Add a script (`scripts/generate-tags.ts`) that:
  - Reads `data/photos.ts`
  - For each photo, calls the Anthropic API with the image and a controlled tag vocabulary, asking for suggested tags
  - Writes suggested tags back to the data file for manual review (do not auto-accept — I review and edit every photo's tags before committing)
- Tags are stored in `data/photos.ts` as the `tags` field
- Captions are NOT generated by this script — I write captions by hand, separately, at my own pace
- Goal: every photo has accurate, consistent tags that support both the filter bar and Phase 4 search/recs

### Phase 4 — Image embeddings: search + similar-photo recommendations
- Add a script (`scripts/generate-embeddings.ts`) that:
  - For each photo, fetches the actual image (from Cloudinary) and sends it to Voyage AI's multimodal embedding model (voyage-multimodal-3)
  - Stores the resulting vector as the `embedding` field in `data/photos.ts`
  - Embeddings are generated from image content directly — not from text metadata
- Search page (`/search`): user types a natural language query, query is embedded via Voyage AI (text input, same multimodal model/vector space), cosine similarity is computed against all photo image embeddings, top results are returned
- Similar-photo recommendations: reuse the same photo embeddings for photo-to-photo cosine similarity ("more like this" on photo cards / trip pages) — build this after search is working, since it's the same underlying vectors
- Start with in-memory similarity — no external vector database needed at this scale
- If the photo collection grows large (500+), consider migrating to Supabase pgvector, but do not add this complexity upfront

### UI polish — after Phase 3 and 4 are functionally complete
- Refine layout, typography, spacing, transitions to match the intended gallery-focused feel
- Do this only once tagging, search, and recs are working end-to-end — don't polish UI around features that don't exist yet

### Stretch goal — print sales (not scoped yet, target window: ~Nov, ahead of holiday calendar sales)
- Out of scope for the current build. Revisit only after core phases and UI polish are done.
- Will require real e-commerce scope: product/size selection, payment integration (e.g. Stripe), and fulfillment (e.g. Printful/Prodigi API or manual handling) — not a simple page addition
- Main planned product: an annual travel calendar using photos from the past 12 months — treat as a separate, later planning effort, not part of this CLAUDE.md's phases

---

## Navigation & Site Structure

- **Homepage**: curated favorites grid only — photos manually marked `featured: true`. Not auto-selected; this is a curatorial decision made by hand, same as captions.
- **All Photos tab** (`/photos` or similar): organized primarily by `country`, with `place` as a sub-level within each country. A visitor browsing "Hungary" sees all Hungary photos regardless of which trip/year they're from.
- **Trip/date** stays available as metadata and filter-bar input (e.g. "Berlin, Spring 2023" vs "Berlin, Fall 2024") but is not the primary navigation axis — multiple visits to the same place should collapse under that place, not fragment the browsing experience by trip.
- Individual trip pages (`/trips/[slug]`) from Phase 1 can remain as a secondary/filtered view if useful, but country/place browsing is the primary path.

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
- All Voyage API calls go through `lib/embeddings.ts` — never call the API directly from a component
- Never expose API keys client-side; all AI calls happen server-side or in scripts

### Git
- Commit after each phase milestone before starting the next
- Descriptive commit messages: "Add Phase 3 AI-assisted tagging script"

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

## My Trips (reference for tagging and mock data)

Use `country` as the primary grouping (for the All Photos tab) and `place` for granular locations within a country. `trip` captures a specific visit/date range — the same country can have multiple trips across different years.

| Country | Notes |
|---|---|
| Germany | Lived in Berlin for 2.5 years — many photos are everyday Berlin life, not just trips. See camera-era note below. |
| Switzerland | |
| Czech Republic | |
| Austria | |
| Slovakia | |
| Hungary | |
| Portugal | |
| Netherlands | |
| Belgium | |
| Italy | |
| Norway | |
| Estonia | |
| Finland | |
| Latvia | |
| Poland | |
| USA | |
| Georgia | |
| Spain | |
| France | |
| Scotland | |
| England | |
| Slovenia | Part of Balkans travel — tag with its own country, not a generic "Balkans" bucket |
| Croatia | Part of Balkans travel |
| Bosnia and Herzegovina | Part of Balkans travel |
| Montenegro | Part of Balkans travel |
| Albania | Part of Balkans travel |
| India | |
| Thailand | |
| Laos | |
| Cambodia | |
| Vietnam | |
| Japan | |
| Nepal | |

### Camera era note (Germany period specifically)
During the Berlin years, the camera used shifted over time — relevant for editing effort and possibly worth a `camera` field later if useful for filtering or display:
- Earliest photos: iPhone
- Middle period: Canon EOS 5D (not all shot in RAW)
- Most recent: Ricoh GR III, shot manually (not all shot in RAW either)

RAW photos have the most edit headroom, but JPEG/iPhone photos are still meaningfully editable (crop, color grade, contrast/exposure within limits) — don't exclude non-RAW shots from curation by default, just expect lower edit ceiling and faster per-photo edit time on those.

---

## What Not To Do

- Do not use the Pages Router
- Do not install a UI component library (shadcn, MUI, Chakra) — use Tailwind
- Do not use a vector database for Phase 4 — start with in-memory similarity; only introduce Supabase pgvector if explicitly asked
- Do not add `embedding` fields to `data/photos.ts` until Phase 4 begins
- Do not auto-generate captions — captions are written by hand
- Do not auto-accept AI-suggested tags without review
- Do not make API calls from client components
- Do not create deeply nested component hierarchies for simple layouts
- Do not add authentication — this is a public portfolio
- Do not build print sales / e-commerce features until explicitly scoped later