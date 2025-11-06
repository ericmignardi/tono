'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function FAQ() {
  const faqs = [
    {
      question: 'What is AI Tone Matching?',
      answer:
        'AI Tone Matching analyzes your guitar signal and preferences to suggest amp, cab, and effect settings tailored to your style.',
    },
    {
      question: 'Can I cancel my subscription at any time?',
      answer:
        'Yes. You can cancel anytime from your account settings. Your plan remains active until the end of the billing cycle.',
    },
    {
      question: 'What happens to my data if I downgrade to Free?',
      answer:
        'Your data remains safe. Some premium-only items become read-only, and advanced features are disabled until you upgrade again.',
    },
  ];

  const [openStates, setOpenStates] = useState<boolean[]>(Array(faqs.length).fill(false));

  const toggleFaq = (index: number) => {
    setOpenStates((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
  };

  return (
    <section
      id="faq"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
      <p className="text-sm">Find answers to common questions about tonifier plans.</p>
      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="bg-primary-foreground border-border flex flex-col gap-2 rounded-2xl border p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <p>{faq.question}</p>
              <Button onClick={() => toggleFaq(index)}>
                {!openStates[index] ? <ChevronDown /> : <ChevronUp />}
              </Button>
            </div>
            {openStates[index] && (
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
