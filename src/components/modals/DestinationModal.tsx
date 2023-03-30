import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Button, Text, StyleSheet } from "react-native";
import { colors } from "../../colors";

import { SHEET_SNAP_POINTS } from "../../utils/utils";
import type { ModalControllerDispatchEvent } from "../modals/ModalController";

export type DestinationModalOpenPayload = {};

export type DestinationModalRef = {
  open: (payload: DestinationModalOpenPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const DestinationModal = forwardRef<DestinationModalRef, Props>(
  (props, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // This is weird and needs to be a ref for the onDismiss prop
    // See note above the prop
    const isOpen = useRef(false);

    const open = useCallback((payload: DestinationModalOpenPayload) => {
      bottomSheetModalRef.current?.present();
      isOpen.current = true;

      console.log(payload);
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
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={SHEET_SNAP_POINTS}
        style={styles.bottomSheet}
        handleStyle={styles.bottomSheetHandle}
        handleIndicatorStyle={styles.bottomSheetHandleIndicator}
        backgroundStyle={styles.bottomSheetBackgroundStyle}
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
            props.modalControllerDispatch({
              event: "CLOSE_DESTINATION",
            });
          }
        }}
      >
        <Text>Yuh</Text>
        <Button
          title="close"
          onPress={() => {
            isOpen.current = false;
            props.modalControllerDispatch({
              event: "CLOSE_DESTINATION",
            });
            bottomSheetModalRef.current?.dismiss();
          }}
        />
      </BottomSheetModal>
    );
  }
);

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

export default DestinationModal;
