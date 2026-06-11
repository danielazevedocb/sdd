'use client';

import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { getMessage } from '@/shared/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ProductStatus = 'active' | 'inactive' | 'draft';

export type ProductListItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
};

export type ProductPageResult = {
  items: ProductListItem[];
  page: number;
  perPage: number;
  total: number;
};

type RequestOptions = {
  method?: string;
  token: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorBody = (await response.json()) as ApiErrorResponse;
    throw errorBody;
  }

  if (response.status === 201) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function fetchProductsPage(
  token: string | null,
  page: number,
  perPage: number,
): Promise<ProductPageResult> {
  return request<ProductPageResult>(`/products?page=${page}&perPage=${perPage}`, { token });
}

export async function fetchProductById(token: string | null, id: string): Promise<ProductListItem> {
  return request<ProductListItem>(`/products/${id}`, { token });
}

export async function createProduct(
  token: string | null,
  body: {
    name: string;
    description?: string | null;
    price: number;
    status: ProductStatus;
    availableOnline?: boolean;
    featured?: boolean;
    allowsPreOrder?: boolean;
  },
): Promise<void> {
  await request<void>('/products', { method: 'POST', token, body });
}

export async function updateProduct(
  token: string | null,
  id: string,
  body: {
    name: string;
    description?: string | null;
    price: number;
    status: ProductStatus;
    availableOnline?: boolean;
    featured?: boolean;
    allowsPreOrder?: boolean;
  },
): Promise<void> {
  await request<void>(`/products/${id}`, { method: 'PUT', token, body });
}

export async function deleteProduct(token: string | null, id: string): Promise<void> {
  await request<void>(`/products/${id}`, { method: 'DELETE', token });
}

export function getApiErrorMessages(error: ApiErrorResponse): string[] {
  return error.errors.map((code) => getMessage(code));
}

export function formatProductPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}
