'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { getMessage } from '@/shared/i18n';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { useAuth } from '../context/auth.context';

type Mode = 'register' | 'login';

export default function AuthComponent() {
  const { status } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/example/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') return null;
  if (status === 'authenticated') return null;

  return (
    <div className="flex w-full flex-col gap-6">
      {mode === 'register' ? <RegisterForm /> : <LoginForm />}

      <button
        type="button"
        onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
        className="text-xs text-white/30 transition-colors hover:text-white/60"
      >
        {mode === 'register' ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
      </button>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const body = {
      email: data.get('email') as string,
      password: data.get('password') as string,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      if (response.ok) {
        const result = await response.json() as { token: string };
        login(result.token);
        router.push('/example/dashboard');
        return;
      }

      const errorBody: ApiErrorResponse = await response.json();
      for (const code of errorBody.errors) {
        toast.error(getMessage(code));
      }
    } catch {
      toast.error(getMessage('DEFAULT_API_ERROR'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="text-sm text-white/70">
          E-mail
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          placeholder="joao@exemplo.com"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-password" className="text-sm text-white/70">
          Senha
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-amber-400 font-bold text-black hover:bg-amber-300"
      >
        Entrar
      </Button>
    </form>
  );
}

function RegisterForm() {
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const body = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      password: data.get('password') as string,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      if (response.status === 201) {
        toast.success('Cadastro realizado com sucesso!');
        form.reset();
        return;
      }

      const errorBody: ApiErrorResponse = await response.json();
      for (const code of errorBody.errors) {
        toast.error(getMessage(code));
      }
    } catch {
      toast.error(getMessage('DEFAULT_API_ERROR'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm text-white/70">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="João da Silva"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm text-white/70">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="joao@exemplo.com"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm text-white/70">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-amber-400 font-bold text-black hover:bg-amber-300"
      >
        Criar conta
      </Button>
    </form>
  );
}
