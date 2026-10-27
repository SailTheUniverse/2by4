// Sample catalog. Product names and brands are real-world style; prices are
// typical ballpark figures, not live data.

export interface ProductSeed {
  name: string;
  brand: string;
  model?: string;
  category: string; // leaf category slug
  price: number; // typical price
  specs: Record<string, string | number | boolean>;
  unit?: [label: string, qty: number];
  shippable?: boolean;
  /** Limit to these retailers (store brands, exclusives) */
  only?: string[];
  /** Remove these retailers from the category default */
  exclude?: string[];
}

const BIG_BOX = ["home-depot", "lowes", "menards", "ace-hardware", "amazon"];

/** Which retailers carry each category unless a product says otherwise */
export const CATEGORY_CARRIERS: Record<string, string[]> = {
  wire: BIG_BOX,
  breakers: BIG_BOX,
  "outlets-switches": BIG_BOX,
  "dimensional-lumber": ["home-depot", "lowes", "menards", "ace-hardware"],
  "plywood-osb": ["home-depot", "lowes", "menards"],
  fasteners: BIG_BOX,
  "load-centers": BIG_BOX,
  meters: ["home-depot", "lowes", "menards", "amazon"],
  "electrical-boxes": BIG_BOX,
  conduit: BIG_BOX,
  "pressure-treated-lumber": ["home-depot", "lowes", "menards", "ace-hardware"],
  "framing-connectors": BIG_BOX,
  "rebar-mesh": BIG_BOX,
  flashing: BIG_BOX,
  "pex-a": BIG_BOX,
  "pex-b": BIG_BOX,
  copper: BIG_BOX,
  pvc: BIG_BOX,
  cpvc: BIG_BOX,
  "push-to-connect": BIG_BOX,
  "drills-drivers": BIG_BOX,
  "circular-saws": BIG_BOX,
  "drywall-panels": ["home-depot", "lowes", "menards"],
  "joint-compound": BIG_BOX,
  "drywall-tape-bead": BIG_BOX,
  "concrete-mix": ["home-depot", "lowes", "menards", "ace-hardware"],
  "mortar-stucco": ["home-depot", "lowes", "menards", "ace-hardware"],
  "block-pavers": ["home-depot", "lowes", "menards"],
  shingles: ["home-depot", "lowes", "menards"],
  underlayment: ["home-depot", "lowes", "menards", "amazon"],
  "miter-saws": BIG_BOX,
  "hand-tools": BIG_BOX,
  ladders: BIG_BOX,
};

const nmb = (gauge: number, cond: 2 | 3, length: number, price: number, brand = "Southwire"): ProductSeed => ({
  name: `${brand} ${gauge}/${cond} NM-B Romex-Style Wire with Ground, ${length} ft`,
  brand,
  category: "wire",
  price,
  specs: { wireType: "NM-B (Romex)", gauge: `${gauge} AWG`, conductors: `${cond} w/ ground`, length, material: "Copper" },
  unit: ["ft", length],
});

const lumber = (
  size: string,
  length: number,
  price: number,
  species: string,
  grade: string,
  treated = false,
): ProductSeed => ({
  name: `${size} x ${length} ft ${treated ? "Pressure-Treated Ground Contact" : grade} ${species} Lumber`,
  brand: "Mill Stock",
  category: treated ? "pressure-treated-lumber" : "dimensional-lumber",
  price,
  specs: treated ? { nominalSize: size, length, rating: "Ground Contact", species } : { nominalSize: size, length, species, grade },
  unit: ["lin ft", length],
  shippable: false,
});

const drywall = (name: string, brand: string, price: number, panelType: string, thickness: string, size = "4 ft x 8 ft", extra: Partial<ProductSeed> = {}): ProductSeed => ({
  name: `${brand} ${thickness} x ${size} ${name}`,
  brand,
  category: "drywall-panels",
  price,
  specs: { panelType, thickness, size },
  unit: ["sheet", 1],
  shippable: false,
  ...extra,
});

const bag = (category: string, brand: string, name: string, price: number, mixType: string, bagWeight: number, extra: Partial<ProductSeed> & { strength?: number } = {}): ProductSeed => {
  const { strength, ...rest } = extra;
  return {
    name: `${brand} ${bagWeight} lb ${name}`,
    brand,
    category,
    price,
    specs: { mixType, bagWeight, ...(strength ? { strength } : {}) },
    unit: ["lb", bagWeight],
    shippable: false,
    ...rest,
  };
};

const shingle = (brand: string, line: string, color: string, price: number, style: string, coverage: number, windRating: number, extra: Partial<ProductSeed> = {}): ProductSeed => ({
  name: `${brand} ${line} ${style} Shingles, ${color} (${coverage} sq ft/bundle)`,
  brand,
  category: "shingles",
  price,
  specs: { style, color, coverage, windRating },
  unit: ["sq ft", coverage],
  shippable: false,
  ...extra,
});

export const PRODUCTS: ProductSeed[] = [
  // ── Wire ────────────────────────────────────────────────
  nmb(14, 2, 250, 89),
  nmb(14, 2, 100, 42),
  nmb(12, 2, 250, 124),
  nmb(12, 2, 100, 58),
  nmb(12, 3, 250, 189),
  nmb(10, 2, 100, 109),
  nmb(10, 3, 125, 179),
  nmb(6, 3, 50, 189),
  { ...nmb(14, 2, 250, 82, "Cerrowire"), exclude: ["home-depot"] },
  { ...nmb(12, 2, 250, 118, "Cerrowire"), exclude: ["home-depot"] },
  { ...nmb(14, 2, 250, 79, "Encore Wire"), exclude: ["ace-hardware"] },
  {
    name: "Southwire 12/2 UF-B Underground Feeder Wire with Ground, 100 ft",
    brand: "Southwire",
    model: "13055926",
    category: "wire",
    price: 95,
    specs: { wireType: "UF-B", gauge: "12 AWG", conductors: "2 w/ ground", length: 100, material: "Copper" },
    unit: ["ft", 100],
  },
  {
    name: "Southwire 12 AWG Black Stranded THHN Wire, 500 ft",
    brand: "Southwire",
    category: "wire",
    price: 109,
    specs: { wireType: "THHN", gauge: "12 AWG", conductors: "Single", length: 500, material: "Copper" },
    unit: ["ft", 500],
  },
  {
    name: "Southwire 12/2 MC Armored Cable with Ground, 250 ft",
    brand: "Southwire",
    model: "55527901",
    category: "wire",
    price: 219,
    specs: { wireType: "MC (Armored)", gauge: "12 AWG", conductors: "2 w/ ground", length: 250, material: "Copper" },
    unit: ["ft", 250],
  },

  // ── Breakers ────────────────────────────────────────────
  { name: "Square D Homeline 20 Amp Single-Pole Circuit Breaker", brand: "Square D", model: "HOM120", category: "breakers", price: 6.98, specs: { panelType: "Homeline", amperage: 20, poles: 1, protection: "Standard" } },
  { name: "Square D Homeline 15 Amp Single-Pole Circuit Breaker", brand: "Square D", model: "HOM115", category: "breakers", price: 6.98, specs: { panelType: "Homeline", amperage: 15, poles: 1, protection: "Standard" } },
  { name: "Square D Homeline 30 Amp Double-Pole Circuit Breaker", brand: "Square D", category: "breakers", price: 15.98, specs: { panelType: "Homeline", amperage: 30, poles: 2, protection: "Standard" } },
  { name: "Square D Homeline 20 Amp Dual Function (AFCI/GFCI) Breaker", brand: "Square D", category: "breakers", price: 54.98, specs: { panelType: "Homeline", amperage: 20, poles: 1, protection: "Dual Function" } },
  { name: "Square D QO 20 Amp Single-Pole Circuit Breaker", brand: "Square D", model: "QO120", category: "breakers", price: 13.98, specs: { panelType: "QO", amperage: 20, poles: 1, protection: "Standard" } },
  { name: "Square D QO 20 Amp GFCI Single-Pole Breaker", brand: "Square D", category: "breakers", price: 59.98, specs: { panelType: "QO", amperage: 20, poles: 1, protection: "GFCI" } },
  { name: "Eaton BR 20 Amp Single-Pole Circuit Breaker", brand: "Eaton", model: "BR120", category: "breakers", price: 7.48, specs: { panelType: "BR", amperage: 20, poles: 1, protection: "Standard" } },
  { name: "Eaton CH 20 Amp Single-Pole Circuit Breaker", brand: "Eaton", model: "CH120", category: "breakers", price: 19.98, specs: { panelType: "CH", amperage: 20, poles: 1, protection: "Standard" } },
  { name: "Siemens 20 Amp Single-Pole Circuit Breaker", brand: "Siemens", model: "Q120", category: "breakers", price: 7.48, specs: { panelType: "Siemens QP", amperage: 20, poles: 1, protection: "Standard" } },
  { name: "Siemens 15 Amp AFCI Single-Pole Breaker", brand: "Siemens", category: "breakers", price: 44.98, specs: { panelType: "Siemens QP", amperage: 15, poles: 1, protection: "AFCI" } },

  // ── Outlets & Switches ──────────────────────────────────
  { name: "Leviton 15 Amp Tamper-Resistant Duplex Outlet, White (10-Pack)", brand: "Leviton", model: "T5320-W", category: "outlets-switches", price: 14.97, specs: { deviceType: "Duplex Receptacle", amperage: 15, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Leviton 20 Amp Tamper-Resistant Duplex Outlet, White (10-Pack)", brand: "Leviton", model: "E5825-MW", category: "outlets-switches", price: 29.97, specs: { deviceType: "Duplex Receptacle", amperage: 20, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Eaton 15 Amp Tamper-Resistant Duplex Outlet, White (10-Pack)", brand: "Eaton", model: "TR270W", category: "outlets-switches", price: 11.98, specs: { deviceType: "Duplex Receptacle", amperage: 15, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Eaton 15 Amp Tamper-Resistant Duplex Outlet, Light Almond (10-Pack)", brand: "Eaton", category: "outlets-switches", price: 12.98, specs: { deviceType: "Duplex Receptacle", amperage: 15, color: "Light Almond", packSize: 10 }, unit: ["each", 10] },
  { name: "Leviton 20 Amp Self-Test GFCI Outlet, White", brand: "Leviton", model: "GFTR2-W", category: "outlets-switches", price: 22.97, specs: { deviceType: "GFCI Receptacle", amperage: 20, color: "White", packSize: 1 } },
  { name: "Leviton 15 Amp Self-Test GFCI Outlet, White (4-Pack)", brand: "Leviton", category: "outlets-switches", price: 59.97, specs: { deviceType: "GFCI Receptacle", amperage: 15, color: "White", packSize: 4 }, unit: ["each", 4] },
  { name: "Leviton 15 Amp USB Type-A/Type-C Outlet, White", brand: "Leviton", model: "T5633-W", category: "outlets-switches", price: 29.97, specs: { deviceType: "USB Receptacle", amperage: 15, color: "White", packSize: 1 } },
  { name: "Leviton 15 Amp Single-Pole Toggle Switch, White (10-Pack)", brand: "Leviton", model: "1451-2WM", category: "outlets-switches", price: 12.97, specs: { deviceType: "Single-Pole Switch", amperage: 15, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Leviton 15 Amp 3-Way Toggle Switch, White", brand: "Leviton", model: "1453-2W", category: "outlets-switches", price: 4.27, specs: { deviceType: "3-Way Switch", amperage: 15, color: "White", packSize: 1 } },
  { name: "Lutron Diva LED+ Single-Pole/3-Way Dimmer, White", brand: "Lutron", category: "outlets-switches", price: 24.97, specs: { deviceType: "Dimmer", amperage: 5, color: "White", packSize: 1 } },
  { name: "Lutron Diva LED+ Single-Pole/3-Way Dimmer, Black", brand: "Lutron", model: "DVCL-153P-BL", category: "outlets-switches", price: 26.97, specs: { deviceType: "Dimmer", amperage: 5, color: "Black", packSize: 1 } },

  // ── Dimensional Lumber ──────────────────────────────────
  lumber("2x4", 8, 3.98, "SPF", "Stud"),
  lumber("2x4", 8, 4.68, "SPF", "Premium"),
  lumber("2x4", 10, 6.48, "SPF", "#2 & Better"),
  lumber("2x4", 12, 7.98, "SPF", "#2 & Better"),
  lumber("2x4", 16, 12.98, "Douglas Fir-Larch", "#2 & Better"),
  lumber("2x6", 8, 7.48, "SPF", "#2 & Better"),
  lumber("2x6", 12, 11.48, "SPF", "#2 & Better"),
  lumber("2x8", 12, 14.98, "SPF", "#2 & Better"),
  lumber("2x10", 12, 21.98, "Douglas Fir-Larch", "#2 & Better"),
  lumber("2x12", 16, 38.98, "Douglas Fir-Larch", "#2 & Better"),
  lumber("2x4", 8, 6.97, "Southern Yellow Pine", "#2 & Better", true),
  lumber("2x6", 8, 9.97, "Southern Yellow Pine", "#2 & Better", true),
  lumber("2x6", 12, 15.47, "Southern Yellow Pine", "#2 & Better", true),
  lumber("4x4", 8, 13.97, "Southern Yellow Pine", "#2 & Better", true),
  lumber("2x8", 10, 13.48, "Hem-Fir", "#2 & Better"),

  // ── Plywood & OSB ───────────────────────────────────────
  { name: "7/16 in x 4 ft x 8 ft OSB Sheathing Panel", brand: "Mill Stock", category: "plywood-osb", price: 15.48, specs: { panelType: "OSB", thickness: "7/16 in", use: "Sheathing" }, unit: ["sheet", 1], shippable: false },
  { name: "15/32 in x 4 ft x 8 ft CDX Plywood Sheathing", brand: "Mill Stock", category: "plywood-osb", price: 32.98, specs: { panelType: "CDX Plywood", thickness: "15/32 in", use: "Sheathing" }, unit: ["sheet", 1], shippable: false },
  { name: "19/32 in x 4 ft x 8 ft CDX Plywood", brand: "Mill Stock", category: "plywood-osb", price: 39.98, specs: { panelType: "CDX Plywood", thickness: "19/32 in", use: "Subfloor" }, unit: ["sheet", 1], shippable: false },
  { name: "23/32 in x 4 ft x 8 ft CDX Plywood", brand: "Mill Stock", category: "plywood-osb", price: 49.98, specs: { panelType: "CDX Plywood", thickness: "23/32 in", use: "Subfloor" }, unit: ["sheet", 1], shippable: false },
  { name: "Huber AdvanTech 23/32 in x 4 ft x 8 ft Tongue & Groove Subfloor Panel", brand: "Huber AdvanTech", category: "plywood-osb", price: 56.98, specs: { panelType: "Tongue & Groove OSB", thickness: "23/32 in", use: "Subfloor" }, unit: ["sheet", 1], shippable: false },
  { name: "3/4 in x 4 ft x 8 ft Sanded Birch Plywood", brand: "Mill Stock", category: "plywood-osb", price: 72.98, specs: { panelType: "Sanded Plywood", thickness: "3/4 in", use: "Projects & Cabinets" }, unit: ["sheet", 1], shippable: false },
  { name: "1/2 in x 4 ft x 8 ft Sanded Pine Plywood", brand: "Mill Stock", category: "plywood-osb", price: 46.98, specs: { panelType: "Sanded Plywood", thickness: "1/2 in", use: "Projects & Cabinets" }, unit: ["sheet", 1], shippable: false },

  // ── Nails & Screws (unit price per 100) ─────────────────
  { name: "Grip-Rite 16d 3-1/2 in Bright Common Nails, 5 lb (approx. 245 ct)", brand: "Grip-Rite", category: "fasteners", price: 15.98, specs: { fastenerType: "Hand-Drive Nails", length: 3.5, finish: "Bright", exterior: false }, unit: ["100 ct", 2.45] },
  { name: "Grip-Rite 16d 3-1/2 in Hot-Dip Galvanized Nails, 5 lb (approx. 230 ct)", brand: "Grip-Rite", category: "fasteners", price: 21.98, specs: { fastenerType: "Hand-Drive Nails", length: 3.5, finish: "Hot-Dip Galvanized", exterior: true }, unit: ["100 ct", 2.3] },
  { name: "Paslode 3-1/4 in 30° Galvanized Paper-Tape Framing Nails (2,000 ct)", brand: "Paslode", category: "fasteners", price: 64.98, specs: { fastenerType: "Collated Framing Nails", length: 3.25, finish: "Hot-Dip Galvanized", exterior: true }, unit: ["100 ct", 20] },
  { name: "Metabo HPT 3-1/4 in 21° Plastic-Strip Framing Nails (2,000 ct)", brand: "Metabo HPT", category: "fasteners", price: 59.98, specs: { fastenerType: "Collated Framing Nails", length: 3.25, finish: "Bright", exterior: false }, unit: ["100 ct", 20] },
  { name: "Simpson Strong-Tie Deck-Drive 2-1/2 in Wood Deck Screws, 5 lb (approx. 350 ct)", brand: "Simpson Strong-Tie", category: "fasteners", price: 39.98, specs: { fastenerType: "Deck Screws", length: 2.5, finish: "Coated", exterior: true }, unit: ["100 ct", 3.5] },
  { name: "Spax 2-1/2 in Exterior Multi-Material Construction Screws (120 ct)", brand: "Spax", category: "fasteners", price: 12.98, specs: { fastenerType: "Construction Screws", length: 2.5, finish: "Coated", exterior: true }, unit: ["100 ct", 1.2] },
  { name: "GRK RSS 5/16 in x 4 in Structural Screws (100 ct)", brand: "GRK", category: "fasteners", price: 89.98, specs: { fastenerType: "Structural Screws", length: 4, finish: "Coated", exterior: true }, unit: ["100 ct", 1] },
  { name: "Simpson Strong-Tie Strong-Drive SDWS 3 in Timber Screws (50 ct)", brand: "Simpson Strong-Tie", category: "fasteners", price: 32.98, specs: { fastenerType: "Structural Screws", length: 3, finish: "Coated", exterior: true }, unit: ["100 ct", 0.5] },

  // (Plumbing lives in its own section below, organized by material system.)

  // ── Drills & Drivers ────────────────────────────────────
  { name: "DeWalt 20V MAX Cordless Drill/Driver Kit with 2 Batteries", brand: "DeWalt", model: "DCD771C2", category: "drills-drivers", price: 99, specs: { toolType: "Drill/Driver", voltage: "20V", configuration: "Kit (2 Batteries)", brushless: false } },
  { name: "DeWalt 20V MAX XR Brushless Impact Driver (Tool Only)", brand: "DeWalt", model: "DCF887B", category: "drills-drivers", price: 129, specs: { toolType: "Impact Driver", voltage: "20V", configuration: "Tool Only", brushless: true } },
  { name: "DeWalt 20V MAX Drill/Driver & Impact Driver Combo Kit", brand: "DeWalt", category: "drills-drivers", price: 159, specs: { toolType: "Combo Kit", voltage: "20V", configuration: "Kit (2 Batteries)", brushless: false } },
  { name: "Milwaukee M18 Compact 1/2 in Drill/Driver (Tool Only)", brand: "Milwaukee", model: "2801-20", category: "drills-drivers", price: 99, specs: { toolType: "Drill/Driver", voltage: "18V", configuration: "Tool Only", brushless: true }, exclude: ["lowes"] },
  { name: "Milwaukee M18 FUEL 1/4 in Hex Impact Driver (Tool Only)", brand: "Milwaukee", model: "2953-20", category: "drills-drivers", price: 149, specs: { toolType: "Impact Driver", voltage: "18V", configuration: "Tool Only", brushless: true }, exclude: ["lowes"] },
  { name: "Milwaukee M12 Drill/Driver Kit with 2 Batteries", brand: "Milwaukee", category: "drills-drivers", price: 119, specs: { toolType: "Drill/Driver", voltage: "12V", configuration: "Kit (2 Batteries)", brushless: false }, exclude: ["lowes"] },
  { name: "Makita 18V LXT Brushless Hammer Drill Kit", brand: "Makita", category: "drills-drivers", price: 189, specs: { toolType: "Hammer Drill", voltage: "18V", configuration: "Kit (2 Batteries)", brushless: true } },
  { name: "Ryobi ONE+ 18V Cordless Drill/Driver Kit with Battery", brand: "Ryobi", category: "drills-drivers", price: 79, specs: { toolType: "Drill/Driver", voltage: "18V", configuration: "Kit (1 Battery)", brushless: false }, only: ["home-depot"] },
  { name: "Kobalt 24V MAX Brushless Drill/Driver Kit", brand: "Kobalt", category: "drills-drivers", price: 99, specs: { toolType: "Drill/Driver", voltage: "24V", configuration: "Kit (1 Battery)", brushless: true }, only: ["lowes"] },
  { name: "Craftsman V20 Cordless Drill/Driver Kit", brand: "Craftsman", category: "drills-drivers", price: 69, specs: { toolType: "Drill/Driver", voltage: "20V", configuration: "Kit (1 Battery)", brushless: false }, only: ["lowes", "ace-hardware", "amazon"] },
  { name: "Bauer 20V Brushless 1/2 in Drill/Driver Kit", brand: "Bauer", category: "drills-drivers", price: 69.99, specs: { toolType: "Drill/Driver", voltage: "20V", configuration: "Kit (1 Battery)", brushless: true }, only: ["harbor-freight"] },
  { name: "Hercules 20V Brushless 1/4 in Impact Driver (Tool Only)", brand: "Hercules", category: "drills-drivers", price: 79.99, specs: { toolType: "Impact Driver", voltage: "20V", configuration: "Tool Only", brushless: true }, only: ["harbor-freight"] },

  // ── Circular Saws ───────────────────────────────────────
  { name: "DeWalt 15 Amp 7-1/4 in Lightweight Circular Saw", brand: "DeWalt", model: "DWE575", category: "circular-saws", price: 119, specs: { power: "Corded", bladeSize: "7-1/4 in", configuration: "Corded", brushless: false } },
  { name: "DeWalt 20V MAX Brushless 7-1/4 in Circular Saw (Tool Only)", brand: "DeWalt", model: "DCS570B", category: "circular-saws", price: 179, specs: { power: "Cordless", bladeSize: "7-1/4 in", configuration: "Tool Only", brushless: true } },
  { name: "Milwaukee M18 FUEL 7-1/4 in Circular Saw (Tool Only)", brand: "Milwaukee", model: "2732-20", category: "circular-saws", price: 249, specs: { power: "Cordless", bladeSize: "7-1/4 in", configuration: "Tool Only", brushless: true }, exclude: ["lowes"] },
  { name: "Skil 15 Amp 7-1/4 in Circular Saw with Laser", brand: "Skil", model: "5280-01", category: "circular-saws", price: 59, specs: { power: "Corded", bladeSize: "7-1/4 in", configuration: "Corded", brushless: false } },
  { name: "Ryobi ONE+ 18V 6-1/2 in Circular Saw (Tool Only)", brand: "Ryobi", category: "circular-saws", price: 79, specs: { power: "Cordless", bladeSize: "6-1/2 in", configuration: "Tool Only", brushless: false }, only: ["home-depot"] },
  { name: "Bauer 15 Amp 7-1/4 in Circular Saw with Laser", brand: "Bauer", category: "circular-saws", price: 49.99, specs: { power: "Corded", bladeSize: "7-1/4 in", configuration: "Corded", brushless: false }, only: ["harbor-freight"] },
  { name: "Hercules 20V Brushless 7-1/4 in Circular Saw Kit", brand: "Hercules", category: "circular-saws", price: 159.99, specs: { power: "Cordless", bladeSize: "7-1/4 in", configuration: "Kit (1 Battery)", brushless: true }, only: ["harbor-freight"] },

  // ── More fasteners ──────────────────────────────────────
  { name: "Grip-Rite #6 x 1-1/4 in Coarse-Thread Drywall Screws, 5 lb (approx. 1,190 ct)", brand: "Grip-Rite", category: "fasteners", price: 26.98, specs: { fastenerType: "Drywall Screws", length: 1.25, finish: "Coated", exterior: false }, unit: ["100 ct", 11.9] },
  { name: "Grip-Rite #6 x 1-5/8 in Coarse-Thread Drywall Screws, 1 lb (approx. 190 ct)", brand: "Grip-Rite", category: "fasteners", price: 8.98, specs: { fastenerType: "Drywall Screws", length: 1.625, finish: "Coated", exterior: false }, unit: ["100 ct", 1.9] },
  { name: "Grip-Rite 1-1/4 in Electro-Galvanized Roofing Nails, 5 lb (approx. 700 ct)", brand: "Grip-Rite", category: "fasteners", price: 17.98, specs: { fastenerType: "Roofing Nails", length: 1.25, finish: "Electro-Galvanized", exterior: true }, unit: ["100 ct", 7] },
  { name: "Bostitch 1-1/4 in Galvanized Coil Roofing Nails (7,200 ct)", brand: "Bostitch", category: "fasteners", price: 64.98, specs: { fastenerType: "Roofing Nails", length: 1.25, finish: "Hot-Dip Galvanized", exterior: true }, unit: ["100 ct", 72] },

  // ── Drywall ─────────────────────────────────────────────
  drywall("UltraLight Drywall Panel", "USG Sheetrock", 15.98, "Lightweight", "1/2 in"),
  drywall("UltraLight Drywall Panel", "USG Sheetrock", 21.98, "Lightweight", "1/2 in", "4 ft x 12 ft"),
  drywall("Regular Drywall Panel", "Gold Bond", 13.48, "Regular", "1/2 in", "4 ft x 8 ft", { exclude: ["home-depot"] }),
  drywall("Regular Drywall Panel", "CertainTeed", 13.98, "Regular", "1/4 in"),
  drywall("Regular Drywall Panel", "USG Sheetrock", 14.98, "Regular", "3/8 in"),
  drywall("Moisture-Resistant Drywall Panel", "USG Sheetrock", 16.98, "Moisture-Resistant", "1/2 in"),
  drywall("Mold Tough Drywall Panel", "USG Sheetrock", 19.48, "Mold & Moisture-Resistant", "1/2 in"),
  drywall("XP Mold & Moisture-Resistant Drywall Panel", "Gold Bond", 19.98, "Mold & Moisture-Resistant", "1/2 in", "4 ft x 8 ft", { exclude: ["home-depot"] }),
  drywall("Firecode X Drywall Panel", "USG Sheetrock", 17.98, "Fire-Rated (Type X)", "5/8 in"),
  drywall("Fire-Shield Type X Drywall Panel", "Gold Bond", 18.48, "Fire-Rated (Type X)", "5/8 in", "4 ft x 12 ft", { exclude: ["home-depot"] }),

  // ── Joint Compound / Tape & Corner Bead ─────────────────
  { name: "USG Sheetrock All Purpose Pre-Mixed Joint Compound, 4.5 gal", brand: "USG Sheetrock", category: "joint-compound", price: 21.98, specs: { productType: "All-Purpose", form: "Pre-Mixed" }, unit: ["gal", 4.5], shippable: false },
  { name: "USG Sheetrock Plus 3 Lightweight Joint Compound, 4.5 gal", brand: "USG Sheetrock", category: "joint-compound", price: 23.98, specs: { productType: "Lightweight", form: "Pre-Mixed" }, unit: ["gal", 4.5], shippable: false },
  { name: "Gold Bond ProForm Lite Joint Compound, 4.5 gal", brand: "Gold Bond", category: "joint-compound", price: 19.98, specs: { productType: "Lightweight", form: "Pre-Mixed" }, unit: ["gal", 4.5], shippable: false, exclude: ["home-depot"] },
  { name: "USG Sheetrock Easy Sand 45 Setting-Type Joint Compound, 18 lb", brand: "USG Sheetrock", category: "joint-compound", price: 17.98, specs: { productType: "Setting-Type", form: "Powder" }, unit: ["lb", 18] },
  { name: "USG Sheetrock Paper Joint Tape, 2-1/16 in x 500 ft", brand: "USG Sheetrock", category: "drywall-tape-bead", price: 6.98, specs: { productType: "Paper Tape" }, unit: ["ft", 500] },
  { name: "FibaTape Self-Adhesive Mesh Drywall Tape, 1-7/8 in x 300 ft", brand: "FibaTape", category: "drywall-tape-bead", price: 9.98, specs: { productType: "Mesh Tape" }, unit: ["ft", 300] },
  { name: "ClarkDietrich 1-1/4 in x 8 ft Metal Drywall Corner Bead", brand: "ClarkDietrich", category: "drywall-tape-bead", price: 3.48, specs: { productType: "Metal Corner Bead" }, unit: ["ft", 8], shippable: false },

  // ── Concrete Mix ────────────────────────────────────────
  bag("concrete-mix", "Quikrete", "Concrete Mix", 5.98, "Standard", 80, { strength: 4000 }),
  bag("concrete-mix", "Quikrete", "Concrete Mix", 4.98, "Standard", 60, { strength: 4000 }),
  bag("concrete-mix", "Quikrete", "Fast-Setting Concrete Mix", 7.98, "Fast-Setting", 50, { strength: 4000 }),
  bag("concrete-mix", "Quikrete", "5000 Plus High-Strength Concrete Mix", 7.48, "High-Strength", 80, { strength: 5000 }),
  bag("concrete-mix", "Quikrete", "Crack-Resistant Concrete Mix", 9.98, "Crack-Resistant", 80, { strength: 4000 }),
  bag("concrete-mix", "Sakrete", "Concrete Mix", 5.78, "Standard", 80, { strength: 4000, exclude: ["home-depot"] }),
  bag("concrete-mix", "Sakrete", "Fast Setting Concrete Mix", 7.68, "Fast-Setting", 50, { strength: 4000, exclude: ["home-depot"] }),

  // ── Mortar, Sand & Stucco ───────────────────────────────
  bag("mortar-stucco", "Quikrete", "Type S Mortar Mix", 9.48, "Type S Mortar", 80),
  bag("mortar-stucco", "Quikrete", "Type N Mortar Mix", 8.98, "Type N Mortar", 80),
  bag("mortar-stucco", "Quikrete", "Sand/Topping Mix", 7.48, "Sand/Topping Mix", 80),
  bag("mortar-stucco", "Quikrete", "Base Coat Stucco", 10.98, "Stucco", 80),
  bag("mortar-stucco", "Quikrete", "All-Purpose Sand", 5.48, "All-Purpose Sand", 50),
  bag("mortar-stucco", "Sakrete", "Type S Mortar Mix", 9.28, "Type S Mortar", 80, { exclude: ["home-depot"] }),

  // ── Block & Pavers ──────────────────────────────────────
  { name: "8 in x 8 in x 16 in Standard Concrete Block", brand: "Masonry Stock", category: "block-pavers", price: 1.98, specs: { blockType: "Concrete Block (CMU)", size: "8 in x 8 in x 16 in", color: "Gray" }, shippable: false },
  { name: "4 in x 8 in x 16 in Solid Concrete Block", brand: "Masonry Stock", category: "block-pavers", price: 1.78, specs: { blockType: "Concrete Block (CMU)", size: "4 in x 8 in x 16 in", color: "Gray" }, shippable: false },
  { name: "2 in x 8 in x 16 in Concrete Cap Block", brand: "Masonry Stock", category: "block-pavers", price: 1.68, specs: { blockType: "Cap Block", size: "2 in x 8 in x 16 in", color: "Gray" }, shippable: false },
  { name: "4 in x 8 in Red Concrete Paver", brand: "Masonry Stock", category: "block-pavers", price: 0.68, specs: { blockType: "Paver", size: "4 in x 8 in", color: "Red" }, shippable: false },
  { name: "4 in x 8 in Charcoal Concrete Paver", brand: "Masonry Stock", category: "block-pavers", price: 0.72, specs: { blockType: "Paver", size: "4 in x 8 in", color: "Charcoal" }, shippable: false },
  { name: "12 in x 12 in Gray Concrete Patio Stone", brand: "Masonry Stock", category: "block-pavers", price: 2.48, specs: { blockType: "Paver", size: "12 in x 12 in", color: "Gray" }, shippable: false },
  { name: "Tan Retaining Wall Block (4 in x 11.75 in x 6.75 in)", brand: "Masonry Stock", category: "block-pavers", price: 2.38, specs: { blockType: "Retaining Wall Block", size: "4 in x 11.75 in x 6.75 in", color: "Tan" }, shippable: false },
  { name: "Gray Retaining Wall Block (4 in x 11.75 in x 6.75 in)", brand: "Masonry Stock", category: "block-pavers", price: 2.28, specs: { blockType: "Retaining Wall Block", size: "4 in x 11.75 in x 6.75 in", color: "Gray" }, shippable: false },

  // ── Shingles (unit price per sq ft of coverage) ─────────
  shingle("Owens Corning", "Duration", "Onyx Black", 42.98, "Architectural", 32.8, 130),
  shingle("Owens Corning", "Duration", "Driftwood", 42.98, "Architectural", 32.8, 130),
  shingle("Owens Corning", "Supreme", "Estate Gray", 34.98, "3-Tab", 33.3, 60),
  shingle("GAF", "Timberline HDZ", "Charcoal", 44.98, "Architectural", 33.3, 130, { exclude: ["menards"] }),
  shingle("GAF", "Timberline HDZ", "Weathered Wood", 44.98, "Architectural", 33.3, 130, { exclude: ["menards"] }),
  shingle("GAF", "Royal Sovereign", "Shasta White", 36.98, "3-Tab", 33.3, 60, { exclude: ["menards"] }),
  shingle("CertainTeed", "Landmark", "Driftwood", 43.98, "Architectural", 32.8, 110, { exclude: ["home-depot"] }),

  // ── Underlayment ────────────────────────────────────────
  { name: "Owens Corning Deck Defense Synthetic Roof Underlayment (1,000 sq ft)", brand: "Owens Corning", category: "underlayment", price: 109.98, specs: { productType: "Synthetic Underlayment", coverage: 1000 }, unit: ["sq ft", 1000] },
  { name: "GAF FeltBuster Synthetic Roofing Underlayment (1,000 sq ft)", brand: "GAF", category: "underlayment", price: 99.98, specs: { productType: "Synthetic Underlayment", coverage: 1000 }, unit: ["sq ft", 1000], exclude: ["menards"] },
  { name: "Grace Ice & Water Shield Roofing Underlayment (200 sq ft)", brand: "Grace", category: "underlayment", price: 129.98, specs: { productType: "Ice & Water Shield", coverage: 200 }, unit: ["sq ft", 200] },
  { name: "Owens Corning WeatherLock Mat Ice & Water Barrier (200 sq ft)", brand: "Owens Corning", category: "underlayment", price: 99.98, specs: { productType: "Ice & Water Shield", coverage: 200 }, unit: ["sq ft", 200] },
  { name: "#15 Asphalt Saturated Roofing Felt (432 sq ft)", brand: "Mill Stock", category: "underlayment", price: 24.98, specs: { productType: "Felt #15", coverage: 432 }, unit: ["sq ft", 432], shippable: false },
  { name: "#30 Asphalt Saturated Roofing Felt (216 sq ft)", brand: "Mill Stock", category: "underlayment", price: 26.98, specs: { productType: "Felt #30", coverage: 216 }, unit: ["sq ft", 216], shippable: false },

  // ── Miter Saws ──────────────────────────────────────────
  { name: "DeWalt 12 in Double-Bevel Sliding Compound Miter Saw", brand: "DeWalt", model: "DWS780", category: "miter-saws", price: 599, specs: { bladeSize: "12 in", bevel: "Dual Bevel", sliding: true, power: "Corded" } },
  { name: "DeWalt 15 Amp 10 in Single-Bevel Compound Miter Saw", brand: "DeWalt", model: "DWS713", category: "miter-saws", price: 229, specs: { bladeSize: "10 in", bevel: "Single Bevel", sliding: false, power: "Corded" } },
  { name: "Metabo HPT 15 Amp 10 in Single-Bevel Compound Miter Saw", brand: "Metabo HPT", model: "C10FCGS", category: "miter-saws", price: 149, specs: { bladeSize: "10 in", bevel: "Single Bevel", sliding: false, power: "Corded" } },
  { name: "Milwaukee M18 FUEL 10 in Dual-Bevel Sliding Miter Saw (Tool Only)", brand: "Milwaukee", model: "2734-20", category: "miter-saws", price: 649, specs: { bladeSize: "10 in", bevel: "Dual Bevel", sliding: true, power: "Cordless" }, exclude: ["lowes"] },
  { name: "Ryobi ONE+ 18V 7-1/4 in Sliding Compound Miter Saw (Tool Only)", brand: "Ryobi", category: "miter-saws", price: 199, specs: { bladeSize: "7-1/4 in", bevel: "Single Bevel", sliding: true, power: "Cordless" }, only: ["home-depot"] },
  { name: "Kobalt 15 Amp 12 in Dual-Bevel Sliding Compound Miter Saw", brand: "Kobalt", category: "miter-saws", price: 329, specs: { bladeSize: "12 in", bevel: "Dual Bevel", sliding: true, power: "Corded" }, only: ["lowes"] },
  { name: "Hercules 12 in Dual-Bevel Sliding Compound Miter Saw", brand: "Hercules", category: "miter-saws", price: 359.99, specs: { bladeSize: "12 in", bevel: "Dual Bevel", sliding: true, power: "Corded" }, only: ["harbor-freight"] },
  { name: "Chicago Electric 10 in Compound Miter Saw", brand: "Chicago Electric", category: "miter-saws", price: 99.99, specs: { bladeSize: "10 in", bevel: "Single Bevel", sliding: false, power: "Corded" }, only: ["harbor-freight"] },

  // ── Hand Tools ──────────────────────────────────────────
  { name: "Stanley PowerLock 25 ft Tape Measure", brand: "Stanley", model: "33-425", category: "hand-tools", price: 19.98, specs: { toolType: "Tape Measure", size: "25 ft" } },
  { name: "Milwaukee 25 ft Compact Wide Blade Tape Measure", brand: "Milwaukee", category: "hand-tools", price: 24.97, specs: { toolType: "Tape Measure", size: "25 ft" }, exclude: ["lowes"] },
  { name: "DeWalt 25 ft Tape Measure", brand: "DeWalt", model: "DWHT36107", category: "hand-tools", price: 21.98, specs: { toolType: "Tape Measure", size: "25 ft" } },
  { name: "Pittsburgh 25 ft Tape Measure", brand: "Pittsburgh", category: "hand-tools", price: 6.99, specs: { toolType: "Tape Measure", size: "25 ft" }, only: ["harbor-freight"] },
  { name: "Estwing 22 oz Solid Steel Framing Hammer", brand: "Estwing", model: "E3-22SM", category: "hand-tools", price: 39.98, specs: { toolType: "Framing Hammer", size: "22 oz" } },
  { name: "Estwing 16 oz Solid Steel Claw Hammer", brand: "Estwing", model: "E3-16C", category: "hand-tools", price: 32.98, specs: { toolType: "Claw Hammer", size: "16 oz" } },
  { name: "Pittsburgh 20 oz Fiberglass Claw Hammer", brand: "Pittsburgh", category: "hand-tools", price: 9.99, specs: { toolType: "Claw Hammer", size: "20 oz" }, only: ["harbor-freight"] },
  { name: "Swanson 7 in Speed Square", brand: "Swanson", model: "S0101", category: "hand-tools", price: 9.98, specs: { toolType: "Speed Square", size: "7 in" } },
  { name: "Empire 48 in True Blue Box Level", brand: "Empire", model: "E75.48", category: "hand-tools", price: 42.98, specs: { toolType: "Level", size: "48 in" } },
  { name: "Johnson 24 in Aluminum Box Level", brand: "Johnson", model: "1741-2400", category: "hand-tools", price: 19.98, specs: { toolType: "Level", size: "24 in" } },
  { name: "Stanley FatMax Retractable Utility Knife", brand: "Stanley", model: "10-777", category: "hand-tools", price: 14.98, specs: { toolType: "Utility Knife", size: "Standard" } },
  { name: "Irwin Strait-Line 100 ft Chalk Reel", brand: "Irwin", model: "IWHT48441", category: "hand-tools", price: 12.98, specs: { toolType: "Chalk Line", size: "Standard" } },

  // ── Ladders ─────────────────────────────────────────────
  { name: "Werner 6 ft Fiberglass Step Ladder, Type II (225 lb)", brand: "Werner", model: "5906", category: "ladders", price: 89, specs: { ladderType: "Step Ladder", height: 6, material: "Fiberglass", duty: "Type II (225 lb)" } },
  { name: "Werner 6 ft Fiberglass Step Ladder, Type IA (300 lb)", brand: "Werner", model: "6206", category: "ladders", price: 149, specs: { ladderType: "Step Ladder", height: 6, material: "Fiberglass", duty: "Type IA (300 lb)" } },
  { name: "Werner 8 ft Fiberglass Step Ladder, Type IA (300 lb)", brand: "Werner", model: "6208", category: "ladders", price: 199, specs: { ladderType: "Step Ladder", height: 8, material: "Fiberglass", duty: "Type IA (300 lb)" } },
  { name: "Louisville Ladder 6 ft Fiberglass Step Ladder, Type IAA (375 lb)", brand: "Louisville Ladder", model: "FS1406HD", category: "ladders", price: 189, specs: { ladderType: "Step Ladder", height: 6, material: "Fiberglass", duty: "Type IAA (375 lb)" } },
  { name: "Werner 24 ft Aluminum Extension Ladder, Type II (225 lb)", brand: "Werner", category: "ladders", price: 229, specs: { ladderType: "Extension Ladder", height: 24, material: "Aluminum", duty: "Type II (225 lb)" }, shippable: false },
  { name: "Werner 28 ft Fiberglass Extension Ladder, Type IA (300 lb)", brand: "Werner", category: "ladders", price: 399, specs: { ladderType: "Extension Ladder", height: 28, material: "Fiberglass", duty: "Type IA (300 lb)" }, shippable: false },
  { name: "Little Giant Velocity 22 ft Multi-Position Ladder, Type IA (300 lb)", brand: "Little Giant", model: "15422-001", category: "ladders", price: 299, specs: { ladderType: "Multi-Position", height: 22, material: "Aluminum", duty: "Type IA (300 lb)" } },
  { name: "Franklin 6 ft Fiberglass Step Ladder, Type II (225 lb)", brand: "Franklin", category: "ladders", price: 79.99, specs: { ladderType: "Step Ladder", height: 6, material: "Fiberglass", duty: "Type II (225 lb)" }, only: ["harbor-freight"] },

  // ── Panels & Load Centers ───────────────────────────────
  { name: "Square D Homeline 100 Amp 20-Space Main Breaker Load Center", brand: "Square D", model: "HOM20M100C", category: "load-centers", price: 129, specs: { panelLine: "Homeline", amperage: 100, spaces: 20, mainType: "Main Breaker", location: "Indoor" } },
  { name: "Square D Homeline 200 Amp 40-Space Main Breaker Load Center", brand: "Square D", model: "HOM4080M200PC", category: "load-centers", price: 269, specs: { panelLine: "Homeline", amperage: 200, spaces: 40, mainType: "Main Breaker", location: "Indoor" } },
  { name: "Square D QO 200 Amp 40-Space Main Breaker Load Center", brand: "Square D", model: "QO140M200C", category: "load-centers", price: 449, specs: { panelLine: "QO", amperage: 200, spaces: 40, mainType: "Main Breaker", location: "Indoor" } },
  { name: "Square D Homeline 125 Amp 8-Space Main Lug Outdoor Load Center", brand: "Square D", model: "HOM816L125RB", category: "load-centers", price: 59, specs: { panelLine: "Homeline", amperage: 125, spaces: 8, mainType: "Main Lug", location: "Outdoor" } },
  { name: "Eaton BR 200 Amp 40-Space Main Breaker Load Center", brand: "Eaton", model: "BR4040B200", category: "load-centers", price: 239, specs: { panelLine: "BR", amperage: 200, spaces: 40, mainType: "Main Breaker", location: "Indoor" } },
  { name: "Eaton BR 125 Amp 12-Space Main Lug Load Center", brand: "Eaton", model: "BRP12L125", category: "load-centers", price: 69, specs: { panelLine: "BR", amperage: 125, spaces: 12, mainType: "Main Lug", location: "Indoor" } },
  { name: "Siemens 200 Amp 40-Space Main Breaker Load Center", brand: "Siemens", model: "SN4040B1200", category: "load-centers", price: 249, specs: { panelLine: "Siemens QP", amperage: 200, spaces: 40, mainType: "Main Breaker", location: "Indoor" } },

  // ── Meter Sockets & Mains ───────────────────────────────
  { name: "Milbank 200 Amp Ringless Overhead/Underground Meter Socket", brand: "Milbank", category: "meters", price: 89, specs: { meterType: "Meter Socket", amperage: 200, ring: "Ringless", feed: "Overhead/Underground" } },
  { name: "Milbank 100 Amp Ring-Type Meter Socket", brand: "Milbank", model: "114TB-RP", category: "meters", price: 59, specs: { meterType: "Meter Socket", amperage: 100, ring: "Ring Type", feed: "Overhead/Underground" } },
  { name: "Eaton 200 Amp Ringless Meter Main Combination", brand: "Eaton", model: "MBP200BTSD", category: "meters", price: 399, specs: { meterType: "Meter Main Combo", amperage: 200, ring: "Ringless", feed: "Overhead/Underground" } },
  { name: "Square D Homeline 200 Amp Overhead/Underground Meter Main Combination", brand: "Square D", model: "RC816F200C", category: "meters", price: 429, specs: { meterType: "Meter Main Combo", amperage: 200, ring: "Ringless", feed: "Overhead/Underground" } },
  { name: "Siemens 200 Amp Meter Main Combination", brand: "Siemens", model: "MC0816B1200RCT", category: "meters", price: 379, specs: { meterType: "Meter Main Combo", amperage: 200, ring: "Ringless", feed: "Overhead/Underground" } },
  { name: "Siemens 50 Amp Temporary Power Outlet Panel", brand: "Siemens", model: "TL17US", category: "meters", price: 219, specs: { meterType: "Temporary Power Outlet", amperage: 50, ring: "Ringless", feed: "Overhead" } },

  // ── Electrical Boxes ────────────────────────────────────
  { name: "Carlon 1-Gang 18 cu in New Work PVC Electrical Box", brand: "Carlon", category: "electrical-boxes", price: 0.78, specs: { boxType: "1-Gang", work: "New Work", material: "PVC", volume: 18, fanRated: false } },
  { name: "Carlon 2-Gang 32 cu in New Work PVC Electrical Box", brand: "Carlon", category: "electrical-boxes", price: 1.48, specs: { boxType: "2-Gang", work: "New Work", material: "PVC", volume: 32, fanRated: false } },
  { name: "Carlon 3-Gang 53 cu in New Work PVC Electrical Box", brand: "Carlon", category: "electrical-boxes", price: 3.98, specs: { boxType: "3-Gang", work: "New Work", material: "PVC", volume: 53, fanRated: false } },
  { name: "Carlon 1-Gang 20 cu in Old Work PVC Electrical Box", brand: "Carlon", category: "electrical-boxes", price: 1.98, specs: { boxType: "1-Gang", work: "Old Work", material: "PVC", volume: 20, fanRated: false } },
  { name: "Carlon 2-Gang 34 cu in Old Work PVC Electrical Box", brand: "Carlon", category: "electrical-boxes", price: 3.48, specs: { boxType: "2-Gang", work: "Old Work", material: "PVC", volume: 34, fanRated: false } },
  { name: "Allied Moulded 1-Gang 22.5 cu in Fiberglass New Work Box", brand: "Allied Moulded", category: "electrical-boxes", price: 2.98, specs: { boxType: "1-Gang", work: "New Work", material: "Fiberglass", volume: 22.5, fanRated: false } },
  { name: "Carlon 4-1/4 in Round 18 cu in Old Work Fan-Rated Ceiling Box", brand: "Carlon", category: "electrical-boxes", price: 7.98, specs: { boxType: "Round Ceiling", work: "Old Work", material: "PVC", volume: 18, fanRated: true } },
  { name: "RACO 4 in Square 2-1/8 in Deep Metal Electrical Box", brand: "RACO", category: "electrical-boxes", price: 3.48, specs: { boxType: "4 in Square", work: "New Work", material: "Metal", volume: 30.3, fanRated: false } },

  // ── Conduit & Fittings ──────────────────────────────────
  { name: "Allied Tube 1/2 in x 10 ft EMT Conduit", brand: "Allied Tube", category: "conduit", price: 7.98, specs: { conduitType: "EMT", productType: "Conduit", size: "1/2 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Allied Tube 3/4 in x 10 ft EMT Conduit", brand: "Allied Tube", category: "conduit", price: 12.48, specs: { conduitType: "EMT", productType: "Conduit", size: "3/4 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Cantex 1/2 in x 10 ft Schedule 40 PVC Conduit", brand: "Cantex", category: "conduit", price: 3.98, specs: { conduitType: "PVC Sch 40", productType: "Conduit", size: "1/2 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Cantex 3/4 in x 10 ft Schedule 40 PVC Conduit", brand: "Cantex", category: "conduit", price: 5.48, specs: { conduitType: "PVC Sch 40", productType: "Conduit", size: "3/4 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Cantex 1 in x 10 ft Schedule 80 PVC Conduit", brand: "Cantex", category: "conduit", price: 13.98, specs: { conduitType: "PVC Sch 80", productType: "Conduit", size: "1 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Southwire 1/2 in x 100 ft Reduced-Wall Flexible Aluminum Conduit", brand: "Southwire", category: "conduit", price: 64.98, specs: { conduitType: "Flexible (FMC)", productType: "Conduit", size: "1/2 in", length: 100 }, unit: ["ft", 100] },
  { name: "Southwire 3/4 in x 25 ft Liquidtight Flexible Conduit", brand: "Southwire", category: "conduit", price: 39.98, specs: { conduitType: "Liquidtight", productType: "Conduit", size: "3/4 in", length: 25 }, unit: ["ft", 25] },
  { name: "Halex 1/2 in EMT Set-Screw Connector (25-Pack)", brand: "Halex", category: "conduit", price: 12.98, specs: { conduitType: "EMT", productType: "Connector", size: "1/2 in" }, unit: ["each", 25] },
  { name: "Halex 1/2 in EMT Set-Screw Coupling (25-Pack)", brand: "Halex", category: "conduit", price: 11.98, specs: { conduitType: "EMT", productType: "Coupling", size: "1/2 in" }, unit: ["each", 25] },
  { name: "Halex 3/4 in EMT Drive Strap (25-Pack)", brand: "Halex", category: "conduit", price: 7.48, specs: { conduitType: "EMT", productType: "Strap", size: "3/4 in" }, unit: ["each", 25] },

  // ── More pressure-treated lumber ────────────────────────
  lumber("6x6", 8, 34.98, "Southern Yellow Pine", "#2 & Better", true),
  lumber("2x8", 12, 19.98, "Southern Yellow Pine", "#2 & Better", true),
  lumber("2x10", 12, 27.98, "Southern Yellow Pine", "#2 & Better", true),
  { name: "2x4 x 8 ft Pressure-Treated Above Ground Southern Yellow Pine Lumber", brand: "Mill Stock", category: "pressure-treated-lumber", price: 5.98, specs: { nominalSize: "2x4", length: 8, rating: "Above Ground", species: "Southern Yellow Pine" }, unit: ["lin ft", 8], shippable: false },
  { name: "5/4 in x 6 in x 12 ft Pressure-Treated Deck Board", brand: "Mill Stock", category: "pressure-treated-lumber", price: 12.98, specs: { nominalSize: "5/4x6 Deck Board", length: 12, rating: "Above Ground", species: "Southern Yellow Pine" }, unit: ["lin ft", 12], shippable: false },
  { name: "5/4 in x 6 in x 16 ft Pressure-Treated Deck Board", brand: "Mill Stock", category: "pressure-treated-lumber", price: 17.48, specs: { nominalSize: "5/4x6 Deck Board", length: 16, rating: "Above Ground", species: "Southern Yellow Pine" }, unit: ["lin ft", 16], shippable: false },

  // ── Framing Connectors ──────────────────────────────────
  { name: "Simpson Strong-Tie 2x6 Face-Mount Joist Hanger", brand: "Simpson Strong-Tie", model: "LUS26", category: "framing-connectors", price: 1.68, specs: { connectorType: "Joist Hanger", fits: "2x6", finish: "G90 Galvanized" } },
  { name: "Simpson Strong-Tie 2x8 Face-Mount Joist Hanger", brand: "Simpson Strong-Tie", model: "LUS28", category: "framing-connectors", price: 2.28, specs: { connectorType: "Joist Hanger", fits: "2x8", finish: "G90 Galvanized" } },
  { name: "Simpson Strong-Tie 2x10 Face-Mount Joist Hanger", brand: "Simpson Strong-Tie", model: "LUS210", category: "framing-connectors", price: 2.68, specs: { connectorType: "Joist Hanger", fits: "2x10", finish: "G90 Galvanized" } },
  { name: "Simpson Strong-Tie 2x6 ZMAX Face-Mount Joist Hanger", brand: "Simpson Strong-Tie", model: "LUS26Z", category: "framing-connectors", price: 2.68, specs: { connectorType: "Joist Hanger", fits: "2x6", finish: "ZMAX / G185" } },
  { name: "USP 2x6 Face-Mount Joist Hanger", brand: "USP", category: "framing-connectors", price: 1.48, specs: { connectorType: "Joist Hanger", fits: "2x6", finish: "G90 Galvanized" }, exclude: ["home-depot"] },
  { name: "Simpson Strong-Tie Hurricane Tie", brand: "Simpson Strong-Tie", model: "H2.5A", category: "framing-connectors", price: 0.98, specs: { connectorType: "Hurricane Tie", fits: "2x4", finish: "G90 Galvanized" } },
  { name: "Simpson Strong-Tie Framing Angle", brand: "Simpson Strong-Tie", model: "A35", category: "framing-connectors", price: 1.18, specs: { connectorType: "Angle", fits: "2x4", finish: "G90 Galvanized" } },
  { name: "Simpson Strong-Tie 4x4 ZMAX Adjustable Post Base", brand: "Simpson Strong-Tie", model: "ABU44Z", category: "framing-connectors", price: 16.98, specs: { connectorType: "Post Base", fits: "4x4", finish: "ZMAX / G185" } },
  { name: "Simpson Strong-Tie 6x6 ZMAX Adjustable Post Base", brand: "Simpson Strong-Tie", model: "ABU66Z", category: "framing-connectors", price: 27.98, specs: { connectorType: "Post Base", fits: "6x6", finish: "ZMAX / G185" } },

  // ── Rebar & Mesh ────────────────────────────────────────
  { name: "#3 (3/8 in) x 10 ft Steel Rebar", brand: "Masonry Stock", category: "rebar-mesh", price: 5.48, specs: { productType: "Rebar", size: "#3 (3/8 in)", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "#4 (1/2 in) x 10 ft Steel Rebar", brand: "Masonry Stock", category: "rebar-mesh", price: 8.48, specs: { productType: "Rebar", size: "#4 (1/2 in)", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "#4 (1/2 in) x 20 ft Steel Rebar", brand: "Masonry Stock", category: "rebar-mesh", price: 15.98, specs: { productType: "Rebar", size: "#4 (1/2 in)", length: 20 }, unit: ["ft", 20], shippable: false },
  { name: "#5 (5/8 in) x 20 ft Steel Rebar", brand: "Masonry Stock", category: "rebar-mesh", price: 22.98, specs: { productType: "Rebar", size: "#5 (5/8 in)", length: 20 }, unit: ["ft", 20], shippable: false },
  { name: "6x6 W1.4 Welded Wire Concrete Mesh Sheet, 42 in x 84 in", brand: "Masonry Stock", category: "rebar-mesh", price: 10.98, specs: { productType: "Wire Mesh", size: "6x6 W1.4" }, unit: ["sheet", 1], shippable: false },
  { name: "16 Gauge Rebar Tie Wire, 3.5 lb Coil", brand: "Masonry Stock", category: "rebar-mesh", price: 9.98, specs: { productType: "Tie Wire", size: "16 Gauge" } },
  { name: "2 in Plastic Rebar Chairs (25-Pack)", brand: "Masonry Stock", category: "rebar-mesh", price: 7.98, specs: { productType: "Rebar Chair", size: "2 in" }, unit: ["each", 25] },

  // ── Flashing & Drip Edge ────────────────────────────────
  { name: "Amerimax 10 ft White Aluminum Roof Drip Edge", brand: "Amerimax", category: "flashing", price: 8.98, specs: { productType: "Drip Edge", material: "Aluminum", color: "White" }, unit: ["ft", 10], shippable: false },
  { name: "Amerimax 10 ft Brown Aluminum Roof Drip Edge", brand: "Amerimax", category: "flashing", price: 8.98, specs: { productType: "Drip Edge", material: "Aluminum", color: "Brown" }, unit: ["ft", 10], shippable: false },
  { name: "Amerimax 10 ft Galvanized Steel Roof Drip Edge", brand: "Amerimax", category: "flashing", price: 6.98, specs: { productType: "Drip Edge", material: "Galvanized Steel", color: "Mill Finish" }, unit: ["ft", 10], shippable: false },
  { name: "Amerimax 5 in x 7 in Aluminum Step Flashing (100-Pack)", brand: "Amerimax", category: "flashing", price: 39.98, specs: { productType: "Step Flashing", material: "Aluminum", color: "Mill Finish" }, unit: ["each", 100] },
  { name: "Amerimax 14 in x 50 ft Aluminum Roll Valley Flashing", brand: "Amerimax", category: "flashing", price: 44.98, specs: { productType: "Roll Flashing", material: "Aluminum", color: "Mill Finish" }, unit: ["ft", 50] },
  { name: "Oatey All-Flash No-Calk 1-1/2 in to 3 in Galvanized Roof Pipe Flashing", brand: "Oatey", category: "flashing", price: 14.98, specs: { productType: "Pipe Boot", material: "Galvanized Steel", color: "Mill Finish" } },

  // ── Plumbing: PEX-A ─────────────────────────────────────
  { name: "Uponor AquaPEX 1/2 in x 100 ft White PEX-A Pipe", brand: "Uponor", model: "F1040500", category: "pex-a", price: 62.98, specs: { productType: "Pipe", size: "1/2 in", length: 100, color: "White" }, unit: ["ft", 100] },
  { name: "Uponor AquaPEX 1/2 in x 100 ft Red PEX-A Pipe", brand: "Uponor", model: "F2040500", category: "pex-a", price: 64.98, specs: { productType: "Pipe", size: "1/2 in", length: 100, color: "Red" }, unit: ["ft", 100] },
  { name: "Uponor AquaPEX 3/4 in x 100 ft White PEX-A Pipe", brand: "Uponor", model: "F1040750", category: "pex-a", price: 109.98, specs: { productType: "Pipe", size: "3/4 in", length: 100, color: "White" }, unit: ["ft", 100] },
  { name: "Uponor ProPEX 1/2 in Expansion Rings with Stop (50-Pack)", brand: "Uponor", model: "Q4690512", category: "pex-a", price: 19.98, specs: { productType: "Expansion Ring", size: "1/2 in" }, unit: ["each", 50] },
  { name: "Uponor ProPEX 1/2 in EP 90° Elbow", brand: "Uponor", category: "pex-a", price: 3.48, specs: { productType: "90° Elbow", size: "1/2 in" } },
  { name: "Uponor ProPEX 1/2 in EP Tee", brand: "Uponor", model: "Q4755050", category: "pex-a", price: 4.48, specs: { productType: "Tee", size: "1/2 in" } },
  { name: "Uponor ProPEX 3/4 in EP Coupling", brand: "Uponor", category: "pex-a", price: 3.98, specs: { productType: "Coupling", size: "3/4 in" } },
  { name: "Uponor ProPEX 1/2 in PEX x 1/2 in FNPT Brass Adapter", brand: "Uponor", model: "LF4575050", category: "pex-a", price: 7.98, specs: { productType: "Adapter", size: "1/2 in" } },

  // ── Plumbing: PEX-B ─────────────────────────────────────
  { name: "SharkBite 1/2 in x 100 ft Red PEX-B Pipe", brand: "SharkBite", model: "U860R100", category: "pex-b", price: 42.98, specs: { productType: "Pipe", size: "1/2 in", length: 100, color: "Red" }, unit: ["ft", 100] },
  { name: "SharkBite 1/2 in x 100 ft Blue PEX-B Pipe", brand: "SharkBite", model: "U860B100", category: "pex-b", price: 42.98, specs: { productType: "Pipe", size: "1/2 in", length: 100, color: "Blue" }, unit: ["ft", 100] },
  { name: "SharkBite 3/4 in x 100 ft Blue PEX-B Pipe", brand: "SharkBite", model: "U870B100", category: "pex-b", price: 69.98, specs: { productType: "Pipe", size: "3/4 in", length: 100, color: "Blue" }, unit: ["ft", 100] },
  { name: "SharkBite 1 in x 100 ft White PEX-B Pipe", brand: "SharkBite", model: "U880W100", category: "pex-b", price: 109.98, specs: { productType: "Pipe", size: "1 in", length: 100, color: "White" }, unit: ["ft", 100] },
  { name: "Apollo 3/4 in x 100 ft Red PEX-B Pipe", brand: "Apollo", category: "pex-b", price: 64.98, specs: { productType: "Pipe", size: "3/4 in", length: 100, color: "Red" }, unit: ["ft", 100], exclude: ["lowes"] },
  { name: "Apollo 1/2 in PEX Crimp Brass 90° Elbow (10-Pack)", brand: "Apollo", category: "pex-b", price: 12.98, specs: { productType: "90° Elbow", size: "1/2 in" }, unit: ["each", 10], exclude: ["lowes"] },
  { name: "Apollo 1/2 in PEX-B Brass Crimp Tee (5-Pack)", brand: "Apollo", category: "pex-b", price: 11.98, specs: { productType: "Tee", size: "1/2 in" }, unit: ["each", 5], exclude: ["lowes"] },
  { name: "Apollo 3/4 in PEX Crimp Brass Coupling (5-Pack)", brand: "Apollo", category: "pex-b", price: 9.98, specs: { productType: "Coupling", size: "3/4 in" }, unit: ["each", 5], exclude: ["lowes"] },
  { name: "Apollo 1/2 in Copper PEX Crimp Rings (50-Pack)", brand: "Apollo", model: "APXCR1250PK", category: "pex-b", price: 11.98, specs: { productType: "Crimp Ring", size: "1/2 in" }, unit: ["each", 50], exclude: ["lowes"] },
  { name: "Apollo 1/2 in Stainless Steel PEX Cinch Clamps (50-Pack)", brand: "Apollo", category: "pex-b", price: 12.98, specs: { productType: "Cinch Clamp", size: "1/2 in" }, unit: ["each", 50], exclude: ["lowes"] },

  // ── Plumbing: Copper ────────────────────────────────────
  { name: "Mueller 1/2 in x 10 ft Copper Type M Pipe", brand: "Mueller", category: "copper", price: 26.98, specs: { productType: "Pipe", size: "1/2 in", copperType: "Type M", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Mueller 1/2 in x 10 ft Copper Type L Pipe", brand: "Mueller", category: "copper", price: 34.98, specs: { productType: "Pipe", size: "1/2 in", copperType: "Type L", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Mueller 3/4 in x 10 ft Copper Type M Pipe", brand: "Mueller", category: "copper", price: 44.98, specs: { productType: "Pipe", size: "3/4 in", copperType: "Type M", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Mueller 3/4 in x 10 ft Copper Type L Pipe", brand: "Mueller", category: "copper", price: 62.98, specs: { productType: "Pipe", size: "3/4 in", copperType: "Type L", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Mueller 1/2 in Copper 90° Sweat Elbow (10-Pack)", brand: "Mueller", category: "copper", price: 15.98, specs: { productType: "90° Elbow", size: "1/2 in" }, unit: ["each", 10] },
  { name: "Mueller 1/2 in Copper Sweat Coupling (10-Pack)", brand: "Mueller", category: "copper", price: 9.98, specs: { productType: "Coupling", size: "1/2 in" }, unit: ["each", 10] },
  { name: "Mueller 1/2 in Copper Sweat Tee (5-Pack)", brand: "Mueller", category: "copper", price: 12.98, specs: { productType: "Tee", size: "1/2 in" }, unit: ["each", 5] },
  { name: "Oatey Safe-Flo Lead-Free Wire Solder, 1/2 lb", brand: "Oatey", category: "copper", price: 24.98, specs: { productType: "Solder & Flux" } },

  // ── Plumbing: PVC ───────────────────────────────────────
  { name: "Charlotte Pipe 1/2 in x 10 ft PVC Schedule 40 Pipe", brand: "Charlotte Pipe", category: "pvc", price: 4.48, specs: { productType: "Pipe", size: "1/2 in", schedule: "Sch 40", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Charlotte Pipe 3/4 in x 10 ft PVC Schedule 40 Pipe", brand: "Charlotte Pipe", category: "pvc", price: 5.98, specs: { productType: "Pipe", size: "3/4 in", schedule: "Sch 40", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Charlotte Pipe 1 in x 10 ft PVC Schedule 40 Pipe", brand: "Charlotte Pipe", category: "pvc", price: 8.48, specs: { productType: "Pipe", size: "1 in", schedule: "Sch 40", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Charlotte Pipe 2 in x 10 ft PVC DWV Foam Core Pipe", brand: "Charlotte Pipe", category: "pvc", price: 16.98, specs: { productType: "Pipe", size: "2 in", schedule: "DWV", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Charlotte Pipe 1/2 in PVC Sch 40 90° Elbow (10-Pack)", brand: "Charlotte Pipe", category: "pvc", price: 5.48, specs: { productType: "90° Elbow", size: "1/2 in", schedule: "Sch 40" }, unit: ["each", 10] },
  { name: "Charlotte Pipe 3/4 in PVC Sch 40 Tee (10-Pack)", brand: "Charlotte Pipe", category: "pvc", price: 9.98, specs: { productType: "Tee", size: "3/4 in", schedule: "Sch 40" }, unit: ["each", 10] },
  { name: "Charlotte Pipe 1/2 in PVC Sch 40 Coupling (10-Pack)", brand: "Charlotte Pipe", category: "pvc", price: 3.98, specs: { productType: "Coupling", size: "1/2 in", schedule: "Sch 40" }, unit: ["each", 10] },
  { name: "Oatey PVC Cement and Purple Primer Combo Pack", brand: "Oatey", model: "30246", category: "pvc", price: 12.98, specs: { productType: "Cement & Primer" } },

  // ── Plumbing: CPVC ──────────────────────────────────────
  { name: "Charlotte Pipe 1/2 in x 10 ft CPVC CTS Pipe", brand: "Charlotte Pipe", category: "cpvc", price: 7.48, specs: { productType: "Pipe", size: "1/2 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "Charlotte Pipe 3/4 in x 10 ft CPVC CTS Pipe", brand: "Charlotte Pipe", category: "cpvc", price: 11.98, specs: { productType: "Pipe", size: "3/4 in", length: 10 }, unit: ["ft", 10], shippable: false },
  { name: "NIBCO 1/2 in CPVC CTS 90° Elbow (10-Pack)", brand: "NIBCO", category: "cpvc", price: 5.98, specs: { productType: "90° Elbow", size: "1/2 in" }, unit: ["each", 10] },
  { name: "NIBCO 1/2 in CPVC CTS Coupling (10-Pack)", brand: "NIBCO", category: "cpvc", price: 4.48, specs: { productType: "Coupling", size: "1/2 in" }, unit: ["each", 10] },
  { name: "NIBCO 3/4 in CPVC CTS Tee (10-Pack)", brand: "NIBCO", category: "cpvc", price: 13.98, specs: { productType: "Tee", size: "3/4 in" }, unit: ["each", 10] },
  { name: "Oatey FlowGuard Gold CPVC Cement, 8 oz", brand: "Oatey", category: "cpvc", price: 10.98, specs: { productType: "Cement & Primer" } },

  // ── Plumbing: Push-to-Connect ───────────────────────────
  { name: "SharkBite 1/2 in Push-to-Connect Brass 90° Elbow", brand: "SharkBite", category: "push-to-connect", price: 9.98, specs: { productType: "90° Elbow", size: "1/2 in" } },
  { name: "SharkBite 3/4 in Push-to-Connect Brass 90° Elbow", brand: "SharkBite", model: "U256LFA", category: "push-to-connect", price: 14.98, specs: { productType: "90° Elbow", size: "3/4 in" } },
  { name: "SharkBite 1/2 in Push-to-Connect Brass Coupling", brand: "SharkBite", model: "U008LFA", category: "push-to-connect", price: 8.48, specs: { productType: "Coupling", size: "1/2 in" } },
  { name: "SharkBite 3/4 in Push-to-Connect Brass Tee", brand: "SharkBite", model: "U370LFA", category: "push-to-connect", price: 19.98, specs: { productType: "Tee", size: "3/4 in" } },
  { name: "SharkBite 3/4 in Push-to-Connect Ball Valve", brand: "SharkBite", model: "22223-0000LF", category: "push-to-connect", price: 29.98, specs: { productType: "Ball Valve", size: "3/4 in" } },
  { name: "SharkBite 1/2 in x 3/8 in Compression Angle Stop Valve", brand: "SharkBite", model: "23036-0000LF", category: "push-to-connect", price: 14.98, specs: { productType: "Stop Valve", size: "1/2 in" } },
  { name: "SharkBite 1/2 in Push x 1/2 in FNPT Brass Adapter", brand: "SharkBite", model: "U088LF", category: "push-to-connect", price: 9.48, specs: { productType: "Adapter", size: "1/2 in" } },
];
