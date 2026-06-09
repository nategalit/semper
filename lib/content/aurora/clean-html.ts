/**
 * HTML sanitizer for Aurora-sourced description strings.
 *
 * Aurora XML stores descriptions as HTML fragments with custom elements
 * (<div element="ID"/>) that reference other content entries, plus
 * <div class="reference"> blocks that should be discarded.
 *
 * cleanHtml:       resolves element refs via featureMap, then sanitizes.
 * cleanHtmlBrowse: same pipeline but no featureMap — refs are dropped.
 *
 * Preserved tags (stripped of all attributes):
 *   p, strong, em, ul, ol, li, h4, h5, br
 *
 * Everything else has its tag removed but its text content kept.
 * <script> and <style> blocks are removed entirely (tag + content).
 */

const ALLOWED: ReadonlySet<string> = new Set([
  "p", "strong", "em", "ul", "ol", "li", "h4", "h5", "br",
]);

interface FeatureRef {
  id: string;
  name: string;
  description: string;
}

function sanitize(html: string): string {
  let r = html;
  r = r.replace(/<script[\s\S]*?<\/script>/gi, "");
  r = r.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Strip all attributes; keep tag if allowed, else keep only inner content.
  r = r.replace(/<(\/?)(\w+)[^>]*>/g, (_, slash: string, tag: string) => {
    const t = tag.toLowerCase();
    return ALLOWED.has(t) ? `<${slash}${t}>` : "";
  });
  return r;
}

export function cleanHtml(
  html: string,
  featureMap?: Map<string, FeatureRef>,
  depth = 3,
): string {
  if (!html) return "";

  // Resolve <div element="ID"/> refs recursively.
  let result = html.replace(/<div\s+element="([^"]+)"[^>]*\/?>/gi, (_, id: string) => {
    if (depth > 0 && featureMap && featureMap.size > 0) {
      const f = featureMap.get(id);
      if (f) return `<h5>${f.name}</h5>${cleanHtml(f.description, featureMap, depth - 1)}`;
    }
    return "";
  });

  // Drop <div class="reference">...</div> blocks entirely.
  result = result.replace(/<div[^>]*class="reference"[^>]*>[\s\S]*?<\/div>/gi, "");

  return sanitize(result).trim();
}

/** Browse-page variant — no featureMap, element refs are silently dropped. */
export function cleanHtmlBrowse(html: string): string {
  return cleanHtml(html);
}
