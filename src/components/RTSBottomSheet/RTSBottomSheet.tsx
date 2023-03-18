import BottomSheet, {
  BottomSheetBackdrop,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { atom, useAtomValue } from "jotai";
import { ComponentProps, useCallback, useRef } from "react";
import { StyleSheet } from "react-native";

import { colors } from "../../colors";
import HomeView2 from "../HomeView2";

export const sheetIndexAtom = atom(1);

export default function RTSBottomSheet() {
  // hooks
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["12.5%", "50%", "92%"];

  const bottomSheetIndex = useAtomValue(sheetIndexAtom);

  // Spring animation config
  const bottomSheetAnimationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const backdropComponent = useCallback(
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

  return (
    <BottomSheet
      ref={sheetRef}
      index={bottomSheetIndex}
      snapPoints={snapPoints}
      style={styles.bottomSheetContainer}
      handleIndicatorStyle={{
        backgroundColor: colors.ios.light.gray["2"].toRgbString(),
      }}
      animationConfigs={bottomSheetAnimationConfigs}
      backdropComponent={backdropComponent}
      enablePanDownToClose={false}
      // onChange={(index) => setBottomSheetIndex(index)}
    >
      {/* <HomeView /> */}
      <HomeView2 />
    </BottomSheet>
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
