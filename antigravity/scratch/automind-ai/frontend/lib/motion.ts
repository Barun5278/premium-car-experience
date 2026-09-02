import { Transition, Variants } from "framer-motion";

/**
 * Automotive Tactile Springs & Motion Physics
 */
export const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 28,
};

export const GENTLE_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 22,
};

export const SMOOTH_EASE: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1], // Custom cinematic bezier curve
};

/**
 * Reusable Framer Motion Variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: SMOOTH_EASE,
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: GENTLE_SPRING,
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: GENTLE_SPRING,
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING_TRANSITION,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  hover: {
    y: -4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

export const buttonTapMotion = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.01 },
  transition: SPRING_TRANSITION,
};
