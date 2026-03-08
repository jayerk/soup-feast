import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Helpers ───────────────────────────────────────────────

function toDate(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function docWithId(id: string, data: DocumentData) {
  const out: Record<string, unknown> = { id, ...data };
  // Convert Firestore Timestamps to ISO strings for JSON serialization
  for (const [k, v] of Object.entries(out)) {
    if (v instanceof Timestamp) out[k] = v.toDate().toISOString();
  }
  return out;
}

// ─── Generic CRUD ──────────────────────────────────────────

export async function getAll(col: string, ...constraints: QueryConstraint[]) {
  const q = constraints.length
    ? query(collection(db, col), ...constraints)
    : collection(db, col);
  const snap = await getDocs(q);
  return snap.docs.map((d) => docWithId(d.id, d.data()));
}

export async function getById(col: string, id: string) {
  const snap = await getDoc(doc(db, col, id));
  if (!snap.exists()) return null;
  return docWithId(snap.id, snap.data());
}

export async function create(col: string, data: Record<string, unknown>) {
  const now = Timestamp.now();
  const payload = { ...data, createdAt: now, updatedAt: now };
  const ref = await addDoc(collection(db, col), payload);
  return docWithId(ref.id, payload);
}

export async function createWithId(col: string, id: string, data: Record<string, unknown>) {
  const now = Timestamp.now();
  const payload = { ...data, createdAt: now, updatedAt: now };
  await setDoc(doc(db, col, id), payload);
  return docWithId(id, payload);
}

export async function update(col: string, id: string, data: Record<string, unknown>) {
  const payload = { ...data, updatedAt: Timestamp.now() };
  await updateDoc(doc(db, col, id), payload);
  return { id, ...payload };
}

export async function remove(col: string, id: string) {
  await deleteDoc(doc(db, col, id));
}

// ─── Collection names ──────────────────────────────────────

export const Collections = {
  events: "events",
  soups: "soups",
  guests: "guests",
  tastingLogs: "tasting_logs",
  ballots: "ballots",
  tastingNotes: "tasting_notes",
  campaigns: "campaigns",
  budgetItems: "budget_items",
  archiveEvents: "archive_events",
} as const;

// Re-export query helpers for convenience
export { where, orderBy, limit, query, collection, getDocs, Timestamp };
