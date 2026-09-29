/**
 * Ginger WashMate - Initial Mock Database & LocalStorage State Engine
 */

const DEFAULT_DATA = {
  settings: {
    businessName: "Ginger WashMate",
    branchName: "Central Car Care Center",
    currency: "₹",
    currencyCode: "INR",
    phone: "+91 98200 45821",
    email: "operations@gingerwashmate.com",
    address: "Ginger Plaza, Sector 18, Commercial Auto Hub, Metro City",
    operatingHours: "08:00 AM - 09:30 PM",
    autoNotifySms: true,
    autoNotifyWhatsapp: true
  },

  currentUser: {
    name: "Rashid Al-Kuwari",
    role: "Super Admin",
    title: "Operations Director",
    avatar: "RK",
    status: "active"
  },

  customers: [
    {
      id: "CUST-1001",
      name: "Ahmed Al Mansoori",
      phone: "+91 98201 11223",
      email: "ahmed.mansoori@emiratesholdings.com",
      createdAt: "2025-11-10",
      lastService: "2026-09-28",
      totalBookings: 14,
      totalSpend: 42500,
      notes: "Preferred technician: Tariq Mansoor. Requests no heavy chemical fragrance; microfiber drying only.",
      vehicles: ["QTR 45821", "QTR 78231", "QTR 12456"]
    },
    {
      id: "CUST-1002",
      name: "Sarah Jenkins",
      phone: "+91 98450 78219",
      email: "sarah.j@apexlogistics.in",
      createdAt: "2026-01-15",
      lastService: "2026-09-28",
      totalBookings: 6,
      totalSpend: 16800,
      notes: "Needs child car seats vacuumed and sanitized carefully.",
      vehicles: ["AUH 19420"]
    },
    {
      id: "CUST-1003",
      name: "Carlos Rodriguez",
      phone: "+91 97112 33455",
      email: "carlos.r@monaco-design.com",
      createdAt: "2026-03-02",
      lastService: "2026-09-27",
      totalBookings: 4,
      totalSpend: 28500,
      notes: "Matte wrap finish on vehicle - DO NOT use glossy wax or harsh solvent shampoos.",
      vehicles: ["DOH 77201", "DOH 88123"]
    },
    {
      id: "CUST-1004",
      name: "Vikram Mehta",
      phone: "+91 98220 99411",
      email: "vikram.mehta@zenithconsulting.in",
      createdAt: "2025-08-20",
      lastService: "2026-09-28",
      totalBookings: 19,
      totalSpend: 68900,
      notes: "Fleet account holder. Priority booking guaranteed.",
      vehicles: ["DXB 55102", "OMN 10243"]
    },
    {
      id: "CUST-1005",
      name: "Elena Rostova",
      phone: "+91 99304 88120",
      email: "elena.rostova@auroraglobal.com",
      createdAt: "2026-04-12",
      lastService: "2026-09-26",
      totalBookings: 5,
      totalSpend: 14200,
      notes: "Golden retriever owner - requires pet hair extraction add-on.",
      vehicles: ["KWI 39211"]
    },
    {
      id: "CUST-1006",
      name: "David Kim",
      phone: "+91 98110 55677",
      email: "david.kim@seoultech.co",
      createdAt: "2026-05-18",
      lastService: "2026-09-28",
      totalBookings: 3,
      totalSpend: 9500,
      notes: "Electric vehicle charging requested during service.",
      vehicles: ["QTR 99182"]
    }
  ],

  vehicleMaster: [
    { id: "VM-01", make: "Toyota", model: "Land Cruiser 300", type: "SUV" },
    { id: "VM-02", make: "Toyota", model: "Fortuner Legender", type: "SUV" },
    { id: "VM-03", make: "Toyota", model: "Camry Hybrid", type: "Sedan" },
    { id: "VM-04", make: "Toyota", model: "Innova Hycross", type: "MUV" },
    { id: "VM-05", make: "Toyota", model: "Glanza", type: "Hatchback" },
    { id: "VM-06", make: "BMW", model: "X5 xDrive40i", type: "SUV" },
    { id: "VM-07", make: "BMW", model: "3 Series Gran Limousine", type: "Sedan" },
    { id: "VM-08", make: "BMW", model: "7 Series 740i", type: "Luxury" },
    { id: "VM-09", make: "BMW", model: "M4 Coupe", type: "Coupe" },
    { id: "VM-10", make: "Mercedes-Benz", model: "G63 AMG V8", type: "SUV" },
    { id: "VM-11", make: "Mercedes-Benz", model: "E-Class LWB", type: "Sedan" },
    { id: "VM-12", make: "Mercedes-Benz", model: "S-Class S450", type: "Luxury" },
    { id: "VM-13", make: "Mercedes-Benz", model: "V-Class Luxury", type: "MUV" },
    { id: "VM-14", make: "Audi", model: "Q7 55 TFSI", type: "SUV" },
    { id: "VM-15", make: "Audi", model: "A6 Technology", type: "Sedan" },
    { id: "VM-16", make: "Audi", model: "A8L Quattro", type: "Luxury" },
    { id: "VM-17", make: "Hyundai", model: "Creta SX(O)", type: "SUV" },
    { id: "VM-18", make: "Hyundai", model: "Verna Turbo", type: "Sedan" },
    { id: "VM-19", make: "Hyundai", model: "i20 N-Line", type: "Hatchback" },
    { id: "VM-20", make: "Hyundai", model: "Alcazar Signature", type: "MUV" },
    { id: "VM-21", make: "Maruti Suzuki", model: "Swift ZXi+", type: "Hatchback" },
    { id: "VM-22", make: "Maruti Suzuki", model: "Brezza ZXi", type: "SUV" },
    { id: "VM-23", make: "Maruti Suzuki", model: "Ertiga ZXi", type: "MUV" },
    { id: "VM-24", make: "Maruti Suzuki", model: "Ciaz Alpha", type: "Sedan" },
    { id: "VM-25", make: "Tata", model: "Harrier Fearless+", type: "SUV" },
    { id: "VM-26", make: "Tata", model: "Nexon EV Empowered", type: "SUV" },
    { id: "VM-27", make: "Tata", model: "Altroz Racer", type: "Hatchback" },
    { id: "VM-28", make: "Tata", model: "Safari Dark", type: "MUV" },
    { id: "VM-29", make: "Mahindra", model: "XUV700 AX7-L", type: "SUV" },
    { id: "VM-30", make: "Mahindra", model: "Scorpio-N Z8-L", type: "SUV" },
    { id: "VM-31", make: "Mahindra", model: "Thar Roxx 4x4", type: "SUV" },
    { id: "VM-32", make: "Porsche", model: "Cayenne GTS", type: "SUV" },
    { id: "VM-33", make: "Porsche", model: "911 Carrera S", type: "Coupe" },
    { id: "VM-34", make: "Porsche", model: "Panamera GTS", type: "Luxury" },
    { id: "VM-35", make: "Land Rover", model: "Range Rover Sport", type: "SUV" },
    { id: "VM-36", make: "Kia", model: "Seltos GTX+", type: "SUV" },
    { id: "VM-37", make: "Kia", model: "Carnival Limousine", type: "MUV" },
    { id: "VM-38", make: "Nissan", model: "Patrol NISMO V8", type: "SUV" },
    { id: "VM-39", make: "Toyota", model: "Hilux 4x4 D-Cab", type: "Truck" },
    { id: "VM-40", make: "Isuzu", model: "D-Max V-Cross 4x4", type: "Truck" }
  ],

  vehicles: [
    {
      plateNumber: "QTR 45821",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      make: "Toyota",
      model: "Land Cruiser 300 GR Sport",
      year: 2024,
      type: "SUV",
      color: "Midnight Black Metallic",
      vin: "JTMBR05J8P4019283",
      lastService: "2026-09-28",
      totalServices: 8,
      status: "In Service",
      conditionNotes: "Minor road rash on front right bumper lip. Ceramic topcoat in good condition.",
      beforePhoto: "assets/images/vehicle_before.jpg",
      afterPhoto: "assets/images/vehicle_after.jpg",
      interiorPhoto: "assets/images/interior_clean.jpg",
      serviceHistory: [
        { date: "2026-09-28", service: "Platinum Detail & Paint Glow Package", amount: 5200, staff: "Tariq Mansoor", status: "In Service", bookingId: "BK-2026-00482" },
        { date: "2026-09-12", service: "Interior Cleaning", amount: 800, staff: "Rahim", status: "Completed", bookingId: "BK-2026-00410" },
        { date: "2026-08-28", service: "Premium Wash", amount: 1500, staff: "Ahmed", status: "Completed", bookingId: "BK-2026-00380" }
      ]
    },
    {
      plateNumber: "QTR 78231",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      make: "BMW",
      model: "X5 xDrive40i M Sport",
      year: 2023,
      type: "SUV",
      color: "Mineral White Metallic",
      vin: "WBA53BG06PW938299",
      lastService: "2026-09-20",
      totalServices: 4,
      status: "Completed",
      conditionNotes: "Gloss finish in mint condition. Microfiber drying requested.",
      beforePhoto: "assets/images/vehicle_before.jpg",
      afterPhoto: "assets/images/vehicle_after.jpg",
      interiorPhoto: "assets/images/interior_clean.jpg",
      serviceHistory: [
        { date: "2026-09-20", service: "Interior Cleaning", amount: 800, staff: "Rahim", status: "Completed", bookingId: "BK-2026-00452" },
        { date: "2026-08-14", service: "Gold Exterior Clean", amount: 1450, staff: "Sanjay Patel", status: "Completed", bookingId: "BK-2026-00355" }
      ]
    },
    {
      plateNumber: "QTR 12456",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      make: "Nissan",
      model: "Patrol NISMO V8",
      year: 2024,
      type: "SUV",
      color: "Diamond Black",
      vin: "JN8AY2NC7P9019284",
      lastService: "2026-09-12",
      totalServices: 3,
      status: "Completed",
      conditionNotes: "Undercarriage protection inspected.",
      beforePhoto: "assets/images/vehicle_before.jpg",
      afterPhoto: "assets/images/vehicle_after.jpg",
      interiorPhoto: "assets/images/interior_clean.jpg",
      serviceHistory: [
        { date: "2026-09-12", service: "Foam Hydro Wash & Wax", amount: 1200, staff: "Aisha Rahman", status: "Completed", bookingId: "BK-2026-00421" }
      ]
    },
    {
      plateNumber: "AUH 19420",
      customerId: "CUST-1002",
      customerName: "Sarah Jenkins",
      make: "BMW",
      model: "530i M Sport",
      year: 2023,
      type: "Sedan",
      color: "Phytonic Blue",
      vin: "WBA53BG06PW938210",
      lastService: "2026-09-28",
      totalServices: 6,
      status: "Ready for Pickup",
      conditionNotes: "Clean body condition. Rear left alloy has mild curb abrasion.",
      serviceHistory: [
        { date: "2026-09-28", service: "Executive Fleet Care Package", amount: 2400, staff: "Zayd Al-Harbi", status: "Ready for Pickup", bookingId: "BK-2026-00483" },
        { date: "2026-08-10", service: "Express Hydro Wash & Dry", amount: 750, staff: "Carlos Silva", status: "Completed", bookingId: "BK-2026-00340" }
      ]
    },
    {
      plateNumber: "DOH 77201",
      customerId: "CUST-1003",
      customerName: "Carlos Rodriguez",
      make: "Mercedes-Benz",
      model: "G63 AMG V8 BiTurbo",
      year: 2024,
      type: "SUV",
      color: "Magno Night Black (Matte)",
      vin: "W1N4632761X894102",
      lastService: "2026-09-27",
      totalServices: 4,
      status: "Quality Check",
      conditionNotes: "Special matte finish wash required using pH neutral foam without wax agents.",
      serviceHistory: [
        { date: "2026-09-27", service: "Matte Wrap Specialist Care", amount: 3200, staff: "Michael Chen", status: "Quality Check", bookingId: "BK-2026-00484" }
      ]
    },
    {
      plateNumber: "DOH 88123",
      customerId: "CUST-1003",
      customerName: "Carlos Rodriguez",
      make: "Porsche",
      model: "911 Carrera S (992)",
      year: 2023,
      type: "Coupe",
      color: "Guards Red",
      vin: "WP0AB2A99PS110293",
      lastService: "2026-08-20",
      totalServices: 2,
      status: "Completed",
      conditionNotes: "Full front PPF installed. Hand wash with ultra-soft mitts only.",
      serviceHistory: [
        { date: "2026-08-20", service: "Ceramic Paint Protection Wash", amount: 2800, staff: "Tariq Mansoor", status: "Completed", bookingId: "BK-2026-00360" }
      ]
    },
    {
      plateNumber: "DXB 55102",
      customerId: "CUST-1004",
      customerName: "Vikram Mehta",
      make: "Land Rover",
      model: "Range Rover Sport Autobiography",
      year: 2024,
      type: "SUV",
      color: "Santorini Black",
      vin: "SALWR2V42RA883910",
      lastService: "2026-09-28",
      totalServices: 11,
      status: "In Service",
      conditionNotes: "Clean body. High-gloss piano black trim on pillars polished.",
      serviceHistory: [
        { date: "2026-09-28", service: "Platinum Detail & Paint Glow Package", amount: 5200, staff: "Tariq Mansoor", status: "In Service", bookingId: "BK-2026-00486" }
      ]
    },
    {
      plateNumber: "OMN 10243",
      customerId: "CUST-1004",
      customerName: "Vikram Mehta",
      make: "Audi",
      model: "RS Q8 Performance",
      year: 2023,
      type: "SUV",
      color: "Nardo Grey",
      vin: "WAUZZZ4M0PD019284",
      lastService: "2026-09-05",
      totalServices: 5,
      status: "Completed",
      conditionNotes: "Carbon fiber exterior pack treated with UV sealant.",
      serviceHistory: [
        { date: "2026-09-05", service: "Gold Exterior + Interior Deep Clean", amount: 2200, staff: "Sanjay Patel", status: "Completed", bookingId: "BK-2026-00401" }
      ]
    },
    {
      plateNumber: "KWI 39211",
      customerId: "CUST-1005",
      customerName: "Elena Rostova",
      make: "Tesla",
      model: "Model Y Performance",
      year: 2024,
      type: "Sedan",
      color: "Pearl White Multi-Coat",
      vin: "7SAYGDEE9PF112093",
      lastService: "2026-09-26",
      totalServices: 5,
      status: "Completed",
      conditionNotes: "Glass roof hydrophobic treated. Door sill rubber protected.",
      serviceHistory: [
        { date: "2026-09-26", service: "Eco Steam Sanitization & Wash", amount: 1800, staff: "Aisha Rahman", status: "Completed", bookingId: "BK-2026-00487" }
      ]
    },
    {
      plateNumber: "QTR 99182",
      customerId: "CUST-1006",
      customerName: "David Kim",
      make: "Lexus",
      model: "LX 600 Ultra Luxury",
      year: 2023,
      type: "SUV",
      color: "Sonic Titanium",
      vin: "JTJHY7AX8P4029103",
      lastService: "2026-09-28",
      totalServices: 3,
      status: "Checked In",
      conditionNotes: "Chrome trim has light water spotting.",
      serviceHistory: [
        { date: "2026-09-28", service: "Ceramic Pro Hydrophobic Maintenance", amount: 4800, staff: "Sanjay Patel", status: "Checked In", bookingId: "BK-2026-00485" }
      ]
    }
  ],

  // Individual Wash Services (with direct Offer/Discount pricing)
  services: [
    {
      id: "SRV-01",
      name: "Foam Hydro Pressure Wash",
      category: "Exterior Wash",
      vehicleType: "All Types",
      duration: "35 mins",
      regularPrice: 650,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 650,
      finalPrice: 650,
      price: 650,
      status: "Active",
      description: "High-pressure touchless pre-wash, Snow foam cannon application, two-bucket hand wash, rim cleaning, and warm air blow dry."
    },
    {
      id: "SRV-02",
      name: "Full Interior Steam & Sanitize Detail",
      category: "Interior Cleaning",
      vehicleType: "Sedan / SUV",
      duration: "60 mins",
      regularPrice: 1850,
      offerType: "percentage",
      discountPercent: 10,
      offerPrice: 1665,
      finalPrice: 1665,
      price: 1665,
      status: "Active",
      description: "Pressurized steam vent sanitization, deep carpet and mat extraction, dashboard UV conditioning, door jamb cleanse, and interior glass clarity wipe."
    },
    {
      id: "SRV-03",
      name: "Gold Exterior + Engine Bay Clean",
      category: "Exterior Cleaning",
      vehicleType: "All Types",
      duration: "55 mins",
      regularPrice: 1450,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 1450,
      finalPrice: 1450,
      price: 1450,
      status: "Active",
      description: "Foam hydro pressure wash + degreasing and dressing of engine bay + high-gloss tire dressing + synthetic hydrophobic sealant spray."
    },
    {
      id: "SRV-04",
      name: "Ceramic Express Paint Protection",
      category: "Ceramic & Protection",
      vehicleType: "All Types",
      duration: "90 mins",
      regularPrice: 3800,
      offerType: "fixed",
      discountPercent: 0,
      offerPrice: 3500,
      finalPrice: 3500,
      price: 3500,
      status: "Active",
      description: "Clay bar decontamination, 1-step gloss enhancement, 6-month ceramic silica sealant bonding, wheel face ceramic spray."
    },
    {
      id: "SRV-05",
      name: "Underbody Anti-Corrosion Flush",
      category: "Exterior Cleaning",
      vehicleType: "SUV / Truck",
      duration: "30 mins",
      regularPrice: 850,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 850,
      finalPrice: 850,
      price: 850,
      status: "Active",
      description: "Multi-nozzle high-pressure chassis flush, mud removal, and anti-rust hydrophobic protective spray."
    },
    {
      id: "SRV-06",
      name: "Express Touchless Rinse & Dry",
      category: "Express Wash",
      vehicleType: "All Types",
      duration: "20 mins",
      regularPrice: 450,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 450,
      finalPrice: 450,
      price: 450,
      status: "Active",
      description: "Touchless pressure wash with spot-free deionized water rinse and warm high-velocity air drying."
    },
    {
      id: "SRV-07",
      name: "Leather Nourish & Seat Conditioning",
      category: "Interior Cleaning",
      vehicleType: "All Types",
      duration: "45 mins",
      regularPrice: 1200,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 1200,
      finalPrice: 1200,
      price: 1200,
      status: "Active",
      description: "pH-balanced deep leather pore scrubbing followed by matte finish beeswax nutrient conditioning."
    },
    {
      id: "SRV-08",
      name: "Paint Correction & Swirl Removal (Stage 1)",
      category: "Full Car Detailing",
      vehicleType: "All Types",
      duration: "120 mins",
      regularPrice: 4500,
      offerType: "percentage",
      discountPercent: 10,
      offerPrice: 4050,
      finalPrice: 4050,
      price: 4050,
      status: "Active",
      description: "Dual-action machine polish removing 60-70% of light swirl marks, holograms, and oxidation."
    },
    {
      id: "SRV-09",
      name: "Premium Wash",
      category: "Exterior Wash",
      vehicleType: "All Types",
      duration: "45 mins",
      regularPrice: 1500,
      offerType: "percentage",
      discountPercent: 10,
      offerPrice: 1350,
      finalPrice: 1350,
      price: 1350,
      status: "Active",
      description: "Snow foam pre-soak, pH-neutral hand bath, wheel decontamination, spray hydrophobic seal, and tire dressing."
    },
    {
      id: "SRV-10",
      name: "Interior Cleaning",
      category: "Interior Cleaning",
      vehicleType: "All Types",
      duration: "40 mins",
      regularPrice: 900,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 900,
      finalPrice: 900,
      price: 900,
      status: "Active",
      description: "Thorough vacuuming of seats, carpets, trunk, dashboard UV conditioning, and interior glass cleaning."
    },
    {
      id: "SRV-11",
      name: "Full Detailing",
      category: "Full Car Detailing",
      vehicleType: "All Types",
      duration: "120 mins",
      regularPrice: 2500,
      offerType: "none",
      discountPercent: 0,
      offerPrice: 2500,
      finalPrice: 2500,
      price: 2500,
      status: "Active",
      description: "Comprehensive exterior hand wash, clay bar, interior steam sanitize, leather conditioning, and synthetic wax protection."
    }
  ],

  // DEDICATED PACKAGES MODULE DATA (with direct Offer/Discount pricing)
  packages: [
    {
      id: "PKG-01",
      name: "Basic Quick Wash Package",
      packageType: "Basic Wash",
      vehicleType: "All Types",
      description: "Fast daily upkeep wash covering exterior foam cleanse, wheel rinse, and basic glass wipe.",
      includedServices: [
        "Foam Hydro Pressure Wash",
        "Express Touchless Rinse & Dry"
      ],
      duration: "30 mins",
      totalWashes: 3,
      validityDays: 30,
      validityDuration: "30 Days",
      regularPrice: 1100,
      offerType: "fixed",
      discountPercent: 23,
      offerPrice: 850,
      finalPrice: 850,
      packagePrice: 850,
      discount: 250,
      status: "Active",
      createdAt: "2026-01-10"
    },
    {
      id: "PKG-02",
      name: "Standard Clean & Shine Package",
      packageType: "Standard Wash",
      vehicleType: "Sedan / Hatchback",
      description: "Complete exterior hand wash with tire dressing and thorough interior vacuuming with window cleaning.",
      includedServices: [
        "Foam Hydro Pressure Wash",
        "Express Touchless Rinse & Dry"
      ],
      duration: "45 mins",
      totalWashes: 4,
      validityDays: 60,
      validityDuration: "60 Days",
      regularPrice: 1800,
      offerType: "fixed",
      discountPercent: 19,
      offerPrice: 1450,
      finalPrice: 1450,
      packagePrice: 1450,
      discount: 350,
      status: "Active",
      createdAt: "2026-01-15"
    },
    {
      id: "PKG-03",
      name: "Premium Hydro & Wax Spa",
      packageType: "Premium Wash",
      vehicleType: "All Types",
      description: "Dual-foam bath, hydrophobic spray sealant, rim iron decontamination, and deep cabin vacuum.",
      includedServices: [
        "Foam Hydro Pressure Wash",
        "Gold Exterior + Engine Bay Clean"
      ],
      duration: "60 mins",
      totalWashes: 5,
      validityDays: 90,
      validityDuration: "3 Months",
      regularPrice: 2100,
      offerType: "fixed",
      discountPercent: 17,
      offerPrice: 1750,
      finalPrice: 1750,
      packagePrice: 1750,
      discount: 350,
      status: "Active",
      createdAt: "2026-02-01"
    },
    {
      id: "PKG-04",
      name: "Executive Fleet Care Package",
      packageType: "Full Car Detailing",
      vehicleType: "All Types",
      description: "Our bestselling inside-out executive treatment: exterior foam wash, interior steam sanitize, and engine bay detailing.",
      includedServices: [
        "Foam Hydro Pressure Wash",
        "Full Interior Steam & Sanitize Detail",
        "Gold Exterior + Engine Bay Clean"
      ],
      duration: "75 mins",
      totalWashes: 6,
      validityDays: 120,
      validityDuration: "4 Months",
      regularPrice: 3950,
      offerType: "fixed",
      discountPercent: 39,
      offerPrice: 2400,
      finalPrice: 2400,
      packagePrice: 2400,
      discount: 1550,
      status: "Active",
      createdAt: "2026-02-15"
    },
    {
      id: "PKG-05",
      name: "Platinum Detail & Paint Glow Package",
      packageType: "Full Car Detailing",
      vehicleType: "All Types",
      description: "Comprehensive multi-stage detailing including clay bar, Ceramic Express shield, interior steam, and undercarriage rinse.",
      includedServices: [
        "Foam Hydro Pressure Wash",
        "Full Interior Steam & Sanitize Detail",
        "Ceramic Express Paint Protection",
        "Underbody Anti-Corrosion Flush"
      ],
      duration: "140 mins",
      totalWashes: 8,
      validityDays: 180,
      validityDuration: "6 Months",
      regularPrice: 7150,
      offerType: "percentage",
      discountPercent: 27,
      offerPrice: 5200,
      finalPrice: 5200,
      packagePrice: 5200,
      discount: 1950,
      status: "Active",
      createdAt: "2026-03-01"
    },
    {
      id: "PKG-06",
      name: "Deep Interior Germ-Free Sanctuary",
      packageType: "Interior Cleaning",
      vehicleType: "All Types",
      description: "High-temperature 160°C dry steam sanitization, leather nourishment balm, upholstery hot extraction, and AC ozone treatment.",
      includedServices: [
        "Full Interior Steam & Sanitize Detail",
        "Leather Nourish & Seat Conditioning"
      ],
      duration: "85 mins",
      totalWashes: 4,
      validityDays: 90,
      validityDuration: "3 Months",
      regularPrice: 3050,
      offerType: "fixed",
      discountPercent: 23,
      offerPrice: 2350,
      finalPrice: 2350,
      packagePrice: 2350,
      discount: 700,
      status: "Active",
      createdAt: "2026-03-10"
    },
    {
      id: "PKG-07",
      name: "SUV Heavy Duty 4x4 Mud Buster",
      packageType: "SUV / Large Vehicle Packages",
      vehicleType: "SUV / Truck",
      description: "Specially formulated for mud, sand, and underbody salt buildup on full-size SUVs and pickup trucks.",
      includedServices: [
        "Foam Hydro Pressure Wash",
        "Underbody Anti-Corrosion Flush",
        "Gold Exterior + Engine Bay Clean"
      ],
      duration: "70 mins",
      totalWashes: 5,
      validityDays: 90,
      validityDuration: "3 Months",
      regularPrice: 2950,
      offerType: "fixed",
      discountPercent: 24,
      offerPrice: 2250,
      finalPrice: 2250,
      packagePrice: 2250,
      discount: 700,
      status: "Active",
      createdAt: "2026-03-20"
    },
    {
      id: "PKG-08",
      name: "Rapid 20-Min Commuter Express",
      packageType: "Express Wash",
      vehicleType: "Sedan / Hatchback",
      description: "In-and-out speed wash: high-pressure blast, shampoo cannon, rinse, tire shine, and express blow dry.",
      includedServices: [
        "Express Touchless Rinse & Dry",
        "Foam Hydro Pressure Wash"
      ],
      duration: "20 mins",
      totalWashes: 10,
      validityDays: 60,
      validityDuration: "60 Days",
      regularPrice: 1100,
      offerType: "fixed",
      discountPercent: 32,
      offerPrice: 750,
      finalPrice: 750,
      packagePrice: 750,
      discount: 350,
      status: "Active",
      createdAt: "2026-04-01"
    },
    {
      id: "PKG-09",
      name: "Paint Correction & Showroom Glaze",
      packageType: "Full Car Detailing",
      vehicleType: "All Types",
      description: "Stage 1 machine polishing to eliminate swirls and restore deep liquid gloss, topped with silica sealant.",
      includedServices: [
        "Paint Correction & Swirl Removal (Stage 1)",
        "Foam Hydro Pressure Wash",
        "Ceramic Express Paint Protection"
      ],
      duration: "180 mins",
      totalWashes: 6,
      validityDays: 365,
      validityDuration: "1 Year",
      regularPrice: 8950,
      offerType: "percentage",
      discountPercent: 22,
      offerPrice: 6999,
      finalPrice: 6999,
      packagePrice: 6999,
      discount: 1951,
      status: "Active",
      createdAt: "2026-04-10"
    }
  ],

  packageCategories: [
    "Basic Wash",
    "Standard Wash",
    "Premium Wash",
    "Interior Cleaning",
    "Exterior Cleaning",
    "Full Car Detailing",
    "Express Wash",
    "Deep Cleaning",
    "SUV / Large Vehicle Packages"
  ],

  // Customer Purchased Packages with Washes Tracking & Validity Status
  customerPackages: [
    {
      id: "CPKG-101",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      packageId: "PKG-05",
      packageName: "Platinum Detail & Paint Glow Package",
      vehiclePlate: "QTR 45821",
      vehicleModel: "Toyota Land Cruiser 300 GR Sport",
      purchaseDate: "2026-08-01",
      validityDays: 180,
      validityDuration: "6 Months",
      expiryDate: "2027-01-28",
      totalWashes: 8,
      usedWashes: 3,
      remainingWashes: 5,
      pricePaid: 5200,
      status: "Active",
      usageHistory: [
        { date: "2026-08-28", bookingId: "BK-2026-00380", serviceName: "Platinum Detail Wash", staff: "Ahmed", vehiclePlate: "QTR 45821" },
        { date: "2026-09-12", bookingId: "BK-2026-00410", serviceName: "Interior Cleaning & Touchup", staff: "Rahim", vehiclePlate: "QTR 45821" },
        { date: "2026-09-28", bookingId: "BK-2026-00482", serviceName: "Platinum Detail & Paint Glow", staff: "Tariq Mansoor", vehiclePlate: "QTR 45821" }
      ]
    },
    {
      id: "CPKG-102",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      packageId: "PKG-03",
      packageName: "Premium Hydro & Wax Spa",
      vehiclePlate: "QTR 78231",
      vehicleModel: "BMW X5 xDrive40i M Sport",
      purchaseDate: "2026-07-15",
      validityDays: 90,
      validityDuration: "3 Months",
      expiryDate: "2026-10-13",
      totalWashes: 5,
      usedWashes: 2,
      remainingWashes: 3,
      pricePaid: 1750,
      status: "Active",
      usageHistory: [
        { date: "2026-08-14", bookingId: "BK-2026-00355", serviceName: "Gold Exterior Clean", staff: "Sanjay Patel", vehiclePlate: "QTR 78231" },
        { date: "2026-09-20", bookingId: "BK-2026-00452", serviceName: "Interior Deep Spa", staff: "Rahim", vehiclePlate: "QTR 78231" }
      ]
    },
    {
      id: "CPKG-103",
      customerId: "CUST-1002",
      customerName: "Sarah Jenkins",
      packageId: "PKG-04",
      packageName: "Executive Fleet Care Package",
      vehiclePlate: "AUH 19420",
      vehicleModel: "BMW 530i M Sport",
      purchaseDate: "2026-06-01",
      validityDays: 120,
      validityDuration: "4 Months",
      expiryDate: "2026-09-29",
      totalWashes: 6,
      usedWashes: 2,
      remainingWashes: 4,
      pricePaid: 2400,
      status: "Active",
      usageHistory: [
        { date: "2026-08-10", bookingId: "BK-2026-00340", serviceName: "Express Hydro Wash & Dry", staff: "Carlos Silva", vehiclePlate: "AUH 19420" },
        { date: "2026-09-28", bookingId: "BK-2026-00483", serviceName: "Executive Fleet Care Package", staff: "Zayd Al-Harbi", vehiclePlate: "AUH 19420" }
      ]
    },
    {
      id: "CPKG-104",
      customerId: "CUST-1003",
      customerName: "Carlos Rodriguez",
      packageId: "PKG-07",
      packageName: "SUV Heavy Duty 4x4 Mud Buster",
      vehiclePlate: "DOH 77201",
      vehicleModel: "Mercedes-Benz G63 AMG V8 BiTurbo",
      purchaseDate: "2026-05-10",
      validityDays: 90,
      validityDuration: "3 Months",
      expiryDate: "2026-08-08",
      totalWashes: 4,
      usedWashes: 4,
      remainingWashes: 0,
      pricePaid: 2250,
      status: "Completed",
      usageHistory: [
        { date: "2026-05-20", bookingId: "BK-2026-00290", serviceName: "Mud Buster Wash", staff: "Michael Chen", vehiclePlate: "DOH 77201" },
        { date: "2026-06-15", bookingId: "BK-2026-00315", serviceName: "Mud Buster Wash", staff: "Michael Chen", vehiclePlate: "DOH 77201" },
        { date: "2026-07-10", bookingId: "BK-2026-00330", serviceName: "Underbody Flush", staff: "Michael Chen", vehiclePlate: "DOH 77201" },
        { date: "2026-08-05", bookingId: "BK-2026-00350", serviceName: "Full Mud Detail", staff: "Michael Chen", vehiclePlate: "DOH 77201" }
      ]
    },
    {
      id: "CPKG-105",
      customerId: "CUST-1003",
      customerName: "Carlos Rodriguez",
      packageId: "PKG-09",
      packageName: "Paint Correction & Showroom Glaze",
      vehiclePlate: "DOH 88123",
      vehicleModel: "Porsche 911 Carrera S (992)",
      purchaseDate: "2026-08-20",
      validityDays: 365,
      validityDuration: "1 Year",
      expiryDate: "2027-08-20",
      totalWashes: 6,
      usedWashes: 1,
      remainingWashes: 5,
      pricePaid: 6999,
      status: "Active",
      usageHistory: [
        { date: "2026-08-20", bookingId: "BK-2026-00360", serviceName: "Ceramic Paint Protection Wash", staff: "Tariq Mansoor", vehiclePlate: "DOH 88123" }
      ]
    },
    {
      id: "CPKG-106",
      customerId: "CUST-1004",
      customerName: "Vikram Mehta",
      packageId: "PKG-05",
      packageName: "Platinum Detail & Paint Glow Package",
      vehiclePlate: "DXB 55102",
      vehicleModel: "Land Rover Range Rover Sport Autobiography",
      purchaseDate: "2026-09-01",
      validityDays: 180,
      validityDuration: "6 Months",
      expiryDate: "2027-02-28",
      totalWashes: 8,
      usedWashes: 1,
      remainingWashes: 7,
      pricePaid: 5200,
      status: "Active",
      usageHistory: [
        { date: "2026-09-28", bookingId: "BK-2026-00486", serviceName: "Platinum Detail & Paint Glow Package", staff: "Tariq Mansoor", vehiclePlate: "DXB 55102" }
      ]
    },
    {
      id: "CPKG-107",
      customerId: "CUST-1005",
      customerName: "Elena Rostova",
      packageId: "PKG-02",
      packageName: "Standard Clean & Shine Package",
      vehiclePlate: "KWI 39211",
      vehicleModel: "Tesla Model Y Performance",
      purchaseDate: "2026-04-12",
      validityDays: 60,
      validityDuration: "60 Days",
      expiryDate: "2026-06-12",
      totalWashes: 4,
      usedWashes: 3,
      remainingWashes: 1,
      pricePaid: 1450,
      status: "Expired",
      usageHistory: [
        { date: "2026-04-12", bookingId: "BK-2026-00210", serviceName: "Standard Clean", staff: "Aisha Rahman", vehiclePlate: "KWI 39211" },
        { date: "2026-05-02", bookingId: "BK-2026-00245", serviceName: "Standard Clean", staff: "Aisha Rahman", vehiclePlate: "KWI 39211" },
        { date: "2026-05-28", bookingId: "BK-2026-00280", serviceName: "Standard Clean", staff: "Aisha Rahman", vehiclePlate: "KWI 39211" }
      ]
    },
    {
      id: "CPKG-108",
      customerId: "CUST-1006",
      customerName: "David Kim",
      packageId: "PKG-01",
      packageName: "Basic Quick Wash Package",
      vehiclePlate: "QTR 99182",
      vehicleModel: "Lexus LX 600 Ultra Luxury",
      purchaseDate: "2026-09-01",
      validityDays: 30,
      validityDuration: "30 Days",
      expiryDate: "2026-10-01",
      totalWashes: 3,
      usedWashes: 1,
      remainingWashes: 2,
      pricePaid: 850,
      status: "Active",
      usageHistory: [
        { date: "2026-09-28", bookingId: "BK-2026-00485", serviceName: "Basic Quick Wash", staff: "Sanjay Patel", vehiclePlate: "QTR 99182" }
      ]
    }
  ],

  addons: [
    { id: "ADD-01", name: "Engine Bay De-grease & Dressing", price: 450 },
    { id: "ADD-02", name: "Rain-X All-Glass Hydrophobic Sealant", price: 350 },
    { id: "ADD-03", name: "Deep Leather Balm Conditioning", price: 600 },
    { id: "ADD-04", name: "Pet Hair Deep Mechanical Extraction", price: 500 },
    { id: "ADD-05", name: "Ozone Gas AC Bacteria & Odor Removal", price: 400 },
    { id: "ADD-06", name: "Headlight Restoration & UV Clearcoat", price: 650 },
    { id: "ADD-07", name: "Wheel Face Ceramic Protective Spray", price: 550 }
  ],

  staff: [
    {
      id: "STF-101",
      name: "Tariq Mansoor",
      role: "Lead Master Detailer",
      phone: "+91 98204 77112",
      specialization: "Paint Correction & Ceramic Coatings",
      availability: "In Service",
      activeBookings: 1,
      completedToday: 4,
      avatar: "TM",
      status: "Active"
    },
    {
      id: "STF-102",
      name: "Sanjay Patel",
      role: "Operations Supervisor",
      phone: "+91 98450 11988",
      specialization: "Operations Oversight & Interior Detailing",
      availability: "Available",
      activeBookings: 0,
      completedToday: 5,
      avatar: "SP",
      status: "Active"
    },
    {
      id: "STF-103",
      name: "Michael Chen",
      role: "Quality Assurance Inspector",
      phone: "+91 97115 88201",
      specialization: "Quality Assurance & Multi-Point Inspection",
      availability: "In Service",
      activeBookings: 1,
      completedToday: 7,
      avatar: "MC",
      status: "Active"
    },
    {
      id: "STF-104",
      name: "Zayd Al-Harbi",
      role: "Senior Detailer",
      phone: "+91 99302 44109",
      specialization: "Exterior Buffing & Fleet Care",
      availability: "In Service",
      activeBookings: 1,
      completedToday: 3,
      avatar: "ZH",
      status: "Active"
    },
    {
      id: "STF-105",
      name: "Carlos Silva",
      role: "Hydro Wash Specialist",
      phone: "+91 98119 22340",
      specialization: "High-Pressure Hydro Wash & Foam Systems",
      availability: "Available",
      activeBookings: 0,
      completedToday: 6,
      avatar: "CS",
      status: "Active"
    },
    {
      id: "STF-106",
      name: "Aisha Rahman",
      role: "Customer Service & Billing",
      phone: "+91 98205 66782",
      specialization: "Customer Intake, Billing & Scheduling",
      availability: "Available",
      activeBookings: 0,
      completedToday: 18,
      avatar: "AR",
      status: "Active"
    }
  ],

  // Simple Booking Status Lifecycle Definition
  workflowStages: [
    { id: 1, key: "confirmed", label: "Booking Confirmed", order: 1 },
    { id: 2, key: "checked_in", label: "Vehicle Checked In", order: 2 },
    { id: 3, key: "in_service", label: "Service In Progress", order: 3 },
    { id: 4, key: "quality_check", label: "Quality Check", order: 4 },
    { id: 5, key: "ready_for_pickup", label: "Ready for Pickup", order: 5 },
    { id: 6, key: "completed", label: "Completed", order: 6 }
  ],

  bookingStatuses: [
    "Confirmed",
    "Checked In",
    "In Service",
    "Quality Check",
    "Ready for Pickup",
    "Completed",
    "Cancelled"
  ],

  bookings: [
    {
      id: "BK-2026-00482",
      date: "2026-09-28",
      time: "09:30 AM",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      customerPhone: "+91 98201 11223",
      vehiclePlate: "QTR 45821",
      vehicleModel: "Toyota Land Cruiser 300 GR Sport (2024)",
      vehicleType: "SUV",
      bookingType: "Package",
      serviceName: "Platinum Detail & Paint Glow Package",
      packageId: "PKG-05",
      assignedStaff: "Tariq Mansoor",
      vehiclesCount: 1,
      vehicleServices: [
        {
          vehiclePlate: "QTR 45821",
          vehicleModel: "Toyota Land Cruiser 300 GR Sport (2024)",
          serviceType: "Package",
          serviceId: "PKG-05",
          serviceName: "Platinum Detail & Paint Glow Package",
          regularPrice: 7150,
          offerPrice: 5200,
          finalPrice: 5200,
          addons: ["Engine Bay De-grease & Dressing", "Rain-X All-Glass Hydrophobic Sealant"],
          addonsTotal: 800,
          vehicleTotal: 6000
        }
      ],
      amount: 5200,
      discount: 200,
      tax: 0,
      totalAmount: 5000,
      paymentStatus: "Paid",
      paymentMethod: "Credit Card (POS)",
      bookingStatus: "In Service",
      currentStageIndex: 3, // Service In Progress
      stageTimestamp: "10:15 AM",
      stageActor: "Tariq Mansoor",
      notes: "Customer waiting in Executive Lounge. Use no harsh fragrance. Mirror paint correction.",
      addons: ["Engine Bay De-grease & Dressing", "Rain-X All-Glass Hydrophobic Sealant"],
      timeline: [
        { stage: "Booking Confirmed", time: "08:15 AM", actor: "Front Desk", note: "Priority customer reservation" },
        { stage: "Vehicle Checked In", time: "09:25 AM", actor: "Aisha Rahman", note: "Keys received. Mileage: 14,210 km" },
        { stage: "Service In Progress", time: "09:45 AM", actor: "Tariq Mansoor", note: "Pre-soak snow foam & steam detailing" }
      ],
      beforePhoto: "assets/images/vehicle_before.jpg",
      afterPhoto: "assets/images/vehicle_after.jpg"
    },
    {
      id: "BK-2026-00483",
      date: "2026-09-28",
      time: "10:00 AM",
      customerId: "CUST-1002",
      customerName: "Sarah Jenkins",
      customerPhone: "+91 98450 78219",
      vehiclePlate: "AUH 19420",
      vehicleModel: "BMW 530i M Sport (2023)",
      vehicleType: "Sedan",
      bookingType: "Package",
      serviceName: "Executive Fleet Care Package",
      packageId: "PKG-04",
      assignedStaff: "Zayd Al-Harbi",
      vehiclesCount: 1,
      vehicleServices: [
        {
          vehiclePlate: "AUH 19420",
          vehicleModel: "BMW 530i M Sport (2023)",
          serviceType: "Package",
          serviceId: "PKG-04",
          serviceName: "Executive Fleet Care Package",
          regularPrice: 3950,
          offerPrice: 2400,
          finalPrice: 2400,
          addons: ["Pet Hair Deep Mechanical Extraction"],
          addonsTotal: 500,
          vehicleTotal: 2900
        }
      ],
      amount: 2400,
      discount: 0,
      tax: 0,
      totalAmount: 2400,
      paymentStatus: "Paid",
      paymentMethod: "Online UPI",
      bookingStatus: "Ready for Pickup",
      currentStageIndex: 5, // Ready for Pickup
      stageTimestamp: "11:20 AM",
      stageActor: "Michael Chen",
      notes: "Child seats sanitized thoroughly.",
      addons: ["Pet Hair Deep Mechanical Extraction"],
      timeline: [
        { stage: "Booking Confirmed", time: "08:30 AM", actor: "Aisha Rahman", note: "Front desk booking" },
        { stage: "Vehicle Checked In", time: "09:55 AM", actor: "Aisha Rahman", note: "Keys received" },
        { stage: "Service In Progress", time: "10:15 AM", actor: "Zayd Al-Harbi", note: "Interior steam sanitize & extraction" },
        { stage: "Quality Check", time: "11:10 AM", actor: "Michael Chen", note: "Pass 100/100 on checklist" },
        { stage: "Ready for Pickup", time: "11:20 AM", actor: "Aisha Rahman", note: "Automated SMS notification dispatched" }
      ]
    },
    {
      id: "BK-2026-00484",
      date: "2026-09-28",
      time: "11:15 AM",
      customerId: "CUST-1003",
      customerName: "Carlos Rodriguez",
      customerPhone: "+91 97112 33455",
      vehiclePlate: "DOH 77201",
      vehicleModel: "Mercedes-Benz G63 AMG (2024)",
      vehicleType: "SUV",
      bookingType: "Service",
      serviceName: "Foam Hydro Pressure Wash",
      packageId: null,
      assignedStaff: "Michael Chen",
      vehiclesCount: 1,
      vehicleServices: [
        {
          vehiclePlate: "DOH 77201",
          vehicleModel: "Mercedes-Benz G63 AMG (2024)",
          serviceType: "Service",
          serviceId: "SRV-01",
          serviceName: "Foam Hydro Pressure Wash",
          regularPrice: 650,
          offerPrice: 650,
          finalPrice: 650,
          addons: ["Underbody Anti-Corrosion Flush"],
          addonsTotal: 850,
          vehicleTotal: 1500
        }
      ],
      amount: 650,
      discount: 0,
      tax: 0,
      totalAmount: 650,
      paymentStatus: "Pending",
      paymentMethod: "Cash on Delivery",
      bookingStatus: "Quality Check",
      currentStageIndex: 4, // Quality Check
      stageTimestamp: "11:55 AM",
      stageActor: "Michael Chen",
      notes: "Matte paint finish. Do not wax.",
      addons: ["Underbody Anti-Corrosion Flush"],
      timeline: [
        { stage: "Booking Confirmed", time: "09:40 AM", actor: "Front Desk", note: "Express Wash Slot" },
        { stage: "Vehicle Checked In", time: "11:10 AM", actor: "Aisha Rahman", note: "Vehicle checked in" },
        { stage: "Service In Progress", time: "11:20 AM", actor: "Carlos Silva", note: "pH-neutral wash shampoo" },
        { stage: "Quality Check", time: "11:55 AM", actor: "Michael Chen", note: "Inspecting emblems and calipers" }
      ]
    },
    {
      id: "BK-2026-00485",
      date: "2026-09-28",
      time: "11:45 AM",
      customerId: "CUST-1006",
      customerName: "David Kim",
      customerPhone: "+91 98110 55677",
      vehiclePlate: "QTR 99182",
      vehicleModel: "Lexus LX 600 Ultra Luxury (2023)",
      vehicleType: "SUV",
      bookingType: "Service",
      serviceName: "Full Interior Steam & Sanitize Detail",
      packageId: null,
      assignedStaff: "Sanjay Patel",
      vehiclesCount: 1,
      vehicleServices: [
        {
          vehiclePlate: "QTR 99182",
          vehicleModel: "Lexus LX 600 Ultra Luxury (2023)",
          serviceType: "Service",
          serviceId: "SRV-02",
          serviceName: "Full Interior Steam & Sanitize Detail",
          regularPrice: 1850,
          offerPrice: 1665,
          finalPrice: 1665,
          addons: ["Ozone Gas AC Bacteria & Odor Removal"],
          addonsTotal: 400,
          vehicleTotal: 2065
        }
      ],
      amount: 1850,
      discount: 100,
      tax: 0,
      totalAmount: 1750,
      paymentStatus: "Paid",
      paymentMethod: "Credit Card (POS)",
      bookingStatus: "Checked In",
      currentStageIndex: 2, // Vehicle Checked In
      stageTimestamp: "11:50 AM",
      stageActor: "Aisha Rahman",
      notes: "Requested EV / Hybrid slow charger connection while cleaning.",
      addons: ["Ozone Gas AC Bacteria & Odor Removal"],
      timeline: [
        { stage: "Booking Confirmed", time: "10:00 AM", actor: "WhatsApp Bot", note: "Automated booking" },
        { stage: "Vehicle Checked In", time: "11:50 AM", actor: "Aisha Rahman", note: "Keys placed in safe" }
      ]
    },
    {
      id: "BK-2026-00486",
      date: "2026-09-28",
      time: "12:30 PM",
      customerId: "CUST-1004",
      customerName: "Vikram Mehta",
      customerPhone: "+91 98220 99411",
      vehiclePlate: "DXB 55102",
      vehicleModel: "Range Rover Sport (2024)",
      vehicleType: "SUV",
      bookingType: "Service",
      serviceName: "Ceramic Express Paint Protection",
      packageId: null,
      assignedStaff: "Tariq Mansoor",
      vehiclesCount: 1,
      vehicleServices: [
        {
          vehiclePlate: "DXB 55102",
          vehicleModel: "Range Rover Sport (2024)",
          serviceType: "Service",
          serviceId: "SRV-04",
          serviceName: "Ceramic Express Paint Protection",
          regularPrice: 3800,
          offerPrice: 3500,
          finalPrice: 3500,
          addons: ["Deep Leather Balm Conditioning", "Rain-X All-Glass Hydrophobic Sealant"],
          addonsTotal: 950,
          vehicleTotal: 4450
        }
      ],
      amount: 3800,
      discount: 300,
      tax: 0,
      totalAmount: 3500,
      paymentStatus: "Paid",
      paymentMethod: "Corporate Account",
      bookingStatus: "Confirmed",
      currentStageIndex: 1, // Confirmed
      stageTimestamp: "08:45 AM",
      stageActor: "Aisha Rahman",
      notes: "Requires high-gloss ceramic cure. Customer returning at 04:00 PM.",
      addons: ["Deep Leather Balm Conditioning", "Rain-X All-Glass Hydrophobic Sealant"],
      timeline: [
        { stage: "Booking Confirmed", time: "08:45 AM", actor: "Aisha Rahman", note: "Pre-booked slot confirmed" }
      ]
    },
    {
      id: "BK-2026-00487",
      date: "2026-09-28",
      time: "02:00 PM",
      customerId: "CUST-1005",
      customerName: "Elena Rostova",
      customerPhone: "+91 99304 88120",
      vehiclePlate: "KWI 39211",
      vehicleModel: "Tesla Model Y Performance (2024)",
      vehicleType: "Sedan",
      bookingType: "Package",
      serviceName: "Basic Quick Wash Package",
      packageId: "PKG-01",
      assignedStaff: "Carlos Silva",
      vehiclesCount: 1,
      vehicleServices: [
        {
          vehiclePlate: "KWI 39211",
          vehicleModel: "Tesla Model Y Performance (2024)",
          serviceType: "Package",
          serviceId: "PKG-01",
          serviceName: "Basic Quick Wash Package",
          regularPrice: 1100,
          offerPrice: 850,
          finalPrice: 850,
          addons: [],
          addonsTotal: 0,
          vehicleTotal: 850
        }
      ],
      amount: 850,
      discount: 0,
      tax: 0,
      totalAmount: 850,
      paymentStatus: "Pending",
      paymentMethod: "Online UPI",
      bookingStatus: "Confirmed",
      currentStageIndex: 1,
      stageTimestamp: "11:00 AM",
      stageActor: "Front Desk",
      notes: "Customer arriving at 02:00 PM.",
      addons: [],
      timeline: [
        { stage: "Booking Confirmed", time: "11:00 AM", actor: "Front Desk", note: "Awaiting customer arrival" }
      ]
    },
    {
      id: "BK-2026-00481",
      date: "2026-09-20",
      time: "11:00 AM",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      customerPhone: "+91 98201 11223",
      vehiclePlate: "QTR 78231",
      vehicleModel: "BMW X5 xDrive40i M Sport",
      vehicleType: "SUV",
      bookingType: "Service",
      serviceName: "Interior Cleaning",
      packageId: null,
      assignedStaff: "Rahim",
      amount: 800,
      discount: 0,
      tax: 0,
      totalAmount: 800,
      paymentStatus: "Paid",
      paymentMethod: "Credit Card (POS)",
      bookingStatus: "Completed",
      currentStageIndex: 6,
      stageTimestamp: "12:15 PM",
      stageActor: "Rahim",
      notes: "Interior leather conditioning completed.",
      addons: [],
      timeline: [
        { stage: "Booking Confirmed", time: "10:30 AM", actor: "Front Desk", note: "Scheduled service" },
        { stage: "Vehicle Checked In", time: "11:00 AM", actor: "Aisha Rahman", note: "Checked in" },
        { stage: "Service In Progress", time: "11:15 AM", actor: "Rahim", note: "Deep steam extraction" },
        { stage: "Quality Check", time: "11:55 AM", actor: "Michael Chen", note: "Passed inspection" },
        { stage: "Ready for Pickup", time: "12:00 PM", actor: "Aisha Rahman", note: "Customer alerted" },
        { stage: "Completed", time: "12:15 PM", actor: "Rahim", note: "Keys returned to customer" }
      ]
    },
    {
      id: "BK-2026-00421",
      date: "2026-09-12",
      time: "02:30 PM",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      customerPhone: "+91 98201 11223",
      vehiclePlate: "QTR 12456",
      vehicleModel: "Nissan Patrol NISMO V8",
      vehicleType: "SUV",
      bookingType: "Service",
      serviceName: "Foam Hydro Wash & Wax",
      packageId: null,
      assignedStaff: "Aisha Rahman",
      amount: 1200,
      discount: 0,
      tax: 0,
      totalAmount: 1200,
      paymentStatus: "Paid",
      paymentMethod: "Credit Card (POS)",
      bookingStatus: "Completed",
      currentStageIndex: 6,
      stageTimestamp: "03:45 PM",
      stageActor: "Aisha Rahman",
      notes: "Undercarriage wash completed.",
      addons: [],
      timeline: [
        { stage: "Booking Confirmed", time: "02:00 PM", actor: "Front Desk", note: "Walk-in booking" },
        { stage: "Vehicle Checked In", time: "02:30 PM", actor: "Aisha Rahman", note: "Vehicle checked in" },
        { stage: "Service In Progress", time: "02:45 PM", actor: "Carlos Silva", note: "Foam wash and hand wax" },
        { stage: "Quality Check", time: "03:30 PM", actor: "Michael Chen", note: "QC certified" },
        { stage: "Ready for Pickup", time: "03:35 PM", actor: "Aisha Rahman", note: "Ready for handover" },
        { stage: "Completed", time: "03:45 PM", actor: "Aisha Rahman", note: "Completed and paid" }
      ]
    },
    {
      id: "BK-2026-00410",
      date: "2026-09-12",
      time: "10:00 AM",
      customerId: "CUST-1001",
      customerName: "Ahmed Al Mansoori",
      customerPhone: "+91 98201 11223",
      vehiclePlate: "QTR 45821",
      vehicleModel: "Toyota Land Cruiser 300 GR Sport",
      vehicleType: "SUV",
      bookingType: "Service",
      serviceName: "Interior Cleaning",
      packageId: null,
      assignedStaff: "Rahim",
      amount: 800,
      discount: 0,
      tax: 0,
      totalAmount: 800,
      paymentStatus: "Paid",
      paymentMethod: "Credit Card (POS)",
      bookingStatus: "Completed",
      currentStageIndex: 6,
      stageTimestamp: "11:20 AM",
      stageActor: "Rahim",
      notes: "Sanitized dashboard and leather seating.",
      addons: [],
      timeline: [
        { stage: "Booking Confirmed", time: "09:30 AM", actor: "Front Desk", note: "Morning booking" },
        { stage: "Vehicle Checked In", time: "10:00 AM", actor: "Aisha Rahman", note: "Keys received" },
        { stage: "Service In Progress", time: "10:15 AM", actor: "Rahim", note: "Vacuuming and steam sanitization" },
        { stage: "Quality Check", time: "11:00 AM", actor: "Michael Chen", note: "Inspected" },
        { stage: "Ready for Pickup", time: "11:05 AM", actor: "Aisha Rahman", note: "SMS sent" },
        { stage: "Completed", time: "11:20 AM", actor: "Rahim", note: "Completed" }
      ]
    }
  ],

  invoices: [
    {
      invoiceNumber: "INV-2026-00391",
      bookingId: "BK-2026-00482",
      customerName: "Ahmed Al Mansoori",
      customerId: "CUST-1001",
      date: "2026-09-28",
      subtotal: 5200,
      discount: 200,
      tax: 0,
      totalAmount: 5000,
      paymentMethod: "Credit Card (POS)",
      paymentStatus: "Paid",
      invoiceStatus: "Paid",
      notes: "Platinum Package detailing completed. 7-day ceramic gloss guarantee.",
      vehiclePlate: "QTR 45821",
      vehicleModel: "Toyota Land Cruiser 300 GR Sport",
      serviceName: "Platinum Detail & Paint Glow Package",
      items: [
        { description: "Platinum Detail & Paint Glow Package (Exterior & Interior)", qty: 1, unitPrice: 4400, amount: 4400 },
        { description: "Add-on: Engine Bay De-grease & Dressing", qty: 1, unitPrice: 450, amount: 450 },
        { description: "Add-on: Rain-X All-Glass Hydrophobic Sealant", qty: 1, unitPrice: 350, amount: 350 }
      ],
      auditHistory: [
        {
          date: "2026-09-28",
          time: "08:20 AM",
          modifiedBy: "System (Auto-generated)",
          previousAmount: 5000,
          updatedAmount: 5000,
          reason: "Initial invoice created upon booking confirmation."
        }
      ]
    },
    {
      invoiceNumber: "INV-2026-00392",
      bookingId: "BK-2026-00483",
      customerName: "Sarah Jenkins",
      customerId: "CUST-1002",
      date: "2026-09-28",
      subtotal: 2400,
      discount: 0,
      tax: 0,
      totalAmount: 2400,
      paymentMethod: "Online UPI",
      paymentStatus: "Paid",
      invoiceStatus: "Paid",
      notes: "Executive Fleet Care Package (Sedan)",
      vehiclePlate: "AUH 19420",
      vehicleModel: "BMW 530i M Sport",
      serviceName: "Executive Fleet Care Package",
      items: [
        { description: "Executive Fleet Care Package (Sedan)", qty: 1, unitPrice: 1900, amount: 1900 },
        { description: "Add-on: Pet Hair Deep Mechanical Extraction", qty: 1, unitPrice: 500, amount: 500 }
      ],
      auditHistory: [
        {
          date: "2026-09-28",
          time: "08:35 AM",
          modifiedBy: "Aisha Rahman (Cashier)",
          previousAmount: 2400,
          updatedAmount: 2400,
          reason: "Invoice generated at intake."
        }
      ]
    },
    {
      invoiceNumber: "INV-2026-00393",
      bookingId: "BK-2026-00484",
      customerName: "Carlos Rodriguez",
      customerId: "CUST-1003",
      date: "2026-09-28",
      subtotal: 650,
      discount: 0,
      tax: 0,
      totalAmount: 650,
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      invoiceStatus: "Pending Payment",
      notes: "Matte car wash service. Hand dry only.",
      vehiclePlate: "DOH 77201",
      vehicleModel: "Mercedes-Benz G63 AMG",
      serviceName: "Foam Hydro Pressure Wash",
      items: [
        { description: "Foam Hydro Pressure Wash (Matte Car Wash)", qty: 1, unitPrice: 650, amount: 650 }
      ],
      auditHistory: [
        {
          date: "2026-09-28",
          time: "09:45 AM",
          modifiedBy: "System (Auto-generated)",
          previousAmount: 650,
          updatedAmount: 650,
          reason: "Generated for service in progress."
        }
      ]
    },
    {
      invoiceNumber: "INV-2026-00390",
      bookingId: "BK-2026-00481",
      customerName: "Ahmed Al Mansoori",
      customerId: "CUST-1001",
      date: "2026-09-28",
      subtotal: 1450,
      discount: 0,
      tax: 0,
      totalAmount: 1450,
      paymentMethod: "Credit Card (POS)",
      paymentStatus: "Paid",
      invoiceStatus: "Paid",
      notes: "Morning express service. Keys handed over.",
      vehiclePlate: "DXB 88312",
      vehicleModel: "Porsche Macan GTS",
      serviceName: "Gold Exterior + Engine Bay Clean",
      items: [
        { description: "Gold Exterior + Engine Bay Clean", qty: 1, unitPrice: 1450, amount: 1450 }
      ],
      auditHistory: [
        {
          date: "2026-09-28",
          time: "07:35 AM",
          modifiedBy: "System",
          previousAmount: 1450,
          updatedAmount: 1450,
          reason: "Generated upon booking."
        }
      ]
    }
  ],

  inventory: [
    {
      id: "INV-PROD-01",
      name: "Sonax Profiline Actifoam Energy (5L)",
      category: "Shampoos & Chemicals",
      sku: "CHM-SNX-401",
      currentStock: 18,
      minStock: 8,
      unit: "Cans (5L)",
      costPrice: 2850,
      supplier: "Detailing World Wholesale",
      status: "In Stock"
    },
    {
      id: "INV-PROD-02",
      name: "Koch Chemie Pol Star Leather & Alcantara Cleaner",
      category: "Interior Chemicals",
      sku: "CHM-KC-POL01",
      currentStock: 4,
      minStock: 6,
      unit: "Bottles (1L)",
      costPrice: 1420,
      supplier: "AutoCare Distribution Gulf",
      status: "Low Stock"
    },
    {
      id: "INV-PROD-03",
      name: "CarPro C.Quartz UK 3.0 Ceramic Coating (50ml)",
      category: "Ceramic Coatings",
      sku: "COAT-CP-CQ50",
      currentStock: 2,
      minStock: 5,
      unit: "Bottles (50ml)",
      costPrice: 4800,
      supplier: "CarPro Certified Distributor",
      status: "Low Stock"
    },
    {
      id: "INV-PROD-04",
      name: "Meguiar's D170 Hyper Dressing (3.78L)",
      category: "Tire & Engine Dressing",
      sku: "DRS-MG-170",
      currentStock: 12,
      minStock: 5,
      unit: "Gallons",
      costPrice: 3200,
      supplier: "Detailing World Wholesale",
      status: "In Stock"
    },
    {
      id: "INV-PROD-05",
      name: "The Rag Company Edgeless 500 GSM Microfiber Towels",
      category: "Consumables & Towels",
      sku: "TOW-TRC-500",
      currentStock: 0,
      minStock: 20,
      unit: "Packs (12 pcs)",
      costPrice: 1650,
      supplier: "AutoCare Distribution Gulf",
      status: "Out of Stock"
    },
    {
      id: "INV-PROD-06",
      name: "Gyeon Q2M WetCoat Hydrophobic Rinse Sealant",
      category: "Exterior Chemicals",
      sku: "GYN-WET-1000",
      currentStock: 15,
      minStock: 6,
      unit: "Bottles (1L)",
      costPrice: 2100,
      supplier: "AutoCare Distribution Gulf",
      status: "In Stock"
    }
  ],

  suppliers: [
    {
      id: "SUP-01",
      name: "Detailing World Wholesale",
      contactPerson: "Rajesh Varma",
      phone: "+91 98200 88441",
      email: "orders@detailingworld.in",
      category: "Chemicals & Compounds",
      status: "Active"
    },
    {
      id: "SUP-02",
      name: "AutoCare Distribution Gulf",
      contactPerson: "Kareem Hassan",
      phone: "+91 98451 99220",
      email: "supply@autocaregulf.com",
      category: "Towels, Pads & Machines",
      status: "Active"
    },
    {
      id: "SUP-03",
      name: "CarPro Certified Distributor",
      contactPerson: "Amitabh Sen",
      phone: "+91 97110 44558",
      email: "sales@carprodist.com",
      category: "Ceramic & Quartz Coatings",
      status: "Active"
    }
  ],

  notifications: [
    {
      id: "NOTIF-01",
      type: "service",
      title: "Vehicle Ready for Customer Pickup",
      message: "Sarah Jenkins' BMW 530i M Sport (AUH 19420) is ready for pickup. SMS notification dispatched.",
      timestamp: "10 mins ago",
      read: false,
      targetId: "BK-2026-00483"
    },
    {
      id: "NOTIF-02",
      type: "inventory",
      title: "Low Stock Alert: Koch Chemie Pol Star",
      message: "Current stock is 4 units (Threshold: 6). Reorder recommended today.",
      timestamp: "35 mins ago",
      read: false,
      targetId: "INV-PROD-02"
    },
    {
      id: "NOTIF-03",
      type: "payment",
      title: "Payment Received: ₹5,900",
      message: "Ahmed Al Mansoori cleared invoice INV-2026-00391 via POS Card.",
      timestamp: "2 hours ago",
      read: true,
      targetId: "INV-2026-00391"
    }
  ],

  users: [
    {
      id: "USR-001",
      name: "Rashid Al-Kuwari",
      email: "rashid@gingerwashmate.com",
      role: "Super Admin",
      phone: "+91 98200 45821",
      status: "Active",
      lastLogin: "2026-09-28 08:15 AM"
    },
    {
      id: "USR-002",
      name: "Fatima Al-Zahra",
      email: "fatima@gingerwashmate.com",
      role: "Admin",
      phone: "+91 98201 99011",
      status: "Active",
      lastLogin: "2026-09-28 09:00 AM"
    },
    {
      id: "USR-003",
      name: "Sanjay Patel",
      email: "sanjay@gingerwashmate.com",
      role: "Branch Manager",
      phone: "+91 98450 11988",
      status: "Active",
      lastLogin: "2026-09-28 07:45 AM"
    },
    {
      id: "USR-004",
      name: "Aisha Rahman",
      email: "aisha@gingerwashmate.com",
      role: "Cashier",
      phone: "+91 98205 66782",
      status: "Active",
      lastLogin: "2026-09-28 08:30 AM"
    }
  ],

  roles: [
    {
      role: "Super Admin",
      description: "Full platform control across all branches, configurations, pricing, invoices, and personnel.",
      usersCount: 1,
      canEditInvoices: true,
      permissions: {
        bookings: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        packages: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        customers: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        vehicles: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        services: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        billing: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        inventory: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        staff: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        reports: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        settings: { view: true, create: true, edit: true, delete: true, approve: true, export: true }
      }
    },
    {
      role: "Admin",
      description: "Business administration, service & package configuration, invoice edits, and operations.",
      usersCount: 1,
      canEditInvoices: true,
      permissions: {
        bookings: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        packages: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        customers: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        vehicles: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
        services: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        billing: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        inventory: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        staff: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        reports: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        settings: { view: true, create: true, edit: true, delete: false, approve: false, export: true }
      }
    },
    {
      role: "Branch Manager",
      description: "Operations oversight, bay schedules, inventory adjustments, and billing reports.",
      usersCount: 1,
      canEditInvoices: true,
      permissions: {
        bookings: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        packages: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        customers: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        vehicles: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        services: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
        billing: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        inventory: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
        staff: { view: true, create: false, edit: true, delete: false, approve: false, export: true },
        reports: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
        settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false }
      }
    },
    {
      role: "Lead Detailer / Technician",
      description: "Service checklist execution, workflow stage advancing, and before/after photo inspection.",
      usersCount: 8,
      canEditInvoices: false,
      permissions: {
        bookings: { view: true, create: false, edit: true, delete: false, approve: false, export: false },
        packages: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        customers: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        vehicles: { view: true, create: false, edit: true, delete: false, approve: false, export: false },
        services: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        billing: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
        inventory: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        staff: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
        reports: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
        settings: { view: false, create: false, edit: false, delete: false, approve: false, export: false }
      }
    },
    {
      role: "Front Desk & Cashier",
      description: "Customer onboarding, booking creation, POS invoice printing, and payments.",
      usersCount: 1,
      canEditInvoices: false,
      permissions: {
        bookings: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
        packages: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        customers: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
        vehicles: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
        services: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        billing: { view: true, create: true, edit: false, delete: false, approve: false, export: true },
        inventory: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        staff: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
        reports: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
      }
    }
  ]
};

// State Manager with LocalStorage Persistence
const StateManager = {
  STORAGE_KEY: "ginger_carwash_state_v16",

  load: function () {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = Object.assign({}, DEFAULT_DATA, parsed);
        if (!data.vehicleMaster || data.vehicleMaster.length === 0) {
          data.vehicleMaster = JSON.parse(JSON.stringify(DEFAULT_DATA.vehicleMaster));
        }
        if (!data.customerPackages || data.customerPackages.length === 0) {
          data.customerPackages = JSON.parse(JSON.stringify(DEFAULT_DATA.customerPackages));
        }
        if (!data.packages || data.packages.length === 0) {
          data.packages = JSON.parse(JSON.stringify(DEFAULT_DATA.packages));
        }
        if (data.notifications) {
          data.notifications = data.notifications.filter(n => 
            !n.title.toLowerCase().includes('online') &&
            !n.message.toLowerCase().includes('online')
          );
        }
        return data;
      }
    } catch (e) {
      console.warn("Could not load from localStorage, using default data", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  },

  save: function (data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  },

  reset: function () {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) { }
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
};

window.INITIAL_DATA = StateManager.load();
window.StateManager = StateManager;
