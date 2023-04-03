import { atom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { match } from "ts-pattern";

import DestinationModal, {
  DestinationModalOpenPayload,
  DestinationModalRef,
} from "./DestinationModal";
import MapOptionsModal, {
  MapOptionsModalRef,
} from "./MapOptionsModal/MapOptionsModal";
import RouteModal, { RouteModalOpenPayload, RouteModalRef } from "./RouteModal";

/**
 * BIG WARNING TODO:
 * CURRENT IMPLEMENTATION NEEDS REWORK AND IS VERY FRAGILE
 * THE COUNTER IS JUST NO BUENO BUT IT WORKS FOR NOW
 * REFACTOR TO A STRONGER DYNAMIC STACK IMPLEMENTATION
 */

export type ModalControllerDispatchEvent =
  | {
      event: "OPEN_DESTINATION";
      payload: DestinationModalOpenPayload;
    }
  | {
      event: "CLOSE_DESTINATION";
    }
  | {
      event: "OPEN_ROUTE";
      payload: RouteModalOpenPayload;
    }
  | {
      event: "CLOSE_ROUTE";
    }
  | {
      event: "OPEN_MAP_OPTIONS";
    }
  | {
      event: "CLOSE_MAP_OPTIONS";
    };

/**
 * Note: We make dispatch a global variable so that we can access it from anywhere (e.g. the MainSheet)
 * more to avoid prop drilling. I know, not the best practice.
 * However, we prop drill the dispatch function to the modals.
 * This also avoids circular imports in the modals
 */
let modalDispatchSubscription:
  | ((event: ModalControllerDispatchEvent) => void)
  | null = null;
export const dispatch = (event: ModalControllerDispatchEvent) => {
  modalDispatchSubscription?.(event);
};

export const ModalCounterAtom = atom(0);

export default function ModalController() {
  const destinationModalRef = useRef<DestinationModalRef>(null);
  const routeModalRef = useRef<RouteModalRef>(null);
  const mapOptionsModalRef = useRef<MapOptionsModalRef>(null);

  const setModalCounter = useSetAtom(ModalCounterAtom);

  useEffect(() => {
    modalDispatchSubscription = (event) => {
      match(event)
        .with({ event: "OPEN_DESTINATION" }, ({ payload }) => {
          destinationModalRef.current?.open(payload);
          setModalCounter((prev) => prev + 1);
        })
        .with({ event: "OPEN_ROUTE" }, ({ payload }) => {
          routeModalRef.current?.open(payload);
          setModalCounter((prev) => prev + 1);
        })
        .with({ event: "OPEN_MAP_OPTIONS" }, () => {
          mapOptionsModalRef.current?.open({});
          setModalCounter((prev) => prev + 1);
        })
        .with(
          { event: "CLOSE_DESTINATION" },
          { event: "CLOSE_ROUTE" },
          { event: "CLOSE_MAP_OPTIONS" },
          () => {
            setModalCounter((prev) => prev - 1);
          }
        )
        .exhaustive();
    };

    return () => {
      modalDispatchSubscription = null;
    };
  }, [setModalCounter]);

  return (
    <>
      <DestinationModal
        ref={destinationModalRef}
        modalControllerDispatch={dispatch}
      />
      <RouteModal ref={routeModalRef} modalControllerDispatch={dispatch} />
      <MapOptionsModal
        ref={mapOptionsModalRef}
        modalControllerDispatch={dispatch}
      />
    </>
  );
}
