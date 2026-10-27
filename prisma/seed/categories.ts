import type { AttributeType } from "../../src/generated/prisma/enums";

export interface AttributeSeed {
  key: string;
  label: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
}

export interface CategorySeed {
  slug: string;
  name: string;
  icon?: string;
  children?: CategorySeed[];
  attributes?: AttributeSeed[];
}

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "electrical",
    name: "Electrical",
    icon: "⚡",
    children: [
      {
        slug: "wire",
        name: "Wire",
        attributes: [
          { key: "wireType", label: "Wire type", type: "ENUM", options: ["NM-B (Romex)", "UF-B", "THHN", "MC (Armored)"] },
          { key: "gauge", label: "Gauge", type: "ENUM", options: ["14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG"] },
          { key: "conductors", label: "Conductors", type: "ENUM", options: ["Single", "2 w/ ground", "3 w/ ground"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
          { key: "material", label: "Conductor", type: "ENUM", options: ["Copper", "Aluminum"] },
        ],
      },
      {
        slug: "breakers",
        name: "Circuit Breakers",
        attributes: [
          { key: "panelType", label: "Panel type", type: "ENUM", options: ["Homeline", "QO", "BR", "CH", "Siemens QP"] },
          { key: "amperage", label: "Amperage", type: "NUMBER", unit: "A" },
          { key: "poles", label: "Poles", type: "NUMBER" },
          { key: "protection", label: "Protection", type: "ENUM", options: ["Standard", "GFCI", "AFCI", "Dual Function"] },
        ],
      },
      {
        slug: "outlets-switches",
        name: "Outlets & Switches",
        attributes: [
          { key: "deviceType", label: "Device", type: "ENUM", options: ["Duplex Receptacle", "GFCI Receptacle", "USB Receptacle", "Single-Pole Switch", "3-Way Switch", "Dimmer"] },
          { key: "amperage", label: "Amperage", type: "NUMBER", unit: "A" },
          { key: "color", label: "Color", type: "ENUM", options: ["White", "Light Almond", "Black"] },
          { key: "packSize", label: "Pack size", type: "NUMBER" },
        ],
      },
    ],
  },
  {
    slug: "framing",
    name: "Framing & Lumber",
    icon: "🪵",
    children: [
      {
        slug: "dimensional-lumber",
        name: "Dimensional Lumber",
        attributes: [
          { key: "nominalSize", label: "Nominal size", type: "ENUM", options: ["2x4", "2x6", "2x8", "2x10", "2x12", "4x4"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
          { key: "treatment", label: "Treatment", type: "ENUM", options: ["Untreated", "Pressure Treated"] },
          { key: "species", label: "Species", type: "ENUM", options: ["SPF", "Douglas Fir-Larch", "Southern Yellow Pine", "Hem-Fir"] },
          { key: "grade", label: "Grade", type: "ENUM", options: ["Stud", "#2 & Better", "#1", "Premium"] },
        ],
      },
      {
        slug: "plywood-osb",
        name: "Plywood & OSB",
        attributes: [
          { key: "panelType", label: "Panel type", type: "ENUM", options: ["OSB", "Tongue & Groove OSB", "CDX Plywood", "Sanded Plywood"] },
          { key: "thickness", label: "Thickness", type: "ENUM", options: ["7/16 in", "15/32 in", "1/2 in", "19/32 in", "23/32 in", "3/4 in"] },
          { key: "use", label: "Best for", type: "ENUM", options: ["Sheathing", "Subfloor", "Projects & Cabinets"] },
        ],
      },
      {
        slug: "fasteners",
        name: "Nails & Screws",
        attributes: [
          { key: "fastenerType", label: "Type", type: "ENUM", options: ["Hand-Drive Nails", "Collated Framing Nails", "Deck Screws", "Construction Screws", "Structural Screws", "Drywall Screws", "Roofing Nails"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "in" },
          { key: "finish", label: "Finish", type: "ENUM", options: ["Bright", "Hot-Dip Galvanized", "Coated"] },
          { key: "exterior", label: "Rated for exterior/treated lumber", type: "BOOLEAN" },
        ],
      },
    ],
  },
  {
    slug: "drywall",
    name: "Drywall",
    icon: "📐",
    children: [
      {
        slug: "drywall-panels",
        name: "Drywall Panels",
        attributes: [
          { key: "panelType", label: "Panel type", type: "ENUM", options: ["Regular", "Lightweight", "Moisture-Resistant", "Mold & Moisture-Resistant", "Fire-Rated (Type X)"] },
          { key: "thickness", label: "Thickness", type: "ENUM", options: ["1/4 in", "3/8 in", "1/2 in", "5/8 in"] },
          { key: "size", label: "Sheet size", type: "ENUM", options: ["4 ft x 8 ft", "4 ft x 10 ft", "4 ft x 12 ft"] },
        ],
      },
      {
        slug: "joint-compound-tape",
        name: "Joint Compound & Tape",
        attributes: [
          { key: "productType", label: "Product", type: "ENUM", options: ["All-Purpose Compound", "Lightweight Compound", "Setting-Type Compound", "Paper Tape", "Mesh Tape", "Corner Bead"] },
          { key: "form", label: "Form", type: "ENUM", options: ["Pre-Mixed", "Powder", "Roll", "Stick"] },
        ],
      },
    ],
  },
  {
    slug: "concrete-masonry",
    name: "Concrete & Masonry",
    icon: "🧱",
    children: [
      {
        slug: "concrete-mix",
        name: "Concrete Mix",
        attributes: [
          { key: "mixType", label: "Mix", type: "ENUM", options: ["Standard", "High-Strength", "Fast-Setting", "Crack-Resistant"] },
          { key: "bagWeight", label: "Bag weight", type: "NUMBER", unit: "lb" },
          { key: "strength", label: "Compressive strength", type: "NUMBER", unit: "psi" },
        ],
      },
      {
        slug: "mortar-stucco",
        name: "Mortar, Sand & Stucco",
        attributes: [
          { key: "mixType", label: "Mix", type: "ENUM", options: ["Type S Mortar", "Type N Mortar", "Sand/Topping Mix", "Stucco", "All-Purpose Sand"] },
          { key: "bagWeight", label: "Bag weight", type: "NUMBER", unit: "lb" },
        ],
      },
      {
        slug: "block-pavers",
        name: "Block & Pavers",
        attributes: [
          { key: "blockType", label: "Type", type: "ENUM", options: ["Concrete Block (CMU)", "Cap Block", "Paver", "Retaining Wall Block"] },
          { key: "size", label: "Size", type: "ENUM", options: ["8 in x 8 in x 16 in", "4 in x 8 in x 16 in", "2 in x 8 in x 16 in", "4 in x 8 in", "12 in x 12 in", "4 in x 11.75 in x 6.75 in"] },
          { key: "color", label: "Color", type: "ENUM", options: ["Gray", "Red", "Tan", "Charcoal"] },
        ],
      },
    ],
  },
  {
    slug: "roofing",
    name: "Roofing",
    icon: "🏠",
    children: [
      {
        slug: "shingles",
        name: "Shingles",
        attributes: [
          { key: "style", label: "Style", type: "ENUM", options: ["Architectural", "3-Tab"] },
          { key: "color", label: "Color", type: "ENUM", options: ["Onyx Black", "Charcoal", "Estate Gray", "Driftwood", "Weathered Wood", "Shasta White"] },
          { key: "coverage", label: "Coverage per bundle", type: "NUMBER", unit: "sq ft" },
          { key: "windRating", label: "Wind rating", type: "NUMBER", unit: "mph" },
        ],
      },
      {
        slug: "underlayment",
        name: "Underlayment & Flashing",
        attributes: [
          { key: "productType", label: "Product", type: "ENUM", options: ["Synthetic Underlayment", "Felt #15", "Felt #30", "Ice & Water Shield", "Drip Edge"] },
          { key: "coverage", label: "Coverage", type: "NUMBER", unit: "sq ft" },
        ],
      },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    icon: "🚰",
    children: [
      {
        slug: "pipe",
        name: "Pipe & Tubing",
        attributes: [
          { key: "pipeMaterial", label: "Material", type: "ENUM", options: ["PEX-A", "PEX-B", "PVC Sch 40", "Copper Type M", "Copper Type L"] },
          { key: "diameter", label: "Diameter", type: "ENUM", options: ["1/2 in", "3/4 in", "1 in"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
          { key: "color", label: "Color", type: "ENUM", options: ["Red", "Blue", "White", "Copper"] },
        ],
      },
      {
        slug: "fittings",
        name: "Fittings & Valves",
        attributes: [
          { key: "fittingType", label: "Fitting", type: "ENUM", options: ["90° Elbow", "Tee", "Coupling", "Ball Valve", "Crimp Ring"] },
          { key: "size", label: "Size", type: "ENUM", options: ["1/2 in", "3/4 in", "1 in"] },
          { key: "connection", label: "Connection", type: "ENUM", options: ["Push-to-Connect", "Crimp", "Sweat/Solder", "Solvent Weld"] },
          { key: "material", label: "Material", type: "ENUM", options: ["Brass", "Copper", "PVC"] },
        ],
      },
    ],
  },
  {
    slug: "tools",
    name: "Tools",
    icon: "🛠️",
    children: [
      {
        slug: "drills-drivers",
        name: "Drills & Drivers",
        attributes: [
          { key: "toolType", label: "Tool", type: "ENUM", options: ["Drill/Driver", "Hammer Drill", "Impact Driver", "Combo Kit"] },
          { key: "voltage", label: "Battery platform", type: "ENUM", options: ["12V", "18V", "20V", "24V"] },
          { key: "configuration", label: "Includes", type: "ENUM", options: ["Tool Only", "Kit (1 Battery)", "Kit (2 Batteries)"] },
          { key: "brushless", label: "Brushless motor", type: "BOOLEAN" },
        ],
      },
      {
        slug: "circular-saws",
        name: "Circular Saws",
        attributes: [
          { key: "power", label: "Power", type: "ENUM", options: ["Corded", "Cordless"] },
          { key: "bladeSize", label: "Blade size", type: "ENUM", options: ["6-1/2 in", "7-1/4 in"] },
          { key: "configuration", label: "Includes", type: "ENUM", options: ["Tool Only", "Kit (1 Battery)", "Corded"] },
          { key: "brushless", label: "Brushless motor", type: "BOOLEAN" },
        ],
      },
      {
        slug: "miter-saws",
        name: "Miter Saws",
        attributes: [
          { key: "bladeSize", label: "Blade size", type: "ENUM", options: ["7-1/4 in", "10 in", "12 in"] },
          { key: "bevel", label: "Bevel", type: "ENUM", options: ["Single Bevel", "Dual Bevel"] },
          { key: "sliding", label: "Sliding", type: "BOOLEAN" },
          { key: "power", label: "Power", type: "ENUM", options: ["Corded", "Cordless"] },
        ],
      },
      {
        slug: "hand-tools",
        name: "Hand Tools",
        attributes: [
          { key: "toolType", label: "Tool", type: "ENUM", options: ["Tape Measure", "Framing Hammer", "Claw Hammer", "Speed Square", "Level", "Utility Knife", "Chalk Line"] },
          { key: "size", label: "Size", type: "ENUM", options: ["16 ft", "25 ft", "30 ft", "7 in", "12 in", "24 in", "48 in", "16 oz", "20 oz", "22 oz", "Standard"] },
        ],
      },
      {
        slug: "ladders",
        name: "Ladders",
        attributes: [
          { key: "ladderType", label: "Type", type: "ENUM", options: ["Step Ladder", "Extension Ladder", "Multi-Position"] },
          { key: "height", label: "Height", type: "NUMBER", unit: "ft" },
          { key: "material", label: "Material", type: "ENUM", options: ["Fiberglass", "Aluminum"] },
          { key: "duty", label: "Duty rating", type: "ENUM", options: ["Type II (225 lb)", "Type I (250 lb)", "Type IA (300 lb)", "Type IAA (375 lb)"] },
        ],
      },
    ],
  },
];
