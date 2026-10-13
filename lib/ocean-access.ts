import "server-only";

// Both private museum presentations use the existing server-configured access code.
export {
  BLENDER_PRIVATE_HEADERS as OCEAN_PRIVATE_HEADERS,
  BLENDER_SESSION_TTL as OCEAN_SESSION_TTL,
  createBlenderSession as createOceanSession,
  isBlenderAccessConfigured as isOceanAccessConfigured,
  verifyBlenderPassword as verifyOceanPassword,
  verifyBlenderSession as verifyOceanSession,
} from "./blender-access";

export const OCEAN_COOKIE_NAME = "ocean_access";
