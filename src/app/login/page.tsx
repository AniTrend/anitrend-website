import { AppHeader } from "@/components/header";
import { AppFooter } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/20">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Sign In</CardTitle>
            <CardDescription>Use the AniTrend app to sign in and manage your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <Button asChild className="w-full" size="lg">
                <Link href="anitrend://login">
                    <Smartphone className="mr-2 h-5 w-5"/> Sign in with AniTrend App
                </Link>
              </Button>
               <p className="text-sm text-muted-foreground">
                Don&apos;t have the app?{" "}
                <Link href="/#get-the-app" className="underline">
                    Download it now
                </Link>.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
