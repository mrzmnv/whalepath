"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import WhaleLoader from "./WhaleLoader";

export default function NavigationLoader() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [loading, setLoading] = useState(false);

  // Hide loader when navigation completes (pathname changes)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setLoading(false);
    }
  }, [pathname]);

  // Show loader when an internal link is clicked
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("//") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        href.startsWith("javascript:")
      )
        return;
      // Don't show for same-page navigation
      const targetPath = href.split("?")[0];
      if (targetPath === pathname || targetPath === "") return;
      setLoading(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return <WhaleLoader visible={loading} />;
}
