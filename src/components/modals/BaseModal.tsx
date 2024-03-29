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
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

import { colors } from "../../colors";
import {
  sheetAnimationConfig,
  sheetStyles,
  SHEET_SNAP_POINTS,
} from "../../utils/sheetConfig";

type BaseModalProps = {
  titleText?: string;
  subtitleText?: string;
  onClose?: () => void;
  hideBodyOnClose?: boolean;
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
    // See note above the onDismiss prop
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

    // #region Body opacity animation
    const animatedIndex = useSharedValue(1);
    const bodyOpacity = useDerivedValue(
      () =>
        interpolate(animatedIndex.value, [0, 0.2], [0, 1], {
          extrapolateRight: Extrapolation.CLAMP,
        }),
      []
    );
    const bodyAnimatedStyle = useAnimatedStyle(() => ({
      opacity: bodyOpacity.value,
    }));
    // #endregion

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
        animatedIndex={animatedIndex}
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
          <View>
            {props.titleText && (
              <Text style={styles.title}>{props.titleText}</Text>
            )}
            {props.subtitleText && (
              <Text style={styles.subtitle}>{props.subtitleText}</Text>
            )}
          </View>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
        <Animated.View style={[bodyAnimatedStyle, { flex: 1 }]}>
          {props.children}
        </Animated.View>
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
  subtitle: {
    fontSize: 20,
    color: colors.ios.light.gray["1"].darken().toRgbString(),
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
