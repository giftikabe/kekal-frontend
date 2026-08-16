/**
 * SandboxCompiler
 *
 * Compiles user-pasted TSX + CSS Modules code entirely in-browser using Sucrase,
 * then injects the result into an isolated <iframe> for sandboxed preview.
 *
 * This extends the F6 PreviewFrame concept by handling arbitrary, untrusted code
 * that hasn't been committed to the repo yet. Nothing is persisted until the
 * admin explicitly triggers "Publish Component".
 *
 * Sucrase is chosen over esbuild-wasm because:
 *  - Much smaller bundle (no WASM binary to fetch/instantiate).
 *  - Sufficient for the subset we need: JSX → JS transform only; no type stripping
 *    edge cases matter here since the code is already typed by the AI.
 *  - Runs synchronously on the main thread (compile is fast for component-sized files).
 *
 * CSS Modules are *simulated* in the sandbox by:
 *  1. Scoping every class selector in the pasted CSS with a unique data attribute.
 *  2. Rewriting `styles.foo` references in the compiled JS to the scoped class name.
 *
 * This is intentionally a best-effort simulation — the real module bundler handles
 * true CSS Modules at build time. The simulation is good enough for visual approval.
 */

import { transform } from "sucrase";

export interface CompileResult {
  /** Compiled JS (ESM, ready to run inside a blob URL module script) */
  js: string;
  /** Scoped CSS string ready to inject into a <style> tag */
  css: string;
  /** The unique scope token used to namespace CSS classes */
  scopeToken: string;
}

export interface CompileError {
  message: string;
}

/** Compile TSX + CSS Module source into sandbox-ready artifacts. */
export function compileSandbox(
  tsxSource: string,
  cssSource: string
): CompileResult | CompileError {
  // ── 1. Generate a stable scope token from the source ──────────────────────
  const scopeToken = `ks_${hashString(tsxSource + cssSource)}`;

  // ── 2. Parse CSS class names & scope them ─────────────────────────────────
  const { scopedCss, classMap } = scopeCss(cssSource, scopeToken);

  // ── 3. Replace `styles.foo` / `styles['foo']` references in TSX ──────────
  const patchedTsx = patchStyleRefs(tsxSource, classMap);

  // ── 4. Compile TSX → JS with Sucrase ─────────────────────────────────────
  let compiled: string;
  try {
    const result = transform(patchedTsx, {
      transforms: ["typescript", "jsx"],
      jsxRuntime: "classic", // uses React.createElement; React must be in scope
      production: false,
    });
    compiled = result.code;
  } catch (err: unknown) {
    return { message: String((err as Error).message ?? err) };
  }

  // ── 5. Wrap in an ESM module that provides a minimal React shim ───────────
  //    The iframe will load this as a <script type="module"> blob URL.
  const js = buildEsmWrapper(compiled);

  return { js, css: scopedCss, scopeToken };
}

// ---------------------------------------------------------------------------
// Iframe HTML builder
// ---------------------------------------------------------------------------

/**
 * Build the full HTML document to srcdoc into the preview iframe.
 * Accepts the ESM JS blob URL, scoped CSS, and placeholder previewProps.
 */
export function buildIframeDoc(
  jsBlobUrl: string,
  css: string,
  previewProps: Record<string, unknown>
): string {
  const propsJson = JSON.stringify(previewProps);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* Theme token defaults matching the KEKAL design system */
    :root {
      --color-primary: #000;
      --color-on-primary: #fff;
      --color-surface: #fff;
      --color-on-surface: #000;
      --color-border: #e5e5e5;
      --color-muted: #666;
      --font-sans: 'Inter', system-ui, sans-serif;
      --font-serif: 'Georgia', serif;
      --spacing-xs: 4px;
      --spacing-sm: 8px;
      --spacing-md: 16px;
      --spacing-lg: 32px;
      --spacing-xl: 64px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-sans); background: var(--color-surface); color: var(--color-on-surface); }
  </style>
  <style id="component-styles">${css}</style>
</head>
<body>
  <div id="root"></div>
  <script type="importmap">
    { "imports": { "react": "https://esm.sh/react@18", "react-dom/client": "https://esm.sh/react-dom@18/client" } }
  </script>
  <script type="module">
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    const previewProps = ${propsJson};
    // Dynamically import the compiled component blob
    import('${jsBlobUrl}').then(mod => {
      const Component = mod.default ?? Object.values(mod).find(v => typeof v === 'function');
      if (!Component) { document.body.innerHTML = '<pre style="color:red">No default export or named function found.</pre>'; return; }
      const root = createRoot(document.getElementById('root'));
      root.render(React.createElement(Component, previewProps));
    }).catch(err => {
      document.body.innerHTML = '<pre style="color:red">' + err.message + '</pre>';
    });
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildEsmWrapper(compiledJs: string): string {
  // The compiled JS references React (from Sucrase's classic JSX output).
  // We prepend an import so the blob module is self-contained.
  return `import React from 'react';\n${compiledJs}`;
}

interface ScopedCssResult {
  scopedCss: string;
  /** Map from bare class name → scoped class name */
  classMap: Map<string, string>;
}

function scopeCss(css: string, scopeToken: string): ScopedCssResult {
  const classMap = new Map<string, string>();

  // Replace every `.className` selector with `.className_<scopeToken>`
  const scopedCss = css.replace(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g, (_, name) => {
    const scoped = `${name}_${scopeToken}`;
    classMap.set(name, scoped);
    return `.${scoped}`;
  });

  return { scopedCss, classMap };
}

function patchStyleRefs(tsx: string, classMap: Map<string, string>): string {
  // Replace styles.foo → "foo_<token>"  and  styles['foo'] → "foo_<token>"
  return tsx
    .replace(/styles\.([a-zA-Z_][a-zA-Z0-9_-]*)/g, (_, name) => {
      const scoped = classMap.get(name);
      return scoped ? `"${scoped}"` : `"${name}"`;
    })
    .replace(/styles\['([a-zA-Z_][a-zA-Z0-9_-]*)'\]/g, (_, name) => {
      const scoped = classMap.get(name);
      return scoped ? `"${scoped}"` : `"${name}"`;
    });
}

/** Lightweight non-crypto hash — good enough for scoping */
function hashString(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(36);
}
