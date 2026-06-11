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
import { getMessage } from '@/shared/i18n';
import { useAuth } from '@/modules/auth/context/auth.context';
import {
  deleteProduct,
  fetchProductsPage,
  formatProductPrice,
  getApiErrorMessages,
  type ProductListItem,
} from '@/modules/catalog/services/product.service';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';

const PER_PAGE = 10;

function getStatusLabel(status: ProductListItem['status']): string {
  return getMessage(`product.status.${status}`);
}

export function ProductsListComponent() {
  const router = useRouter();
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const loadPage = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await fetchProductsPage(token, page, PER_PAGE);
      setItems(result.items);
      setTotal(result.total);
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      if (apiError.errors) {
        for (const message of getApiErrorMessages(apiError)) {
          toast.error(message);
        }
      } else {
        toast.error('Não foi possível carregar os produtos.');
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
      await deleteProduct(token, deleteTarget.id);
      toast.success('Produto excluído com sucesso.');
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
        toast.error('Não foi possível excluir o produto.');
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <TableCard
        title="Produtos"
        subtitle="Gerencie o catálogo de produtos da aplicação."
        headerAside={
          <Button asChild>
            <Link href="/catalog/products/new">
              <Plus className="size-4" />
              Novo produto
            </Link>
          </Button>
        }
        footer={
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={total}
            totalLabel="produtos"
            onPageChange={setPage}
            disabled={isLoading}
          />
        }
      >
        {isLoading ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">Carregando produtos...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10">
            <EmptyListState
              title="Nenhum produto encontrado"
              subtitle="Cadastre o primeiro produto para começar."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{formatProductPrice(product.price)}</TableCell>
                  <TableCell>{getStatusLabel(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => router.push(`/catalog/products/${product.id}/edit`)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Excluir ${product.name}`}
                        onClick={() => setDeleteTarget(product)}
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
        title="Excluir produto"
        description="Esta ação remove o produto selecionado de forma permanente."
        itemLabel="Produto"
        itemValue={deleteTarget?.name}
        isConfirming={isDeleting}
      />
    </>
  );
}
