const nativeVoiceOrder = ["Daniel", "Karen", "Moira", "Samantha", "Tessa"];
const googleVoiceOrder = ["Google US English", "Google UK English Female", "Google UK English Male"];

export const allowedEnglishVoiceSummary =
  "Daniel/Karen/Moira/Samantha/Tessa 或 Google US English/Google UK English Female/Google UK English Male";

function cleanVoiceName(name: string) {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function isEnglishVoice(voice: SpeechSynthesisVoice) {
  return voice.lang.toLowerCase().startsWith("en");
}

function getVoiceRank(voice: SpeechSynthesisVoice) {
  const name = cleanVoiceName(voice.name);
  const nativeIndex = nativeVoiceOrder.indexOf(name);
  if (nativeIndex >= 0) return nativeIndex;

  const googleIndex = googleVoiceOrder.indexOf(name);
  if (googleIndex >= 0) return nativeVoiceOrder.length + googleIndex;

  return Number.POSITIVE_INFINITY;
}

export function getAllowedEnglishVoices(voices: SpeechSynthesisVoice[]) {
  return voices
    .filter((voice) => isEnglishVoice(voice) && Number.isFinite(getVoiceRank(voice)))
    .filter((voice, index, list) => list.findIndex((item) => item.voiceURI === voice.voiceURI) === index)
    .sort((a, b) => getVoiceRank(a) - getVoiceRank(b) || a.name.localeCompare(b.name));
}

export function chooseAllowedEnglishVoice(voices: SpeechSynthesisVoice[], savedURI = "") {
  const allowedVoices = getAllowedEnglishVoices(voices);
  const saved = allowedVoices.find((voice) => voice.voiceURI === savedURI);
  return saved ?? allowedVoices[0];
}
