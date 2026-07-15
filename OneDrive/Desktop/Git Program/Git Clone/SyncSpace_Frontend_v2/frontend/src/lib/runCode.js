const WORKER_PREAMBLE = `
const post = (kind, args) => self.postMessage({ kind, args: args.map(safeStringify) });
function safeStringify(v) {
  if (typeof v === "string") return v;
  if (v instanceof Error) return v.stack || \`\${v.name}: \${v.message}\`;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
console.log = (...a) => post("log", a);
console.info = (...a) => post("info", a);
console.warn = (...a) => post("warn", a);
console.error = (...a) => post("error", a);
self.addEventListener("error", (e) => {
  post("error", [e.message + (e.lineno ? \` (line \${e.lineno})\` : "")]);
  self.postMessage({ kind: "done" });
});
self.addEventListener("unhandledrejection", (e) => {
  post("error", ["Unhandled promise rejection: " + safeStringify(e.reason)]);
});
`;

/** Transpile TypeScript (or pass JavaScript through) into a browser-runnable
 * ES module. Transpile-only — no type checking — which is what keeps this
 * instant instead of round-tripping through a real compiler/backend.
 *
 * The `typescript` package is dynamically imported here rather than at
 * module scope: it's a multi-MB dependency that most sessions (JS-only,
 * or people who never click Run) should never have to download. */
export async function transpile(code, language) {
  if (language !== "typescript") return code;
  const ts = await import("typescript");
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.Preserve,
    },
    reportDiagnostics: false,
  });
  return result.outputText;
}

/**
 * Runs `code` in a sandboxed module Worker (isolated from the page — no DOM,
 * no cookies, no access to the app's Yjs doc). Fully in-browser: no network
 * round trip, so output streams back essentially as fast as the code runs.
 *
 * A watchdog timeout guards against runaway loops; since it only tears down
 * the worker thread it never freezes the UI.
 */
export function runCode(code, language, { onMessage, onDone, timeoutMs = 5000 } = {}) {
  let finished = false;
  let worker = null;
  let url = null;
  let watchdog = null;

  const finish = (reason) => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    worker?.terminate();
    if (url) URL.revokeObjectURL(url);
    onDone?.(reason);
  };

  transpile(code, language)
    .then((transpiled) => {
      if (finished) return; // stopped before transpile finished
      const script = `${WORKER_PREAMBLE}\ntry {\n${transpiled}\n} catch (err) {\n  post("error", [err]);\n}\nself.postMessage({ kind: "done" });\n`;
      const blob = new Blob([script], { type: "application/javascript" });
      url = URL.createObjectURL(blob);
      worker = new Worker(url, { type: "module" });

      watchdog = setTimeout(() => {
        onMessage?.({ kind: "error", args: [`Execution timed out after ${timeoutMs}ms (possible infinite loop) — stopped.`] });
        finish("timeout");
      }, timeoutMs);

      worker.onmessage = (e) => {
        if (e.data.kind === "done") {
          finish("complete");
        } else {
          onMessage?.(e.data);
        }
      };
      worker.onerror = (e) => {
        onMessage?.({ kind: "error", args: [e.message] });
        finish("error");
      };
    })
    .catch((err) => {
      onMessage?.({ kind: "error", args: [`Failed to prepare code for execution: ${err.message || err}`] });
      finish("error");
    });

  return {
    stop: () => {
      onMessage?.({ kind: "warn", args: ["Stopped by user."] });
      finish("stopped");
    },
  };
}
