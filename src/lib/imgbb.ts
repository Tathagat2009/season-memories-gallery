/**
 * ImgBB URL normalizer.
 *
 * ImgBB users typically copy one of:
 *   - Share/page URL: https://ibb.co/kV0jrDPq        (HTML page, NOT an image)
 *   - Viewer URL:     https://ibb.co/album/...       (HTML page, NOT an image)
 *   - Direct URL:     https://i.ibb.co/abc123/photo.jpg  (real image)
 *
 * The browser cannot render a page URL inside <img>. We try to detect those
 * and return null so the UI can show a clear error instead of a broken image.
 */

export type ImgbbCheck =
  | { kind: "direct"; url: string }
  | { kind: "share"; url: string; hint: string }
  | { kind: "other"; url: string }
  | { kind: "empty" };

export function classifyImageUrl(raw: string): ImgbbCheck {
  const url = (raw || "").trim();
  if (!url) return { kind: "empty" };
  // Direct ImgBB image host
  if (/^https?:\/\/i\.ibb\.co\//i.test(url)) return { kind: "direct", url };
  // Share / page URL on ibb.co — cannot be embedded directly
  if (/^https?:\/\/(www\.)?ibb\.co\//i.test(url)) {
    return {
      kind: "share",
      url,
      hint:
        "This is an ImgBB share link, not the image itself. On the ImgBB image page, right-click the photo → 'Copy image address'. The correct URL starts with https://i.ibb.co/...",
    };
  }
  return { kind: "other", url };
}