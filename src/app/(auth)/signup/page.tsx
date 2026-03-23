import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a WhatHome account to save projects and searches.",
};

export default function SignupPage() {
  return <AuthForm defaultMode="signup" />;
}
