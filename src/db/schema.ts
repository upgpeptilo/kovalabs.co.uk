import { pgTable, serial, text, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";

// Prices are stored in pence (GBP minor units).
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  blurb: text("blurb").notNull().default(""),
  image: text("image").notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    // ponytail: images are URLs (kovalabs image host or any https URL); add Neon Object Storage upload when admin needs file uploads
    images: jsonb("images").$type<string[]>().notNull().default([]),
    badge: text("badge").notNull().default(""), // e.g. "Selling fast"
    purity: text("purity").notNull().default(""), // e.g. "99.33%"
    kind: text("kind").notNull().default("single"), // single | blend | stack | accessory
    bestSeller: boolean("best_seller").notNull().default(false),
    published: boolean("published").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("products_cat_idx").on(t.categoryId)],
);

export const variants = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(), // e.g. "5mg"
    pricePence: integer("price_pence").notNull(),
    stock: integer("stock").notNull().default(100),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("variants_product_idx").on(t.productId)],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(), // ORD-XXXXXXXX
  status: text("status").notNull().default("new"), // new|confirmed|paid|shipped|completed|cancelled
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  notes: text("notes").notNull().default(""),
  items: jsonb("items").$type<{ variantId: number; name: string; label: string; qty: number; pricePence: number; discountPct?: number }[]>().notNull(),
  totalPence: integer("total_pence").notNull(),
  paymentMethodId: integer("payment_method_id"),
  paymentMethodName: text("payment_method_name").notNull().default(""),
  channel: text("channel").notNull().default("email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull().default(""),
  instructions: text("instructions").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  section: text("section").notNull().default("General"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sort: integer("sort").notNull().default(0),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  body: text("body").notNull(),
  title: text("title").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  product: text("product").notNull().default(""),
  photo: text("photo").notNull().default(""),
  date: text("date").notNull().default(""),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  cover: text("cover").notNull().default(""),
  layout: text("layout").notNull().default("classic"), // classic | grid | magazine
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Uploaded images. ponytail: base64 text in Postgres (Neon Object Storage isn't offered in aws-eu-west-2);
// served with immutable cache headers so the CDN, not the database, handles repeat views. Move to a bucket/Blob if volume grows.
export const images = pgTable("images", {
  id: text("id").primaryKey(),
  contentType: text("content_type").notNull(),
  data: text("data").notNull(), // base64
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Values are wrapped as { v: value }: neon-http re-parses bare jsonb strings on read.
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<{ v: unknown }>().notNull(),
});
