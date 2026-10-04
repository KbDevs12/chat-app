"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/error";
import { request } from "@/lib/client";
import { RegisterSchema } from "@/lib/validations/register.schema";

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(values: RegisterValues) {
    const promise = request<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(values),
    });

    toast.promise(promise, {
      loading: "Registering account...",
      success: (res: { message: string }) => res.message,
      error: (err: unknown) =>
        err instanceof ApiError ? err.message : "Something went wrong.",
      dismissible: true,
    });

    try {
      await promise;
      router.push("/login");
    } catch (err) {
      if (!(err instanceof ApiError)) return;

      if (err.details) {
        for (const [field, messages] of Object.entries(err.details)) {
          if (field === "email" || field === "password") {
            setError(field, { message: messages[0] });
          }
        }
      } else if (err.code === "CONFLICT") {
        setError("email", { message: err.message });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
