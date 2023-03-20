import { atom } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { assign, createMachine } from "xstate";

export const sheetViewMachine = createMachine({
  id: "sheetViewMachine",
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

export const SheetViewMachineAtom = atomWithMachine(sheetViewMachine);
export const SheetMachineValueAtom = atom(
  (get) => get(SheetViewMachineAtom).value
);
