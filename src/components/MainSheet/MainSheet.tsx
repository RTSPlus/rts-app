// #region Imports
import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { useAtom } from "jotai";
import React, { ComponentProps, useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  default as Reanimated,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { match } from "ts-pattern";

import {
  MainSheetMachineAtom,
  SheetViewMachineStates,
} from "./MainSheetMachine";
import SearchBar from "./SearchBar";
import { colors } from "../../colors";
import HomeViewBody from "./HomeView/HomeViewBody";
import SearchViewBody from "./SearchView/SearchViewBody";

// #endregion

export default function MainBottomSheet() {
  // #region State
  const [sheetState, sheetSend] = useAtom(MainSheetMachineAtom);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["12.5%", "50%", "92%"];

  const [searchBarInput, setSearchBarInput] = useState("");

  // #endregion

  // #region Animation for body opacity
  const sheetAnimatedIndex = useSharedValue(1);
  const bodyOpacity = useDerivedValue(
    () =>
      interpolate(sheetAnimatedIndex.value, [0, 0.2], [0, 1], {
        extrapolateRight: Extrapolation.CLAMP,
      }),
    []
  );
  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
  }));
  // #endregion

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

  const body = match(sheetState.value as SheetViewMachineStates)
    .with("home", () => <HomeViewBody />)
    .with("search", "transitioning_to_search", () => (
      <SearchViewBody searchQuery={searchBarInput} />
    ))
    .exhaustive();

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={sheetState.context.sheetIndex}
        snapPoints={snapPoints}
        style={styles.bottomSheet}
        handleStyle={styles.bottomSheetHandle}
        handleIndicatorStyle={styles.bottomSheetHandleIndicator}
        backgroundStyle={styles.bottomSheetBackgroundStyle}
        animationConfigs={bottomSheetAnimationConfigs}
        backdropComponent={BackdropComponent}
        enablePanDownToClose={false}
        animatedIndex={sheetAnimatedIndex}
        onAnimate={(from) => {
          if (sheetState.value === "search" && from === 2) {
            sheetSend("EXIT_SEARCH");
          }
        }}
      >
        <SearchBar onChangeText={(text) => setSearchBarInput(text)} />
        {/* <HomeView /> */}
        <Reanimated.View
          style={[{ ...styles.bottomSheetBackgroundStyle }, bodyAnimatedStyle]}
        >
          {body}
        </Reanimated.View>
      </BottomSheet>
      {/* Invisible box filling to whole screen that renders the sheet inactive during transition */}
      {sheetState.value === "transitioning_to_search" && (
        <View style={StyleSheet.absoluteFill} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheetHandle: {
    backgroundColor: colors.ios.light.gray["6"].toRgbString(),
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bottomSheetHandleIndicator: {
    backgroundColor: colors.ios.light.gray["2"].toRgbString(),
  },
  bottomSheetBackgroundStyle: {
    flex: 1,
    backgroundColor: colors.ios.light.gray["6"].toRgbString(),
  },
  bottomSheet: {
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
