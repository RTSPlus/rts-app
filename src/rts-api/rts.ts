import { RTS_HASH_KEY, RTS_API_KEY } from "@env";
import encHex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import { distVincenty } from "node-vincenty";

import { PathPoint, PathStopPoint, Route, RoutePath } from "./types";

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

async function apiRequest(
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

type RouteData = {
  num: number;
  name: string;
  color: string;
};

export async function getRoutes() {
  const response = await apiRequest(endpoints.GET_ROUTES);

  return new Promise<RouteData[]>((res, rej) => {
    response
      .json()
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
        console.log(pathResponse);

        const paths: RoutePath[] = pathResponse.map((path: any) => {
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
                lat: parseFloat(point["lat"]),
                lon: parseFloat(point["lon"]),
                type: point["typ"],
                projectedDistance,
                interpolated: false,
              });
            } else if (point["typ"] === "S") {
              stops.push({
                lat: parseFloat(point["lat"]),
                lon: parseFloat(point["lon"]),
                name: point["stpnm"],
                id: point["stpid"],
                type: point["typ"],
                projectedDistance:
                  points.length > 0 ? points.at(-1).projectedDistance : 0,
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

          return {
            id: path["pid"],
            reportedLength: path["ln"],
            direction: path["rtdir"],
            path: points,
            stops,
          } as RoutePath;
        });

        // TODO: get the route name and color
        const route: Route = {
          num: rt,
          name,
          color,
          path: paths.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
        };

        res(route);
      })
      .catch((err) => rej(err));
  });
}
