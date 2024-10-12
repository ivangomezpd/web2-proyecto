import { getProduct } from "@/lib/db/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Cantidad from "@/components/app/Cantidad";



export default async function ProductPage({ params, searchParams }:
         { params: { productId: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const product = await getProduct(params.productId);
  const cantidad = searchParams &&  searchParams.cantidad ? parseInt(searchParams.cantidad as string) : 0;
  

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{product.ProductName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>ID: {product.ProductID}</p>
          <p>Precio: ${product.UnitPrice}</p>
          <p>En Stock: {product.UnitsInStock}</p>
          <Cantidad productoId={product.ProductID} cantidad={cantidad} />
        </CardContent>
      </Card>
    </div>
  );
}
