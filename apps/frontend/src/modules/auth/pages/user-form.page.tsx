import { UserFormComponent } from '@/modules/auth/components/user-form.component';

type UserFormPageProps = {
  userId?: string;
};

export default function UserFormPage({ userId }: UserFormPageProps) {
  return <UserFormComponent userId={userId} />;
}
