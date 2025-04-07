// src/lib/services/database.ts
// Firebase database service for CircusSync

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentReference,
  serverTimestamp,
} from "firebase/firestore";
import type {
  Client,
  Performer,
  Event,
  Agent,
  User,
  Notification,
  Document,
  Task,
} from "../types";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper for data conversion (Date <-> Timestamp)
function prepareForFirestore<T>(data: T): any {
  const prepared = { ...data } as any;

  // Walk through object and convert Date objects to Firestore Timestamps
  Object.keys(prepared).forEach((key) => {
    if (prepared[key] instanceof Date) {
      prepared[key] = Timestamp.fromDate(prepared[key]);
    } else if (prepared[key] && typeof prepared[key] === "object") {
      // Check for nested dates in objects
      if (Array.isArray(prepared[key])) {
        prepared[key] = prepared[key].map((item: any) => {
          if (typeof item === "object") {
            return prepareForFirestore(item);
          }
          return item;
        });
      } else {
        prepared[key] = prepareForFirestore(prepared[key]);
      }
    }
  });

  return prepared;
}

function convertFromFirestore<T>(data: any): T {
  if (!data) return data;

  const converted = { ...data } as any;

  // Walk through object and convert Firestore Timestamps back to Date objects
  Object.keys(converted).forEach((key) => {
    if (converted[key] && typeof converted[key].toDate === "function") {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === "object") {
      // Check for nested timestamps in objects
      if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map((item: any) => {
          if (typeof item === "object") {
            return convertFromFirestore(item);
          }
          return item;
        });
      } else {
        converted[key] = convertFromFirestore(converted[key]);
      }
    }
  });

  return converted as T;
}

// Generic CRUD operations
async function addDocument<T>(
  collectionName: string,
  data: Omit<T, "id">
): Promise<string> {
  const collectionRef = collection(db, collectionName);

  // Prepare data for Firestore (convert Date objects to Timestamps)
  const preparedData = prepareForFirestore({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const docRef = await addDoc(collectionRef, preparedData);
  return docRef.id;
}

async function updateDocument<T>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, id);

  // Prepare data for Firestore
  const preparedData = prepareForFirestore({
    ...data,
    updatedAt: new Date(),
  });

  await updateDoc(docRef, preparedData);
}

async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

async function getDocument<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  // Convert Firestore Timestamps back to Date objects
  return {
    ...convertFromFirestore(docSnap.data()),
    id: docSnap.id,
  } as T;
}

async function getAllDocuments<T>(collectionName: string): Promise<T[]> {
  const collectionRef = collection(db, collectionName);
  const querySnapshot = await getDocs(collectionRef);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        ...convertFromFirestore(doc.data()),
        id: doc.id,
      } as T)
  );
}

// Client-specific operations
export const clientService = {
  async add(
    client: Omit<Client, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    return addDocument<Client>("clients", client);
  },

  async update(id: string, client: Partial<Client>): Promise<void> {
    return updateDocument<Client>("clients", id, client);
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("clients", id);
  },

  async get(id: string): Promise<Client | null> {
    return getDocument<Client>("clients", id);
  },

  async getAll(): Promise<Client[]> {
    return getAllDocuments<Client>("clients");
  },

  async getByStatus(status: Client["status"]): Promise<Client[]> {
    const clientsCollection = collection(db, "clients");
    const clientsQuery = query(
      clientsCollection,
      where("status", "==", status),
      orderBy("name")
    );

    const querySnapshot = await getDocs(clientsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Client)
    );
  },

  async getForFollowUp(days: number = 7): Promise<Client[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const clientsCollection = collection(db, "clients");
    const clientsQuery = query(
      clientsCollection,
      where("nextFollowUp.date", ">=", today),
      where("nextFollowUp.date", "<=", futureDate)
    );

    const querySnapshot = await getDocs(clientsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Client)
    );
  },

  async search(searchTerm: string): Promise<Client[]> {
    // Basic search implementation - in a real app, you might use Algolia or other search service
    const clientsCollection = collection(db, "clients");
    const querySnapshot = await getDocs(clientsCollection);

    const searchTermLower = searchTerm.toLowerCase();

    return querySnapshot.docs
      .map(
        (doc) =>
          ({
            ...convertFromFirestore(doc.data()),
            id: doc.id,
          } as Client)
      )
      .filter(
        (client) =>
          client.name.toLowerCase().includes(searchTermLower) ||
          client.contactPerson.toLowerCase().includes(searchTermLower) ||
          client.email.toLowerCase().includes(searchTermLower)
      );
  },
};

// Performer-specific operations
export const performerService = {
  async add(
    performer: Omit<Performer, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    return addDocument<Performer>("performers", performer);
  },

  async update(id: string, performer: Partial<Performer>): Promise<void> {
    return updateDocument<Performer>("performers", id, performer);
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("performers", id);
  },

  async get(id: string): Promise<Performer | null> {
    return getDocument<Performer>("performers", id);
  },

  async getAll(): Promise<Performer[]> {
    return getAllDocuments<Performer>("performers");
  },

  async getBySkill(category: PerformerSkillCategory): Promise<Performer[]> {
    const performersCollection = collection(db, "performers");
    const performersQuery = query(
      performersCollection,
      where("skills", "array-contains", { category }),
      orderBy("name")
    );

    const querySnapshot = await getDocs(performersQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Performer)
    );
  },

  async getAvailableForDate(date: Date): Promise<Performer[]> {
    // Convert date to start and end of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const performersCollection = collection(db, "performers");
    const querySnapshot = await getDocs(performersCollection);

    return querySnapshot.docs
      .map(
        (doc) =>
          ({
            ...convertFromFirestore(doc.data()),
            id: doc.id,
          } as Performer)
      )
      .filter((performer) => {
        const dateAvailability = performer.availability.find(
          (avail) => avail.date >= startDate && avail.date <= endDate
        );

        return !dateAvailability || dateAvailability.status === "available";
      });
  },
};

// Event-specific operations
export const eventService = {
  async add(
    event: Omit<Event, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    return addDocument<Event>("events", event);
  },

  async update(id: string, event: Partial<Event>): Promise<void> {
    return updateDocument<Event>("events", id, event);
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("events", id);
  },

  async get(id: string): Promise<Event | null> {
    return getDocument<Event>("events", id);
  },

  async getAll(): Promise<Event[]> {
    return getAllDocuments<Event>("events");
  },

  async getUpcoming(limit: number = 10): Promise<Event[]> {
    const today = new Date();

    const eventsCollection = collection(db, "events");
    const eventsQuery = query(
      eventsCollection,
      where("date", ">=", today),
      orderBy("date"),
      limit(limit)
    );

    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Event)
    );
  },

  async getByStatus(status: EventStatus): Promise<Event[]> {
    const eventsCollection = collection(db, "events");
    const eventsQuery = query(
      eventsCollection,
      where("status", "==", status),
      orderBy("date")
    );

    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Event)
    );
  },

  async getByClient(clientId: string): Promise<Event[]> {
    const eventsCollection = collection(db, "events");
    const eventsQuery = query(
      eventsCollection,
      where("client", "==", clientId),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Event)
    );
  },

  async getByPerformer(performerId: string): Promise<Event[]> {
    const eventsCollection = collection(db, "events");
    const eventsQuery = query(
      eventsCollection,
      where("performers", "array-contains", { performer: performerId }),
      orderBy("date", "desc")
    );

    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Event)
    );
  },

  async getInDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const eventsCollection = collection(db, "events");
    const eventsQuery = query(
      eventsCollection,
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date")
    );

    const querySnapshot = await getDocs(eventsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Event)
    );
  },
};

// Agent-specific operations
export const agentService = {
  async add(
    agent: Omit<Agent, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    return addDocument<Agent>("agents", agent);
  },

  async update(id: string, agent: Partial<Agent>): Promise<void> {
    return updateDocument<Agent>("agents", id, agent);
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("agents", id);
  },

  async get(id: string): Promise<Agent | null> {
    return getDocument<Agent>("agents", id);
  },

  async getAll(): Promise<Agent[]> {
    return getAllDocuments<Agent>("agents");
  },

  async getBySpecialization(specialization: string): Promise<Agent[]> {
    const agentsCollection = collection(db, "agents");
    const agentsQuery = query(
      agentsCollection,
      where("specialization", "array-contains", specialization)
    );

    const querySnapshot = await getDocs(agentsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Agent)
    );
  },
};

// Task-specific operations
export const taskService = {
  async add(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    return addDocument<Task>("tasks", task);
  },

  async update(id: string, task: Partial<Task>): Promise<void> {
    return updateDocument<Task>("tasks", id, task);
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("tasks", id);
  },

  async get(id: string): Promise<Task | null> {
    return getDocument<Task>("tasks", id);
  },

  async getAll(): Promise<Task[]> {
    return getAllDocuments<Task>("tasks");
  },

  async getByUser(userId: string): Promise<Task[]> {
    const tasksCollection = collection(db, "tasks");
    const tasksQuery = query(
      tasksCollection,
      where("assignedTo", "==", userId),
      orderBy("dueDate")
    );

    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Task)
    );
  },

  async getUpcoming(userId: string, days: number = 7): Promise<Task[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const tasksCollection = collection(db, "tasks");
    const tasksQuery = query(
      tasksCollection,
      where("assignedTo", "==", userId),
      where("dueDate", ">=", today),
      where("dueDate", "<=", futureDate),
      where("completed", "==", false),
      orderBy("dueDate")
    );

    const querySnapshot = await getDocs(tasksQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Task)
    );
  },
};

// Notification-specific operations
export const notificationService = {
  async add(
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<string> {
    return addDocument<Notification>("notifications", {
      ...notification,
      read: false,
    });
  },

  async markAsRead(id: string): Promise<void> {
    return updateDocument<Notification>("notifications", id, { read: true });
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("notifications", id);
  },

  async get(id: string): Promise<Notification | null> {
    return getDocument<Notification>("notifications", id);
  },

  async getForUser(
    userId: string,
    includeRead: boolean = false
  ): Promise<Notification[]> {
    const notificationsCollection = collection(db, "notifications");
    let notificationsQuery;

    if (includeRead) {
      notificationsQuery = query(
        notificationsCollection,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    } else {
      notificationsQuery = query(
        notificationsCollection,
        where("userId", "==", userId),
        where("read", "==", false),
        orderBy("createdAt", "desc")
      );
    }

    const querySnapshot = await getDocs(notificationsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Notification)
    );
  },
};

// Document-specific operations
export const documentService = {
  async add(document: Omit<Document, "id" | "createdAt">): Promise<string> {
    return addDocument<Document>("documents", document);
  },

  async update(id: string, document: Partial<Document>): Promise<void> {
    return updateDocument<Document>("documents", id, document);
  },

  async delete(id: string): Promise<void> {
    return deleteDocument("documents", id);
  },

  async get(id: string): Promise<Document | null> {
    return getDocument<Document>("documents", id);
  },

  async getAll(): Promise<Document[]> {
    return getAllDocuments<Document>("documents");
  },

  async getByRelatedEntity(
    entityType: "client" | "performer" | "event" | "agent",
    entityId: string
  ): Promise<Document[]> {
    const documentsCollection = collection(db, "documents");
    const documentsQuery = query(
      documentsCollection,
      where("relatedTo.type", "==", entityType),
      where("relatedTo.id", "==", entityId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(documentsQuery);
    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...convertFromFirestore(doc.data()),
          id: doc.id,
        } as Document)
    );
  },
};

// Export all services
export const db_service = {
  client: clientService,
  performer: performerService,
  event: eventService,
  agent: agentService,
  task: taskService,
  notification: notificationService,
  document: documentService,
};

export default db_service;
