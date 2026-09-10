import { z } from "zod";
import { SalesAuthError } from "./auth";

const shortText = (label: string, max = 100) =>
  z.string().trim().min(1, `${label}不能为空。`).max(max, `${label}过长。`);
const optionalText = (max = 500) => z.string().trim().max(max).optional().default("");

export const registerSchema = z
  .object({
    email: z.string().trim().email("请输入有效邮箱。").max(160),
    name: shortText("姓名", 60),
    phone: z.string().trim().min(6, "请输入有效手机号。 ").max(30),
    region: shortText("负责区域", 80),
    password: z
      .string()
      .min(8, "密码至少需要 8 位。")
      .max(128, "密码不能超过 128 位。")
      .regex(/[A-Za-z]/, "密码需包含英文字母。")
      .regex(/[0-9]/, "密码需包含数字。"),
    passwordConfirm: z.string(),
    adminCode: z.string().trim().max(160).optional(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    message: "两次输入的密码不一致。",
    path: ["passwordConfirm"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("请输入有效邮箱。").max(160),
  password: z.string().min(1, "请输入密码。").max(128),
});

export const customerCreateSchema = z.object({
  name: shortText("客户名称", 160),
  shortName: z.string().trim().max(12).optional().default(""),
  channel: shortText("渠道", 60),
  tier: z.enum(["A", "B", "C"]).default("B"),
  status: z.enum(["active", "prospect", "paused"]).default("prospect"),
  city: shortText("城市", 80),
  address: shortText("地址", 240),
  contact: shortText("联系人", 80),
  phone: z.string().trim().max(30).optional().default(""),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  nextVisitAt: z.string().datetime().nullable().optional(),
  notes: optionalText(1000),
});

export const customerPatchSchema = customerCreateSchema.partial().extend({
  lastVisitAt: z.string().datetime().nullable().optional(),
  monthlySales: z.number().min(0).max(100000000).optional(),
});

export const visitCreateSchema = z.object({
  customerId: z.string().uuid(),
  salespersonId: z.string().uuid().optional(),
  scheduledAt: z.string().datetime(),
  purpose: shortText("拜访目的", 300),
});

export const visitPatchSchema = z.object({
  action: z.enum(["reschedule", "checkin", "complete", "cancel"]),
  scheduledAt: z.string().datetime().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  notes: z.string().trim().max(2000).optional(),
  displayScore: z.number().int().min(1).max(5).nullable().optional(),
  stockStatus: z.string().trim().max(160).optional(),
  nextAction: z.string().trim().max(500).optional(),
});

export const orderCreateSchema = z.object({
  customerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(9999),
      }),
    )
    .min(1, "请至少选择一个商品。")
    .max(50),
  notes: optionalText(1000),
});

export const orderPatchSchema = z.object({
  status: z.enum(["approved", "fulfilled", "cancelled"]),
  notes: z.string().trim().max(1000).optional(),
});

export const teamPatchSchema = z.object({
  role: z.enum(["admin", "manager", "sales"]).optional(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  region: z.string().trim().max(80).optional(),
  territory: z.string().trim().max(120).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  monthlyTarget: z.number().min(0).max(100000000).optional(),
});

export const companySettingsSchema = z.object({
  companyName: z.string().trim().min(1).max(120).optional(),
  companyNameEn: z.string().trim().min(1).max(120).optional(),
  visitRadiusMeters: z.number().int().min(50).max(10000).optional(),
  requireVisitLocation: z.boolean().optional(),
  registrationEnabled: z.boolean().optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z
      .string()
      .min(8, "新密码至少需要 8 位。")
      .max(128)
      .regex(/[A-Za-z]/, "新密码需包含英文字母。")
      .regex(/[0-9]/, "新密码需包含数字。"),
    passwordConfirm: z.string(),
  })
  .refine((value) => value.newPassword === value.passwordConfirm, {
    message: "两次输入的新密码不一致。",
    path: ["passwordConfirm"],
  });

export function parseJsonBody<T>(schema: z.ZodType<T>, body: unknown) {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const message = result.error.issues[0]?.message || "提交的信息不完整。";
  throw new SalesAuthError(message, 400, "VALIDATION_ERROR");
}
