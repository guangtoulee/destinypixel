# Private museum presentation

`/ocean` provides a password-gated proposal, image gallery, plans, and interactive model. It uses the existing server-configured museum access code, with a separate signed `ocean_access` cookie scoped to `/ocean`. Every media request also verifies the cookie independently of Proxy. Private responses set noindex and private/no-store headers. Encoded separator and traversal paths are normalized before access checks.

Media is stored in the connected private Vercel Blob store. The SDK uses `BLOB_STORE_ID` with Vercel-managed OIDC credentials; the provisioned `BLOB_READ_WRITE_TOKEN` remains a fallback. No token, password, proposal prose, image, model, or document belongs in Git. Local review files live in ignored `private/ocean/`, which is also excluded from deployment inputs.

From the repository root, run `python3 scripts/ocean/stage-media.py /path/to/approved-source-manifest.json` to copy approved media and generate thumbnails/checksums. Run `node scripts/ocean/verify-media.mjs` before uploading. Final verification requires 21–30 distinct effect images, the final PDF and editable PPT, the circulation plan, and at least eight model camera presets.

`node scripts/ocean/upload-private.mjs` verifies every checksum, uploads media at immutable SHA-256 object paths, and updates the private manifest pointer last. Existing object paths are reused; unrelated files and stores are never deleted. Future Git deployments read the same durable private media through `/ocean/media/[...path]`.

Image and model loads retry transient failures twice and cancel stale retries when the view changes. Private downloads support authenticated single byte ranges so browsers can resume large files; unauthorized range requests stay denied. Proposal tables use plain-text semantic markup and scroll within their container on narrow screens.

Local review can use an explicit `OCEAN_MEDIA_LOCAL_DIR` pointing at the copied review directory. This filesystem fallback is disabled on Vercel. Browser QA and screenshots containing private project assets must stay outside Git.
