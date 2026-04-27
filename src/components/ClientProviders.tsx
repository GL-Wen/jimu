"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  type AppState,
  clearAppStorage,
  DEFAULT_APP_STATE,
  type GenCount,
  loadAppState,
  type ResultSlot,
  saveAppState,
} from "@/lib/app-persist-idb";
import type { AspectOption } from "@/lib/antmoo-config";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import type { PalmistryStyleId } from "@/lib/palmistry-prompt";

const SAVE_DEBOUNCE_MS = 450;

type SetFiles = React.Dispatch<React.SetStateAction<File[]>>;
type SetResults = React.Dispatch<React.SetStateAction<ResultSlot[]>>;
type SetPalmistryFile = React.Dispatch<React.SetStateAction<File | null>>;

type AppDataContextValue = {
  isHydrated: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  saveApiKey: (key: string) => void;
  openApiKeyModal: () => void;
  clearAllData: () => Promise<void>;
  tab: AppState["tab"];
  setTab: (t: AppState["tab"]) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  n: GenCount;
  setN: (n: GenCount) => void;
  aspect: AspectOption;
  setAspect: (a: AspectOption) => void;
  sourceFiles: File[];
  setSourceFiles: SetFiles;
  results: ResultSlot[];
  setResults: SetResults;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  message: string | null;
  setMessage: (m: string | null) => void;
  palmistryStyleId: PalmistryStyleId;
  setPalmistryStyleId: (styleId: PalmistryStyleId) => void;
  palmistryFile: File | null;
  setPalmistryFile: SetPalmistryFile;
  palmistryResultSrc: string | null;
  setPalmistryResultSrc: (src: string | null) => void;
  palmistryMessage: string | null;
  setPalmistryMessage: (message: string | null) => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function useApiKey() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useApiKey must be used within ClientProviders");
  }
  return {
    apiKey: ctx.apiKey,
    setApiKey: ctx.setApiKey,
    saveApiKey: ctx.saveApiKey,
    openApiKeyModal: ctx.openApiKeyModal,
    isHydrated: ctx.isHydrated,
  };
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within ClientProviders");
  }
  return ctx;
}

export function usePalmistryData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("usePalmistryData must be used within ClientProviders");
  }
  return {
    apiKey: ctx.apiKey,
    openApiKeyModal: ctx.openApiKeyModal,
    styleId: ctx.palmistryStyleId,
    setStyleId: ctx.setPalmistryStyleId,
    file: ctx.palmistryFile,
    setFile: ctx.setPalmistryFile,
    resultSrc: ctx.palmistryResultSrc,
    setResultSrc: ctx.setPalmistryResultSrc,
    message: ctx.palmistryMessage,
    setMessage: ctx.setPalmistryMessage,
  };
}

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<AppState | null>(null);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const stateRef = useRef<AppState | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextPersistRef = useRef(true);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const flushToIdb = useCallback(() => {
    const s = stateRef.current;
    if (!s) {
      return;
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    void saveAppState(s).catch(() => {
      /* non-fatal */
    });
  }, []);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        flushToIdb();
      }
    };
    window.addEventListener("pagehide", flushToIdb);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", flushToIdb);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [flushToIdb]);

  useEffect(() => {
    flushToIdb();
  }, [flushToIdb, pathname]);

  useEffect(() => {
    return () => {
      flushToIdb();
    };
  }, [flushToIdb]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loaded = await loadAppState();
      if (!cancelled) {
        skipNextPersistRef.current = true;
        setState(loaded);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) {
      return;
    }
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      void saveAppState(state).catch(() => {
        /* non-fatal */
      });
      saveTimerRef.current = null;
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [state]);

  const setApiKey = useCallback(
    (key: string) => {
      setState((prev) => (prev ? { ...prev, apiKey: key } : prev));
    },
    []
  );

  const saveApiKey = useCallback((key: string) => {
    skipNextPersistRef.current = true;
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const next = { ...prev, apiKey: key };
      void saveAppState(next).catch(() => {
        /* non-fatal */
      });
      return next;
    });
  }, []);

  const clearAllData = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    await clearAppStorage();
    skipNextPersistRef.current = true;
    setState({ ...DEFAULT_APP_STATE });
    try {
      await saveAppState({ ...DEFAULT_APP_STATE });
    } catch {
      /* non-fatal */
    }
  }, []);

  const setTab = useCallback((t: AppState["tab"]) => {
    setState((prev) => (prev ? { ...prev, tab: t } : prev));
  }, []);

  const setPrompt = useCallback((p: string) => {
    setState((prev) => (prev ? { ...prev, prompt: p } : prev));
  }, []);

  const setN = useCallback((n: GenCount) => {
    setState((prev) => (prev ? { ...prev, n } : prev));
  }, []);

  const setAspect = useCallback((a: AspectOption) => {
    setState((prev) => (prev ? { ...prev, aspect: a } : prev));
  }, []);

  const setSourceFiles: SetFiles = useCallback((action) => {
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const nextFiles =
        typeof action === "function" ? action(prev.sourceFiles) : action;
      return { ...prev, sourceFiles: nextFiles };
    });
  }, []);

  const setResults: SetResults = useCallback((action) => {
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const nextRes =
        typeof action === "function" ? action(prev.results) : action;
      return { ...prev, results: nextRes };
    });
  }, []);

  const setIndex: React.Dispatch<React.SetStateAction<number>> = useCallback(
    (action) => {
      setState((prev) => {
        if (!prev) {
          return prev;
        }
        const nextIdx =
          typeof action === "function"
            ? action(prev.resultIndex)
            : action;
        return { ...prev, resultIndex: nextIdx };
      });
    },
    []
  );

  const setMessage = useCallback((m: string | null) => {
    setState((prev) => (prev ? { ...prev, message: m } : prev));
  }, []);

  const setPalmistryStyleId = useCallback((palmistryStyleId: PalmistryStyleId) => {
    setState((prev) => (prev ? { ...prev, palmistryStyleId } : prev));
  }, []);

  const setPalmistryFile: SetPalmistryFile = useCallback((action) => {
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const palmistryFile =
        typeof action === "function" ? action(prev.palmistryFile) : action;
      return { ...prev, palmistryFile };
    });
  }, []);

  const setPalmistryResultSrc = useCallback((palmistryResultSrc: string | null) => {
    setState((prev) => (prev ? { ...prev, palmistryResultSrc } : prev));
  }, []);

  const setPalmistryMessage = useCallback((palmistryMessage: string | null) => {
    setState((prev) => (prev ? { ...prev, palmistryMessage } : prev));
  }, []);

  const openApiKeyModal = useCallback(() => {
    setApiKeyModalOpen(true);
  }, []);

  const appContextValue = useMemo((): AppDataContextValue | null => {
    if (!state) {
      return null;
    }
    return {
      isHydrated: true,
      apiKey: state.apiKey,
      setApiKey,
      saveApiKey,
      openApiKeyModal,
      clearAllData,
      tab: state.tab,
      setTab,
      prompt: state.prompt,
      setPrompt,
      n: state.n,
      setN,
      aspect: state.aspect,
      setAspect,
      sourceFiles: state.sourceFiles,
      setSourceFiles,
      results: state.results,
      setResults,
      index: state.resultIndex,
      setIndex,
      message: state.message,
      setMessage,
      palmistryStyleId: state.palmistryStyleId,
      setPalmistryStyleId,
      palmistryFile: state.palmistryFile,
      setPalmistryFile,
      palmistryResultSrc: state.palmistryResultSrc,
      setPalmistryResultSrc,
      palmistryMessage: state.palmistryMessage,
      setPalmistryMessage,
    };
  }, [
    state,
    setApiKey,
    saveApiKey,
    openApiKeyModal,
    clearAllData,
    setTab,
    setPrompt,
    setN,
    setAspect,
    setSourceFiles,
    setResults,
    setIndex,
    setMessage,
    setPalmistryStyleId,
    setPalmistryFile,
    setPalmistryResultSrc,
    setPalmistryMessage,
  ]);

  if (!state) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-2 bg-stone-50/80 text-sm text-stone-500">
        正在从本机恢复数据…
      </div>
    );
  }

  return (
    <AppDataContext.Provider value={appContextValue!}>
      {children}
      <ApiKeyModal
        open={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={state.apiKey}
        saveApiKey={saveApiKey}
        isHydrated
        clearAllData={clearAllData}
      />
    </AppDataContext.Provider>
  );
}
