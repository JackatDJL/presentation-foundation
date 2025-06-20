"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Printer } from "react-feather";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { LanguageToggle } from "~/components/language-toggle";
import { useTheme } from "next-themes";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export default function PrivacyPolicy() {
  const updateDate = new Date("2025-03-15T14:29:57.488Z");

  const [language, setLanguage] = useState<"de" | "en">("de");
  const currentDate = updateDate.toLocaleDateString(
    language === "de" ? "de-DE" : "en-US",
  );
  const { setTheme, theme } = useTheme();

  // Handle printing
  const handlePrint = () => {
    // Store current theme
    const currentTheme = theme;

    // Set theme to light for printing
    setTheme("light");

    // Print
    setTimeout(() => {
      window.print();

      // Restore theme after printing
      setTimeout(() => {
        setTheme(currentTheme ?? "system");
      }, 500);
    }, 300);
  };

  // Liste der Auftragsverarbeiter mit ihren Details
  const subprocessors = [
    {
      name: "Vercel",
      purpose:
        language === "de"
          ? "Hosting und Infrastruktur"
          : "Hosting and infrastructure",
      link: "https://vercel.com/legal/privacy-policy",
      description:
        language === "de"
          ? "Vercel stellt die Hosting-Infrastruktur für unsere Anwendung bereit."
          : "Vercel provides the hosting infrastructure for our application.",
    },
    {
      name: "Neon",
      purpose: language === "de" ? "Datenbankdienste" : "Database services",
      link: "https://neon.tech/privacy",
      description:
        language === "de"
          ? "Neon bietet serverlose PostgreSQL-Datenbankdienste zur Speicherung von Präsentationsdaten."
          : "Neon provides serverless PostgreSQL database services for storing presentation data.",
    },
    {
      name: "Clerk",
      purpose:
        language === "de"
          ? "Authentifizierung und Benutzerverwaltung"
          : "Authentication and user management",
      link: "https://clerk.com/privacy",
      description:
        language === "de"
          ? "Clerk bietet Dienste für Authentifizierung, Benutzerverwaltung und Sitzungsverwaltung."
          : "Clerk provides authentication, user management, and session handling services.",
    },
    {
      name: "UploadThing",
      purpose:
        language === "de"
          ? "Dateispeicherung und -verwaltung"
          : "File storage and management",
      link: "https://uploadthing.com/privacy",
      description:
        language === "de"
          ? "UploadThing bietet Dienste für Datei-Upload, -speicherung und -verwaltung für Präsentationsdateien."
          : "UploadThing provides file upload, storage, and management services for presentation files.",
    },
    {
      name: "Sentry",
      purpose:
        language === "de"
          ? "Fehlerüberwachung und -meldung"
          : "Error monitoring and reporting",
      link: "https://sentry.io/privacy/",
      description:
        language === "de"
          ? "Sentry bietet Dienste zur Fehlerüberwachung und -meldung, um uns bei der Identifizierung und Behebung von Problemen zu helfen."
          : "Sentry provides error monitoring and reporting services to help us identify and fix issues.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 print:py-4 print:px-0">
      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="mb-8 flex justify-between items-center print:mb-4"
          variants={itemVariants}
        >
          <div>
            <div className="flex items-center gap-4 mb-6 print:hidden">
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {language === "de" ? "Zurück zur Startseite" : "Back to Home"}
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {language === "de" ? "Drucken" : "Print"}
              </Button>
            </div>
            <motion.h1
              className="text-4xl font-bold mb-4 print:text-3xl"
              variants={fadeInVariants}
            >
              {language === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
            </motion.h1>
            <motion.p
              className="text-muted-foreground"
              variants={fadeInVariants}
            >
              {language === "de" ? "Zuletzt aktualisiert: " : "Last updated: "}
              {currentDate}
            </motion.p>
          </div>
          <div className="print:hidden">
            <LanguageToggle onChange={setLanguage} />
          </div>
        </motion.div>

        <motion.div
          className="space-y-6 text-foreground"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Alert
              variant="destructive"
              className="mb-6 text-foreground print:border-2 print:border-black"
            >
              <AlertTitle className="text-foregound">
                {language === "de" ? "Wichtiger Hinweis:" : "Important Notice:"}
              </AlertTitle>
              <AlertDescription>
                <ul className="space-y-1 mb-0 mt-2 text-foreground">
                  <li>
                    {language === "de"
                      ? "Die Nutzung unseres Dienstes erfolgt vollständig nach Ihrer Wahl."
                      : "Your use of our service is entirely by your choice."}
                  </li>
                  <li>
                    {language === "de"
                      ? "Wir haften nicht für Ihre Daten oder Folgen, die sich aus Ihrer Nutzung unseres Dienstes ergeben."
                      : "We are not liable for your data or any consequences resulting from your use of our service."}
                  </li>
                  <li>
                    {language === "de"
                      ? "Sie können unseren Dienst nicht nutzen, wenn Sie dieser Datenschutzerklärung nicht zustimmen."
                      : "You cannot use our service if you do not agree to this Privacy Policy."}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </motion.div>

          {language === "de" ? (
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  1. Einleitung
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Bei der Presentation Foundation nehmen wir Ihren Datenschutz
                  ernst. Diese Datenschutzerklärung erläutert, wie wir Ihre
                  Informationen sammeln, verwenden, offenlegen und schützen,
                  wenn Sie unseren Dienst nutzen. Wir sind die Presentation
                  Foundation der DJL Foundation, ein gemeinnütziger
                  uneingetragener Verein (u.V.) in Deutschland mit Sitz in
                  Stade, Niedersachsen.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  2. Informationen, die wir sammeln
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir sammeln Informationen, die Sie uns direkt zur Verfügung
                  stellen, z.B. wenn Sie ein Konto erstellen, Präsentationen
                  hochladen oder mit uns kommunizieren. Dies kann Folgendes
                  umfassen:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Persönliche Identifikatoren (Name, E-Mail-Adresse)</li>
                  <li>Kontoanmeldedaten</li>
                  <li>
                    Von Ihnen hochgeladene Inhalte (Präsentationen, Handouts
                    usw.)
                  </li>
                  <li>Kommunikation mit uns</li>
                </ul>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir sammeln auch automatisch bestimmte Informationen, wenn Sie
                  unseren Dienst nutzen, darunter:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>
                    Protokolldaten (IP-Adresse, Browsertyp, besuchte Seiten)
                  </li>
                  <li>Geräteinformationen</li>
                  <li>Nutzungsinformationen</li>
                  <li>Cookies und ähnliche Technologien</li>
                </ul>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  3. Wie wir Ihre Informationen verwenden
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir verwenden die gesammelten Informationen, um:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>
                    Unsere Dienste bereitzustellen, zu warten und zu verbessern
                  </li>
                  <li>Transaktionen zu verarbeiten und abzuschließen</li>
                  <li>
                    Ihnen technische Hinweise und Support-Nachrichten zu senden
                  </li>
                  <li>Auf Ihre Kommentare und Fragen zu antworten</li>
                  <li>Neue Produkte und Dienstleistungen zu entwickeln</li>
                  <li>Trends und Nutzung zu überwachen und zu analysieren</li>
                  <li>
                    Betrügerische Transaktionen und andere illegale Aktivitäten
                    zu erkennen, zu untersuchen und zu verhindern
                  </li>
                  <li>Ihre Erfahrung zu personalisieren</li>
                </ul>
              </motion.div>

              {/* Continue with the rest of the German content */}
              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  4. Weitergabe von Informationen
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir können Ihre Informationen teilen mit:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>
                    Dienstleistern, die Dienstleistungen in unserem Auftrag
                    erbringen
                  </li>
                  <li>
                    Anderen Nutzern, wenn Sie Präsentationen öffentlich teilen
                  </li>
                  <li>
                    Als Reaktion auf rechtliche Verfahren oder wenn wir der
                    Meinung sind, dass dies zur Einhaltung von Gesetzen
                    erforderlich ist
                  </li>
                  <li>
                    Im Zusammenhang mit einer Fusion, einem Verkauf oder einer
                    Übernahme
                  </li>
                </ul>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  5. Datenspeicherung
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir speichern Ihre Informationen so lange, wie Ihr Konto aktiv
                  ist oder wie es zur Bereitstellung von Diensten für Sie
                  erforderlich ist. Wir werden Ihre Informationen auch so lange
                  aufbewahren und verwenden, wie es zur Erfüllung rechtlicher
                  Verpflichtungen, zur Beilegung von Streitigkeiten und zur
                  Durchsetzung unserer Vereinbarungen erforderlich ist.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  6. Ihre Rechte und Wahlmöglichkeiten
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Je nach Ihrem Standort haben Sie möglicherweise bestimmte
                  Rechte in Bezug auf Ihre personenbezogenen Daten, wie z.B.:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Zugang zu Ihren personenbezogenen Daten</li>
                  <li>Berichtigung ungenauer Informationen</li>
                  <li>Löschung Ihrer Informationen</li>
                  <li>Einschränkung der Verarbeitung</li>
                  <li>Datenübertragbarkeit</li>
                  <li>Widerspruch gegen die Verarbeitung</li>
                </ul>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Um diese Rechte auszuüben, kontaktieren Sie uns bitte unter{" "}
                  <a
                    href="mailto:privacy@djl.foundation"
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    privacy@djl.foundation
                  </a>
                  .
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  7. Europäischer und deutscher Datenschutz
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Als deutsche Organisation halten wir uns an die
                  Datenschutz-Grundverordnung (DSGVO) und die deutschen
                  Datenschutzgesetze. Das bedeutet:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>
                    Wir verarbeiten Ihre Daten rechtmäßig, fair und transparent
                  </li>
                  <li>
                    Wir erheben Daten für festgelegte, eindeutige und legitime
                    Zwecke
                  </li>
                  <li>Wir beschränken die Datenerhebung auf das Notwendige</li>
                  <li>Wir stellen die Richtigkeit der Daten sicher</li>
                  <li>Wir begrenzen die Speicherzeiträume</li>
                  <li>Wir gewährleisten angemessene Sicherheitsmaßnahmen</li>
                </ul>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Nach deutschem Recht haben Sie zusätzliche Rechte in Bezug auf
                  Ihre Daten, einschließlich des Rechts, eine Beschwerde bei der
                  deutschen Datenschutzbehörde (Bundesbeauftragter für den
                  Datenschutz und die Informationsfreiheit) einzureichen.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  8. Sicherheit
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir ergreifen angemessene Maßnahmen, um Ihre personenbezogenen
                  Daten vor Verlust, Diebstahl, Missbrauch, unbefugtem Zugriff,
                  Offenlegung, Änderung und Zerstörung zu schützen.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  9. Internationale Übertragungen
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Ihre Informationen können in Länder übertragen und dort
                  verarbeitet werden, die andere Datenschutzgesetze haben als
                  Ihr Wohnsitzland. Diese Länder können Datenschutzgesetze
                  haben, die sich von den Gesetzen Ihres Landes unterscheiden.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  10. Datenschutz für Kinder
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Unser Dienst richtet sich nicht an Kinder unter 13 Jahren, und
                  wir erheben wissentlich keine personenbezogenen Daten von
                  Kindern unter 13 Jahren. Wenn wir erfahren, dass wir
                  personenbezogene Daten von einem Kind unter 13 Jahren
                  gesammelt haben, werden wir Maßnahmen ergreifen, um diese
                  Informationen zu löschen.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  11. Änderungen dieser Datenschutzerklärung
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir können diese Datenschutzerklärung von Zeit zu Zeit
                  aktualisieren. Wir werden Sie über Änderungen informieren,
                  indem wir die neue Datenschutzerklärung auf dieser Seite
                  veröffentlichen und das Datum &quot;Zuletzt aktualisiert&quot;
                  aktualisieren.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  12. Auftragsverarbeiter
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir nutzen die folgenden Auftragsverarbeiter, um unsere
                  Dienste bereitzustellen. Jeder Auftragsverarbeiter wurde
                  sorgfältig ausgewählt und ist vertraglich verpflichtet,
                  angemessene technische und organisatorische Maßnahmen zum
                  Schutz Ihrer Daten zu implementieren.
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  At Presentation Foundation, we take your privacy seriously.
                  This Privacy Policy explains how we collect, use, disclose,
                  and safeguard your information when you use our service. We
                  are the Presentation Foundation by the DJL Foundation, a
                  nonprofit unregistered association (u.V.) in Germany based in
                  Stade, Lower Saxony.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  2. Information We Collect
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We collect information that you provide directly to us, such
                  as when you create an account, upload presentations, or
                  communicate with us. This may include:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Personal identifiers (name, email address)</li>
                  <li>Account credentials</li>
                  <li>Content you upload (presentations, handouts, etc.)</li>
                  <li>Communications with us</li>
                </ul>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We also automatically collect certain information when you use
                  our service, including:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Log data (IP address, browser type, pages visited)</li>
                  <li>Device information</li>
                  <li>Usage information</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  3. How We Use Your Information
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We use the information we collect to:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and complete transactions</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Develop new products and services</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>
                    Detect, investigate, and prevent fraudulent transactions and
                    other illegal activities
                  </li>
                  <li>Personalize your experience</li>
                </ul>
              </motion.div>

              {/* Continue with the rest of the English content */}
              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  4. Sharing of Information
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We may share your information with:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Service providers who perform services on our behalf</li>
                  <li>Other users when you share presentations publicly</li>
                  <li>
                    In response to legal process or when we believe it&apos;s
                    necessary to comply with law
                  </li>
                  <li>In connection with a merger, sale, or acquisition</li>
                </ul>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  5. Data Retention
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We retain your information for as long as your account is
                  active or as needed to provide you services. We will also
                  retain and use your information as necessary to comply with
                  legal obligations, resolve disputes, and enforce our
                  agreements.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  6. Your Rights and Choices
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Depending on your location, you may have certain rights
                  regarding your personal information, such as:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>Access to your personal information</li>
                  <li>Correction of inaccurate information</li>
                  <li>Deletion of your information</li>
                  <li>Restriction of processing</li>
                  <li>Data portability</li>
                  <li>Objection to processing</li>
                </ul>
                <p className="text-muted-foreground leading-7 print:text-black">
                  To exercise these rights, please contact us at{" "}
                  <a
                    href="mailto:privacy@djl.foundation"
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    privacy@djl.foundation
                  </a>
                  .
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  7. European and German Data Protection
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  As a German organization, we comply with the General Data
                  Protection Regulation (GDPR) and German data protection laws.
                  This means:
                </p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground print:text-black">
                  <li>
                    We process your data lawfully, fairly, and transparently
                  </li>
                  <li>
                    We collect data for specified, explicit, and legitimate
                    purposes
                  </li>
                  <li>We limit data collection to what is necessary</li>
                  <li>We ensure data accuracy</li>
                  <li>We limit storage periods</li>
                  <li>We ensure appropriate security measures</li>
                </ul>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Under German law, you have additional rights regarding your
                  data, including the right to lodge a complaint with the German
                  data protection authority (Bundesbeauftragter für den
                  Datenschutz und die Informationsfreiheit).
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  8. Security
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We take reasonable measures to help protect your personal
                  information from loss, theft, misuse, unauthorized access,
                  disclosure, alteration, and destruction.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  9. International Transfers
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Your information may be transferred to, and processed in,
                  countries other than the country in which you reside. These
                  countries may have data protection laws that are different
                  from the laws of your country.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  10. Children&apos;s Privacy
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Our service is not directed to children under 13, and we do
                  not knowingly collect personal information from children under
                  13. If we learn that we have collected personal information
                  from a child under 13, we will take steps to delete that
                  information.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  11. Changes to This Privacy Policy
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &quot;Last updated&quot; date.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  12. Subprocessors
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We use the following subprocessors to help provide our
                  services. Each subprocessor has been carefully selected and is
                  bound by contractual obligations to implement appropriate
                  technical and organizational measures to protect your data.
                </p>
              </motion.div>
            </motion.div>
          )}

          <motion.div
            className="mt-6 space-y-4 not-prose"
            variants={containerVariants}
          >
            {subprocessors.map((processor, index) => (
              <motion.div
                key={processor.name}
                variants={itemVariants}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="print:break-inside-avoid"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>{processor.name}</CardTitle>
                    <CardDescription className="text-foreground print:text-black">
                      {processor.purpose}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 print:text-black">
                      {processor.description}
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto print:hidden"
                      asChild
                    >
                      <a
                        href={processor.link}
                        target="_blank"
                        className="underline decoration-2 text-muted-foreground decoration-accent hover:decoration-wavy print:text-blue-700"
                        rel="noopener noreferrer"
                      >
                        {language === "de"
                          ? "Datenschutzerklärung ansehen"
                          : "View Privacy Policy"}
                      </a>
                    </Button>
                    <span className="hidden print:inline-block print:text-blue-700">
                      {processor.link}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="mt-8">
              {language === "de" ? "13. Kontakt" : "13. Contact Us"}
            </h2>
            <p className="text-muted-foreground leading-7 print:text-black">
              {language === "de"
                ? "Wenn Sie Fragen zu dieser Datenschutzerklärung haben, kontaktieren Sie uns bitte unter "
                : "If you have any questions about this Privacy Policy, please contact us at "}
              <a
                href="mailto:privacy@djl.foundation"
                className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
              >
                privacy@djl.foundation
              </a>
              .
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Separator className="my-8" />

            <div className="text-sm text-muted-foreground print:text-black">
              <p className="font-medium">
                {language === "de" ? "Postanschrift:" : "Postal address:"}
              </p>
              <p className="text-muted-foreground leading-7 print:text-black">
                {language === "de" ? "z.Hdn." : "c/o"} Jack Ruder
                <br />
                DJL Foundation
                <br />
                Altmarktstraße 27
                <br />
                21684 Stade
                <br />
                {language === "de" ? "Deutschland" : "Germany"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
