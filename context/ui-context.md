# UI Context

## Theme

Luxe Heritage — a warm, elegant visual language inspired by high-jewelry craftsmanship. Light ivory backgrounds with rich gold accents, serif headlines for timeless sophistication, and clean sans-serif body text for readability. The design emphasizes generous whitespace, subtle motion, and premium material surfaces.

## Colors

All components must use these tokens — no hardcoded hex values.

| Role            | CSS Variable       | Value     |
| --------------- | ------------------ | --------- |
| Page background | `--bg-base`        | `#fff8ef` |
| Surface         | `--bg-surface`     | `#fff8ef` |
| Surface low     | `--bg-surface-low` | `#f3ede4` |
| Surface dim     | `--bg-surface-dim` | `#dfd9d0` |
| Primary text    | `--text-primary`   | `#1d1b16` |
| Muted text      | `--text-muted`     | `#4e453a` |
| Primary accent  | `--accent-primary` | `#C9A44A` |
| Accent warm     | `--accent-warm`    | `#e9c088` |
| Border          | `--border-default` | `#807569` |
| Error           | `--state-error`    | `#ba1a1a` |
| White           | `--color-white`    | `#ffffff` |

Tailwind v4 theme aliases: `bg-background`, `bg-surface`, `bg-surface-low`, `bg-surface-dim`, `text-navy`, `text-on-surface-var`, `text-gold`, `border-outline`, etc.

## Typography

| Role      | Font                | Variable       |
| --------- | ------------------- | -------------- |
| Headlines | Cormorant Garamond  | `--font-headline` |
| Body / UI | Manrope             | `--font-body`     |
| Labels    | Manrope             | `--font-label`    |

Headlines use light to regular weights (300–400). Labels and buttons use uppercase tracking with tight letter-spacing.

## Border Radius

| Context           | Value    |
| ----------------- | -------- |
| Inline / small UI | `rounded-sm` |
| Cards / panels    | `rounded-lg` |
| Buttons / pills   | `rounded-full` |
| Modals / overlays | `rounded-xl` |

## Component Library

No external UI library (shadcn/ui, Material UI, etc.). All components are custom-built with Tailwind CSS v4 and stored in `app/components/`. Reuse existing patterns (ProductCard, HeroSlider, CampaignCarousel) before creating new ones.

## Layout Patterns

- **Homepage**: Full-viewport hero slider, followed by category grid, product sections, campaign carousel, and recently viewed
- **Product pages**: Single-column on mobile, split layout on desktop with image gallery and details
- **Admin**: Sidebar navigation with content panels, tables for CRUD, modals for forms
- **Modals**: Centered overlay with backdrop blur and warm ivory surface
- **Navbar**: Fixed top bar with announcement ticker, transparent-to-solid on scroll
- **Footer**: Multi-column layout with newsletter, links, and brand narrative

## Icons

- Lucide React for UI icons (stroke-based)
- `react-icons` for brand and social icons
- Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons
- Custom SVGs used sparingly for decorative arrows and accents
