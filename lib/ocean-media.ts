import "server-only";

export const OCEAN_BLOB_PREFIX = "ocean/proposal-20261014/";

export function oceanMediaKey(segments: string[]) {
  if (!segments.length || segments.length > 3) return null;
  if (segments.some(s => !s || s === "." || s === ".." || /[\\/\u0000%]/.test(s) || s.length > 240)) return null;
  if (segments.length === 1 && ["manifest.json", "media-checksums.json"].includes(segments[0])) return OCEAN_BLOB_PREFIX + segments[0];
  if (segments.length === 3 && segments[0] === "assets" && /^[a-f0-9]{64}$/.test(segments[1])) return OCEAN_BLOB_PREFIX + segments.join("/");
  // Flat files are used only by the explicitly configured local review directory.
  if (segments.length === 1) return OCEAN_BLOB_PREFIX + segments[0];
  return null;
}

export function oceanContentType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", glb: "model/gltf-binary", json: "application/json; charset=utf-8", pdf: "application/pdf", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation" } as Record<string, string>)[extension || ""] || "application/octet-stream";
}

export function oceanContentDisposition(filename: string) {
  const attachment = /\.(pdf|pptx)$/i.test(filename);
  return `${attachment ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
