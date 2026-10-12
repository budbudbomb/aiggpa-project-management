import { useEffect } from 'react';

function hashCss(css: string): string {
  let hash = 0;
  for (let i = 0; i < css.length; i += 1) {
    hash = (hash * 31 + css.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Injects a page-specific stylesheet (imported with `?inline`) into <head>
 * while the component is mounted, and removes it on unmount. Mirrors the
 * legacy per-page <link> stylesheets without leaking selectors across routes.
 */
export function usePageStyles(css: string): void {
  useEffect(() => {
    const styleId = `page-style-${hashCss(css)}`;
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      el.textContent = css;
      document.head.appendChild(el);
    }
    return () => {
      el?.remove();
    };
  }, [css]);
}
