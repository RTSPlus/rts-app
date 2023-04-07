import { RTS_GOOGLE_API_KEY } from "@env";
import { z } from "zod";
// const : string = "AIzaSyAF6id2KmOvi5pPEwX8E4EEMpGXemMlx5E";


const PlacePredictionSchema = z.object({
  description: z.string(),
  matched_substrings: z.array(
    z.object({
      length: z.number(),
      offset: z.number(),
    })
  ),
  place_id: z.string(),
  structured_formatting: z.object({
    main_text: z.string(),
    main_text_matched_substrings: z.array(
      z.object({
        length: z.number(),
        offset: z.number(),
      })
    ),
    secondary_text: z.string(),
  }),
  terms: z.array(
    z.object({
      offset: z.number(),
      value: z.string(),
    })
  ),
  types: z.array(z.string()),
});

const PlacesAutoCompleteResponseSchema = z.object({
  predictions: z.array(PlacePredictionSchema),
  status: z.string(),
});

export async function googleAutocomplete(query: string) {
  return new Promise<
    z.infer<typeof PlacesAutoCompleteResponseSchema>["predictions"]
  >((res, rej) => {
    fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${RTS_GOOGLE_API_KEY}&input=${query}`
    )
      .then((response) => response.json())
      .then((data) => PlacesAutoCompleteResponseSchema.safeParseAsync(data))
      .then((parsedData) => {
        if (parsedData.success) {
          if (parsedData.data.status === "OK") {
            res(parsedData.data.predictions);
          } else {
            rej(parsedData.data.status);
          }
        } else {
          rej(parsedData.error);
        }
      })
      .catch((error) => rej(error));
  });
}
