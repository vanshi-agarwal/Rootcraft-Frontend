"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

/**
 * Props for the SplitText component.
 * Configures the text animation, timing, and splitting behavior.
 */
export interface SplitTextProps {
  text: string;
  className?: string;
  id?: string;
  delay?: number;
  duration?: number;
  ease?: gsap.TweenVars["ease"];
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: CSSProperties["textAlign"];
  onLetterAnimationComplete?: () => void;
}

// Extend HTMLElement to store the GSAP SplitText instance for cleanup
type SplitElement = HTMLElement & { _rbsplitInstance?: GSAPSplitText };

/**
 * SplitText Component
 *
 * Animates text by splitting it into characters, words, or lines using GSAP.
 * Triggers animation when the element enters the viewport (ScrollTrigger).
 *
 * Features:
 * - Customizable split type (chars, words, lines).
 * - Configurable animation properties (duration, delay, ease).
 * - Intersection Observer integration via ScrollTrigger.
 * - Font loading detection to ensure correct splitting.
 */
const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = "",
  id,
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const ref = useRef<SplitElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Ensure fonts are loaded before splitting text to prevent layout shifts
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.fonts.status === "loaded") {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => setFontsLoaded(true));
    }
  }, []);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !text || !fontsLoaded) return;

      // Cleanup previous instance if it exists
      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch {
          // ignore
        }
        el._rbsplitInstance = undefined;
      }

      // Calculate start position for ScrollTrigger
      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || "px" : "px";
      const sign =
        marginValue === 0
          ? ""
          : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      let targets: Element[] = [];
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes("chars") && self.chars?.length) {
          targets = self.chars;
        }
        if (
          !targets.length &&
          splitType.includes("words") &&
          self.words?.length
        ) {
          targets = self.words;
        }
        if (
          !targets.length &&
          splitType.includes("lines") &&
          self.lines?.length
        ) {
          targets = self.lines;
        }
        if (!targets.length) {
          targets = self.chars || self.words || self.lines || [];
        }
      };

      // Initialize GSAP SplitText
      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);
          // Animate the split targets
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4,
              },
              onComplete: () => onLetterAnimationComplete?.(),
              willChange: "transform, opacity",
              force3D: true,
            }
          );
        },
      });

      el._rbsplitInstance = splitInstance;

      // Cleanup function
      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch {
          // ignore
        }
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete,
      ],
      scope: ref,
    }
  );

  const baseStyle: CSSProperties = {
    textAlign,
    wordWrap: "break-word",
    willChange: "transform, opacity",
  };
  const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;

  const sharedProps = {
    ref,
    style: baseStyle,
    className: classes,
    id,
  } as any;

  // Render the appropriate HTML tag
  const elementMap: Record<
    NonNullable<SplitTextProps["tag"]>,
    (props: React.HTMLAttributes<HTMLElement>) => ReactElement
  > = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 {...sharedProps} {...props}>
        {text}
      </h1>
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...sharedProps} {...props}>
        {text}
      </h2>
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 {...sharedProps} {...props}>
        {text}
      </h3>
    ),
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4 {...sharedProps} {...props}>
        {text}
      </h4>
    ),
    h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h5 {...sharedProps} {...props}>
        {text}
      </h5>
    ),
    h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h6 {...sharedProps} {...props}>
        {text}
      </h6>
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...sharedProps} {...props}>
        {text}
      </p>
    ),
    span: (props: React.HTMLAttributes<HTMLSpanElement>) => (
      <span {...sharedProps} {...props}>
        {text}
      </span>
    ),
  };

  return (
    elementMap[tag]?.({} as React.HTMLAttributes<HTMLElement>) ??
    elementMap.p?.({} as React.HTMLAttributes<HTMLParagraphElement>)
  );
};

export default SplitText;
