'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/class-name.util';
import { getMessage } from '@/shared/i18n';
import { useAuth } from '@/modules/auth/context/auth.context';
import {
  createProduct,
  fetchProductById,
  getApiErrorMessages,
  updateProduct,
  type ProductStatus,
} from '@/modules/catalog/services/product.service';
import type { ApiErrorResponse } from '@/shared/types/api-error.type';

const STATUS_OPTIONS: ProductStatus[] = ['active', 'inactive', 'draft'];

type ProductFormComponentProps = {
  productId?: string;
};

export function ProductFormComponent({ productId }: ProductFormComponentProps) {
  const router = useRouter();
  const { token } = useAuth();
  const isEditing = Boolean(productId);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [availableOnline, setAvailableOnline] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [allowsPreOrder, setAllowsPreOrder] = useState(false);

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      setIsLoading(true);

      try {
        const product = await fetchProductById(token, productId!);
        setName(product.name);
        setDescription(product.description ?? '');
        setPrice(String(product.price));
        setStatus(product.status);
        setAvailableOnline(product.availableOnline);
        setFeatured(product.featured);
        setAllowsPreOrder(product.allowsPreOrder);
      } catch (error) {
        const apiError = error as ApiErrorResponse;
        if (apiError.errors) {
          for (const message of getApiErrorMessages(apiError)) {
            toast.error(message);
          }
        } else {
          toast.error(getMessage('product.not_found'));
        }
        router.push('/catalog/products');
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [router, token, productId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice)) {
      toast.error(getMessage('product.price.required'));
      return;
    }

    const body = {
      name,
      description: description.trim() === '' ? null : description,
      price: parsedPrice,
      status,
      availableOnline,
      featured,
      allowsPreOrder,
    };

    setIsSubmitting(true);

    try {
      if (isEditing && productId) {
        await updateProduct(token, productId, body);
        toast.success('Produto atualizado com sucesso.');
      } else {
        await createProduct(token, body);
        toast.success('Produto criado com sucesso.');
      }

      router.push('/catalog/products');
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
    return <div className="text-sm text-muted-foreground">Carregando produto...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <FormSectionLayout title="Dados básicos" description="Informações principais do produto.">
        <div className="space-y-2">
          <Label htmlFor="product-name">Nome</Label>
          <Input
            id="product-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-description">Descrição</Label>
          <Input
            id="product-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout title="Preço e status" description="Valores comerciais e situação do produto.">
        <div className="space-y-2">
          <Label htmlFor="product-price">Preço</Label>
          <Input
            id="product-price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-status">Status</Label>
          <select
            id="product-status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getMessage(`product.status.${option}`)}
              </option>
            ))}
          </select>
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Disponibilidade"
        description="Opções de exposição e venda do produto."
        showDivider={false}
      >
        <div className="flex items-center gap-2">
          <Checkbox
            id="product-available-online"
            checked={availableOnline}
            onCheckedChange={(checked) => setAvailableOnline(checked === true)}
          />
          <Label htmlFor="product-available-online">Disponível online</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="product-featured"
            checked={featured}
            onCheckedChange={(checked) => setFeatured(checked === true)}
          />
          <Label htmlFor="product-featured">Destaque</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="product-allows-pre-order"
            checked={allowsPreOrder}
            onCheckedChange={(checked) => setAllowsPreOrder(checked === true)}
          />
          <Label htmlFor="product-allows-pre-order">Permite pré-venda</Label>
        </div>
      </FormSectionLayout>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/catalog/products">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
