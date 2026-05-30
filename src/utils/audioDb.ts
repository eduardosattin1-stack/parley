/**
 * IndexedDB integration for persistent offline audio storage.
 * Keeps raw Blob records safely stored on-device to prevent data loss.
 */

const DB_NAME = "ParleyAudioDB";
const STORE_NAME = "AudioBlobs";
const DB_VERSION = 1;

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this client environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Database open error:", event);
      reject(new Error("Failed to open local audio database"));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Persists an audio Blob keyed by the unique meeting ID.
 */
export async function saveAudioBlob(meetingId: string, blob: Blob): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(blob, meetingId);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error("IndexedDB save audio error:", err);
  }
}

/**
 * Retrieves a persisted audio Blob for dynamically generating Object URLs.
 */
export async function getAudioBlob(meetingId: string): Promise<Blob | null> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(meetingId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error("IndexedDB retrieve audio error:", err);
    return null;
  }
}

/**
 * Deletes an audio Blob from the database.
 */
export async function deleteAudioBlob(meetingId: string): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(meetingId);

      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    });
  } catch (err) {
    console.error("IndexedDB delete audio error:", err);
  }
}
