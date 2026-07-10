"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useScrollStore } from "@/lib/scrollStore";

/**
 * Attaches a GSAP ScrollTrigger to every `[data-nexus-scene]` section on the
 * page and streams a 0-1 progress value for each into the shared scroll
 * store. This is what turns ordinary page scroll into "traveling through a
 * dimension" for each Three.js scene, driven by real scroll position rather
 * than time.
 */
export function ScrollController() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const sections = gsap.utils.toArray<HTMLElement>("[data-nexus-scene]");
    const triggers: ScrollTrigger[] = [];

    sections.forEach((section, index) => {
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          useScrollStore.getState().setProgress(index, self.progress);
        },
      });
      triggers.push(trigger);

      gsap.fromTo(
        section.querySelectorAll("[data-nexus-reveal]"),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "top 20%",
            scrub: false,
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <div ref={containerRef} />;
}
