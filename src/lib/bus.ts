type EventType = "order.created" | "order.updated" | "menu.updated";

type Subscriber = {
  id: string;
  send: (type: EventType, payload: unknown) => void;
};

const subscribers = new Map<string, Subscriber>();

export function subscribe(send: Subscriber["send"]) {
  const id = crypto.randomUUID();
  subscribers.set(id, { id, send });

  return () => {
    subscribers.delete(id);
  };
}

export function publish(type: EventType, payload: unknown = {}) {
  for (const subscriber of subscribers.values()) {
    try {
      subscriber.send(type, payload);
    } catch {
      subscribers.delete(subscriber.id);
    }
  }
}
