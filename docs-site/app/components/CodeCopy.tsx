"use client";

import { useEffect } from "react";

const RESET_DELAY_MS = 2000;

/**
 * Wires up the copy buttons that `renderMarkdownToHtml` emits into every
 * highlighted code block. The article HTML is injected with
 * `dangerouslySetInnerHTML` from a server component, so there is no React tree
 * to hang an onClick off — one delegated listener covers every block on the
 * page, including any rendered after this mounts.
 */
export default function CodeCopy() {
  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();

    async function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest<HTMLButtonElement>("[data-copy-button]");
      if (!button) {
        return;
      }

      const code = button
        .closest("[data-code-block]")
        ?.querySelector("pre")?.textContent;
      if (!code) {
        return;
      }

      // The label span sits next to the icon; writing to the button itself
      // would wipe the icon out.
      const label = button.querySelector(".copy-btn-label") ?? button;

      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // Clipboard access is denied outside a secure context, and in some
        // privacy configurations. Say so rather than showing "Copied" over a
        // clipboard that still holds whatever was there before.
        label.textContent = "Press ⌘C";
        button.dataset.copyState = "failed";
        const failureTimer = setTimeout(() => {
          label.textContent = "Copy";
          delete button.dataset.copyState;
        }, RESET_DELAY_MS);
        timers.add(failureTimer);
        return;
      }

      label.textContent = "Copied";
      button.dataset.copyState = "copied";
      const timer = setTimeout(() => {
        label.textContent = "Copy";
        delete button.dataset.copyState;
      }, RESET_DELAY_MS);
      timers.add(timer);
    }

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, []);

  return null;
}
