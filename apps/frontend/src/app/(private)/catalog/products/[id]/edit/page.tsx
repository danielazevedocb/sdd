import ProductFormPage from '@/modules/catalog/pages/product-form.page';

type EditProductRoutePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductRoutePage({ params }: EditProductRoutePageProps) {
  const { id } = await params;
  return <ProductFormPage productId={id} />;
}
