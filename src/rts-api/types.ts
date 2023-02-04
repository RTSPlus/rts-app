export type PathPoint = {
  lat: number;
  lon: number;

  type: "S" | "W";

  projectedDistance: number;
  interpolated: boolean;
};

export type PathStopPoint = PathPoint & {
  type: "S";

  name: string;
  id: number;

  reportedDistance: number;
};

export type RoutePath = {
  id: number;
  reportedLength: number;
  direction: "INBOUND" | "OUTBOUND";

  path: PathPoint[];
  stops: PathStopPoint[];

  dtr?: {
    id: number;
    path: PathPoint[];
    stops: PathStopPoint[];
  };
};

export type Route = {
  num: number;
  name: string;
  color: string;
  path: Record<number, RoutePath>;
};
