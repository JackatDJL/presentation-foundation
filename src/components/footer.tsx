"use client";

import { motion } from "framer-motion";
import Link from "next/link";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GitHub, Twitter, Mail } from "react-feather";

export default function Footer() {
  return (
    <motion.footer
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 py-8 border-t border-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-muted-foreground font-medium">
              Presentation Foundation
            </p>
            <p className="text-sm text-muted-foreground">
              Making presentations accessible anywhere, anytime
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="https://github.com/djl-foundation"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <GitHub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            {/* <Link
              href="https://twitter.com/djl_foundation"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link> */}
            <Link
              href="mailto:contact@djl.foundation"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="mt-6 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p>
            © {new Date().getFullYear()} By Jack @ DJL Foundation. All rights
            reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
