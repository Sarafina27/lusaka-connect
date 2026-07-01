export type UserBooking = {
  id: string;
  userEmail: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  purchasedAt: string;
  rsvp?: boolean;
};

const BOOKINGS_STORAGE_KEY = "kuwala.bookings.v1";

export function loadBookings(): UserBooking[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UserBooking[]) : [];
  } catch {
    return [];
  }
}

export function saveBookings(bookings: UserBooking[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // ignore storage failures
  }
}

export function getBookingsForUser(email: string) {
  return loadBookings().filter((booking) => booking.userEmail === email);
}

export function addBooking(booking: UserBooking) {
  const next = [...loadBookings(), booking];
  saveBookings(next);
  return next;
}

export function addRsvp(booking: Omit<UserBooking, "id" | "purchasedAt" | "quantity" | "totalPrice">) {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const next: UserBooking = {
    ...booking,
    id,
    quantity: 0,
    totalPrice: 0,
    purchasedAt: new Date().toISOString(),
  };
  return addBooking(next);
}
