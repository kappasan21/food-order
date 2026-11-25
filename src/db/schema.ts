import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"),
  createdAt: text("created_at").notNull(),
});

export const menuItems = sqliteTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  orderType: text("order_type").notNull(),
  phoneNumber: text("phone_number").notNull(),
  deliveryAddress: text("delivery_address"),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  totalCents: integer("total_cents").notNull(),
  createdAt: text("created_at").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  menuItemId: text("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  menuItemName: text("menu_item_name").notNull(),
  menuItemDescription: text("menu_item_description").notNull(),
  menuItemPriceCents: integer("menu_item_price_cents").notNull(),
  menuItemImageUrl: text("menu_item_image_url").notNull(),
  quantity: integer("quantity").notNull(),
});

export type User = typeof users.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
