import { Product } from '../types/ecommerce';

// High-resolution local studio assets generated for this storefront
import armchairImg from '../assets/images/product_oak_armchair_1793542310861.jpg';
import pendantImg from '../assets/images/product_brass_pendant_1793542311621.jpg';
import vesselImg from '../assets/images/product_ceramic_vessel_1793542312638.jpg';
import marbleTableImg from '../assets/images/product_marble_table_1793542313940.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'nordic-lounge-chair',
    name: 'Kallio Sculptural Lounge Chair',
    subtitle: 'FSC Solid White Oak & Tactile Bouclé',
    category: 'Furniture',
    price: 1480,
    originalPrice: 1650,
    rating: 4.9,
    reviewCount: 38,
    inStock: true,
    stockCount: 6,
    image: armchairImg,
    additionalImages: [
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: 'W 82cm × D 84cm × H 76cm (Seat: 41cm)',
    materials: ['Solid European White Oak', 'Textured Wool Bouclé', 'High-Resilience Bio-Foam'],
    designer: 'Studio Eemil, Helsinki',
    origin: 'Handcrafted in Småland, Sweden',
    description: 'The Kallio Lounge Chair balances substantial architectural mass with delicate organic curves. Sculpted from sustainably harvested European white oak with finger-mortise joinery, it features an upholstered nest in unbleached Belgian wool bouclé.',
    features: [
      'Hand-finished with cold-pressed natural matte oil',
      'Ergonomic lumbar curvature engineered for sustained reading',
      'Replaceable acoustic wool cushion insert',
      'FSC-Certified Grade-A timber core'
    ],
    leadTime: 'In Stock · Dispatches in 2–4 business days'
  },
  {
    id: 'aethel-brass-pendant',
    name: 'Aethel Spun Brass Dome Pendant',
    subtitle: 'Hand-Hammered Satin Brass & Opal Glass',
    category: 'Lighting',
    price: 620,
    rating: 4.8,
    reviewCount: 52,
    inStock: true,
    stockCount: 14,
    image: pendantImg,
    additionalImages: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: 'Ø 46cm × H 28cm (Cord: 300cm Braided Linen)',
    materials: ['Solid Spun Brass', 'Mouth-Blown Triplex Opal Glass', 'Unbleached Linen Cord'],
    designer: 'Astrid Vestergaard, Copenhagen',
    origin: 'Turned & polished in Odense, Denmark',
    description: 'Engineered to cast a soft downlight without harsh glare. The Aethel Pendant celebrates the warmth of unlacquered spun brass, which develops a rich, personal patina over decades of atmospheric exposure.',
    features: [
      'Warm 2700K integrated dimmable LED driver included',
      'Hand-brushed circular satin finish',
      'Mouth-blown triplex diffusion dome',
      'Ceiling rose in matching solid brass'
    ],
    leadTime: 'In Stock · Dispatches next business day'
  },
  {
    id: 'silo-fluted-vessel',
    name: 'Silo Fluted Ceramic Vessel No. 04',
    subtitle: 'Coarse Sandstone Stoneware with Matte Glaze',
    category: 'Ceramics',
    price: 240,
    rating: 5.0,
    reviewCount: 29,
    inStock: true,
    stockCount: 8,
    image: vesselImg,
    additionalImages: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: 'Ø 22cm × H 36cm (Weight: 3.4kg)',
    materials: ['Stoneware Clay', 'Coarse River Sand', 'Chalk-White Matte Slip Glaze'],
    designer: 'Maren Lindqvist, Gotland',
    origin: 'Wood-fired kiln in Visby, Sweden',
    description: 'Wheel-thrown and ribbed by hand using vintage wooden rib tools. Each Silo Vessel bears distinctive tactile ridges and slight mineral speckling from natural sand gathered along Baltic estuaries.',
    features: [
      'Fully water-tight internal vitreous glaze',
      'Subtle mineral flecks and unique flame markings',
      'Weighted pedestal foot prevents surface tipping',
      'Numbered edition stamp on unglazed base'
    ],
    leadTime: 'In Stock · Ready to ship'
  },
  {
    id: 'nero-monolith-table',
    name: 'Nero Marquina Monolith Coffee Table',
    subtitle: 'Honed Basque Black Marble with White Calcite Veins',
    category: 'Furniture',
    price: 2650,
    originalPrice: 2890,
    rating: 4.9,
    reviewCount: 16,
    inStock: true,
    stockCount: 3,
    image: marbleTableImg,
    additionalImages: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: 'L 120cm × W 70cm × H 32cm (Weight: 72kg)',
    materials: ['Authentic Nero Marquina Marble', 'Concealed Steel Sub-frame'],
    designer: 'Atelier Nordic Studio',
    origin: 'Extracted in Markina-Xemein, finished in Carrara',
    description: 'A low-profile statement centerpiece sculpted from monolithic blocks of deep pitch-black marble laced with lightning veins of natural white calcite. Honed to a velvety matte finish that invites human touch.',
    features: [
      'Matte satin hone resists fingerprints and reflection',
      'Chamfered 45-degree edge detailing',
      'Treated with oleophobic organic stone sealer',
      'Delivered via white-glove inside placement'
    ],
    leadTime: 'Limited Edition · 3 Units Remaining'
  },
  {
    id: 'travertine-pillar-lamp',
    name: 'Altum Travertine Table Lamp',
    subtitle: 'Porous Roman Travertine & Frosted Glass Sphere',
    category: 'Lighting',
    price: 490,
    rating: 4.8,
    reviewCount: 44,
    inStock: true,
    stockCount: 11,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: 'Ø 18cm × H 38cm',
    materials: ['Natural Roman Travertine', 'Acid-Etched Opal Glass', 'Knurled Brass Dimmer Switch'],
    designer: 'Lukas Berglund',
    origin: 'Tivoli, Italy',
    description: 'An architectural composition of raw un-filled travertine stone crowned by an ethereal glowing orb. The tactile pitted stone grounds the room, while tactile rotary brass dimmer allows smooth transition from reading brilliance to candlelight glow.',
    features: [
      'Continuous rotary dimmer on heavy stone base',
      'Subtle porous geological cavities preserved intact',
      'Includes 6W 2200K–2700K Warm Dim G9 LED bulb',
      'Braided black textile cord'
    ],
    leadTime: 'In Stock · Dispatches in 1–2 business days'
  },
  {
    id: 'arch-pedestal-bench',
    name: 'Svalbard Architectural Bench',
    subtitle: 'Fumed Smoked Oak & Cast Bronze Pins',
    category: 'Furniture',
    price: 1820,
    rating: 4.9,
    reviewCount: 21,
    inStock: true,
    stockCount: 5,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
    dimensions: 'L 160cm × W 42cm × H 45cm',
    materials: ['Fumed Solid Oak', 'Cast Bronze Dowels', 'Vegetable-Tanned Saddle Leather Strap'],
    designer: 'Kari Nyqvist',
    origin: 'Oslo, Norway',
    description: 'Originally commissioned for a gallery pavilion in Bergen, this low bench displays bold monolithic slab legs locked together with hand-cast bronze pins. Beautiful at the foot of a bed or grounding an entryway.',
    features: [
      'Traditional Japanese mortise and tenon joinery',
      'Fumed in closed chambers for deep coffee-black grain',
      'Optional vegetable-tanned harness leather seat bolster',
      'Supports up to 280kg static load'
    ],
    leadTime: 'Made to order · Dispatches in 1–2 weeks'
  },
  {
    id: 'cast-iron-incense-burner',
    name: 'Vrå Heavy Cast Iron Censer',
    subtitle: 'Raw Cast Iron & Solid Polished Brass Lid',
    category: 'Objects',
    price: 145,
    rating: 5.0,
    reviewCount: 78,
    inStock: true,
    stockCount: 22,
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=1200&q=80',
    dimensions: 'Ø 12cm × H 9cm (Weight: 1.8kg)',
    materials: ['Sand-Cast Iron', 'Solid Turned Brass', 'Fireproof Basalt Wool Base'],
    designer: 'Studio Eemil',
    origin: 'Kockums foundry, Sweden',
    description: 'A tactile desktop sculpture that doubles as an aromatherapy vessel. Cast from recycled Nordic iron with a rough textured exterior and capped with a micro-perforated brass disc that releases smoke plumes in hypnotic ribbons.',
    features: [
      'Accommodates Japanese stick, rope, or cone incense',
      'Sand-cast iron retains residual heat safely',
      'Natural blackened linseed finish',
      'Comes packaged in embossed paulownia wood gift box'
    ],
    leadTime: 'In Stock · Ready to ship'
  },
  {
    id: 'nordic-merino-throw',
    name: 'Skye Heavyweight Alpaca Blanket',
    subtitle: '70% Fine Merino & 30% Baby Alpaca Twill',
    category: 'Objects',
    price: 310,
    rating: 4.9,
    reviewCount: 65,
    inStock: true,
    stockCount: 18,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1200&q=80',
    dimensions: '140cm × 210cm with fringed ends',
    materials: ['Peruvian Baby Alpaca', 'Organic Certified Merino Wool'],
    designer: 'Elinor Sandström',
    origin: 'Woven in Biella, Italy',
    description: 'Woven with a dense herringbone twill from undyed, naturally sorted fleece fibers. Incredibly soft, thermo-regulating, and heavy enough to drape with architectural gravity over sofa arms.',
    features: [
      'Zero synthetic dyes — 100% natural fleece tones',
      'Self-fringe borders finished by hand',
      'Hypoallergenic and naturally moisture-wicking',
      'Dry clean or air out in winter frost'
    ],
    leadTime: 'In Stock · Ready to ship'
  }
];
