import { atom } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { assign, createMachine } from "xstate";

type Context = {
  sheetIndex: number;
};

type Events =
  | {
      type: "FOCUS_SEARCH";
    }
  | {
      type: "EXIT_SEARCH";
    }
  | {
      type: "FINISHED_TRANSITION";
    };

export const MainSheetMachine = createMachine({
  tsTypes: {} as import("./MainSheetMachine.typegen").Typegen0,
  schema: {
    context: {} as Context,
    events: {} as Events,
  },
  id: "mainSheetMachine",
  initial: "home",
  context: {
    sheetIndex: 1,
  },
  states: {
    home: {
      on: {
        FOCUS_SEARCH: {
          target: "transitioning_to_search",
          actions: [assign({ sheetIndex: 2 })],
        },
      },
    },
    transitioning_to_search: {
      on: {
        FINISHED_TRANSITION: {
          target: "search",
        },
      },
    },
    search: {
      on: {
        EXIT_SEARCH: {
          target: "home",
          actions: [assign({ sheetIndex: 1 })],
        },
      },
    },
  },
  predictableActionArguments: true,
});

export type SheetViewMachineStates =
  (typeof MainSheetMachine)["__TResolvedTypesMeta"]["resolved"]["matchesStates"];

export const MainSheetMachineAtom = atomWithMachine(MainSheetMachine);
export const MainSheetMachineValueAtom = atom(
  (get) => get(MainSheetMachineAtom).value
);
export const MainSheetActivatedAtom = atom(true);
