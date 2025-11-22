"use client";

import { cn } from "@/lib/utils";
import { Activity, Brain, MapPin } from "lucide-react";
import type React from "react";
import { useLanguageStore } from "@/store/languageStore";
import { translations } from "@/lib/translations";

// The main props for the HowItWorks component
interface HowItWorksProps extends React.HTMLAttributes<HTMLElement> { }

// The props for a single step card
interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  stepNumber: number;
  colorClass: string;
}

/**
 * A single step card within the "How It Works" section.
 * It displays an icon, title, description, and a list of benefits.
 */
const StepCard: React.FC<StepCardProps> = ({
  icon,
  title,
  description,
  benefits,
  colorClass,
}) => (
  <div
    className={cn(
      "relative rounded-2xl border bg-card p-6 text-card-foreground transition-all duration-300 ease-in-out",
      "hover:scale-105 hover:shadow-lg hover:border-primary/50 hover:bg-muted"
    )}
  >
    {/* Icon */}
    <div className={cn("mb-4 flex h-12 w-12 items-center justify-center rounded-lg", colorClass)}>
      {icon}
    </div>
    {/* Title and Description */}
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="mb-6 text-muted-foreground">{description}</p>
    {/* Benefits List */}
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-muted-foreground">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * A responsive "How It Works" section that displays a 3-step process.
 * It is styled with shadcn/ui theme variables to support light and dark modes.
 */
export const HowItWorks: React.FC<HowItWorksProps> = ({
  className,
  ...props
}) => {
  const { language } = useLanguageStore();
  const t = translations[language];

  const stepsData = [
    {
      icon: <Activity className="h-6 w-6 text-white" />,
      title: t.howItWorks.step1.title,
      description: t.howItWorks.step1.description,
      benefits: t.howItWorks.step1.benefits,
      colorClass: "bg-primary",
    },
    {
      icon: <Brain className="h-6 w-6 text-white" />,
      title: t.howItWorks.step2.title,
      description: t.howItWorks.step2.description,
      benefits: t.howItWorks.step2.benefits,
      colorClass: "bg-teal-500",
    },
    {
      icon: <MapPin className="h-6 w-6 text-white" />,
      title: t.howItWorks.step3.title,
      description: t.howItWorks.step3.description,
      benefits: t.howItWorks.step3.benefits,
      colorClass: "bg-cyan-500",
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full bg-muted/30 py-16 sm:py-24", className)}
      {...props}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t.howItWorks.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.howItWorks.subtitle}
          </p>
        </div>

        {/* Step Indicators with Connecting Line */}
        <div className="relative mx-auto mb-8 w-full max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2 bg-gradient-to-r from-primary via-teal-500 to-cyan-500 opacity-20"
          ></div>
          {/* Use grid to align numbers with the card grid below */}
          <div className="relative grid grid-cols-3">
            {stepsData.map((step, index) => (
              <div
                key={index}
                // Center the number within its grid column
                className={cn(
                  "flex h-12 w-12 items-center justify-center justify-self-center rounded-full font-semibold text-white ring-4 ring-background",
                  step.colorClass
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
              stepNumber={index + 1}
              colorClass={step.colorClass}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
