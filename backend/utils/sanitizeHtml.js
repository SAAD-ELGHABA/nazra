const ALLOWED_TAGS = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "h2", "h3", "blockquote", "a", "img"]);
const VOID_TAGS = new Set(["br", "img"]);
const ALLOWED_ATTRS = Object.freeze({
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title"])
});

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const isSafeUrl = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const parseAttributes = (rawAttributes, tagName) => {
  const allowed = ALLOWED_ATTRS[tagName] || new Set();
  const attrs = [];
  const pattern = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>/]+))/g;
  let match;

  while ((match = pattern.exec(rawAttributes || "")) !== null) {
    const name = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (!allowed.has(name) || name.startsWith("on") || name === "style") continue;
    if ((name === "href" || name === "src") && !isSafeUrl(value)) continue;
    if (tagName === "a" && name === "target" && value !== "_blank") continue;
    attrs.push(`${name}="${escapeHtml(value)}"`);
  }

  if (tagName === "a") {
    attrs.push('rel="noopener noreferrer"');
  }

  return attrs.length ? ` ${attrs.join(" ")}` : "";
};

const sanitizeHtml = (html) => {
  return String(html || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|svg|math)[^>]*>/gi, "")
    .replace(/<\s*(\/?)\s*([A-Za-z0-9]+)([^>]*)>/g, (_tag, closing, tag, attrs) => {
      const tagName = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(tagName)) return "";
      if (closing) return VOID_TAGS.has(tagName) ? "" : `</${tagName}>`;
      return `<${tagName}${parseAttributes(attrs, tagName)}${VOID_TAGS.has(tagName) ? ">" : ">"}`;
    });
};

module.exports = { sanitizeHtml, escapeHtml, isSafeUrl };
