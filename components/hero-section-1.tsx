'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HowItWorks } from '@/components/how-it-works'
import { Pricing } from '@/components/pricing'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/utility/ThemeToggle'
import { useLanguageStore } from '@/store/languageStore'
import { translations } from '@/lib/translations'
import { LanguageSwitcher } from '@/components/language-switcher'

import { Variants } from 'framer-motion'

const transitionVariants: { item: Variants } = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    const { language } = useLanguageStore();
    const t = translations[language];

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                {/* Top Spotlight/Glow Effect */}
                <div
                    aria-hidden
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none z-0">
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 blur-3xl rounded-full"
                        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(180 84% 60% / 0.2) 40%, transparent 70%)' }}
                    />
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-40 blur-2xl rounded-full"
                        style={{ background: 'radial-gradient(circle, hsl(187 92% 69% / 0.3) 0%, hsl(217 91% 60% / 0.15) 40%, transparent 70%)' }}
                    />
                </div>

                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="https://ik.imagekit.io/lrigu76hy/tailark/night-background.jpg?updatedAt=1745733451120"
                                alt="background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
                                width="3276"
                                height="4095"
                            />
                        </AnimatedGroup>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">{t.hero.badge}</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1
                                        className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                        {t.hero.title}
                                    </h1>
                                    <p
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                        {t.hero.description}
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <Link href="/intake">
                                                <span className="text-nowrap">{t.hero.startAssessment}</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href="#how-it-works">
                                            <span className="text-nowrap">{t.hero.learnMore}</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                                    <img
                                        className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                                        src="https://tailark.com//_next/image?url=%2Fmail2.png&w=3840&q=75"
                                        alt="app screen"
                                        width="2700"
                                        height="1440"
                                    />
                                    <img
                                        className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                                        src="https://tailark.com/_next/image?url=%2Fmail2-light.png&w=3840&q=75"
                                        alt="app screen"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span> {t.hero.meetCustomers}</span>

                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                    alt="Nvidia Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/column.svg"
                                    alt="Column Logo"
                                    height="16"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/github.svg"
                                    alt="GitHub Logo"
                                    height="16"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nike.svg"
                                    alt="Nike Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                                    alt="Lemon Squeezy Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/laravel.svg"
                                    alt="Laravel Logo"
                                    height="16"
                                    width="auto"
                                />
                            </div>
                            <div className="flex">
                                <img
                                    className="mx-auto h-7 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/lilly.svg"
                                    alt="Lilly Logo"
                                    height="28"
                                    width="auto"
                                />
                            </div>

                            <div className="flex">
                                <img
                                    className="mx-auto h-6 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/openai.svg"
                                    alt="OpenAI Logo"
                                    height="24"
                                    width="auto"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-background py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">
                                {t.features.title}
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                {t.features.subtitle}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{t.features.available.title}</h3>
                                <p className="text-muted-foreground">
                                    {t.features.available.description}
                                </p>
                            </div>

                            <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{t.features.accuracy.title}</h3>
                                <p className="text-muted-foreground">
                                    {t.features.accuracy.description}
                                </p>
                            </div>

                            <div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{t.features.privacy.title}</h3>
                                <p className="text-muted-foreground">
                                    {t.features.privacy.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <HowItWorks />

                {/* Solutions Section */}
                <section id="solutions" className="bg-background py-16 md:py-24">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                                    {t.solutions.title}
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    {t.solutions.description}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.solutions.emergency.title}</h4>
                                            <p className="text-sm text-muted-foreground">{t.solutions.emergency.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.solutions.facilities.title}</h4>
                                            <p className="text-sm text-muted-foreground">{t.solutions.facilities.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.solutions.selfCare.title}</h4>
                                            <p className="text-sm text-muted-foreground">{t.solutions.selfCare.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.solutions.realTime.title}</h4>
                                            <p className="text-sm text-muted-foreground">{t.solutions.realTime.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 border">
                                    <div className="h-full w-full rounded-xl bg-card border shadow-lg overflow-hidden">
                                        <img
                                            src="/real_time_triage.png"
                                            alt="Real-Time Triage Dashboard"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <Pricing
                    title="Simple, Transparent Pricing"
                    description="Choose the plan that fits your healthcare needs. All plans include AI-powered triage and 24/7 access."
                    plans={[
                        {
                            name: "Free",
                            price: "0",
                            yearlyPrice: "0",
                            period: "month",
                            features: [
                                "Basic symptom assessment",
                                "AI triage recommendations",
                                "Up to 3 assessments/month",
                                "Email support",
                            ],
                            description: "Perfect for occasional health concerns",
                            buttonText: "Start Free",
                            href: "/intake",
                            isPopular: false,
                        },
                        {
                            name: "Individual",
                            price: "9",
                            yearlyPrice: "7",
                            period: "month",
                            features: [
                                "Unlimited assessments",
                                "Advanced AI analysis",
                                "Medical history tracking",
                                "Priority email support",
                                "Nearby facility finder",
                                "Export health reports",
                            ],
                            description: "Best for individuals and families",
                            buttonText: "Get Started",
                            href: "/intake",
                            isPopular: true,
                        },
                        {
                            name: "Family",
                            price: "19",
                            yearlyPrice: "15",
                            period: "month",
                            features: [
                                "Everything in Individual",
                                "Up to 5 family members",
                                "Family health dashboard",
                                "24/7 chat support",
                                "Telemedicine integration",
                                "Health insights & trends",
                            ],
                            description: "Comprehensive care for the whole family",
                            buttonText: "Start Family Plan",
                            href: "/intake",
                            isPopular: false,
                        },
                    ]}
                />

                {/* CTA Section */}
                <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            {t.cta.title}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                            {t.cta.description}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="text-lg px-8 h-12">
                                <Link href="/intake">
                                    {t.cta.button}
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-8">
                            <strong>{t.footer.medicalDisclaimer}:</strong> {t.cta.disclaimer}
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-muted/50 border-t py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 font-bold text-xl mb-4">
                                    <Logo className="h-6" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t.footer.description}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">{t.footer.product}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#features" className="hover:text-foreground">{t.nav.features}</Link></li>
                                    <li><Link href="#how-it-works" className="hover:text-foreground">{t.nav.howItWorks}</Link></li>
                                    <li><Link href="#solutions" className="hover:text-foreground">{t.nav.solutions}</Link></li>
                                    <li><Link href="/intake" className="hover:text-foreground">{t.hero.startAssessment}</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">{t.footer.company}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#about" className="hover:text-foreground">{t.footer.about}</Link></li>
                                    <li><Link href="#privacy" className="hover:text-foreground">{t.footer.privacy}</Link></li>
                                    <li><Link href="#terms" className="hover:text-foreground">{t.footer.terms}</Link></li>
                                    <li><Link href="#contact" className="hover:text-foreground">{t.footer.contact}</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#hipaa" className="hover:text-foreground">{t.footer.hipaa}</Link></li>
                                    <li><Link href="#disclaimer" className="hover:text-foreground">{t.footer.medicalDisclaimer}</Link></li>
                                    <li><Link href="#security" className="hover:text-foreground">{t.footer.security}</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                            <p>&copy; {new Date().getFullYear()} Medagen AI. {t.footer.rights}</p>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    )
}

const HeroHeader = () => {
    const { language } = useLanguageStore();
    const t = translations[language];

    const menuItems = [
        { name: t.nav.features, href: '#features' },
        { name: t.nav.howItWorks, href: '#how-it-works' },
        { name: t.nav.solutions, href: '#solutions' },
        { name: t.nav.pricing, href: '#pricing' },
    ]
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                                <ThemeToggle />
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="#">
                                        <span>{t.nav.login}</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="#">
                                        <span>{t.nav.signUp}</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                    <Link href="#">
                                        <span>{t.nav.getStarted}</span>
                                    </Link>
                                </Button>
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <img
                src="/logo.svg"
                alt="Medagen Logo"
                className="h-8 w-auto"
            />
            <span className="text-lg font-semibold text-foreground">
                MEDAGEN
            </span>
        </div>
    )
}