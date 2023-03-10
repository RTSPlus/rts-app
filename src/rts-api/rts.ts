import { RTS_HASH_KEY, RTS_API_KEY } from "@env";
import encHex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import { distVincenty } from "node-vincenty";

import { PathPoint, PathStopPoint, Route, Pattern } from "./types";
import { bisect_left } from "../utils";

// Veryify that the environment variables are set
if (!RTS_HASH_KEY || !RTS_API_KEY) {
  throw new Error(
    "RTS_HASH_KEY and RTS_API_KEY must be set in the environment variables"
  );
}

export const endpoints = {
  GET_ROUTES: {
    url: "/api/v3/getroutes",
    requestType: "getroutes",
  },

  GET_ROUTE_PATTERNS: {
    url: "/api/v3/getpatterns",
    requestType: "getpatterns",
  },

  GET_VEHICLES: {
    url: "/api/v3/getvehicles",
    requestType: "getvehicles",
  },
} as const;

async function buildURL(
  endpoint: (typeof endpoints)[keyof typeof endpoints],
  hashKey: string,
  apiKey: string,
  params: Record<string, unknown> = {},
  xtime: number = Math.floor(Date.now())
) {
  const baseURL = "https://riderts.app/bustime";

  const formattedTime = new Date(xtime).toUTCString();

  const queryParams = {
    requestType: endpoint.requestType,
    key: apiKey,
    xtime: xtime.toString(),
    format: "json",
    ...params,
  };
  const encodedSearchParams = new URLSearchParams(queryParams).toString();

  const hashData = `${endpoint.url}?${encodedSearchParams}${formattedTime}`;
  const headers = {
    "X-Date": formattedTime,
    "X-Request-ID": hmacSHA256(hashData, hashKey).toString(encHex),
  } as const;

  return {
    url: `${baseURL}${endpoint.url}?${encodedSearchParams}`,
    headers,
  } as const;
}

export async function apiRequest(
  endpoint: (typeof endpoints)[keyof typeof endpoints],
  params: Record<string, unknown> = {},
  xtime: number = Math.floor(Date.now())
) {
  const { url, headers } = await buildURL(
    endpoint,
    RTS_HASH_KEY,
    RTS_API_KEY,
    params,
    xtime
  );

  return fetch(url, {
    headers,
  });
}

export type RouteData = {
  num: number;
  name: string;
  color: string;
};

export async function getRoutes() {
  return new Promise<RouteData[]>((res, rej) => {
    apiRequest(endpoints.GET_ROUTES)
      .then((response) => response.json())
      .then((data) => {
        const routes = data["bustime-response"]["routes"];
        res(
          routes.map(
            (rt: { [x: string]: any }): RouteData => ({
              num: parseInt(rt["rt"], 10),
              name: rt["rtnm"],
              color: rt["rtclr"],
            })
          )
        );
      })
      .catch((err) => rej(err));
  });
}

const PROJECTED_DISTANCE_SCALING_FACTOR = 0.98;
/**
 * Ensures PathPoint[] is sorted
 * @param rt
 * @param name
 * @param color
 * @returns
 */
export async function getRoutePattern(
  rt: number,
  name: string,
  color: string
): Promise<Route> {
  const response = await apiRequest(endpoints.GET_ROUTE_PATTERNS, { rt });

  return new Promise((res, rej) => {
    response
      .json()
      .then((data) => {
        const pathResponse = data["bustime-response"]["ptr"];

        const paths: Pattern[] = pathResponse.map((path: any) => {
          path["pt"].sort(
            (a: { [x: string]: number }, b: { [x: string]: number }) =>
              a["seq"] - b["seq"]
          );

          const points: PathPoint[] = [];
          const stops: PathStopPoint[] = [];

          // loop through the points and add the projected distance
          for (const point of path["pt"]) {
            if (point["typ"] === "W") {
              let projectedDistance = 0;

              if (points.length > 0) {
                const lastPoint = points.at(-1);
                if (lastPoint === undefined) {
                  throw new Error("lastPoint is undefined");
                }

                const distanceDiff = distVincenty(
                  lastPoint.lat,
                  lastPoint.lon,
                  parseFloat(point["lat"]),
                  parseFloat(point["lon"])
                ).distance;

                projectedDistance =
                  lastPoint.projectedDistance +
                  distanceDiff * PROJECTED_DISTANCE_SCALING_FACTOR;
              }

              points.push({
                seq: parseInt(point["seq"], 10),
                lat: parseFloat(point["lat"]),
                lon: parseFloat(point["lon"]),
                type: point["typ"],
                projectedDistance,
                interpolated: false,
              });
            } else if (point["typ"] === "S") {
              stops.push({
                seq: parseInt(point["seq"], 10),
                lat: parseFloat(point["lat"]),
                lon: parseFloat(point["lon"]),
                name: point["stpnm"],
                id: point["stpid"],
                type: point["typ"],
                projectedDistance: points.at(-1)?.projectedDistance ?? 0,
                reportedDistance: parseFloat(point["pdist"]),
                interpolated: false,
              });
            }

            while (
              stops.length > 0 &&
              points.length > 0 &&
              distVincenty(
                stops.at(-1).lat,
                stops.at(-1).lon,
                points.at(-1).lat,
                points.at(-1).lon
              ).distance <=
                1 / 1000
            ) {
              stops.pop();
            }
          }

          // Sort points and stops by by seq
          points.sort((a, b) => a.seq - b.seq);
          stops.sort((a, b) => a.seq - b.seq);

          return {
            id: path["pid"],
            reportedLength: path["ln"],
            direction: path["rtdir"],
            path: points,
            stops,
          } as Pattern;
        });

        // TODO: get the route name and color
        const route: Route = {
          num: rt,
          name,
          color,
          patterns: paths.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
        };

        res(route);
      })
      .catch((err) => rej(err));
  });
}

// TODO: Implement
export function projectPdistToNearestStop() {
  throw new Error("Not implemented");
}

/**
 * Expects a sorted `PathPoint[]`
 * Expects pdist in meters
 */
export function projectPdistToPathPoint(
  path: PathPoint[],
  pdist: number
): PathPoint {
  if (path.length === 0) {
    throw new Error("Path is empty");
  }

  // Clip pdist to path length
  if (pdist >= path.at(-1)!.projectedDistance) {
    return path.at(-1)!;
  } else if (pdist <= 0) {
    return path.at(0)!;
  }

  const index = bisect_left(path, pdist, (p) => p.projectedDistance);

  // Handle edge cases where pdist is exactly on a point
  // Just because I don't want to deal with projection edge cases
  if (index === 0) {
    return path.at(0)!;
  } else if (index === path.length) {
    return path.at(-1)!;
  } else if (path.at(index)?.projectedDistance === pdist) {
    return path.at(index)!;
  }

  const prevPoint = path.at(index - 1)!;
  const nextPoint = path.at(index)!;

  const ratio =
    (pdist - prevPoint.projectedDistance) /
    (nextPoint.projectedDistance - prevPoint.projectedDistance);
  const lat = prevPoint.lat + ratio * (nextPoint.lat - prevPoint.lat);
  const lon = prevPoint.lon + ratio * (nextPoint.lon - prevPoint.lon);

  return {
    seq: -1,
    lat,
    lon,
    type: "W",
    projectedDistance: pdist,
    interpolated: true,
  };
}
