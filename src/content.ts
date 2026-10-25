// All copy and sources in one place so the narrative can be edited without touching layout.

export const AUTHOR = {
  name: "Manit Agarwal",
  linkedin: "https://www.linkedin.com/in/manit-agarwal-a43b3a2a6",
  email: "agarwalmanit2004@gmail.com",
};

export const SOURCES = [
  {
    id: "tc-2026",
    label: "TechCrunch: Indian Uber rival Rapido raises $240M at $3B valuation (May 2026)",
    url: "https://techcrunch.com/2026/05/15/indian-uber-rival-rapido-raises-240m-at-3b-valuation/",
  },
  {
    id: "bs-2026",
    label: "Business Standard: $240M fundraise propels Rapido post-money valuation to $3B",
    url: "https://www.business-standard.com/companies/start-ups/rapido-raises-240-million-led-by-prosus-at-3-billion-valuation-challenge-to-uber-and-ola-market-126051500571_1.html",
  },
  {
    id: "tc-2025",
    label: "TechCrunch: Rapido doubles valuation to $2.3B following Swiggy stake sale (Sep 2025)",
    url: "https://techcrunch.com/2025/09/23/uber-rival-rapido-doubles-valuation-to-2-3b-following-swiggy-stake-sale",
  },
  {
    id: "equentis",
    label: "Equentis: Rapido vs Ola vs Uber, 56% bike-taxi share estimate",
    url: "https://www.equentis.com/blog/14-cabs-31-autorickshaws-56-bike-taxis-is-rapido-set-to-outpace-ola-uber/",
  },
  {
    id: "inc42",
    label: "Inc42: Rapido at 10, CEO-cited bike-taxi share",
    url: "https://inc42.com/startups/rapido-10-years-decade-1000-cr-revenue-club/",
  },
  {
    id: "dh-zero",
    label: "Deccan Herald: Rapido moves auto captains to zero commission with a daily login fee",
    url: "https://deccanherald.com/business/companies/rapido-aims-to-attract-auto-drivers-with-zero-commission-2892438",
  },
  {
    id: "tribune-delhi",
    label: "The Tribune: Bike-taxi aggregators can't operate in Delhi for now (2023)",
    url: "https://www.tribuneindia.com/news/delhi/bike-taxi-aggregators-rapido-and-uber-cant-operate-in-delhi-for-now-516498",
  },
  {
    id: "medianama-2026",
    label: "MediaNama: CCI dismisses private bike-taxi allegations against Rapido (Mar 2026)",
    url: "https://www.medianama.com/2026/03/223-cci-complaint-rapido-private-vehicles-use-for-bike-taxi-service/",
  },
  {
    id: "rapido-safety",
    label: "Rapido: Safety guidelines (SOS, 24/7 response team, masked numbers, ride tracking)",
    url: "https://www.rapido.bike/RapidoSafetyGuidelines.pdf",
  },
  {
    id: "bike-pink",
    label: "YourStory: Rapido to launch women-only 'Bike Pink' in Karnataka after Chennai (Feb 2025)",
    url: "https://yourstory.com/2025/02/rapido-launch-pink-rapido-bikes-karnataka-25000-jobs-women",
  },
  {
    id: "uber-moto-safety",
    label: "Business Today: Uber adds women rider preference, helmet selfies and more in India",
    url: "https://www.businesstoday.in/technology/news/story/women-rider-preference-helmet-selfies-and-more-uber-rolls-out-new-features-in-india-453851-2024-11-15",
  },
  {
    id: "uber-safety-prefs",
    label: "Uber India: Safety Preferences turn on Share My Trip, RideCheck and audio recording automatically",
    url: "https://www.uber.com/en-IN/newsroom/uber-introduces-new-features-to-elevate-safety",
  },
  {
    id: "uber-auto-fee",
    label: "TechCrunch: Uber ditches commissions in favour of fees for auto drivers in India (Feb 2025)",
    url: "https://techcrunch.com/2025/02/19/uber-ditches-commissions-in-favor-of-fees-for-auto-rickshaw-drivers-in-india",
  },
  {
    id: "ola-zero",
    label: "Business Standard: Ola rolls out nationwide zero-commission model (Jun 2025)",
    url: "https://www.business-standard.com/companies/news/bhavish-aggarwal-led-ola-rolls-out-nationwide-zero-commission-model-125061701242_1.html",
  },
  {
    id: "ola-safety",
    label: "GizNext: Ola's safety features (SOS, ride sharing, route monitoring)",
    url: "https://www.giznext.com/news/want-a-safe-ride-home-here-are-top-four-safety-features-by-ola-cabs/",
  },
  {
    id: "namma-yatri",
    label: "Namma Yatri app listing (SOS, safety team callback, zero commission)",
    url: "https://apps.apple.com/in/app/namma-yatri-ride-booking-app/id1637429831",
  },
  {
    id: "mana-yatri",
    label: "Mana Yatri (Namma Yatri product): bike, auto & cab in Hyderabad and Warangal",
    url: "https://play.google.com/store/apps/details?id=in.mobility.manayatri&hl=en_IN",
  },
] as const;

/** Interview counts as reported by Manit (Aug–Sep 2026, Delhi NCR). */
export const RESEARCH = {
  captains: 25,
  riders: 42,
  nonRiders: 3,
  women: 6,
  riderRows: [
    { label: "Women who avoid bikes after 8–9 PM", n: 6, of: 6, display: "6 of 6", night: true, note: "5 women riders and 1 woman non-rider" },
    { label: "Find it hard to get a bike at night", n: 28, of: 42, display: "28 of 42", night: true },
    { label: "Raised rash driving as a concern", n: 15, of: 42, display: "15 of 42", night: true },
    { label: "Chose bikes mainly for the price", n: 39.5, of: 42, display: "39–40 of 42" },
  ],
  captainRows: [
    { label: "Also drive for other apps", n: 21, of: 25, display: "20–22 of 25" },
    { label: "Work full-time on Rapido", n: 18, of: 25, display: "18 of 25" },
    { label: "Pay with a pass", n: 17, of: 25, display: "17 of 25", note: "15 on a 3-day pass, 2 on a 1-day pass" },
    { label: "Pay commission per ride", n: 8, of: 25, display: "8 of 25" },
  ],
};

export const srcUrl = (id: (typeof SOURCES)[number]["id"]) => SOURCES.find((s) => s.id === id)!.url;

export const QUOTES = {
  earnings: { text: "I usually work 8 hours a day, 6 days a week and make around 800-900 per day", who: "Full-time captain" },
  pass: { text: "Rapido is my full time job so I take a 3 day subscription pass", who: "Full-time captain" },
  cheap: { text: "I use bike taxi as it is the cheapest option available, can't spend huge money just for travelling", who: "Rider · Gurgaon" },
  night: { text: "finding a bike at night is really tough in gurgaon dude", who: "Rider · IP Extension" },
  never: { text: "I will never use a bike taxi, as these drivers drive so bad that they will end up injuring me", who: "Non-rider" },
};

export const NEIGHBOURHOODS = [
  "Gurgaon",
  "Connaught Place",
  "Khan Market",
  "Sarojini Nagar",
  "IP Extension",
  "Vaishali",
  "Noida",
];

/** Illustrative 24h shape modelled from interviews. Not Rapido data. */
export const DAY_CURVE: { hour: string; riders: number; captains: number }[] = [
  { hour: "6 AM", riders: 20, captains: 30 },
  { hour: "7 AM", riders: 55, captains: 60 },
  { hour: "8 AM", riders: 90, captains: 85 },
  { hour: "9 AM", riders: 100, captains: 95 },
  { hour: "10 AM", riders: 70, captains: 90 },
  { hour: "11 AM", riders: 45, captains: 80 },
  { hour: "12 PM", riders: 45, captains: 75 },
  { hour: "1 PM", riders: 50, captains: 75 },
  { hour: "2 PM", riders: 45, captains: 72 },
  { hour: "3 PM", riders: 45, captains: 72 },
  { hour: "4 PM", riders: 55, captains: 78 },
  { hour: "5 PM", riders: 80, captains: 88 },
  { hour: "6 PM", riders: 95, captains: 92 },
  { hour: "7 PM", riders: 92, captains: 90 },
  { hour: "8 PM", riders: 78, captains: 78 },
  { hour: "9 PM", riders: 68, captains: 55 },
  { hour: "10 PM", riders: 58, captains: 38 },
  { hour: "11 PM", riders: 45, captains: 26 },
  { hour: "12 AM", riders: 35, captains: 16 },
  { hour: "1 AM", riders: 22, captains: 10 },
];
