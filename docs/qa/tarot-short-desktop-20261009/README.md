# Short desktop viewport correction

External Preview QA found the primary Shuffle action below the first fold at 1165×757. Before this fix the button started at y=794px, also outside 1280×720.

A tarot-only desktop breakpoint at heights up to 800px compresses the header, empty positions and stage spacing. The center card remains 166×286px, with a ~540px fan. Shuffle now starts at y=615px and ends at y=663px. Three revealed cards and the Place action also fit in the same short viewport. A local gradient behind the left text strengthens contrast without darkening the full scene. No card logic, route, content or backend changed.

Production build and types pass. The expanded scene suite passes all 28 locale/viewport cases: four languages at 360×800, 390×844, 430×932, 1165×757, 1280×720, 1440×860 and 1440×900. It checks the entire fan and primary action inside the first viewport, actual exposed-card selection, three unique cards, and reduced-motion behavior. Both short desktop cases additionally check all three revealed cards and the Place action after returning to scroll position zero.

The prior full content, history, spread and free-table evidence remains in `../tarot-scene-20261009/`. This is a Preview-only correction; production is unchanged.
