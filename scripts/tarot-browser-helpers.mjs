/** Open the secondary settings through its accessible disclosure. */
export async function openTarotSettings(page) {
  const disclosure = page.locator('.tarot-settings-disclosure');
  if (!(await disclosure.evaluate(element => element.open))) {
    await disclosure.locator(':scope > summary').click();
  }
}
