import type { UnitType } from "@/lib/bedroom/inference";

export interface InferBedroomBackfillEvent {
  type: "bedroom-backfill:progress";
  data: {
    processed: number;
    updated: number;
    total: number;
  };
}

export interface BedroomInferenceResult {
  id: string;
  inferredBedroomType: UnitType | null;
  isPostHarmonisation: boolean | null;
}
