"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { loginUser } from "@/lib/actions/auth.actions";
import { useRouter } from "next/navigation";
import { createEctdStructureForUser } from "@/lib/actions/folder.actions";

interface OTPModalProps {
  accountId: string;
  email: string;
  password: string; // Password for backend login after OTP verification
}

const OTPModal = ({ accountId, email, password }: OTPModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    if (otp.length !== 6) return; // Don't submit if OTP is incomplete

    console.log("[OTP Modal] Starting OTP verification", {
      accountId,
      email,
      otpLength: otp.length,
    });

    setIsLoading(true);

    try {
      setIsSettingUp(true);

      // 1. Verify OTP (now fast, no folder creation)
      const sessionId = await verifySecret({ accountId, password: otp });

      if (sessionId) {
        // 2. Create folder structure (modal stays open with 2-min warning)
        await createEctdStructureForUser({ path: "/documents" });

        // 3. Backend login
        try {
          await loginUser({ email, password });
        } catch (error) {
          console.log("Backend login:", error);
        }

        // 4. Redirect
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      setIsSettingUp(false);
    }

    setIsLoading(false);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && otp.length === 6 && !isLoading) {
      handleSubmit(e);
    }
  };

  const handleResendOTP = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={isSettingUp ? undefined : setIsOpen}
    >
      <AlertDialogContent className="shad-alert-dialog">
        {isSettingUp ? (
          // Setting up account view
          <div className="flex flex-col items-center justify-center py-8 gap-6">
            <div className="relative">
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={50}
                height={50}
                className="animate-spin invert"
              />
            </div>
            <div className="text-center space-y-2">
              <h3 className="h3 text-light-100">Setting up your account</h3>
              <p className="subtitle-2 text-light-100/70">
                This may take up to 2 minutes depending on your internet
                connection.
              </p>
              <p className="text-sm text-light-100/50 mt-4">
                Please don&apos;t close this window...
              </p>
            </div>
          </div>
        ) : (
          // OTP input view
          <>
            <AlertDialogHeader className="relative flex justify-center">
              <AlertDialogTitle className="h2 text-center">
                Enter your OTP{" "}
                <Image
                  src="/assets/icons/close-dark.svg"
                  alt="close"
                  width={20}
                  height={20}
                  onClick={() => setIsOpen(false)}
                  className="otp-close-button"
                />
              </AlertDialogTitle>
              <AlertDialogDescription className="subtitle-2 text-center text-light-100">
                We&apos;ve sent a 6-digit code to{" "}
                <span className="pl-1 text-brand">{email}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              onKeyDown={handleKeyDown}
              autoFocus
            >
              <InputOTPGroup className="shad-otp">
                <InputOTPSlot index={0} className="shad-otp-slot" />
                <InputOTPSlot index={1} className="shad-otp-slot" />
                <InputOTPSlot index={2} className="shad-otp-slot" />
                <InputOTPSlot index={3} className="shad-otp-slot" />
                <InputOTPSlot index={4} className="shad-otp-slot" />
                <InputOTPSlot index={5} className="shad-otp-slot" />
              </InputOTPGroup>
            </InputOTP>

            <AlertDialogFooter>
              <div className="flex w-full flex-col gap-4">
                <AlertDialogAction
                  className="shad-submit-btn h-12 text-white"
                  type="button"
                  onClick={handleSubmit}
                >
                  Verify your email
                  {isLoading && (
                    <Image
                      src="/assets/icons/loader.svg"
                      alt="loader"
                      width={24}
                      height={24}
                      className="ml-2 animate-spin"
                    />
                  )}
                </AlertDialogAction>

                <div className="subtitle-2 mt-2 text-center text-light-100">
                  Didn&apos;t get a code?
                  <Button
                    type="button"
                    variant="link"
                    className="pl-1 text-brand"
                    onClick={handleResendOTP}
                  >
                    Resend code
                  </Button>
                </div>
              </div>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
