# v1.1.0 Release Notes

## 🎨 Design System Refactor

### New Branding

- **Color Palette**: Introduced "Friendly Green" theme with Mint (#74c69d) and Emerald (#059669)
- **Typography**: Updated to DM Sans (primary) and Permanent Marker (script/accent)
- **Semantic Classes**: Replaced all hardcoded colors with semantic Tailwind classes (primary, secondary, accent)

### Landing Page Updates

- ✨ Refactored all components: Hero, Features, Pricing, GetStarted, Footer, Header
- 🎯 Consistent branding with new color palette
- 🎸 Playful logo with 3° rotation
- 🌈 Improved visual hierarchy and spacing

### Dashboard Redesign

- 📊 **Dashboard Page**: Cleaner 3-column stats grid, improved empty states with CTAs
- 📚 **Tones List**: Modern 3-column responsive grid layout with hover effects
- 🎵 **Tone Cards**: Enhanced with music icon badges, guitar/artist info, smooth transitions
- 📝 **Tone Detail**: Better 2-column layout with sticky AI notes sidebar, back navigation
- 🔢 **Live Tone Count**: Dynamic sidebar badge showing real-time tone count
- 🍞 **Dynamic Breadcrumbs**: Context-aware navigation in dashboard header

### Form Improvements

- 📋 **Create Tone Form**: Simplified clean form with all necessary fields
- ✅ Required field indicators with asterisks
- 🎛️ Pickups dropdown and string gauge input
- 🎨 Consistent with new design system

### Technical Improvements

- 🏗️ Created server action for fetching tone counts (`lib/actions/tones.ts`)
- 🔧 Installed Shadcn components: Breadcrumb, Textarea
- 🎯 Logo consistency between landing header and dashboard sidebar
- 🧹 Code cleanup and lint fixes

## Breaking Changes

None - all changes are visual/UI improvements

## Migration Notes

No migration required - this is a visual refresh

---

**Full Changelog**: Compare v1.0.0...v1.1.0
