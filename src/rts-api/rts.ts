import { RTS_HASH_KEY, RTS_API_KEY } from "@env";
import encHex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import { distVincenty } from "node-vincenty";

import { PathPoint, PathStopPoint, Route, Pattern } from "./types";
import { bisect_left } from "../utils/bisect";
import { match } from "ts-pattern";

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

// This mock data was retrieved on 1680357856172 (April 1, 2023 2:04:16.172 GMT)
const MOCK_GET_ROUTES_REQUEST = true;
const MOCK_GET_ROUTES_RESPONSE = `{"bustime-response": {"routes": [{"rt": "1", "rtnm": "Rosa Parks to Butler Plaza TS", "rtclr": "#6373b4", "rtdd": "1"}, {"rt": "2", "rtnm": "Rosa Parks to NE Walmart Super", "rtclr": "#d88257", "rtdd": "2"}, {"rt": "3", "rtnm": "Rosa Parks to N Main Post Office", "rtclr": "#20b2aa", "rtdd": "3"}, {"rt": "5", "rtnm": "Rosa Parks to Oaks Mall", "rtclr": "#777a56", "rtdd": "5"}, {"rt": "6", "rtnm": "Rosa Parks to N Walmart Super", "rtclr": "#74797d", "rtdd": "6"}, {"rt": "7", "rtnm": "Rosa Parks to Eastwood Meadows", "rtclr": "#cc2575", "rtdd": "7"}, {"rt": "8", "rtnm": "Shands to N Walmart Supercenter", "rtclr": "#ff7b00", "rtdd": "8"}, {"rt": "9", "rtnm": "Reitz Union to Hunters Run", "rtclr": "#acc24c", "rtdd": "9"}, {"rt": "10", "rtnm": "Rosa Parks to Santa Fe", "rtclr": "#2ca4e2", "rtdd": "10"}, {"rt": "11", "rtnm": "Rosa Parks to Eastwood Meadows", "rtclr": "#9e8a6c", "rtdd": "11"}, {"rt": "12", "rtnm": "Reitz Union to Butler Plaza", "rtclr": "#b27b55", "rtdd": "12"}, {"rt": "13", "rtnm": "Beaty Tower to Cottage Grove Apt", "rtclr": "#49535a", "rtdd": "13"}, {"rt": "15", "rtnm": "Rosa Parks to NW 13th Street", "rtclr": "#449a57", "rtdd": "15"}, {"rt": "16", "rtnm": "Beaty Towers to Sugar Hill", "rtclr": "#929496", "rtdd": "16"}, {"rt": "17", "rtnm": "Beaty Towers to Rosa Parks", "rtclr": "#b0312b", "rtdd": "17"}, {"rt": "20", "rtnm": "Reitz Union to Oaks Mall", "rtclr": "#42b4ed", "rtdd": "20"}, {"rt": "21", "rtnm": "Reitz Union to Cabana Beach", "rtclr": "#d6803b", "rtdd": "21"}, {"rt": "23", "rtnm": "Oaks Mall to Santa Fe", "rtclr": "#b49f33", "rtdd": "23"}, {"rt": "25", "rtnm": "UF Commuter Lot to Airport", "rtclr": "#8fbc8f", "rtdd": "25"}, {"rt": "26", "rtnm": "Rosa Parks to Airport", "rtclr": "#94256c", "rtdd": "26"}, {"rt": "28", "rtnm": "The Hub to Butler Plaza", "rtclr": "#9cc77d", "rtdd": "28"}, {"rt": "33", "rtnm": "Butler Plaza to Midtown", "rtclr": "#ca0088", "rtdd": "33"}, {"rt": "34", "rtnm": "The Hub to Lexington Crossing", "rtclr": "#ca3132", "rtdd": "34"}, {"rt": "35", "rtnm": "Reitz Union to SW 35th Place", "rtclr": "#00acec", "rtdd": "35"}, {"rt": "36", "rtnm": "Reitz Union to Williston Plaza", "rtclr": "#d00073", "rtdd": "36"}, {"rt": "37", "rtnm": "Reitz Union to Butler Plaza", "rtclr": "#0a8e33", "rtdd": "37"}, {"rt": "38", "rtnm": "The Hub to Gainesville Place", "rtclr": "#1ea89c", "rtdd": "38"}, {"rt": "40", "rtnm": "The Hub to Hunters Crossing", "rtclr": "#ffd5a5", "rtdd": "40"}, {"rt": "43", "rtnm": "Shands to Santa Fe", "rtclr": "#3365de", "rtdd": "43"}, {"rt": "46", "rtnm": "Reitz Union to Rosa Parks", "rtclr": "#88809a", "rtdd": "46"}, {"rt": "75", "rtnm": "Oaks Mall to Butler Plaza", "rtclr": "#e4aaac", "rtdd": "75"}, {"rt": "76", "rtnm": "Sante Fe to Haile", "rtclr": "#9894c6", "rtdd": "76"}, {"rt": "78", "rtnm": "Santa Fe College to Butler Plaza", "rtclr": "#c8c8c8", "rtdd": "78"}, {"rt": "118", "rtnm": "The Hub to Cultural Plaza", "rtclr": "#bbd147", "rtdd": "118"}, {"rt": "119", "rtnm": "The Hub to Family Housing", "rtclr": "#f165de", "rtdd": "119"}, {"rt": "121", "rtnm": "The Hub to Commuter Lot", "rtclr": "#ffa500", "rtdd": "121"}, {"rt": "122", "rtnm": "UF North/South Circulator", "rtclr": "#fff22d", "rtdd": "122"}, {"rt": "125", "rtnm": "The Hub to Lakeside", "rtclr": "#ca0088", "rtdd": "125"}, {"rt": "126", "rtnm": "Sorority Row to Lakeside", "rtclr": "#7cc6f3", "rtdd": "126"}, {"rt": "127", "rtnm": "East Circulator", "rtclr": "#6fb353", "rtdd": "127"}, {"rt": "150", "rtnm": "Haile Village to UF Campus", "rtclr": "#ff7f50", "rtdd": "150"}, {"rt": "711", "rtnm": "Rosa Parks to Eastwood Meadows", "rtclr": "#7b4e5a", "rtdd": "711"}]}}`;
export async function getRoutes() {
  return new Promise<RouteData[]>((res, rej) => {
    const data = match(MOCK_GET_ROUTES_REQUEST)
      .with(true, () => {
        return new Promise<any>((res) => {
          setTimeout(() => {
            res(JSON.parse(MOCK_GET_ROUTES_RESPONSE));
          }, 500);
        });
      })
      .with(false, () =>
        apiRequest(endpoints.GET_ROUTES).then((response) => response.json())
      )
      .exhaustive();

    data
      .then((data) => {
        res(
          data["bustime-response"]["routes"].map(
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
