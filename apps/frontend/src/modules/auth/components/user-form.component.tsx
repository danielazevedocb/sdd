'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import { useAuth } from '@/modules/auth/context/auth.context';
import {
  createUser,
  fetchUserById,
  getApiErrorMessages,
  updateUser,
} from '@/modules/auth/services/user.service';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';

type UserFormComponentProps = {
  userId?: string;
};

export function UserFormComponent({ userId }: UserFormComponentProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEditing = Boolean(userId);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!userId) return;

    async function loadUser() {
      setIsLoading(true);

      try {
        const user = await fetchUserById(token, userId!);
        setName(user.name);
        setEmail(user.email);
      } catch (error) {
        const apiError = error as ApiErrorResponse;
        if (apiError.errors) {
          for (const message of getApiErrorMessages(apiError)) {
            toast.error(message);
          }
        } else {
          toast.error(getMessage('user.not_found'));
        }
        router.push('/auth/users');
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [router, token, userId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isEditing && password !== confirmPassword) {
      toast.error(getMessage('user.password.confirmation.mismatch'));
      return;
    }

    if (isEditing && password && password !== confirmPassword) {
      toast.error(getMessage('user.password.confirmation.mismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && userId) {
        const body: { name: string; email: string; password?: string } = { name, email };
        if (password.trim() !== '') {
          body.password = password;
        }
        await updateUser(token, userId, body);
        toast.success('Usuário atualizado com sucesso.');
      } else {
        await createUser(token, { name, email, password });
        toast.success('Usuário criado com sucesso.');
      }

      router.push('/auth/users');
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.errors) {
        for (const message of getApiErrorMessages(apiError)) {
          toast.error(message);
        }
      } else {
        toast.error(getMessage('DEFAULT_API_ERROR'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando usuário...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <FormSectionLayout title="Dados básicos" description="Informações principais do usuário.">
        <div className="space-y-2">
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">E-mail</Label>
          <Input
            id="user-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Senha"
        description={
          isEditing
            ? 'Deixe em branco para manter a senha atual.'
            : 'Defina uma senha forte para o novo usuário.'
        }
        showDivider={false}
      >
        <div className="space-y-2">
          <Label htmlFor="user-password">Senha</Label>
          <Input
            id="user-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-confirm-password">Confirmar senha</Label>
          <Input
            id="user-confirm-password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required={!isEditing}
          />
        </div>
      </FormSectionLayout>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar usuário'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/auth/users">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
