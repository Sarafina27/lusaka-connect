import { query } from "./db";

export type UserRole = "attendee" | "organizer" | "admin";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
};

export type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRecord = {
  id: string;
  organizer_id: string;
  category_id: number;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  time: string;
  badge: string | null;
  price: number;
  image_url: string | null;
  capacity: number;
  sold: number;
  status: "draft" | "published" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type BookingRecord = {
  id: string;
  user_id: string;
  event_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  ticket_number: string;
  qr_code: string | null;
  delivery_channel: "email" | "sms";
  delivery_target: string;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type SavedEventRecord = {
  id: number;
  user_id: string;
  event_id: string;
  created_at: string;
};

export type ReviewRecord = {
  id: string;
  user_id: string;
  event_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type PaymentRecord = {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  provider: string | null;
  status: "pending" | "completed" | "failed";
  transaction_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function createId(prefix = "") {
  return `${prefix}${typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

export async function findUserByEmail(email: string) {
  const rows = await query<UserRecord>(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [email.toLowerCase()],
  );
  return rows[0];
}

export async function createUser(user: {
  email: string;
  name: string;
  phone?: string;
  password_hash: string;
  role?: UserRole;
}) {
  const id = createId("user-");
  await query(`
    INSERT INTO users (id, email, name, phone, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, user.email.toLowerCase(), user.name, user.phone ?? null, user.password_hash, user.role ?? "attendee"]);
  return findUserByEmail(user.email);
}

export async function getCategories() {
  return query<CategoryRecord>(`SELECT * FROM categories ORDER BY name ASC`);
}

export async function createCategory(category: {
  name: string;
  slug: string;
  description?: string;
}) {
  await query(`
    INSERT INTO categories (name, slug, description)
    VALUES (?, ?, ?)
  `, [category.name, category.slug, category.description ?? null]);
  return query<CategoryRecord>(`SELECT * FROM categories WHERE slug = ? LIMIT 1`, [category.slug]).then((rows) => rows[0]);
}

export async function getEvents(filters?: {
  categoryId?: number;
  organizerId?: string;
  status?: "draft" | "published" | "cancelled";
  search?: string;
}) {
  const where: string[] = [];
  const params: unknown[] = [];

  if (filters?.categoryId) {
    where.push("category_id = ?");
    params.push(filters.categoryId);
  }

  if (filters?.organizerId) {
    where.push("organizer_id = ?");
    params.push(filters.organizerId);
  }

  if (filters?.status) {
    where.push("status = ?");
    params.push(filters.status);
  }

  if (filters?.search) {
    where.push("(title LIKE ? OR description LIKE ? OR venue LIKE ?)");
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return query<EventRecord>(`SELECT * FROM events ${clause} ORDER BY event_date ASC`, params);
}

export async function getEventById(id: string) {
  const rows = await query<EventRecord>(`SELECT * FROM events WHERE id = ? LIMIT 1`, [id]);
  return rows[0];
}

export async function createEvent(event: {
  organizer_id: string;
  category_id: number;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  time: string;
  badge?: string;
  price: number;
  image_url?: string;
  capacity: number;
  sold?: number;
  status?: "draft" | "published" | "cancelled";
}) {
  const id = createId("event-");
  await query(`
    INSERT INTO events (id, organizer_id, category_id, title, description, venue, event_date, time, badge, price, image_url, capacity, sold, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    event.organizer_id,
    event.category_id,
    event.title,
    event.description,
    event.venue,
    event.event_date,
    event.time,
    event.badge ?? null,
    event.price,
    event.image_url ?? null,
    event.capacity,
    event.sold ?? 0,
    event.status ?? "published",
  ]);
  return getEventById(id);
}

export async function updateEvent(id: string, updates: Partial<Omit<EventRecord, "id" | "created_at" | "updated_at">>) {
  const keys = Object.keys(updates) as Array<keyof typeof updates>;
  if (!keys.length) return getEventById(id);
  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const params = keys.map((key) => (updates as any)[key]);
  params.push(id);
  await query(`UPDATE events SET ${setClause} WHERE id = ?`, params);
  return getEventById(id);
}

export async function deleteEvent(id: string) {
  await query(`DELETE FROM events WHERE id = ?`, [id]);
}

export async function createBooking(booking: {
  user_id: string;
  event_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  ticket_number: string;
  qr_code?: string;
  delivery_channel: "email" | "sms";
  delivery_target: string;
  status?: "pending" | "paid" | "cancelled";
}) {
  const id = createId("booking-");
  await query(`
    INSERT INTO bookings (id, user_id, event_id, quantity, unit_price, total_price, ticket_number, qr_code, delivery_channel, delivery_target, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    booking.user_id,
    booking.event_id,
    booking.quantity,
    booking.unit_price,
    booking.total_price,
    booking.ticket_number,
    booking.qr_code ?? null,
    booking.delivery_channel,
    booking.delivery_target,
    booking.status ?? "paid",
  ]);
  const rows = await query<BookingRecord>(`SELECT * FROM bookings WHERE id = ? LIMIT 1`, [id]);
  return rows[0];
}

export async function getBookingsForUser(userId: string) {
  return query<BookingRecord>(`SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
}

export async function addSavedEvent(userId: string, eventId: string) {
  await query(`INSERT IGNORE INTO saved_events (user_id, event_id) VALUES (?, ?)`, [userId, eventId]);
  const rows = await query<SavedEventRecord>(`SELECT * FROM saved_events WHERE user_id = ? AND event_id = ?`, [userId, eventId]);
  return rows[0];
}

export async function removeSavedEvent(userId: string, eventId: string) {
  await query(`DELETE FROM saved_events WHERE user_id = ? AND event_id = ?`, [userId, eventId]);
}

export async function getSavedEvents(userId: string) {
  return query<EventRecord>(
    `SELECT e.* FROM events e JOIN saved_events s ON s.event_id = e.id WHERE s.user_id = ? ORDER BY s.created_at DESC`,
    [userId],
  );
}

export async function createReview(review: {
  user_id: string;
  event_id: string;
  rating: number;
  comment?: string;
}) {
  const id = createId("review-");
  await query(`
    INSERT INTO reviews (id, user_id, event_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `, [id, review.user_id, review.event_id, review.rating, review.comment ?? null]);
  const rows = await query<ReviewRecord>(`SELECT * FROM reviews WHERE id = ? LIMIT 1`, [id]);
  return rows[0];
}

export async function getReviewsForEvent(eventId: string) {
  return query<ReviewRecord>(`SELECT * FROM reviews WHERE event_id = ? ORDER BY created_at DESC`, [eventId]);
}

export async function recordPayment(payment: {
  booking_id: string;
  amount: number;
  payment_method: string;
  provider?: string;
  status?: "pending" | "completed" | "failed";
  transaction_id?: string;
  metadata?: Record<string, unknown>;
}) {
  const id = createId("payment-");
  await query(`
    INSERT INTO payments (id, booking_id, amount, payment_method, provider, status, transaction_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    payment.booking_id,
    payment.amount,
    payment.payment_method,
    payment.provider ?? null,
    payment.status ?? "pending",
    payment.transaction_id ?? null,
    payment.metadata ? JSON.stringify(payment.metadata) : null,
  ]);
  const rows = await query<PaymentRecord>(`SELECT * FROM payments WHERE id = ? LIMIT 1`, [id]);
  return rows[0];
}

export async function getPaymentsForBooking(bookingId: string) {
  return query<PaymentRecord>(`SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC`, [bookingId]);
}

export async function getAllUsers() {
  return query<UserRecord>(`SELECT * FROM users ORDER BY created_at DESC`);
}

export async function getAllEvents() {
  return query<EventRecord>(`SELECT * FROM events ORDER BY event_date DESC`);
}

export async function getAllBookings() {
  return query<BookingRecord>(`SELECT * FROM bookings ORDER BY created_at DESC`);
}
