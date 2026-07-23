import { permanentRedirect } from "next/navigation";

export default function LegacyCanddyRedirect() {
  permanentRedirect("/candy");
}
