import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetModal,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

import { colors } from "../../colors";
import {
  sheetAnimationConfig,
  sheetStyles,
  SHEET_SNAP_POINTS,
} from "../../utils/sheetConfig";

type BaseModalProps = {
  titleText?: string;
  onClose?: () => void;
};

export type BaseModalRef = {
  open: () => void;
};

const BaseModal = forwardRef<BaseModalRef, PropsWithChildren<BaseModalProps>>(
  (props, ref) => {
    const modalRef = useRef<BottomSheetModal>(null);

    // Spring animation config
    const bottomSheetAnimationConfigs =
      useBottomSheetSpringConfigs(sheetAnimationConfig);

    // This is weird and needs to be a ref for the onDismiss prop
    // See note above the prop
    const isOpen = useRef(false);

    const open = useCallback(() => {
      modalRef.current?.present();
      isOpen.current = true;
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        open,
      }),
      [open]
    );

    return (
      <BottomSheetModal
        ref={modalRef}
        index={1}
        snapPoints={SHEET_SNAP_POINTS}
        style={sheetStyles.bottomSheet}
        handleStyle={sheetStyles.bottomSheetHandle}
        handleIndicatorStyle={sheetStyles.bottomSheetHandleIndicator}
        backgroundStyle={sheetStyles.bottomSheetBackgroundStyle}
        animationConfigs={bottomSheetAnimationConfigs}
        //
        // This is weird because the bottom sheet can be dismissed by swiping down
        // and we need to dispatch the state change. But we also want to close the
        // modal when the user presses the close button and that requires an alternate dispatch
        // because waiting for onDismiss is too slow. The event fires after the animation finishes
        // But we need the isOpen ref (not state) because we don't want to re-fire the dispatch
        // since the dismiss() call in the button press also fires onDismiss but slower since it runs after animation end
        // It's a little bit of a mess that would be fixed if we could disable the swipe-down close action
        // But alas, we cannot
        onDismiss={() => {
          if (isOpen.current) {
            isOpen.current = false;
            props.onClose?.();
          }
        }}
      >
        <View style={styles.topRow}>
          <Text style={styles.title}>{props.titleText ?? ""}</Text>
          <TouchableOpacity
            hitSlop={10}
            activeOpacity={0.5}
            style={styles.closeBtn}
            onPress={() => {
              isOpen.current = false;
              props.onClose?.();
              modalRef.current?.dismiss();
            }}
          >
            <Ionicons
              name="ios-close"
              size={24}
              color={colors.ios.light.gray["1"].darken().toRgbString()}
              style={{ transform: [{ translateX: 0.5 }] }}
            />
          </TouchableOpacity>
        </View>
        {props.children}
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 0,
  },
  closeBtn: {
    backgroundColor: colors.ios.light.gray["4"].setAlpha(0.5).toRgbString(),
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BaseModal;
