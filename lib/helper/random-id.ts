/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return A random string, e.g. sn1s7vb4gcic.
 */
export function getRandomString() {
  const x = 2147483648;

  // tslint:disable-next-line:no-bitwise
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ Date.now()).toString(36);
}
