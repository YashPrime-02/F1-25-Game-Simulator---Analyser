import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export default  function Counter({ value }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    Math.floor(latest)
  );

  useEffect(() => {
    const controls = animate(count, value, { duration: 1 });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

