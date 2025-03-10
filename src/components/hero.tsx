/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SignedOut, Waitlist } from "@clerk/nextjs";
import Image from "next/image";
import {
  Clock,
  Download,
  Share2,
  Users,
  CheckCircle,
  Lock,
  Globe,
  Zap,
} from "react-feather";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Create animated versions of shadcn components
const MotionCard = motion(Card);
const MotionCardContent = motion(CardContent);

export default function Hero() {
  const [activeScenario, setActiveScenario] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const scenarios = [
    {
      value: "usb",
      title: "No USB Stick? No Problem!",
      description:
        "Access your presentations instantly from any browser. No downloads, no logins, no 2FA delays.",
      icon: <Clock className="h-10 w-10 text-primary" />,
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      value: "share",
      title: "Share with Anyone, Instantly",
      description:
        "Let students and colleagues download your presentation or handouts directly from a simple URL.",
      icon: <Share2 className="h-10 w-10 text-primary" />,
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      value: "kahoot",
      title: "Kahoot Made Simple",
      description:
        "No more repeating join codes. Let everyone join your Kahoot with a single click.",
      icon: <Users className="h-10 w-10 text-primary" />,
      image: "/placeholder.svg?height=300&width=500",
    },
    {
      value: "find",
      title: "Find Your Content Fast",
      description:
        "Instantly access your presentations without searching through complicated platforms.",
      icon: <Zap className="h-10 w-10 text-primary" />,
      image: "/placeholder.svg?height=300&width=500",
    },
  ];

  // Auto-rotate through scenarios
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScenario((prev) => (prev + 1) % scenarios.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [scenarios.length]);

  return (
    <main className="container mx-auto px-4 pt-10 pb-20">
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
            Present Without the <span className="text-primary">Stress</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Access and share your presentations instantly from any browser. No
            more USB sticks, cloud logins, or complicated sharing methods.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SignedOut>
              <Button size="lg" asChild>
                <a href="#waitlist">Join the Waitlist</a>
              </Button>
            </SignedOut>
            <Button size="lg" variant="secondary" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl -z-10" />

          <Card className="overflow-hidden">
            {/* Progress indicators */}
            <div className="flex justify-center gap-2 pt-4">
              {scenarios.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScenario(index)}
                  className="p-1"
                >
                  <div
                    className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                      activeScenario === index
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScenario}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="grid md:grid-cols-2 gap-8 items-center"
                >
                  <div>
                    <motion.div
                      className="flex items-center gap-4 mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      {scenarios[activeScenario]?.icon}
                      <h3 className="text-2xl font-bold">
                        {scenarios[activeScenario]?.title}
                      </h3>
                    </motion.div>
                    <motion.p
                      className="text-lg text-muted-foreground mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      {scenarios[activeScenario]?.description}
                    </motion.p>
                    <motion.ul
                      className="space-y-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Instant access from any browser</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>No downloads or installations required</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Simple sharing with custom URLs</span>
                      </li>
                    </motion.ul>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-lg overflow-hidden shadow-lg"
                  >
                    <Image
                      src={
                        scenarios[activeScenario]?.image ?? "/placeholder.svg"
                      }
                      alt={scenarios[activeScenario]?.title ?? ""}
                      width={500}
                      height={300}
                      className="w-full h-auto"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="py-16" id="features" ref={ref}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose the Presentation Foundation?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed for educators, students, and professionals who need
            reliable, instant access to their presentations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Globe className="h-8 w-8 text-primary" />,
              title: "Access Anywhere",
              description:
                "Open your presentations from any device with a web browser. No special software needed.",
            },
            {
              icon: <Zap className="h-8 w-8 text-primary" />,
              title: "Lightning Fast",
              description:
                "Skip the login delays and cloud downloads. Access your content instantly.",
            },
            {
              icon: <Share2 className="h-8 w-8 text-primary" />,
              title: "Easy Sharing",
              description:
                "Share with a simple URL. No more dealing with different sharing methods for different devices.",
            },
            {
              icon: <Users className="h-8 w-8 text-primary" />,
              title: "Classroom Ready",
              description:
                "Perfect for teachers and students. Simplify Kahoot sessions and handout distribution.",
            },
            {
              icon: <Lock className="h-8 w-8 text-primary" />,
              title: "Secure Access",
              description:
                "Control who can view or download your presentations with optional access controls.",
            },
            {
              icon: <Download className="h-8 w-8 text-primary" />,
              title: "Easy Downloads",
              description:
                "Let viewers download materials directly from your presentation page.",
            },
          ].map((feature, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CardContent className="p-6">
                <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </MotionCard>
          ))}
        </div>
      </section>

      <section className="py-16" id="use-cases">
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Real-World Scenarios
            </CardTitle>
            <CardDescription className="text-xl max-w-2xl mx-auto">
              See how the Presentation Foundation solves common presentation
              challenges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-12 p-8">
            {[
              {
                title: "The Forgotten USB Stick",
                description:
                  "You arrive at school without your USB stick. Instead of panicking, you simply open any browser and navigate to your-presentation.pr.djl.foundation to access your presentation instantly.",
                image: "/placeholder.svg?height=250&width=400",
              },
              {
                title: "The Sharing Nightmare",
                description:
                  "After your presentation, students want your handouts. Some have iPads, others have Android devices. Instead of dealing with AirDrop and QuickShare, just tell everyone to visit same-presentation.pr.djl.foundation.",
                image: "/placeholder.svg?height=250&width=400",
              },
              {
                title: "The Kahoot Chaos",
                description:
                  "You're running a Kahoot session and students keep asking for the join code. Instead of repeating yourself, use the Presentation Foundation to let everyone join with a single click.",
                image: "/placeholder.svg?height=250&width=400",
              },
            ].map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`flex flex-col ${index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}
              >
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-bold mb-4">{scenario.title}</h3>
                  <p className="text-lg text-muted-foreground">
                    {scenario.description}
                  </p>
                </div>
                <div className="md:w-1/2">
                  <Image
                    src={scenario.image || "/placeholder.svg"}
                    alt={scenario.title}
                    width={400}
                    height={250}
                    className="rounded-lg shadow-lg w-full h-auto"
                  />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </section>

      <SignedOut>
        <section className="py-16 mt-16" id="waitlist">
          <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 border-none">
            <CardContent className="p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Join the Waitlist
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Be the first to experience the Presentation Foundation when we
                  launch. Enter your email to join our waitlist.
                </p>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-center">
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                        <Waitlist appearance={{ layout: {} }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <p className="mt-6 text-sm text-muted-foreground">
                  By joining the waitlist, you&apos;ll receive updates about our
                  launch and early access opportunities.
                  <br />A project by the DJL Foundation.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </SignedOut>
    </main>
  );
}
