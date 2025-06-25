import { motion } from "motion/react";

export function PricingHeader() {
  return (
    <section className="py-12 md:py-20">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Choose Your <span className="text-primary">Perfect Plan</span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Find the plan that best fits your needs, whether you&apos;re just
          starting out or scaling your presentations.
        </motion.p>
      </motion.div>
    </section>
  );
}
