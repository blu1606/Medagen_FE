import { WizardIntake } from '@/components/organisms/WizardIntake';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function IntakePage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b p-4">
                <div className="container mx-auto flex items-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
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
