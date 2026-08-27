/**
 * Minimal Express Request mock for service-layer tests
 */
export function createMockRequest(
  query: Record<string, string> = {},
  params: Record<string, string> = {}
) {
  return { query, params } as unknown;
}
