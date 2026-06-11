'use client';

import { Layers } from 'lucide-react';
import AuthComponent from '@/modules/auth/components/auth.component';

export default function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <Layers className="size-7 text-amber-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight">Cadastro Base</h1>
            <p className="mt-1 text-sm text-white/50">Acesse ou crie sua conta</p>
          </div>
        </div>

        <AuthComponent />
      </div>
    </div>
  );
}
