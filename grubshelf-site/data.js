/* grubshelf, content data (ported from src/lib + section components) */

const NAV_LINKS = [
  { label: "Features", href: "#vf-features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#v5-faq" },
];
const WAITLIST_HREF = "#vf-waitlist";
const WAITLIST_LABEL = "Join the Waiting List";

// Hero list items
const HERO_ITEMS = [
  { text: "eggs", expiry: "8d", tone: "good" },
  { text: "oat milk", expiry: "5d", tone: "good" },
  { text: "yoghurt", expiry: "2d", tone: "warn" },
  { text: "tomatoes", expiry: "4d", tone: "good" },
  { text: "spinach!!", expiry: "today", tone: "bad" },
];

// Story beats
const BEATS = [
  { n: "01", title: "You meant to make a list.", body: "But the kid needed something, the dog ate something, and now you're in the parking lot trying to remember if you have eggs.", visual: "paper-blank" },
  { n: "02", title: "You overspend.", body: "Snacks at the checkout. The fancy yogurt. That sauce you'll definitely use this week. The receipt is $87 and you don't know what dinner is.", visual: "receipt" },
  { n: "03", title: "Half of it goes off.", body: "The spinach turns to liquid in the back of the fridge. The berries fur over before you touch them. You meant to use them, and next week you'll do it all again.", visual: "fridge-bad" },
];

// Product features
const FEATURES = [
  {
    n: "01",
    title: "The pantry that actually knows what's in it.",
    body: "Scan a receipt or barcode once. We track what you have, when it expires, and what's about to go off. No more 'do I have eggs'. Open the app, see eggs.",
    bullets: ["Scan-to-add from receipts", "Expiry tracking with smart reminders", "Family sharing so two of you stop buying milk"],
    bg: "var(--cream)", text: "dark", side: "right", mock: "pantry",
  },
  {
    n: "02",
    title: "A shopping list that follows you in.",
    body: "The list is on your phone, sorted by aisle. Items you already have at home are dimmed, so you don't buy a fourth bottle of olive oil. Cross off as you go.",
    bullets: ["Auto-sorted by store layout", "Already-have items dimmed", "Works offline at the dead-zone in aisle 7"],
    bg: "var(--bg-teal)", text: "light", side: "left", mock: "list",
  },
  {
    n: "03",
    title: "Spend tracking that finally adds up.",
    body: "Set a budget, log each shop, and see exactly where the money goes: this month's total, the trend, and your daily pace. The $87 mystery receipt becomes three numbers you actually understand.",
    bullets: ["Set a budget by week or month", "Trends and daily spend at a glance", "Every shop broken down by category"],
    bg: "var(--paper)", text: "dark", side: "right", mock: "expense",
  },
];

// Mock data
const PANTRY_ITEMS = [
  { name: "avocados", expiry: "2 days", tone: "warn", qty: 4 },
  { name: "spinach", expiry: "today", tone: "bad", qty: 1 },
  { name: "milk · 2%", expiry: "5 days", tone: "good", qty: 1 },
  { name: "eggs", expiry: "8 days", tone: "good", qty: 12 },
  { name: "yoghurt", expiry: "2 days", tone: "warn", qty: 1 },
  { name: "tomatoes", expiry: "4 days", tone: "good", qty: 6 },
];
const LIST_ITEMS = [
  { name: "eggs", aisle: "Dairy", checked: true, hasIt: false },
  { name: "oat milk", aisle: "Dairy", checked: true, hasIt: false },
  { name: "spinach", aisle: "Produce", checked: false, hasIt: true },
  { name: "tomatoes", aisle: "Produce", checked: false, hasIt: false },
  { name: "peppers", aisle: "Produce", checked: false, hasIt: false },
  { name: "pasta", aisle: "Dry", checked: false, hasIt: true },
  { name: "olive oil", aisle: "Dry", checked: false, hasIt: false },
];

// Savings stats
const STATS = [
  { value: "~$58", label: "the monthly target", sub: "in over-buying and duplicate jars we aim to cut" },
  { value: "33%", label: "less food binned", sub: "the waste GrubShelf is built to prevent" },
  { value: "8 min", label: "shorter shops", sub: "the goal, with an aisle-sorted list" },
];

// Testimonials
const QUOTES = [
  { text: "Genuinely stopped buying double of everything. The 'have it' indicator at the store is the killer feature.", name: "Priya S.", role: "Early access · 4 months", rotation: -2 },
  { text: "I used to throw out a sad bag of spinach every two weeks. Now I catch it before it turns.", name: "Marcus T.", role: "Early access · 6 months", rotation: 1.5 },
  { text: "My partner and I stopped having the 'did you get milk' fight. That alone is worth it.", name: "Lena & Sam", role: "Early access · 3 months", rotation: -1 },
  { text: "It's the first app where I actually do the thing the app wants me to do. The notifications feel useful, not pushy.", name: "Devon R.", role: "Early access · 2 months", rotation: 2.5 },
];

// Pricing
const PRICING_FREE = {
  name: "Free", price: "$0", sub: "forever, no credit card",
  features: ["Shared pantry for two", "Up to 75 pantry items", "2 shopping lists", "20 barcode scans per month", "7-day insights and one household budget", "Expiry reminders and email support"],
  cta: "Join the Waiting List", ctaStyle: "secondary",
};
const PRICING_PREMIUM = {
  name: "Premium", price: "$4.99", sub: "per month", yearlyNote: "or $53.89/year, save 10%",
  features: ["All Free features", "Unlimited members, items, lists, and scans", "Full analytics, custom categories, and storage locations", "Item photos, bulk operations, and per-category budgets", "PDF/Excel exports, priority support, and early access to new features"],
  cta: "Join the Waiting List", ctaStyle: "primary", tag: "early access",
};

// FAQ
const FAQS = [
  { q: "How does the pantry track what I have?", a: "Scan a receipt or barcode once and it lands in your pantry: matched, counted, and dated. You see what you've got, how much, and what's about to turn. Filter by expiring, fresh, or running low. No more standing at the fridge guessing." },
  { q: "How does scan-to-add work?", a: "Take a photo of your receipt. We read it and match everything to real products. On the first scan you'll confirm a couple of things; after that it's instant. We never keep the photo or the receipt." },
  { q: "How does the shopping list know what I already have?", a: 'It\'s linked to your pantry. Items you already have at home show up dimmed with a "have it" label, so you don\'t buy a fourth bottle of olive oil. The list sorts by aisle, works offline in dead zones, and you cross off as you go.' },
  { q: "How does spend tracking work?", a: "Set a weekly or monthly budget, then log each shop. Scan the receipt and it's split by category for you. You see this month's total, how you're pacing day to day, and where the money actually goes. The $87 mystery receipt becomes three numbers you understand." },
  { q: "What notifications do I get?", a: "One default: things expiring tomorrow that you haven't used yet. You can turn it off, but most people keep it on because it's the only one that matters." },
  { q: "How does family sharing work?", a: "Pantry, shopping list, spending, and history sync across your household. Free is a shared pantry for two; Premium adds unlimited members. When your partner adds milk at the store, you see it. The two-buying-the-same-milk problem is the easiest one we solve." },
  { q: "What platforms is GrubShelf on?", a: "iOS first: iPhone and iPad, launching soon. Android and web are on the roadmap. Join the waiting list below and we'll email you the moment it goes live." },
  { q: "When can I get the app?", a: "We're putting the final polish on the iOS app now. Join the waiting list on this page and you'll be first in line at launch, plus tips and early feature news along the way." },
  { q: "How much will it cost?", a: "Free will be $0: a shared pantry for two, up to 75 items, 2 shopping lists, and 20 barcode scans per month, plus 7-day insights, one household budget, expiry reminders, and email support. Premium will be $4.99/month or $53.89/year (save 10%) with unlimited members, items, lists, and scans, plus full analytics, exports, and priority support. Join the waiting list now; Premium will be subscribed inside the app once we launch." },
];
