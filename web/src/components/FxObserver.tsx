'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const FX_SELECTOR = '[data-fx-section], .reveal';

export default function FxObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      document.querySelectorAll(FX_SELECTOR).forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // 持续观察：进入视口时播放，离开视口时复位，以便下次滚动回来重播
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as Element;
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            // 长列表（曲目卡片 reveal-once）：只入场一次，之后永久可见。
            // 取消观察，避免回滚 / 展开 / hover 触发回流时重新被隐藏，
            // 也避免长列表滚动时空屏、并减少持续合成开销。
            if (el.classList.contains('reveal-once')) {
              io.unobserve(el);
            }
          } else {
            // 普通 reveal 离开视口时复位，便于再次滚动回来重播
            if (!el.classList.contains('reveal-once')) {
              el.classList.remove('is-visible');
            }
          }
        });
      },
      {
        threshold: 0.05,
        // 底部留正向余量：元素进入视口前 ~10% 就提前触发，减少长列表下滑空屏
        rootMargin: '0px 0px 10% 0px',
      }
    );

    function observe(el: Element) {
      if (el.matches(FX_SELECTOR)) {
        const isOnce = el.classList.contains('reveal-once');
        const alreadyVisible = el.classList.contains('is-visible');
        if (isOnce && alreadyVisible) return;
        el.classList.remove('is-visible');
        io.observe(el);
      }
    }

    function observeAll(root: Element | Document = document) {
      root.querySelectorAll(FX_SELECTOR).forEach(observe);
    }

    function unobserve(el: Element) {
      if (el.matches(FX_SELECTOR)) {
        io.unobserve(el);
      }
    }

    // 监听新增节点（React 重渲染会替换元素，需要重新观察）
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            unobserve(node as Element);
            (node as Element).querySelectorAll(FX_SELECTOR).forEach(unobserve);
          }
        });
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            observe(node as Element);
            observeAll(node as Element);
          }
        });
      }
    });

    observeAll();
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
