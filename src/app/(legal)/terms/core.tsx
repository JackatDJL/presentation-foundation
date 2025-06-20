"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Printer } from "react-feather";
import { Button } from "~/components/ui/button";
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

export default function TermsOfService() {
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
              {language === "de" ? "Nutzungsbedingungen" : "Terms of Service"}
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
          {language === "de" ? (
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  1. Einleitung
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Willkommen bei der Presentation Foundation (&quot;wir,&quot;
                  &quot;uns,&quot; oder &quot;unser&quot;). Wir sind die
                  Presentation Foundation der DJL Foundation, ein gemeinnütziger
                  uneingetragener Verein (u.V.) in Deutschland mit Sitz in
                  Stade, Niedersachsen. Durch den Zugriff auf oder die Nutzung
                  unseres Dienstes stimmen Sie zu, an diese Nutzungsbedingungen
                  (&quot;Bedingungen&quot;) gebunden zu sein. Bitte lesen Sie
                  diese Bedingungen sorgfältig durch.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  2. Nutzung unserer Dienste
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Sie müssen alle Richtlinien befolgen, die Ihnen innerhalb der
                  Dienste zur Verfügung gestellt werden. Sie dürfen unsere
                  Dienste nur wie gesetzlich erlaubt nutzen. Wir können die
                  Bereitstellung unserer Dienste für Sie aussetzen oder
                  einstellen, wenn Sie unsere Bedingungen oder Richtlinien nicht
                  einhalten oder wenn wir einen Verdacht auf Fehlverhalten
                  untersuchen.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    Wenn Sie beabsichtigen, unsere Dienste für Zwecke zu nutzen,
                    die nicht privat sind, müssen Sie uns vorher um Genehmigung
                    kontaktieren.
                  </strong>
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    Wir behalten uns das Recht vor, bestimmte Benutzer mit oder
                    ohne Angabe von Gründen zu sperren.
                  </strong>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  3. Ihr Konto
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Um bestimmte Funktionen unserer Dienste nutzen zu können,
                  müssen Sie möglicherweise ein Konto erstellen. Sie sind für
                  die Sicherung Ihres Kontos und für alle Aktivitäten, die über
                  Ihr Konto stattfinden, verantwortlich. Wir empfehlen die
                  Verwendung eines starken Passworts und dessen vertrauliche
                  Behandlung.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  4. Datenschutz und Urheberrechtsschutz
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Unsere{" "}
                  <Link
                    href="/privacy"
                    prefetch
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    Datenschutzerklärung
                  </Link>{" "}
                  erläutert, wie wir mit Ihren personenbezogenen Daten umgehen
                  und Ihre Privatsphäre schützen, wenn Sie unsere Dienste
                  nutzen. Durch die Nutzung unserer Dienste stimmen Sie zu, dass
                  wir solche Daten in Übereinstimmung mit unseren
                  Datenschutzrichtlinien verwenden können.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Bei Urheberrechtsverletzungen kontaktieren Sie uns bitte unter{" "}
                  <a
                    href="mailto:claims@djl.foundation"
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    claims@djl.foundation
                  </a>
                  .
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  5. Ihre Inhalte in unseren Diensten
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Unsere Dienste ermöglichen es Ihnen, Inhalte hochzuladen,
                  einzureichen, zu speichern, zu senden und zu empfangen. Sie
                  behalten alle Eigentumsrechte an geistigem Eigentum, die Sie
                  an diesen Inhalten halten. Wenn Sie Inhalte auf oder über
                  unsere Dienste hochladen, einreichen, speichern, senden oder
                  empfangen, erteilen Sie uns eine weltweite Lizenz zur Nutzung,
                  Hosting, Speicherung, Reproduktion, Modifizierung, Erstellung
                  abgeleiteter Werke, Kommunikation, Veröffentlichung,
                  öffentlichen Aufführung, öffentlichen Anzeige und Verteilung
                  solcher Inhalte.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    Wir behalten uns das Recht vor, Ihre Inhalte nach eigenem
                    Ermessen mit oder ohne Vorankündigung von unserer Plattform
                    zu löschen.
                  </strong>
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    Wir sind nicht verantwortlich für die Inhalte, die Sie auf
                    unserer Plattform hochladen oder hosten.
                  </strong>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  6. Änderung und Beendigung unserer Dienste
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir ändern und verbessern unsere Dienste ständig. Wir können
                  Funktionalitäten oder Merkmale hinzufügen oder entfernen und
                  einen Dienst ganz einstellen. Sie können die Nutzung unserer
                  Dienste jederzeit beenden, obwohl wir es bedauern würden, Sie
                  gehen zu sehen. Wir können auch die Bereitstellung von
                  Diensten für Sie einstellen oder neue Grenzen für unsere
                  Dienste festlegen.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    Wir können Preise für unsere Plattform einführen und Ihnen
                    möglicherweise Zeit geben oder auch nicht, um den neuen
                    Preisbedingungen zu entsprechen. Nichteinhaltung kann zur
                    Löschung Ihrer Daten führen.
                  </strong>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  7. Haftung für unsere Dienste
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Soweit gesetzlich zulässig, sind die Presentation Foundation
                  und ihre Lieferanten und Vertriebspartner nicht verantwortlich
                  für entgangene Gewinne, Einnahmen oder Daten, finanzielle
                  Verluste oder indirekte, besondere, Folge-, exemplarische oder
                  Strafschäden.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  8. Geschäftliche Nutzung unserer Dienste
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wenn Sie unsere Dienste im Namen eines Unternehmens nutzen,
                  akzeptiert dieses Unternehmen diese Bedingungen. Es wird die
                  Presentation Foundation und ihre verbundenen Unternehmen,
                  leitenden Angestellten, Vertreter und Mitarbeiter von
                  jeglichen Ansprüchen, Klagen oder Handlungen, die sich aus
                  oder im Zusammenhang mit der Nutzung der Dienste oder der
                  Verletzung dieser Bedingungen ergeben, freistellen und
                  schadlos halten, einschließlich jeglicher Haftung oder Kosten,
                  die aus Ansprüchen, Verlusten, Schäden, Klagen, Urteilen,
                  Prozesskosten und Anwaltsgebühren entstehen.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  9. Über diese Bedingungen
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wir können diese Bedingungen oder zusätzliche Bedingungen, die
                  für einen Dienst gelten, ändern, um beispielsweise Änderungen
                  des Gesetzes oder Änderungen unserer Dienste widerzuspiegeln.
                  Sie sollten die Bedingungen regelmäßig überprüfen. Wir werden
                  Hinweise auf Änderungen dieser Bedingungen auf dieser Seite
                  veröffentlichen. Änderungen gelten nicht rückwirkend und
                  werden frühestens vierzehn Tage nach ihrer Veröffentlichung
                  wirksam. Änderungen, die neue Funktionen für einen Dienst
                  betreffen oder aus rechtlichen Gründen vorgenommen werden,
                  treten jedoch sofort in Kraft.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  10. Kontakt
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Wenn Sie Fragen zu diesen Bedingungen haben, kontaktieren Sie
                  uns bitte unter{" "}
                  <a
                    href="mailto:contact@djl.foundation"
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    contact@djl.foundation
                  </a>
                  .
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Separator className="my-8" />

                <div className="text-sm text-muted-foreground print:text-black">
                  <p className="font-medium">Postanschrift:</p>
                  <p className="text-muted-foreground leading-7 print:text-black">
                    z.Hdn. Jack Ruder
                    <br />
                    DJL Foundation
                    <br />
                    Altmarktstraße 27
                    <br />
                    21684 Stade
                    <br />
                    Deutschland
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="space-y-6">
              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  1. Introduction
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Welcome to Presentation Foundation (&quot;we,&quot;
                  &quot;our,&quot; or &quot;us&quot;). We are the Presentation
                  Foundation by the DJL Foundation, a nonprofit unregistered
                  association (u.V.) in Germany based in Stade, Lower Saxony. By
                  accessing or using our service, you agree to be bound by these
                  Terms of Service (&quot;Terms&quot;). Please read these Terms
                  carefully.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  2. Using Our Services
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  You must follow any policies made available to you within the
                  Services. You may use our Services only as permitted by law.
                  We may suspend or stop providing our Services to you if you do
                  not comply with our terms or policies or if we are
                  investigating suspected misconduct.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    If you intend to use our Services for any uses that are not
                    Private, you are required to contact us beforehand for
                    approval.
                  </strong>
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    We reserve the right to block specific users with or without
                    providing reasoning.
                  </strong>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  3. Your Account
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  To use certain features of our Services, you may need to
                  create an account. You are responsible for safeguarding your
                  account and for any activity that occurs through your account.
                  We recommend using a strong password and keeping it
                  confidential.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  4. Privacy and Copyright Protection
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Our{" "}
                  <Link
                    href="/privacy"
                    prefetch
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    Privacy Policy
                  </Link>{" "}
                  explains how we treat your personal data and protect your
                  privacy when you use our Services. By using our Services, you
                  agree that we can use such data in accordance with our privacy
                  policies.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  For copyright claims, please contact us at{" "}
                  <a
                    href="mailto:claims@djl.foundation"
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    claims@djl.foundation
                  </a>
                  .
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  5. Your Content in Our Services
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  Our Services allow you to upload, submit, store, send, and
                  receive content. You retain ownership of any intellectual
                  property rights that you hold in that content. When you
                  upload, submit, store, send, or receive content to or through
                  our Services, you give us a worldwide license to use, host,
                  store, reproduce, modify, create derivative works,
                  communicate, publish, publicly perform, publicly display, and
                  distribute such content.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    We reserve the right to delete your content from our
                    platform with or without notice at our sole discretion.
                  </strong>
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    We are not responsible for whatever you upload or host on
                    our platform.
                  </strong>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  6. Modifying and Terminating Our Services
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We are constantly changing and improving our Services. We may
                  add or remove functionalities or features, and we may suspend
                  or stop a Service altogether. You can stop using our Services
                  at any time, although we&apos;ll be sorry to see you go. We
                  may also stop providing Services to you, or add or create new
                  limits to our Services at any time.
                </p>
                <p className="text-muted-foreground leading-7 print:text-black">
                  <strong className="font-medium text-foreground print:text-black">
                    We may implement pricing into our platform and may or may
                    not give you time to comply with new pricing terms.
                    Non-compliance may lead to deletion of your data.
                  </strong>
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  7. Liability for Our Services
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  When permitted by law, Presentation Foundation and its
                  suppliers and distributors will not be responsible for lost
                  profits, revenues, or data, financial losses, or indirect,
                  special, consequential, exemplary, or punitive damages.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  8. Business Uses of Our Services
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  If you are using our Services on behalf of a business, that
                  business accepts these Terms. It will hold harmless and
                  indemnify Presentation Foundation and its affiliates,
                  officers, agents, and employees from any claim, suit, or
                  action arising from or related to the use of the Services or
                  violation of these Terms, including any liability or expense
                  arising from claims, losses, damages, suits, judgments,
                  litigation costs, and attorneys&apos; fees.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  9. About These Terms
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  We may modify these Terms or any additional terms that apply
                  to a Service to, for example, reflect changes to the law or
                  changes to our Services. You should look at the Terms
                  regularly. We&apos;ll post notice of modifications to these
                  Terms on this page. Changes will not apply retroactively and
                  will become effective no sooner than fourteen days after they
                  are posted. However, changes addressing new functions for a
                  Service or changes made for legal reasons will be effective
                  immediately.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  10. Contact Us
                </h2>
                <p className="text-muted-foreground leading-7 print:text-black">
                  If you have any questions about these Terms, please contact us
                  at{" "}
                  <a
                    href="mailto:contact@djl.foundation"
                    className="text-foreground underline decoration-2 decoration-accent hover:decoration-wavy print:text-blue-700"
                  >
                    contact@djl.foundation
                  </a>
                  .
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Separator className="my-8" />

                <div className="text-sm text-muted-foreground print:text-black">
                  <p className="font-medium">Postal address:</p>
                  <p className="text-muted-foreground leading-7 print:text-black">
                    c/o Jack Ruder
                    <br />
                    DJL Foundation
                    <br />
                    Altmarktstraße 27
                    <br />
                    21684 Stade
                    <br />
                    Germany
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
