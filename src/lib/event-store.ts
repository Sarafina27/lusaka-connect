import { useCallback, useEffect, useState } from "react";
import eventWarehouse from "@/assets/event-warehouse.jpg";
import eventSunset from "@/assets/event-sunset.jpg";
import eventConcert from "@/assets/event-concert.jpg";

export type EventCategory = "nightlife" | "concert" | "private" | "chill";

export type EventData = {
  id: string;
  title: string;
  venue: string;
  when: string;
  date: string;
  time: string;
  description: string;
  badge: string;
  price: number;
  category: EventCategory;
  image: string;
  capacity: number;
  sold: number;
};

const STORAGE_KEY = "kuwala.events.v1";
const today = new Date();
const getEventDate = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

export const DEFAULT_EVENTS: EventData[] = [
  {
    id: "e1",
    title: "Warehouse Sessions",
    venue: "Rhodes Park",
    when: "Tonight · 22:00",
    date: getEventDate(0),
    time: "22:00",
    description: "High-energy warehouse sessions with live performers and the latest beats.",
    badge: "MoMo Accepted",
    price: 150,
    category: "nightlife",
    image: eventWarehouse,
    capacity: 300,
    sold: 90,
  },
  {
    id: "e2",
    title: "Sunset Soirée at Latitude",
    venue: "Leopard's Hill",
    when: "Sat · 16:00",
    date: getEventDate(2),
    time: "16:00",
    description: "Elegant sunset experience with cocktails, live music, and breathtaking views.",
    badge: "Limited Tickets",
    price: 450,
    category: "chill",
    image: eventSunset,
    capacity: 200,
    sold: 80,
  },
  {
    id: "e3",
    title: "Echoes of the Copperbelt",
    venue: "Showgrounds",
    when: "Sun · 19:00",
    date: getEventDate(3),
    time: "19:00",
    description: "A showcase of Zambia's rich cultural soundscape with live performances.",
    badge: "Verified Organizer",
    price: 200,
    category: "concert",
    image: eventConcert,
    capacity: 400,
    sold: 180,
  },
];

export function getTicketsAvailable(event: EventData) {
  return Math.max(0, event.capacity - event.sold);
}

export function getTicketProgressPercent(event: EventData) {
  if (event.capacity <= 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, Math.round((event.sold / event.capacity) * 100)));
}

export function getTicketProgressInterval(event: EventData) {
  return Math.min(100, Math.floor(getTicketProgressPercent(event) / 25) * 25);
}

export function formatTicketPrice(amount: number) {
  return `ZMW ${amount.toLocaleString()}`;
}

const isBrowser = typeof window !== "undefined";

function loadEventsFromStorage() {
  if (!isBrowser) {
    return DEFAULT_EVENTS;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }

    const parsed = JSON.parse(stored) as EventData[];
    if (Array.isArray(parsed)) {
      return parsed.map((event) => ({
        ...event,
        date: event.date || getEventDate(0),
      }));
    }
    return DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

function saveEventsToStorage(events: EventData[]) {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore storage failures
  }
}

export function useEventStore() {
  const [events, setEvents] = useState<EventData[]>(DEFAULT_EVENTS);

  useEffect(() => {
    setEvents(loadEventsFromStorage());
  }, []);

  useEffect(() => {
    saveEventsToStorage(events);
  }, [events]);

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as EventData[];
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateEvent = useCallback(
    (id: string, updates: Partial<Omit<EventData, "id">>) => {
      setEvents((prev) =>
        prev.map((event) => (event.id === id ? { ...event, ...updates } : event)),
      );
    },
    [],
  );

  const addEvent = useCallback((newEvent: EventData) => {
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }, []);

  const buyTickets = useCallback(
    (id: string, quantity: number) => {
      setEvents((prev) =>
        prev.map((event) => {
          if (event.id !== id) return event;
          const available = getTicketsAvailable(event);
          return {
            ...event,
            sold: event.sold + Math.min(Math.max(0, quantity), available),
          };
        }),
      );
    },
    [],
  );

  return {
    events,
    updateEvent,
    addEvent,
    removeEvent,
    buyTickets,
  };
}
