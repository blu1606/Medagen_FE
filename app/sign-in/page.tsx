import { LightLogin } from "@/components/ui/sign-in";
import { Suspense } from "react";

export default function SignInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LightLogin />
        </Suspense>
    );
}
