// #region Imports
import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetInternal,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { match } from "ts-pattern";

import HomeViewBody from "./HomeView/HomeViewBody";
import {
  MainSheetMachineAtom,
  MainSheetMachineValueAtom,
  SheetViewMachineStates,
} from "./MainSheetMachine";
import SearchBar from "./SearchBar";
import SearchViewBody from "./SearchView/SearchViewBody";
import { sheetAnimationConfig, sheetStyles } from "../../utils/sheetConfig";
import { SHEET_SNAP_POINTS } from "../../utils/utils";
import { ModalCounterAtom } from "../modals/ModalController";

// #endregion

const SheetTransitionHandler = () => {
  const { animatedIndex } = useBottomSheetInternal();

  // Very marginal? possible render optimization by using derived read-only atoms
  const sheetMachineSend = useSetAtom(MainSheetMachineAtom);
  const sheetMachineValue = useAtomValue(MainSheetMachineValueAtom);

  // Render sheet in-active when another modal is active
  const isSheetActive = useAtomValue(ModalCounterAtom) <= 0;

  // Handle sheet transition
  useAnimatedReaction(
    () => ({
      index: animatedIndex.value,
    }),
    ({ index }) => {
      if (sheetMachineValue === "transitioning_to_search") {
        // Render the bottom sheet un-interactive when we are transitioning to the search view
        // to prevent weird bugs/behaviors. Necessary to feel more natural
        if (index >= 1.95) runOnJS(sheetMachineSend)("FINISHED_TRANSITION");
      } else if (sheetMachineValue === "search" && isSheetActive) {
        // This is required because for some reason, `onAnimate` in the BottomSheet prop will not
        // fire when the sheet is transitioning from the search view to the home view
        // However, that event transition should be preferred as it runs faster
        // This is a backup in case that event transition fails
        if (index <= 1) runOnJS(sheetMachineSend)("EXIT_SEARCH");
      }
    },
    [sheetMachineValue, sheetMachineSend, isSheetActive]
  );

  return <></>;
};

export default function MainBottomSheet() {
  // #region State
  const [sheetState, sheetSend] = useAtom(MainSheetMachineAtom);
  const sheetRef = useRef<BottomSheet>(null);

  const [searchBarInput, setSearchBarInput] = useState("");
  // #endregion

  // Spring animation config
  const bottomSheetAnimationConfigs =
    useBottomSheetSpringConfigs(sheetAnimationConfig);

  // Honestly idk why this needs to be wrapped in a useCallback. That's the example from the docs
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

  const body = match(sheetState.value as SheetViewMachineStates)
    .with("home", () => <HomeViewBody />)
    .with("search", "transitioning_to_search", () => (
      <SearchViewBody searchQuery={searchBarInput} />
    ))
    .exhaustive();

  // De-activate sheet when another modal is active
  const isSheetActive = useAtomValue(ModalCounterAtom) <= 0;

  useEffect(() => {
    if (!isSheetActive) {
      sheetRef.current?.close();
    }
  }, [isSheetActive]);

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={sheetState.context.sheetIndex}
        snapPoints={SHEET_SNAP_POINTS}
        style={sheetStyles.bottomSheet}
        handleStyle={sheetStyles.bottomSheetHandle}
        handleIndicatorStyle={sheetStyles.bottomSheetHandleIndicator}
        backgroundStyle={sheetStyles.bottomSheetBackgroundStyle}
        animationConfigs={bottomSheetAnimationConfigs}
        backdropComponent={BackdropComponent}
        enablePanDownToClose={false}
        onAnimate={(from) => {
          if (isSheetActive) {
            if (sheetState.value === "search" && from === 2) {
              sheetSend("EXIT_SEARCH");
            }
          }
        }}
      >
        <SheetTransitionHandler />
        <SearchBar onChangeText={(text) => setSearchBarInput(text)} />
        <View style={sheetStyles.bottomSheetBackgroundStyle}>{body}</View>
      </BottomSheet>
      {/* Invisible box filling to whole screen that renders the sheet inactive during transition */}
      {sheetState.value === "transitioning_to_search" && (
        <View style={StyleSheet.absoluteFill} />
      )}
    </>
  );
}
