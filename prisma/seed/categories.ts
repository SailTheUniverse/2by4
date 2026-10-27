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


/** Plumbing is shopped by material system: pipe and the fittings that go with it. */
function plumbingSystem(
  slug: string,
  name: string,
  productTypes: string[],
  colors: string[] = [],
  extra: AttributeSeed[] = [],
): CategorySeed {
  return {
    slug,
    name,
    attributes: [
      { key: "productType", label: "Product", type: "ENUM", options: productTypes },
      { key: "size", label: "Size", type: "ENUM", options: ["1/2 in", "3/4 in", "1 in", "1-1/2 in", "2 in"] },
      ...extra,
      { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
      ...(colors.length ? [{ key: "color", label: "Color", type: "ENUM" as const, options: colors }] : []),
    ],
  };
}

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "electrical",
    name: "Electrical",
    icon: "⚡",
    children: [
      {
        slug: "wire",
        name: "Wire & Cable",
        attributes: [
          { key: "wireType", label: "Wire type", type: "ENUM", options: ["NM-B (Romex)", "UF-B", "THHN", "MC (Armored)"] },
          { key: "gauge", label: "Gauge", type: "ENUM", options: ["14 AWG", "12 AWG", "10 AWG", "8 AWG", "6 AWG"] },
          { key: "conductors", label: "Conductors", type: "ENUM", options: ["Single", "2 w/ ground", "3 w/ ground"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
          { key: "material", label: "Conductor", type: "ENUM", options: ["Copper", "Aluminum"] },
        ],
      },
      {
        slug: "load-centers",
        name: "Panels & Load Centers",
        attributes: [
          { key: "panelLine", label: "Breaker type", type: "ENUM", options: ["Homeline", "QO", "BR", "CH", "Siemens QP"] },
          { key: "amperage", label: "Amperage", type: "NUMBER", unit: "A" },
          { key: "spaces", label: "Spaces", type: "NUMBER" },
          { key: "mainType", label: "Main", type: "ENUM", options: ["Main Breaker", "Main Lug"] },
          { key: "location", label: "Location", type: "ENUM", options: ["Indoor", "Outdoor"] },
        ],
      },
      {
        slug: "meters",
        name: "Meter Sockets & Mains",
        attributes: [
          { key: "meterType", label: "Type", type: "ENUM", options: ["Meter Socket", "Meter Main Combo", "Temporary Power Outlet"] },
          { key: "amperage", label: "Amperage", type: "NUMBER", unit: "A" },
          { key: "ring", label: "Cover", type: "ENUM", options: ["Ringless", "Ring Type"] },
          { key: "feed", label: "Feed", type: "ENUM", options: ["Overhead/Underground", "Underground", "Overhead"] },
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
      {
        slug: "electrical-boxes",
        name: "Electrical Boxes",
        attributes: [
          { key: "boxType", label: "Box", type: "ENUM", options: ["1-Gang", "2-Gang", "3-Gang", "Round Ceiling", "4 in Square"] },
          { key: "work", label: "Install", type: "ENUM", options: ["New Work", "Old Work"] },
          { key: "material", label: "Material", type: "ENUM", options: ["PVC", "Fiberglass", "Metal"] },
          { key: "volume", label: "Volume", type: "NUMBER", unit: "cu in" },
          { key: "fanRated", label: "Fan rated", type: "BOOLEAN" },
        ],
      },
      {
        slug: "conduit",
        name: "Conduit & Fittings",
        attributes: [
          { key: "conduitType", label: "Type", type: "ENUM", options: ["EMT", "PVC Sch 40", "PVC Sch 80", "Flexible (FMC)", "Liquidtight"] },
          { key: "productType", label: "Product", type: "ENUM", options: ["Conduit", "Connector", "Coupling", "Strap"] },
          { key: "size", label: "Trade size", type: "ENUM", options: ["1/2 in", "3/4 in", "1 in"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
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
          { key: "species", label: "Species", type: "ENUM", options: ["SPF", "Douglas Fir-Larch", "Southern Yellow Pine", "Hem-Fir"] },
          { key: "grade", label: "Grade", type: "ENUM", options: ["Stud", "#2 & Better", "#1", "Premium"] },
        ],
      },
      {
        slug: "pressure-treated-lumber",
        name: "Pressure-Treated Lumber",
        attributes: [
          { key: "nominalSize", label: "Nominal size", type: "ENUM", options: ["2x4", "2x6", "2x8", "2x10", "4x4", "6x6", "5/4x6 Deck Board"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
          { key: "rating", label: "Rating", type: "ENUM", options: ["Ground Contact", "Above Ground"] },
          { key: "species", label: "Species", type: "ENUM", options: ["Southern Yellow Pine", "Hem-Fir", "Douglas Fir-Larch"] },
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
        slug: "framing-connectors",
        name: "Framing Connectors",
        attributes: [
          { key: "connectorType", label: "Connector", type: "ENUM", options: ["Joist Hanger", "Hurricane Tie", "Angle", "Post Base", "Strap"] },
          { key: "fits", label: "Fits", type: "ENUM", options: ["2x4", "2x6", "2x8", "2x10", "4x4", "6x6"] },
          { key: "finish", label: "Finish", type: "ENUM", options: ["G90 Galvanized", "ZMAX / G185"] },
        ],
      },
      {
        slug: "fasteners",
        name: "Nails & Screws",
        attributes: [
          { key: "fastenerType", label: "Type", type: "ENUM", options: ["Hand-Drive Nails", "Collated Framing Nails", "Deck Screws", "Construction Screws", "Structural Screws", "Drywall Screws", "Roofing Nails"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "in" },
          { key: "finish", label: "Finish", type: "ENUM", options: ["Bright", "Hot-Dip Galvanized", "Electro-Galvanized", "Coated"] },
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
        slug: "joint-compound",
        name: "Joint Compound",
        attributes: [
          { key: "productType", label: "Compound", type: "ENUM", options: ["All-Purpose", "Lightweight", "Setting-Type"] },
          { key: "form", label: "Form", type: "ENUM", options: ["Pre-Mixed", "Powder"] },
        ],
      },
      {
        slug: "drywall-tape-bead",
        name: "Tape & Corner Bead",
        attributes: [
          { key: "productType", label: "Product", type: "ENUM", options: ["Paper Tape", "Mesh Tape", "Metal Corner Bead", "Paper-Faced Corner Bead"] },
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
      {
        slug: "rebar-mesh",
        name: "Rebar & Mesh",
        attributes: [
          { key: "productType", label: "Product", type: "ENUM", options: ["Rebar", "Wire Mesh", "Tie Wire", "Rebar Chair"] },
          { key: "size", label: "Size", type: "ENUM", options: ["#3 (3/8 in)", "#4 (1/2 in)", "#5 (5/8 in)", "6x6 W1.4", "16 Gauge", "2 in"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "ft" },
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
        name: "Underlayment",
        attributes: [
          { key: "productType", label: "Product", type: "ENUM", options: ["Synthetic Underlayment", "Felt #15", "Felt #30", "Ice & Water Shield"] },
          { key: "coverage", label: "Coverage", type: "NUMBER", unit: "sq ft" },
        ],
      },
      {
        slug: "flashing",
        name: "Flashing & Drip Edge",
        attributes: [
          { key: "productType", label: "Product", type: "ENUM", options: ["Drip Edge", "Step Flashing", "Roll Flashing", "Pipe Boot"] },
          { key: "material", label: "Material", type: "ENUM", options: ["Aluminum", "Galvanized Steel", "Rubber & Aluminum"] },
          { key: "color", label: "Color", type: "ENUM", options: ["White", "Brown", "Black", "Mill Finish"] },
        ],
      },
    ],
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    icon: "🚰",
    children: [
      plumbingSystem("pex-a", "PEX-A", ["Pipe", "90° Elbow", "Tee", "Coupling", "Adapter", "Expansion Ring"], ["Red", "Blue", "White"]),
      plumbingSystem("pex-b", "PEX-B", ["Pipe", "90° Elbow", "Tee", "Coupling", "Adapter", "Crimp Ring", "Cinch Clamp"], ["Red", "Blue", "White"]),
      plumbingSystem("copper", "Copper", ["Pipe", "90° Elbow", "Tee", "Coupling", "Adapter", "Solder & Flux"], [], [
        { key: "copperType", label: "Wall type", type: "ENUM", options: ["Type M", "Type L", "Type K"] },
      ]),
      plumbingSystem("pvc", "PVC", ["Pipe", "90° Elbow", "Tee", "Coupling", "Adapter", "Cement & Primer"], [], [
        { key: "schedule", label: "Schedule", type: "ENUM", options: ["Sch 40", "Sch 80", "DWV"] },
      ]),
      plumbingSystem("cpvc", "CPVC", ["Pipe", "90° Elbow", "Tee", "Coupling", "Adapter", "Cement & Primer"]),
      plumbingSystem("push-to-connect", "Push-to-Connect", ["90° Elbow", "Tee", "Coupling", "Ball Valve", "Stop Valve", "Adapter"]),
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
