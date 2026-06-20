// Apple App Attest — gates the API so only the genuine Maverick app can call it.
//
// Phase 1 ships with APP_ATTEST_REQUIRED=false. Before public launch, implement
// verifyAssertion (Phase 1b) and flip the flag. Until then the guard skips it.

export function appAttestRequired(): boolean {
  return process.env.APP_ATTEST_REQUIRED === 'true';
}

/**
 * Verify an App Attest assertion on a request. Returns true if valid.
 *
 * TODO (Phase 1b):
 *  1. On first launch the app calls /api/attest/register with its attestation
 *     object; verify it against Apple's App Attest root and store the public key
 *     + sign counter keyed by the device key id.
 *  2. Each API call includes an assertion over SHA256(body || challenge); verify
 *     the signature with the stored public key and require a monotonically
 *     increasing counter (replay protection).
 */
export async function verifyAssertion(_req: Request, _uid: string): Promise<boolean> {
  return false; // not implemented yet — keep APP_ATTEST_REQUIRED=false
}
