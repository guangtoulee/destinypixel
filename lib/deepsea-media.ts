import "server-only";
import { oceanMediaKey, OCEAN_BLOB_PREFIX } from "./ocean-media";

export const DEEPSEA_BLOB_PREFIX = "ocean/deepsea-su-20261016-r2/";

export function deepseaMediaKey(segments: string[]) {
  const validated = oceanMediaKey(segments);
  return validated ? DEEPSEA_BLOB_PREFIX + validated.slice(OCEAN_BLOB_PREFIX.length) : null;
}
