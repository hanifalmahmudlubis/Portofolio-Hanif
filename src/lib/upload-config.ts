// Keep multipart requests below Vercel Functions' 4.5 MB request limit.
// The admin sends one image per request while allowing a batch selection.
export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
export const MAX_UPLOAD_COUNT = 8;
export const MAX_UPLOAD_BODY = MAX_IMAGE_SIZE + 64 * 1024;
