import { ASPECT_OPTIONS, type AspectOption } from "@/lib/antmoo-config";
import { PALMISTRY_STYLES, type PalmistryStyleId } from "@/lib/palmistry-prompt";

const DB_NAME = "antmoo";
const DB_VERSION = 1;
const STORE = "app";
const KEY = "v1";
const LEGACY_LOCAL_KEY = "antmoo_api_key";

export const COUNTS = [1, 2, 4, 8] as const;
export type GenCount = (typeof COUNTS)[number];

export type ResultSlot = {
  id: string;
  src: string;
  prompt: string;
  revisedPrompt?: string;
};

type SourcePersisted = {
  name: string;
  type: string;
  b64: string;
};

export type AppPersistV1 = {
  v: 1;
  apiKey: string;
  tab: "edit" | "generate";
  prompt: string;
  n: GenCount;
  aspect: AspectOption;
  sourceFiles: SourcePersisted[];
  results: ResultSlot[];
  resultIndex: number;
  message: string | null;
  palmistryStyleId?: PalmistryStyleId;
  palmistryFile?: SourcePersisted | null;
  palmistryResultSrc?: string | null;
  palmistryMessage?: string | null;
};

export type AppState = {
  apiKey: string;
  tab: "edit" | "generate";
  prompt: string;
  n: GenCount;
  aspect: AspectOption;
  sourceFiles: File[];
  results: ResultSlot[];
  resultIndex: number;
  message: string | null;
  palmistryStyleId: PalmistryStyleId;
  palmistryFile: File | null;
  palmistryResultSrc: string | null;
  palmistryMessage: string | null;
};

export const DEFAULT_APP_STATE: AppState = {
  apiKey: "",
  tab: "generate",
  prompt: "",
  n: 1,
  aspect: "Auto",
  sourceFiles: [],
  results: [],
  resultIndex: 0,
  message: null,
  palmistryStyleId: "minimal",
  palmistryFile: null,
  palmistryResultSrc: null,
  palmistryMessage: null,
};

function isAspect(a: string): a is AspectOption {
  return (ASPECT_OPTIONS as readonly string[]).includes(a);
}

function isN(n: number): n is GenCount {
  return (COUNTS as readonly number[]).includes(n);
}

function isPalmistryStyleId(id: string): id is PalmistryStyleId {
  return PALMISTRY_STYLES.some((style) => style.id === id);
}

function b64ToFile(b64: string, name: string, type: string): File {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) {
    u8[i] = bin.charCodeAt(i);
  }
  return new File([u8], name, { type: type || "image/png" });
}

export async function fileToB64(f: File): Promise<string> {
  const buf = new Uint8Array(await f.arrayBuffer());
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < buf.length; i += chunk) {
    const slice = buf.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(
      null,
      slice as unknown as number[]
    );
  }
  return btoa(binary);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

async function idbGet(): Promise<unknown | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const st = tx.objectStore(STORE);
    const g = st.get(KEY);
    g.onsuccess = () => resolve(g.result);
    g.onerror = () => reject(g.error ?? new Error("idb get"));
    tx.oncomplete = () => db.close();
  });
}

function parseApp(raw: unknown): AppState | null {
  if (!raw || typeof raw !== "object" || (raw as AppPersistV1).v !== 1) {
    return null;
  }
  const p = raw as AppPersistV1;
  if (p.tab !== "edit" && p.tab !== "generate") {
    return null;
  }
  if (typeof p.prompt !== "string" || p.prompt.length > 5000) {
    return null;
  }
  if (typeof p.apiKey !== "string") {
    return null;
  }
  if (!isN(p.n)) {
    return null;
  }
  if (!p.aspect || !isAspect(p.aspect)) {
    return null;
  }
  if (!Array.isArray(p.sourceFiles) || !Array.isArray(p.results)) {
    return null;
  }
  if (typeof p.resultIndex !== "number" || p.resultIndex < 0) {
    return null;
  }
  if (p.message != null && typeof p.message !== "string") {
    return null;
  }

  const sourceFiles: File[] = [];
  for (const s of p.sourceFiles) {
    if (
      !s ||
      typeof s !== "object" ||
      typeof s.b64 !== "string" ||
      typeof s.name !== "string" ||
      typeof s.type !== "string"
    ) {
      return null;
    }
    try {
      sourceFiles.push(b64ToFile(s.b64, s.name, s.type));
    } catch {
      return null;
    }
  }
  if (sourceFiles.length > 10) {
    return null;
  }

  const results: ResultSlot[] = [];
  for (const r of p.results) {
    if (
      !r ||
      typeof r.id !== "string" ||
      typeof r.src !== "string" ||
      typeof r.prompt !== "string" ||
      (r.revisedPrompt != null && typeof r.revisedPrompt !== "string")
    ) {
      return null;
    }
    results.push({
      id: r.id,
      src: r.src,
      prompt: r.prompt,
      revisedPrompt: r.revisedPrompt,
    });
  }

  const ri =
    results.length === 0
      ? 0
      : Math.min(
          p.resultIndex,
          Math.max(0, results.length - 1)
        );

  let palmistryFile: File | null = null;
  if (p.palmistryFile) {
    try {
      palmistryFile = b64ToFile(
        p.palmistryFile.b64,
        p.palmistryFile.name,
        p.palmistryFile.type
      );
    } catch {
      palmistryFile = null;
    }
  }
  const palmistryStyleId =
    typeof p.palmistryStyleId === "string" &&
    isPalmistryStyleId(p.palmistryStyleId)
      ? p.palmistryStyleId
      : DEFAULT_APP_STATE.palmistryStyleId;

  return {
    apiKey: p.apiKey,
    tab: p.tab,
    prompt: p.prompt,
    n: p.n,
    aspect: p.aspect,
    sourceFiles,
    results,
    resultIndex: ri,
    message: p.message,
    palmistryStyleId,
    palmistryFile,
    palmistryResultSrc:
      typeof p.palmistryResultSrc === "string" ? p.palmistryResultSrc : null,
    palmistryMessage:
      typeof p.palmistryMessage === "string" ? p.palmistryMessage : null,
  };
}

function tryMigrateLocalStorageToState(): AppState | null {
  try {
    if (typeof localStorage === "undefined") {
      return null;
    }
    const k = localStorage.getItem(LEGACY_LOCAL_KEY);
    if (k == null || k === "") {
      return null;
    }
    return { ...DEFAULT_APP_STATE, apiKey: k };
  } catch {
    return null;
  }
}

export async function loadAppState(): Promise<AppState> {
  try {
    const raw = await idbGet();
    const parsed = parseApp(raw);
    if (parsed) {
      return parsed;
    }
  } catch {
    /* use defaults + migration */
  }
  const fromLocal = tryMigrateLocalStorageToState();
  if (fromLocal) {
    return fromLocal;
  }
  return { ...DEFAULT_APP_STATE };
}

async function toPersisted(state: AppState): Promise<AppPersistV1> {
  const sourceFiles: SourcePersisted[] = [];
  for (const f of state.sourceFiles) {
    try {
      sourceFiles.push({
        name: f.name,
        type: f.type,
        b64: await fileToB64(f),
      });
    } catch {
      /* skip broken file in persist */
    }
  }
  let palmistryFile: SourcePersisted | null = null;
  if (state.palmistryFile) {
    try {
      palmistryFile = {
        name: state.palmistryFile.name,
        type: state.palmistryFile.type,
        b64: await fileToB64(state.palmistryFile),
      };
    } catch {
      palmistryFile = null;
    }
  }
  return {
    v: 1,
    apiKey: state.apiKey,
    tab: state.tab,
    prompt: state.prompt,
    n: state.n,
    aspect: state.aspect,
    sourceFiles,
    results: state.results,
    resultIndex: state.resultIndex,
    message: state.message,
    palmistryStyleId: state.palmistryStyleId,
    palmistryFile,
    palmistryResultSrc: state.palmistryResultSrc,
    palmistryMessage: state.palmistryMessage,
  };
}

export async function saveAppState(state: AppState): Promise<void> {
  const db = await openDb();
  const body = await toPersisted(state);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const st = tx.objectStore(STORE);
    st.put(body, KEY);
    tx.oncomplete = () => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(LEGACY_LOCAL_KEY);
        }
      } catch {
        /* ignore */
      }
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("idb put"));
    };
  });
}

export async function clearAppStorage(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const st = tx.objectStore(STORE);
    st.delete(KEY);
    tx.oncomplete = () => {
      try {
        localStorage.removeItem(LEGACY_LOCAL_KEY);
      } catch {
        /* ignore */
      }
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("idb delete"));
    };
  });
}
