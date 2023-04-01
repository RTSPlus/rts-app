import { forwardRef, useImperativeHandle, useRef } from "react";
import { Text, StyleSheet, View } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import type { ModalControllerDispatchEvent } from "./ModalController";

export type MapOptionsModalPayload = {};

export type MapOptionsModalRef = {
  open: (payload: MapOptionsModalPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const MapOptionsModal = forwardRef<MapOptionsModalRef, Props>((props, ref) => {
  const baseModalRef = useRef<BaseModalRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        baseModalRef.current?.open();
      },
    }),
    []
  );

  return (
    <BaseModal
      titleText="Your Map"
      ref={baseModalRef}
      onClose={() =>
        props.modalControllerDispatch({
          event: "CLOSE_ROUTE",
        })
      }
    >
      <View style={{ paddingHorizontal: 16 }}></View>
    </BaseModal>
  );
});

const styles = StyleSheet.create({});

export default MapOptionsModal;
