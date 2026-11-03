/** Let the Blob SDK resolve and refresh credentials; never copy OIDC tokens. */
export function hasBlobStorage(env: NodeJS.ProcessEnv = process.env) {
  if (env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  // Vercel may provide OIDC through its request context instead of process.env.
  return Boolean(
    env.BLOB_STORE_ID?.trim() &&
    (env.VERCEL_OIDC_TOKEN?.trim() || env.VERCEL?.trim()),
  );
}
