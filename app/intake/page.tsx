'use client';

import { WizardIntake } from '@/components/organisms/WizardIntake';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { translations } from '@/lib/translations';

export default function IntakePage() {
    const { language } = useLanguageStore();
    const t = translations[language];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b p-4">
                <div className="container mx-auto flex items-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t.intake.details.backToHome}
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <WizardIntake />
            </main>
        </div>
    );
}
