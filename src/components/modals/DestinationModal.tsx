import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Text } from "react-native";

import BaseModal, { BaseModalRef } from "./BaseModal";
import type { ModalControllerDispatchEvent } from "../modals/ModalController";

export type DestinationModalOpenPayload = {
  title: string;
};

export type DestinationModalRef = {
  open: (payload: DestinationModalOpenPayload) => void;
};

type Props = {
  modalControllerDispatch: (event: ModalControllerDispatchEvent) => void;
};

const DestinationModal = forwardRef<DestinationModalRef, Props>(
  (props, ref) => {
    const baseModalRef = useRef<BaseModalRef>(null);
    const [destinationInfo, setDestionationInfo] = useState({ title: "yuh" });

    useImperativeHandle(
      ref,
      () => ({
        open: (payload) => {
          baseModalRef.current?.open();
          setDestionationInfo({
            title: payload.title,
          });
        },
      }),
      []
    );

    return (
      <BaseModal
        ref={baseModalRef}
        onClose={() =>
          props.modalControllerDispatch({
            event: "CLOSE_DESTINATION",
          })
        }
      >
        <Text>{destinationInfo.title}</Text>
      </BaseModal>
    );
  }
);

export default DestinationModal;
