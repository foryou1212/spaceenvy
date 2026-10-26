"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/auth-actions";

const initialState: LoginState = { message: "", success: false };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form className="login-form" action={action}>
      <label>
        Email address
        <input
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          maxLength={254}
          required
        />
      </label>
      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          maxLength={256}
          required
        />
      </label>
      {state.message ? (
        <p className="form-message form-message--error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="button button--full" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
