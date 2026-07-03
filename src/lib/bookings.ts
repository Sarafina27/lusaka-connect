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
  ticketNumber?: string;
  qrCode?: string;
  deliveryChannel?: "email" | "sms";
  deliveryTarget?: string;
};

const BOOKINGS_STORAGE_KEY = "kuwala.bookings.v1";

function createTicketNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KWL-${stamp}-${suffix}`;
}

function createQrCodeDataUrl(payload: string) {
  const size = 20;
  const cell = 8;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const finder = (x: number, y: number) => {
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 7; col += 1) {
        const isEdge = row === 0 || row === 6 || col === 0 || col === 6;
        const isCenter = row >= 2 && row <= 4 && col >= 2 && col <= 4;
        matrix[y + row][x + col] = isEdge || isCenter ? 1 : matrix[y + row][x + col];
      }
    }
  };

  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);

  const hash = payload.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (matrix[row][col]) continue;
      const shouldFill = (hash + row * 13 + col * 7) % 5 === 0;
      matrix[row][col] = shouldFill ? 1 : 0;
    }
  }

  const rects = matrix.flatMap((row, rowIndex) =>
    row.flatMap((value, colIndex) => {
      if (!value) return [];
      return `<rect x="${colIndex * cell}" y="${rowIndex * cell}" width="${cell}" height="${cell}" fill="#111827" />`;
    }),
  );

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * cell}" height="${size * cell}" viewBox="0 0 ${size * cell} ${size * cell}"><rect width="100%" height="100%" fill="white" />${rects.join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildTicketDelivery(recipient: string, channel: "email" | "sms") {
  const ticketNumber = createTicketNumber();
  const qrCode = createQrCodeDataUrl(`${ticketNumber}:${recipient}:${channel}`);
  return {
    ticketNumber,
    qrCode,
    deliveryChannel: channel,
    deliveryTarget: recipient,
  };
}

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
