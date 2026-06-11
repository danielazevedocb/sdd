import { ProductFormComponent } from '@/modules/catalog/components/product-form.component';

type ProductFormPageProps = {
  productId?: string;
};

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  return <ProductFormComponent productId={productId} />;
}
