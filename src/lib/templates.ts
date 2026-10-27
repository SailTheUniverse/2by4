// Starter projects shoppers can load into an empty list. Quantities are rough
// takeoffs for a typical build, meant as a starting point.

export interface ProjectTemplate {
  key: string;
  name: string;
  description: string;
  items: { slug: string; quantity: number }[];
}

export const TEMPLATES: ProjectTemplate[] = [
  {
    key: "shed-framing",
    name: "8×10 shed framing",
    description: "Floor, walls and roof framing for a basic 8×10 shed.",
    items: [
      { slug: "4x4-x-8-ft-pressure-treated-ground-contact-southern-yellow-pine-lumber", quantity: 3 },
      { slug: "2x6-x-8-ft-pressure-treated-ground-contact-southern-yellow-pine-lumber", quantity: 9 },
      { slug: "2x4-x-8-ft-stud-spf-lumber", quantity: 42 },
      { slug: "2x6-x-12-ft-2-and-better-spf-lumber", quantity: 8 },
      { slug: "23-32-in-x-4-ft-x-8-ft-cdx-plywood", quantity: 3 },
      { slug: "7-16-in-x-4-ft-x-8-ft-osb-sheathing-panel", quantity: 16 },
      { slug: "paslode-3-1-4-in-30-paper-tape-framing-nails-2-000-ct", quantity: 1 },
    ],
  },
  {
    key: "drywall-room",
    name: "Drywall a 12×12 room",
    description: "Hang and finish walls and ceiling with 8 ft ceilings.",
    items: [
      { slug: "usg-sheetrock-1-2-in-x-4-ft-x-8-ft-ultralight-drywall-panel", quantity: 18 },
      { slug: "grip-rite-6-x-1-1-4-in-coarse-thread-drywall-screws-5-lb-approx-1-500-ct", quantity: 1 },
      { slug: "usg-sheetrock-all-purpose-pre-mixed-joint-compound-4-5-gal", quantity: 2 },
      { slug: "usg-sheetrock-paper-joint-tape-2-1-16-in-x-500-ft", quantity: 1 },
      { slug: "clarkdietrich-1-1-4-in-x-8-ft-metal-drywall-corner-bead", quantity: 4 },
    ],
  },
  {
    key: "kitchen-circuit",
    name: "New 20 A kitchen circuit",
    description: "Run a dedicated 20 A countertop circuit with GFCI protection.",
    items: [
      { slug: "southwire-12-2-nm-b-romex-style-wire-with-ground-100-ft", quantity: 1 },
      { slug: "square-d-homeline-20-amp-single-pole-circuit-breaker", quantity: 1 },
      { slug: "leviton-20-amp-self-test-gfci-outlet-white", quantity: 1 },
      { slug: "leviton-20-amp-tamper-resistant-duplex-outlet-white-10-pack", quantity: 1 },
    ],
  },
  {
    key: "fence-posts",
    name: "Set 10 fence posts",
    description: "Pressure-treated posts set in fast-setting concrete.",
    items: [
      { slug: "4x4-x-8-ft-pressure-treated-ground-contact-southern-yellow-pine-lumber", quantity: 10 },
      { slug: "quikrete-50-lb-fast-setting-concrete-mix", quantity: 20 },
      { slug: "grip-rite-16d-3-1-2-in-hot-dip-galvanized-nails-5-lb-approx-230-ct", quantity: 1 },
    ],
  },
];
