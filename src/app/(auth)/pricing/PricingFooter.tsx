import { Card, CardContent } from "~/components/ui/card";
import Link from "next/link";

export function PricingFooter() {
  return (
    <section className="py-8">
      <Card className="bg-transparent border-none shadow-none text-center text-sm text-muted-foreground dark:text-slate-400">
        <CardContent className="p-4">
          <Link
            href="/terms"
            prefetch
            className="hover:text-foreground dark:hover:text-slate-100 transition-colors mr-4"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            prefetch
            className="hover:text-foreground dark:hover:text-slate-100 transition-colors"
          >
            Privacy Policy
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
