import { z } from "zod";

import { apiRequest, endpoints } from "./rts";

// Shortened schema for brevity
// See API docs for full schema
const Schema = z.array(
  z.object({
    des: z.string(),
    dly: z.boolean(),
    hdg: z.coerce.number(),
    lat: z.coerce.number(),
    lon: z.coerce.number(),
    pdist: z.number(),
    pid: z.number(),
    // TODO: Change this to enum
    psgld: z.string(),
    rt: z.coerce.number(),
    spd: z.number(),
    vid: z.coerce.number(),
  })
);

export default async function getVehiclesOnRoute(routeNum: number) {
  return new Promise<z.infer<typeof Schema>>((res, rej) => {
    apiRequest(endpoints.GET_VEHICLES, {
      rt: routeNum.toString(),
    })
      .then((response) => response.json())
      .then((data) => {
        const parsed = Schema.safeParse(data["bustime-response"]["vehicle"]);

        if (!parsed.success) {
          rej(parsed.error);
        } else {
          res(parsed.data);
        }
      })
      .catch((err) => rej(err));
  });
}
