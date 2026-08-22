import type { DestinyProfile } from "@/app/xingpan/types";
import type {
  DestinyChart,
  OracleBirthInput,
} from "@/lib/destinyCalculator";

export type OracleRequest = OracleBirthInput;

export type OracleResponse = {
  profile: DestinyProfile;
  chart: DestinyChart;
  activeCycleId: string;
  overview: string;
  meta: {
    oracleSource: "deepseek" | "local-fallback";
    model: string;
    generatedAt: string;
    degraded: boolean;
    privacy: "chart-only";
  };
};

export type OracleErrorResponse = {
  error: string;
  code: string;
};

export type OracleRequestState = "idle" | "calculating" | "ready" | "error";
