import type { Metadata } from "next";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your WhatHome account to access saved projects and searches.",
};

export default function LoginPage() {
  return <AuthForm />;
}
