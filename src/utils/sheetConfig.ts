import { useBottomSheetSpringConfigs } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";

import { colors } from "../colors";

export const SHEET_SNAP_POINTS = ["12.5%", "50%", "92%"];

export const sheetAnimationConfig: Parameters<
  typeof useBottomSheetSpringConfigs
>[0] = {
  damping: 40,
  overshootClamping: true,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
  stiffness: 500,
};

export const sheetStyles = StyleSheet.create({
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
