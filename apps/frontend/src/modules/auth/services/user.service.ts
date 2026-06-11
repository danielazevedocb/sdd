'use client';

import type { ApiErrorResponse } from '@/shared/types/api-error.type';
import { getMessage } from '@/shared/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserListItem = {
  id: string;
  name: string;
  email: string;
};

export type UserPageResult = {
  items: UserListItem[];
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

export async function fetchUsersPage(
  token: string | null,
  page: number,
  perPage: number,
): Promise<UserPageResult> {
  return request<UserPageResult>(`/users?page=${page}&perPage=${perPage}`, { token });
}

export async function fetchUserById(token: string | null, id: string): Promise<UserListItem> {
  return request<UserListItem>(`/users/${id}`, { token });
}

export async function createUser(
  token: string | null,
  body: { name: string; email: string; password: string },
): Promise<void> {
  await request<void>('/users', { method: 'POST', token, body });
}

export async function updateUser(
  token: string | null,
  id: string,
  body: { name: string; email: string; password?: string },
): Promise<void> {
  await request<void>(`/users/${id}`, { method: 'PUT', token, body });
}

export async function deleteUser(token: string | null, id: string): Promise<void> {
  await request<void>(`/users/${id}`, { method: 'DELETE', token });
}

export function getApiErrorMessages(error: ApiErrorResponse): string[] {
  return error.errors.map((code) => getMessage(code));
}
