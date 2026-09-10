import { createHash, timingSafeEqual } from "node:crypto";
import { salesCompanyId } from "./types";

const defaultBootstrapCodeHash =
  "3363fc01fa4d0159e18d08ec9e067932922f0381646338fb1b3a92dbb70fa2f9";

export const salesConfig = {
  companyId: salesCompanyId,
  companyName: "PACKOM 中国",
  companyNameEn: "PACKOM China",
  sessionCookie: "packom_sales_session",
  sessionDays: 30,
};

export class SalesStorageError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "SALES_STORAGE_ERROR") {
    super(message);
    this.name = "SalesStorageError";
    this.status = status;
    this.code = code;
  }
}

export type SalesStorageConfig = {
  url: string;
  key: string;
};

export function getSalesStorageConfig(): SalesStorageConfig | null {
  const url =
    process.env.XIAOSHOU_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.XIAOSHOU_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    !key ||
    !/^https?:\/\//.test(url) ||
    !/^[\x21-\x7e]+$/.test(key) ||
    key.length < 32
  ) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), key };
}

export function assertBootstrapCode(code: string) {
  const expected = Buffer.from(
    process.env.XIAOSHOU_BOOTSTRAP_CODE_HASH || defaultBootstrapCodeHash,
    "hex",
  );
  const actual = Buffer.from(
    createHash("sha256").update(code.trim()).digest("hex"),
    "hex",
  );

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
