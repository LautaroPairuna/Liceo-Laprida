const UNSPLASH = "https://images.unsplash.com/";

/** Unsplash resizes on its side: ask for the width the layout shows instead of the stored one. */
export function sizedImage(url: string, width: number) {
  if (!url.startsWith(UNSPLASH)) return url;
  const sized = new URL(url);
  sized.searchParams.set("w", String(width));
  sized.searchParams.set("q", "70");
  sized.searchParams.set("auto", "format");
  return sized.toString();
}

/** srcSet for an Unsplash photo in the given widths; undefined for any other image. */
export function imageSrcSet(url: string, widths: number[]) {
  if (!url.startsWith(UNSPLASH)) return undefined;
  return widths.map((width) => `${sizedImage(url, width)} ${width}w`).join(", ");
}
