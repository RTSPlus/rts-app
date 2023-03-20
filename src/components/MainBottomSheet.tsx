import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { atom, useAtomValue } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { ComponentProps, useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { assign, createMachine } from "xstate";

import HomeView from "./HomeView/HomeView";
import HomeView2 from "./HomeView/HomeView2";
import { colors } from "../colors";

const sheetViewMachine = createMachine({
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

export default function RTSBottomSheet() {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["12.5%", "50%", "92%"];

  // Spring animation config
  const bottomSheetAnimationConfigs = useBottomSheetSpringConfigs({
    damping: 40,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const BackdropComponent = useCallback(
    (props: ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={2}
        disappearsOnIndex={1}
        opacity={0.2}
        pressBehavior="none"
      />
    ),
    []
  );

  const sheetMachineState = useAtomValue(SheetViewMachineAtom);

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={sheetMachineState.context.sheetIndex}
        snapPoints={snapPoints}
        style={styles.bottomSheetContainer}
        handleIndicatorStyle={{
          backgroundColor: colors.ios.light.gray["2"].toRgbString(),
        }}
        animationConfigs={bottomSheetAnimationConfigs}
        backdropComponent={BackdropComponent}
        enablePanDownToClose={false}
      >
        {/* <HomeView /> */}
        <HomeView2 />
      </BottomSheet>
      {/* Invisible box filling to whole screen that renders the sheet inactive during transition */}
      {/* {sheetMachineState.value === "transitioning_to_search" && (
        <View style={StyleSheet.absoluteFill} />
      )} */}
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  bottomSheetContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
