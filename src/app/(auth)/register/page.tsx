import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisterForm from "./RegisterForm";

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-none">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Join the conversation and start chatting.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterForm />
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
