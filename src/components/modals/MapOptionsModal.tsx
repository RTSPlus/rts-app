import { forwardRef, useImperativeHandle, useRef } from "react";
import { Text, StyleSheet } from "react-native";

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
      ref={baseModalRef}
      onClose={() =>
        props.modalControllerDispatch({
          event: "CLOSE_ROUTE",
        })
      }
    >
      <Text>Map options</Text>
    </BaseModal>
  );
});

const styles = StyleSheet.create({});

export default MapOptionsModal;
