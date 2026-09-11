import assert from "node:assert/strict";
import test from "node:test";
import { approvedPaypalUrl, paymentAmountCents, validateCompletedOrder, validateOrderIdentity, type PaypalOrder } from "./paypal-validation";

test("PayPal amounts require exact decimal strings, never float coercion", () => {
  assert.equal(paymentAmountCents("1.99"), 199);
  assert.equal(paymentAmountCents("0.50"), 50);
  assert.equal(paymentAmountCents("999.00"), 99900);
  for (const value of [1.99, null, undefined, "", " 1.99", "1.99 ", "1,99", "1.999", "1.9", "1", "1e2", "-1.99", "+1.99", "Infinity", "1000000000.00"]) {
    assert.equal(paymentAmountCents(value), null, String(value));
  }
});

test("a completed order must contain exactly one matching completed capture", () => {
  const expected = { localId: "local-order", paypalId: "PAYPAL123", amountCents: 199, currency: "USD", merchantId: "MERCHANT123" };
  const valid: PaypalOrder = {
    id: expected.paypalId, status: "COMPLETED",
    purchase_units: [{ custom_id: expected.localId, amount: { value: "1.99", currency_code: "USD" }, payee: { merchant_id: expected.merchantId }, payments: { captures: [{ id: "CAPTURE123", status: "COMPLETED", amount: { value: "1.99", currency_code: "USD" } }] } }],
  };
  assert.deepEqual(validateCompletedOrder(valid, expected), { captureId: "CAPTURE123" });
  assert.equal(validateOrderIdentity({ ...valid, status: "VOIDED" }, expected), true);
  const missingAmount = structuredClone(valid);
  missingAmount.purchase_units![0].amount = undefined;
  assert.equal(validateOrderIdentity(missingAmount, expected), false);
  const mutations: Array<(order: PaypalOrder) => void> = [
    order => { order.id = "OTHERORDER"; },
    order => { order.status = "APPROVED"; },
    order => { order.purchase_units = []; },
    order => { order.purchase_units!.push(structuredClone(order.purchase_units![0])); },
    order => { order.purchase_units![0].custom_id = "other-local-order"; },
    order => { order.purchase_units![0].payee = undefined; },
    order => { order.purchase_units![0].amount!.value = "0.01"; },
    order => { order.purchase_units![0].amount!.currency_code = "EUR"; },
    order => { order.purchase_units![0].payments = undefined; },
    order => { order.purchase_units![0].payments!.captures = []; },
    order => { order.purchase_units![0].payments!.captures!.push(structuredClone(order.purchase_units![0].payments!.captures![0])); },
    order => { order.purchase_units![0].payments!.captures![0].status = "PENDING"; },
    order => { order.purchase_units![0].payments!.captures![0].id = ""; },
    order => { order.purchase_units![0].payments!.captures![0].amount!.value = "1.990"; },
    order => { order.purchase_units![0].payments!.captures![0].amount!.currency_code = "EUR"; },
  ];
  for (const mutate of mutations) {
    const order = structuredClone(valid);
    mutate(order);
    assert.equal(validateCompletedOrder(order, expected), null);
  }
});

test("checkout approval links stay on the exact PayPal environment hostname", () => {
  const link = (href: string): PaypalOrder => ({ links: [{ rel: "approve", href }] });
  assert.equal(approvedPaypalUrl(link("https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL123"), true), "https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL123");
  assert.equal(approvedPaypalUrl(link("https://www.paypal.com/checkoutnow?token=PAYPAL123"), false), "https://www.paypal.com/checkoutnow?token=PAYPAL123");
  for (const href of ["http://www.paypal.com/checkout", "https://www.paypal.com.evil.test/checkout", "https://evil.test/?next=https://www.paypal.com", "https://www.sandbox.paypal.com/checkout", "javascript:alert(1)", "//www.paypal.com/checkout"]) {
    assert.equal(approvedPaypalUrl(link(href), false), null);
  }
  assert.equal(approvedPaypalUrl(link("https://www.paypal.com/checkout"), true), null);
  assert.equal(approvedPaypalUrl({ links: [{ rel: "self", href: "https://www.paypal.com/checkout" }] }, false), null);
  assert.equal(approvedPaypalUrl({}, false), null);
});
