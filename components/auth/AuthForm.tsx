"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import { registerUser, loginUser } from "@/lib/actions/auth.actions";
import OTPModal from "./OTPModal";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName:
      formType === "sign-up"
        ? z.string().min(2, "Full name must be at least 2 characters")
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [pendingPassword, setPendingPassword] = useState("");

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Store password for use after OTP verification
      setPendingPassword(values.password);

      if (type === "sign-up") {
        // 1. Register with new backend API (creates user with password)
        try {
          await registerUser({
            email: values.email,
            password: values.password,
            fullName: values.fullName || "",
          });
        } catch (error) {
          // If user already exists in new backend, continue with Appwrite
          console.log("Backend registration:", error);
        }

        // 2. Create account with Appwrite (sends OTP)
        const result = await createAccount({
          fullName: values.fullName || "",
          email: values.email,
        });

        // Check for error in response
        if ("error" in result) {
          setErrorMessage(result.error);
          return;
        }

        setAccountId(result.accountId);
      } else {
        // Sign in flow
        // 1. Sign in with Appwrite (sends OTP)
        const result = await signInUser({ email: values.email });

        if (result?.accountId) {
          setAccountId(result.accountId);
        } else {
          setErrorMessage(result?.error || "User not found. Please sign up first.");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to authenticate";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title h1">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>

          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label body-2">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="shad-input body-2 shad-no-focus"
                        autoFocus
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message body-2" />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label body-2">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                      className="shad-input body-2 shad-no-focus"
                      autoFocus={type === "sign-in"}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message body-2" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label body-2">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your password"
                      type="password"
                      {...field}
                      className="shad-input body-2 shad-no-focus"
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message body-2" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="form-submit-button primary-btn text-white"
            disabled={isLoading}
          >
            {type === "sign-in" ? "Sign In" : "Sign Up"}
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>

          {errorMessage && (
            <p className="error-message body-2">* {errorMessage}</p>
          )}

          {/* Temporarily disabled sign-up option */}
          {/* <div className="body-2 flex justify-center">
            {type === "sign-in" ? (
              <>
                <p className="text-light-100">Don&apos;t have an account?</p>
                <Link href="/sign-up" className="ml-1 font-medium text-brand">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <p className="text-light-100">Already have an account?</p>
                <Link href="/sign-in" className="ml-1 font-medium text-brand">
                  Sign In
                </Link>
              </>
            )}
          </div> */}
        </form>
      </Form>

      {/* OTP Modal - also handles backend login after OTP verification */}
      {accountId && (
        <OTPModal
          email={form.getValues("email")}
          accountId={accountId}
          password={pendingPassword}
        />
      )}
    </>
  );
};

export default AuthForm;
