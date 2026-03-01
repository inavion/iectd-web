import AuthForm from "@/components/auth/AuthForm";
import { redirect } from "next/navigation";
import React from "react";

const SignUp = () => redirect("/sign-in");

export default SignUp;
