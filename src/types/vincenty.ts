declare module "node-vincenty" {
  export const distVincenty: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    distance: number;
    initialBearing: number;
    finalBearing: number;
  };
}
