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
import type { User } from "@/lib/types";
import { LoginSchema } from "@/lib/validations/login.schema";

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(values: LoginValues) {
    const promise = request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });

    toast.promise(promise, {
      dismissible: true,
      loading: "Log in...",
      success: "Successful login.",
      error: (err) =>
        err instanceof ApiError ? err.message : "Something went wrong.",
    });

    try {
      await promise;
      router.replace("/chat");
      router.refresh();
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.code === "VALIDATION_ERROR" &&
        err.details
      ) {
        for (const [field, messages] of Object.entries(err.details)) {
          if (field === "email" || field === "password") {
            setError(field, { message: messages[0] });
          }
        }
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
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
