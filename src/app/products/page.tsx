import { getAllProducts } from "@/lib/db/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import Link from "next/link";
export default async function Home() {
  const products = await getAllProducts();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product: any) => (
          <Card key={product.ProductID}>
            <CardHeader>
              <CardTitle>
                <Link href={`/product/${product.ProductID}`}>{product.ProductName}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Id: {product.ProductID}</p>
              <p>Price: ${product.UnitPrice}</p>
              <p>In Stock: {product.UnitsInStock}</p>
              
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
