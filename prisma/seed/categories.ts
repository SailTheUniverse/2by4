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
          { key: "fastenerType", label: "Type", type: "ENUM", options: ["Hand-Drive Nails", "Collated Framing Nails", "Deck Screws", "Construction Screws", "Structural Screws"] },
          { key: "length", label: "Length", type: "NUMBER", unit: "in" },
          { key: "finish", label: "Finish", type: "ENUM", options: ["Bright", "Hot-Dip Galvanized", "Coated"] },
          { key: "exterior", label: "Rated for exterior/treated lumber", type: "BOOLEAN" },
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
    ],
  },
];
