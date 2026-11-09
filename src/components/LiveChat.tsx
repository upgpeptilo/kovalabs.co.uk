"use client";
import { useEffect } from "react";

// Chat providers give a <script> snippet. Scripts inserted via innerHTML never run, so rebuild each one as a real element.
// ponytail: runs the admin's snippet as-is (admin is trusted); sandbox it if non-admins can ever edit settings.
export function LiveChat({ snippet }: { snippet: string }) {
  useEffect(() => {
    const doc = new DOMParser().parseFromString(snippet, "text/html");
    const added: Element[] = [];
    for (const node of [...doc.head.children, ...doc.body.children]) {
      let el: Element = node;
      if (node.tagName === "SCRIPT") {
        el = document.createElement("script");
        for (const a of node.attributes) el.setAttribute(a.name, a.value);
        el.textContent = node.textContent;
      }
      document.body.appendChild(el);
      added.push(el);
    }
    return () => added.forEach((el) => el.remove());
  }, [snippet]);
  return null;
}
