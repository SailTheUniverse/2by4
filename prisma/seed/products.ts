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
  pipe: BIG_BOX,
  fittings: BIG_BOX,
  "drills-drivers": BIG_BOX,
  "circular-saws": BIG_BOX,
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
  category: "dimensional-lumber",
  price,
  specs: { nominalSize: size, length, treatment: treated ? "Pressure Treated" : "Untreated", species, grade },
  unit: ["lin ft", length],
  shippable: false,
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
  { name: "Leviton 15 Amp Tamper-Resistant Duplex Outlet, White (10-Pack)", brand: "Leviton", category: "outlets-switches", price: 14.97, specs: { deviceType: "Duplex Receptacle", amperage: 15, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Leviton 20 Amp Tamper-Resistant Duplex Outlet, White (10-Pack)", brand: "Leviton", category: "outlets-switches", price: 29.97, specs: { deviceType: "Duplex Receptacle", amperage: 20, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Eaton 15 Amp Tamper-Resistant Duplex Outlet, White (10-Pack)", brand: "Eaton", category: "outlets-switches", price: 11.98, specs: { deviceType: "Duplex Receptacle", amperage: 15, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Eaton 15 Amp Tamper-Resistant Duplex Outlet, Light Almond (10-Pack)", brand: "Eaton", category: "outlets-switches", price: 12.98, specs: { deviceType: "Duplex Receptacle", amperage: 15, color: "Light Almond", packSize: 10 }, unit: ["each", 10] },
  { name: "Leviton 20 Amp Self-Test GFCI Outlet, White", brand: "Leviton", category: "outlets-switches", price: 22.97, specs: { deviceType: "GFCI Receptacle", amperage: 20, color: "White", packSize: 1 } },
  { name: "Leviton 15 Amp Self-Test GFCI Outlet, White (4-Pack)", brand: "Leviton", category: "outlets-switches", price: 59.97, specs: { deviceType: "GFCI Receptacle", amperage: 15, color: "White", packSize: 4 }, unit: ["each", 4] },
  { name: "Leviton 15 Amp USB Type-A/Type-C Outlet, White", brand: "Leviton", category: "outlets-switches", price: 29.97, specs: { deviceType: "USB Receptacle", amperage: 15, color: "White", packSize: 1 } },
  { name: "Leviton 15 Amp Single-Pole Toggle Switch, White (10-Pack)", brand: "Leviton", category: "outlets-switches", price: 12.97, specs: { deviceType: "Single-Pole Switch", amperage: 15, color: "White", packSize: 10 }, unit: ["each", 10] },
  { name: "Leviton 15 Amp 3-Way Toggle Switch, White", brand: "Leviton", category: "outlets-switches", price: 4.27, specs: { deviceType: "3-Way Switch", amperage: 15, color: "White", packSize: 1 } },
  { name: "Lutron Diva LED+ Single-Pole/3-Way Dimmer, White", brand: "Lutron", category: "outlets-switches", price: 24.97, specs: { deviceType: "Dimmer", amperage: 5, color: "White", packSize: 1 } },
  { name: "Lutron Diva LED+ Single-Pole/3-Way Dimmer, Black", brand: "Lutron", category: "outlets-switches", price: 26.97, specs: { deviceType: "Dimmer", amperage: 5, color: "Black", packSize: 1 } },

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
  { name: "Paslode 3-1/4 in 30° Paper-Tape Framing Nails (2,000 ct)", brand: "Paslode", category: "fasteners", price: 64.98, specs: { fastenerType: "Collated Framing Nails", length: 3.25, finish: "Bright", exterior: false }, unit: ["100 ct", 20] },
  { name: "Metabo HPT 3-1/4 in 21° Plastic-Strip Framing Nails (2,000 ct)", brand: "Metabo HPT", category: "fasteners", price: 59.98, specs: { fastenerType: "Collated Framing Nails", length: 3.25, finish: "Bright", exterior: false }, unit: ["100 ct", 20] },
  { name: "Simpson Strong-Tie Deck-Drive 2-1/2 in Wood Deck Screws, 5 lb (approx. 350 ct)", brand: "Simpson Strong-Tie", category: "fasteners", price: 39.98, specs: { fastenerType: "Deck Screws", length: 2.5, finish: "Coated", exterior: true }, unit: ["100 ct", 3.5] },
  { name: "Spax 2-1/2 in Exterior Multi-Material Construction Screws (120 ct)", brand: "Spax", category: "fasteners", price: 12.98, specs: { fastenerType: "Construction Screws", length: 2.5, finish: "Coated", exterior: true }, unit: ["100 ct", 1.2] },
  { name: "GRK RSS 5/16 in x 4 in Structural Screws (50 ct)", brand: "GRK", category: "fasteners", price: 49.98, specs: { fastenerType: "Structural Screws", length: 4, finish: "Coated", exterior: true }, unit: ["100 ct", 0.5] },
  { name: "Simpson Strong-Tie Strong-Drive SDWS 3 in Timber Screws (50 ct)", brand: "Simpson Strong-Tie", category: "fasteners", price: 32.98, specs: { fastenerType: "Structural Screws", length: 3, finish: "Coated", exterior: true }, unit: ["100 ct", 0.5] },

  // ── Pipe & Tubing ───────────────────────────────────────
  { name: "SharkBite 1/2 in x 100 ft Red PEX-B Pipe", brand: "SharkBite", category: "pipe", price: 42.98, specs: { pipeMaterial: "PEX-B", diameter: "1/2 in", length: 100, color: "Red" }, unit: ["ft", 100] },
  { name: "SharkBite 1/2 in x 100 ft Blue PEX-B Pipe", brand: "SharkBite", category: "pipe", price: 42.98, specs: { pipeMaterial: "PEX-B", diameter: "1/2 in", length: 100, color: "Blue" }, unit: ["ft", 100] },
  { name: "Apollo 3/4 in x 100 ft Red PEX-B Pipe", brand: "Apollo", category: "pipe", price: 64.98, specs: { pipeMaterial: "PEX-B", diameter: "3/4 in", length: 100, color: "Red" }, unit: ["ft", 100], exclude: ["lowes"] },
  { name: "Uponor AquaPEX 1/2 in x 100 ft White PEX-A Pipe", brand: "Uponor", category: "pipe", price: 62.98, specs: { pipeMaterial: "PEX-A", diameter: "1/2 in", length: 100, color: "White" }, unit: ["ft", 100] },
  { name: "Uponor AquaPEX 3/4 in x 100 ft White PEX-A Pipe", brand: "Uponor", category: "pipe", price: 109.98, specs: { pipeMaterial: "PEX-A", diameter: "3/4 in", length: 100, color: "White" }, unit: ["ft", 100] },
  { name: "Charlotte Pipe 1/2 in x 10 ft PVC Schedule 40 Pipe", brand: "Charlotte Pipe", category: "pipe", price: 4.48, specs: { pipeMaterial: "PVC Sch 40", diameter: "1/2 in", length: 10, color: "White" }, unit: ["ft", 10], shippable: false },
  { name: "Charlotte Pipe 3/4 in x 10 ft PVC Schedule 40 Pipe", brand: "Charlotte Pipe", category: "pipe", price: 5.98, specs: { pipeMaterial: "PVC Sch 40", diameter: "3/4 in", length: 10, color: "White" }, unit: ["ft", 10], shippable: false },
  { name: "Mueller 1/2 in x 10 ft Copper Type M Pipe", brand: "Mueller", category: "pipe", price: 26.98, specs: { pipeMaterial: "Copper Type M", diameter: "1/2 in", length: 10, color: "Copper" }, unit: ["ft", 10], shippable: false },
  { name: "Mueller 3/4 in x 10 ft Copper Type L Pipe", brand: "Mueller", category: "pipe", price: 62.98, specs: { pipeMaterial: "Copper Type L", diameter: "3/4 in", length: 10, color: "Copper" }, unit: ["ft", 10], shippable: false },

  // ── Fittings & Valves ───────────────────────────────────
  { name: "SharkBite 1/2 in Push-to-Connect Brass 90° Elbow", brand: "SharkBite", category: "fittings", price: 9.98, specs: { fittingType: "90° Elbow", size: "1/2 in", connection: "Push-to-Connect", material: "Brass" } },
  { name: "SharkBite 1/2 in Push-to-Connect Brass Coupling", brand: "SharkBite", category: "fittings", price: 8.48, specs: { fittingType: "Coupling", size: "1/2 in", connection: "Push-to-Connect", material: "Brass" } },
  { name: "SharkBite 3/4 in Push-to-Connect Brass Tee", brand: "SharkBite", category: "fittings", price: 19.98, specs: { fittingType: "Tee", size: "3/4 in", connection: "Push-to-Connect", material: "Brass" } },
  { name: "SharkBite 3/4 in Push-to-Connect Ball Valve", brand: "SharkBite", category: "fittings", price: 29.98, specs: { fittingType: "Ball Valve", size: "3/4 in", connection: "Push-to-Connect", material: "Brass" } },
  { name: "Apollo 1/2 in PEX Crimp Brass 90° Elbow (10-Pack)", brand: "Apollo", category: "fittings", price: 12.98, specs: { fittingType: "90° Elbow", size: "1/2 in", connection: "Crimp", material: "Brass" }, unit: ["each", 10], exclude: ["lowes"] },
  { name: "Apollo 1/2 in Copper PEX Crimp Rings (50-Pack)", brand: "Apollo", category: "fittings", price: 11.98, specs: { fittingType: "Crimp Ring", size: "1/2 in", connection: "Crimp", material: "Copper" }, unit: ["each", 50], exclude: ["lowes"] },
  { name: "Mueller 1/2 in Copper 90° Sweat Elbow (10-Pack)", brand: "Mueller", category: "fittings", price: 15.98, specs: { fittingType: "90° Elbow", size: "1/2 in", connection: "Sweat/Solder", material: "Copper" }, unit: ["each", 10] },
  { name: "Charlotte Pipe 1/2 in PVC Sch 40 90° Elbow (10-Pack)", brand: "Charlotte Pipe", category: "fittings", price: 5.48, specs: { fittingType: "90° Elbow", size: "1/2 in", connection: "Solvent Weld", material: "PVC" }, unit: ["each", 10] },

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
];
