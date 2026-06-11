import UserFormPage from '@/modules/auth/pages/user-form.page';

type EditUserRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserRoutePage({ params }: EditUserRoutePageProps) {
  const { id } = await params;

  return <UserFormPage userId={id} />;
}
