"use client";

import { useEffect } from "react";

const STORAGE_KEY = "opteryx-docs-tab";

function select(group: Element, button: HTMLButtonElement, focus = false) {
  for (const tab of group.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
    const selected = tab === button;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
    if (panel) panel.hidden = !selected;
  }
  if (focus) button.focus();
}

function selectLabelEverywhere(label: string) {
  for (const group of document.querySelectorAll("[data-tabs]")) {
    const match = [...group.querySelectorAll<HTMLButtonElement>('[role="tab"]')].find(
      (tab) => tab.dataset.tabLabel === label,
    );
    if (match) select(group, match);
  }
}

/**
 * Wires up the tab groups `renderMarkdownToHtml` emits. Like `CodeCopy`, the
 * article is injected HTML with no React tree, so one delegated listener covers
 * every group. Picking "Python" once picks it on every page that offers it.
 */
export default function DocTabs() {
  useEffect(() => {
    // A link to a heading inside a hidden panel would otherwise land on nothing.
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    const targetPanel = target?.closest<HTMLElement>('[role="tabpanel"]');
    if (targetPanel) {
      const tab = document.getElementById(targetPanel.getAttribute("aria-labelledby") ?? "");
      const group = targetPanel.closest("[data-tabs]");
      if (tab && group) select(group, tab as HTMLButtonElement);
      target!.scrollIntoView();
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) selectLabelEverywhere(saved);
      } catch {
        // Storage blocked: every group just opens on its first tab.
      }
    }

    function onClick(event: MouseEvent) {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
        '[data-tabs] [role="tab"]',
      );
      if (!button) return;
      const label = button.dataset.tabLabel ?? "";
      selectLabelEverywhere(label);
      try {
        localStorage.setItem(STORAGE_KEY, label);
      } catch {
        // Not remembered; still switched.
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
        '[data-tabs] [role="tab"]',
      );
      if (!button) return;
      const group = button.closest("[data-tabs]")!;
      const tabs = [...group.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
      const i = tabs.indexOf(button);
      const next =
        event.key === "ArrowRight" ? tabs[(i + 1) % tabs.length]
        : event.key === "ArrowLeft" ? tabs[(i - 1 + tabs.length) % tabs.length]
        : event.key === "Home" ? tabs[0]
        : event.key === "End" ? tabs[tabs.length - 1]
        : null;
      if (!next) return;
      event.preventDefault();
      select(group, next, true);
    }

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
