import { render } from "@testing-library/react";
import { usePersistence } from "../usePersistence";

type HookOptions = {
    props?: Record<string, any>;
    state?: Record<string, any>;
    initialState?: Record<string, any>;
};

const createState = (overrides: Record<string, any> = {}) => ({
    currentView: "grid",
    activeFilters: {},
    globalSearch: "",
    sortModel: [],
    columnVisibility: {},
    columnOrder: [],
    columnPinned: {},
    ...overrides
});

const setupHook = ({
    props: propOverrides,
    state: stateOverrides,
    initialState: initialOverrides
}: HookOptions = {}) => {
    const props = { name: "TestWidget", useLocalStorage: true, ...propOverrides };
    const state = createState(stateOverrides);
    const initialState = createState(initialOverrides || stateOverrides);
    const setState = jest.fn();

    const hookResult: { current?: ReturnType<typeof usePersistence> } = {};

    const TestComponent = () => {
        hookResult.current = usePersistence(props, state, setState, initialState);
        return null;
    };

    render(<TestComponent />);

    if (!hookResult.current) {
        throw new Error("usePersistence did not return a value");
    }

    return {
        ...hookResult.current,
        setStateMock: setState,
        storageKey: `aggrid:${props.name || "default"}`,
        initialState
    };
};

// ---------------------------------------------------------------------------
// Regression tests for AGGrid.tsx calling usePersistence with undefined args
// (see: const { savePersistedState, resetSettings } = usePersistence(props, undefined, undefined, undefined))
// These tests intentionally reproduce the crash so the CI pipeline catches it
// before the hook is wired up to the real gridState.
// ---------------------------------------------------------------------------
describe("usePersistence – called with undefined state/setState (AGGrid.tsx regression)", () => {
    const setupHookWithUndefined = () => {
        const props = { name: "TestWidget", useLocalStorage: true };
        const hookResult: { current?: ReturnType<typeof usePersistence> } = {};

        const TestComponent = () => {
            // Mirrors exactly how AGGrid.tsx currently calls the hook
            hookResult.current = usePersistence(props, undefined, undefined, undefined);
            return null;
        };

        render(<TestComponent />);

        if (!hookResult.current) {
            throw new Error("usePersistence did not return a value");
        }
        return hookResult.current;
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --- savePersistedState crashes ---
    it("savePersistedState should NOT throw a TypeError when state is undefined (BUG: currently crashes)", () => {
        const { savePersistedState } = setupHookWithUndefined();
        // When state is undefined, `state.currentView` throws:
        //   TypeError: Cannot read properties of undefined (reading 'currentView')
        // The hook must guard against this instead of crashing.
        expect(() => savePersistedState({ globalSearch: "orders" })).not.toThrow();
    });

    it("savePersistedState should not write to localStorage when state is undefined", () => {
        const setItemSpy = jest.spyOn(window.localStorage, "setItem");
        const { savePersistedState } = setupHookWithUndefined();
        // Should be a no-op rather than crashing
        try {
            savePersistedState({ globalSearch: "orders" });
        } catch {
            // swallow crash so the expect below can still report the failure
        }
        expect(setItemSpy).not.toHaveBeenCalled();
    });

    // --- resetSettings crashes ---
    it("resetSettings should NOT throw when setState is undefined (BUG: currently crashes)", () => {
        const { resetSettings } = setupHookWithUndefined();
        // When setState is undefined, `setState(initialState)` throws:
        //   TypeError: setState is not a function
        expect(() => resetSettings()).not.toThrow();
    });

    it("resetSettings should still clear localStorage even when setState is undefined", () => {
        const removeItemSpy = jest.spyOn(window.localStorage, "removeItem");
        const { resetSettings } = setupHookWithUndefined();
        try {
            resetSettings();
        } catch {
            // swallow crash so the expect below can still report the failure
        }
        expect(removeItemSpy).toHaveBeenCalledWith("aggrid:TestWidget");
    });
});

// ---------------------------------------------------------------------------
// Core unit tests
// ---------------------------------------------------------------------------
describe("usePersistence", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("saves merged state to localStorage", () => {
        const setItemSpy = jest.spyOn(window.localStorage, "setItem");
        const { savePersistedState, storageKey } = setupHook();

        savePersistedState({ globalSearch: "orders", preferredExportFormat: "pdf" });

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        expect(setItemSpy).toHaveBeenCalledWith(storageKey, expect.any(String));
        const payload = JSON.parse(setItemSpy.mock.calls[0][1]);
        expect(payload).toEqual({
            viewMode: "grid",
            activeFilters: {},
            globalSearch: "orders",
            sortModel: [],
            columnVisibility: {},
            columnOrder: [],
            columnPinned: {},
            preferredExportFormat: "pdf",
            preferredExportOptions: undefined
        });
    });

    it("skips persistence when disabled or when window is unavailable", () => {
        const setItemSpy = jest.spyOn(window.localStorage, "setItem");
        const { savePersistedState } = setupHook({ props: { useLocalStorage: false } });

        savePersistedState({ globalSearch: "noop" });
        expect(setItemSpy).not.toHaveBeenCalled();

        const originalWindow = global.window;
        const { savePersistedState: serverSave } = setupHook();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (global as any).window;

        serverSave({ globalSearch: "server" });

        expect(setItemSpy).not.toHaveBeenCalled();

        global.window = originalWindow;
    });

    it("clears storage and resets state when resetSettings is called", () => {
        const removeItemSpy = jest.spyOn(window.localStorage, "removeItem");
        const { resetSettings, storageKey, setStateMock, initialState } = setupHook({
            state: { globalSearch: "current" },
            initialState: { globalSearch: "initial" }
        });

        resetSettings();

        expect(removeItemSpy).toHaveBeenCalledWith(storageKey);
        expect(setStateMock).toHaveBeenCalledWith(initialState);
    });
});
