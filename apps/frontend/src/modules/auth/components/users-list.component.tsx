'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { EmptyListState } from '@/shared/components/ui/empty-list-state';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { TableCard } from '@/shared/components/ui/table-card';
import { useAuth } from '@/modules/auth/context/auth.context';
import {
  deleteUser,
  fetchUsersPage,
  getApiErrorMessages,
  type UserListItem,
} from '@/modules/auth/services/user.service';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';

const PER_PAGE = 10;

export function UsersListComponent() {
  const router = useRouter();
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const loadPage = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchUsersPage(token, page, PER_PAGE);
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.errors) {
        for (const message of getApiErrorMessages(apiError)) {
          toast.error(message);
        }
      } else {
        toast.error('Não foi possível carregar os usuários.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, token]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await deleteUser(token, deleteTarget.id);
      toast.success('Usuário excluído com sucesso.');
      setDeleteTarget(null);

      if (items.length === 1 && page > 1) {
        setPage((current) => current - 1);
        return;
      }

      await loadPage();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.errors) {
        for (const message of getApiErrorMessages(apiError)) {
          toast.error(message);
        }
      } else {
        toast.error('Não foi possível excluir o usuário.');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <TableCard
        title="Usuários"
        subtitle="Gerencie os usuários cadastrados na aplicação."
        headerAside={
          <Button asChild>
            <Link href="/auth/users/new">
              <Plus className="size-4" />
              Novo usuário
            </Link>
          </Button>
        }
        footer={
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={total}
            totalLabel="usuários"
            onPageChange={setPage}
            disabled={isLoading}
          />
        }
      >
        {isLoading ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">Carregando usuários...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10">
            <EmptyListState
              title="Nenhum usuário encontrado"
              subtitle="Cadastre o primeiro usuário para começar."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Editar ${user.name}`}
                        onClick={() => router.push(`/auth/users/${user.id}/edit`)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Excluir ${user.name}`}
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <DeleteConfirmationDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
        title="Excluir usuário"
        description="Esta ação remove o usuário selecionado de forma permanente."
        itemLabel="Usuário"
        itemValue={deleteTarget?.name}
        isConfirming={isDeleting}
      />
    </>
  );
}
