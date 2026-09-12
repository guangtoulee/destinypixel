/** Current DeepSeek Flash API id. Legacy `deepseek-v4-flash` is retired and only a temporary alias. */
export const DEFAULT_DEEPSEEK_REPORT_MODEL = "deepseek-flash";

export function deepSeekReportModel(configured = process.env.DEEPSEEK_MODEL) {
  const model = configured?.trim();
  return model || DEFAULT_DEEPSEEK_REPORT_MODEL;
}
