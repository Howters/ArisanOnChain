"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, HelpCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <Card className="border-primary/20">
      <button
        onClick={onClick}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-primary/5 transition-colors rounded-lg"
      >
        <span className="font-medium pr-8 text-base">{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 text-primary ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function GlossaryItem({ term, definition }: { term: string; definition: string }) {
  return (
    <Card className="p-5 border-primary/20 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-primary mb-1">{term}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{definition}</p>
        </div>
      </div>
    </Card>
  );
}

export default function FAQPage() {
  const t = useTranslations("faqPage");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const basicFaqs = [
    { q: t("basic.q1.q"), a: t("basic.q1.a") },
    { q: t("basic.q2.q"), a: t("basic.q2.a") },
    { q: t("basic.q3.q"), a: t("basic.q3.a") },
    { q: t("basic.q4.q"), a: t("basic.q4.a") },
    { q: t("basic.q5.q"), a: t("basic.q5.a") },
    { q: t("basic.q6.q"), a: t("basic.q6.a") },
    { q: t("basic.q7.q"), a: t("basic.q7.a") },
    { q: t("basic.q8.q"), a: t("basic.q8.a") },
  ];

  const moneyFaqs = [
    { q: t("money.q1.q"), a: t("money.q1.a") },
    { q: t("money.q2.q"), a: t("money.q2.a") },
    { q: t("money.q3.q"), a: t("money.q3.a") },
    { q: t("money.q4.q"), a: t("money.q4.a") },
    { q: t("money.q5.q"), a: t("money.q5.a") },
  ];

  const securityFaqs = [
    { q: t("security.q1.q"), a: t("security.q1.a") },
    { q: t("security.q2.q"), a: t("security.q2.a") },
    { q: t("security.q3.q"), a: t("security.q3.a") },
    { q: t("security.q4.q"), a: t("security.q4.a") },
  ];

  const techFaqs = [
    { q: t("tech.q1.q"), a: t("tech.q1.a") },
    { q: t("tech.q2.q"), a: t("tech.q2.a") },
    { q: t("tech.q3.q"), a: t("tech.q3.a") },
    { q: t("tech.q4.q"), a: t("tech.q4.a") },
  ];

  const glossaryTerms = [
    { term: t("glossary.term1.term"), definition: t("glossary.term1.def") },
    { term: t("glossary.term2.term"), definition: t("glossary.term2.def") },
    { term: t("glossary.term3.term"), definition: t("glossary.term3.def") },
    { term: t("glossary.term4.term"), definition: t("glossary.term4.def") },
    { term: t("glossary.term5.term"), definition: t("glossary.term5.def") },
    { term: t("glossary.term6.term"), definition: t("glossary.term6.def") },
    { term: t("glossary.term7.term"), definition: t("glossary.term7.def") },
    { term: t("glossary.term8.term"), definition: t("glossary.term8.def") },
    { term: t("glossary.term9.term"), definition: t("glossary.term9.def") },
    { term: t("glossary.term10.term"), definition: t("glossary.term10.def") },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">{t("title")}</h1>
        </div>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">📚</span>
          {t("basicTitle")}
        </h2>
        <div className="space-y-3">
          {basicFaqs.map((faq, i) => (
            <FAQItem
              key={`basic-${i}`}
              q={faq.q}
              a={faq.a}
              isOpen={openFaq === i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">💰</span>
          {t("moneyTitle")}
        </h2>
        <div className="space-y-3">
          {moneyFaqs.map((faq, i) => {
            const index = basicFaqs.length + i;
            return (
              <FAQItem
                key={`money-${i}`}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">🔒</span>
          {t("securityTitle")}
        </h2>
        <div className="space-y-3">
          {securityFaqs.map((faq, i) => {
            const index = basicFaqs.length + moneyFaqs.length + i;
            return (
              <FAQItem
                key={`security-${i}`}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">⚙️</span>
          {t("techTitle")}
        </h2>
        <div className="space-y-3">
          {techFaqs.map((faq, i) => {
            const index = basicFaqs.length + moneyFaqs.length + securityFaqs.length + i;
            return (
              <FAQItem
                key={`tech-${i}`}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            );
          })}
        </div>
      </section>

      <section className="border-t pt-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">{t("glossaryTitle")}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{t("glossarySubtitle")}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {glossaryTerms.map((item, i) => (
            <GlossaryItem key={i} term={item.term} definition={item.definition} />
          ))}
        </div>
      </section>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          {t("stillHaveQuestions")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("contactSupport")}</p>
      </Card>
    </div>
  );
}

