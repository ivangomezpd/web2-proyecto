import { getProduct } from "@/lib/db/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Cantidad from "@/components/app/Cantidad";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ProductPage({ params, searchParams }:
         { params: { productId: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const product = await getProduct(params.productId);
  const cantidad = searchParams &&  searchParams.cantidad ? parseInt(searchParams.cantidad as string) : 0;
  

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Producto no encontrado</h1>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Productos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Productos
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagen del producto */}
        <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
          <div className="text-8xl text-gray-400 font-bold">
            {product.ProductName.charAt(0).toUpperCase()}
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.ProductName}</h1>
            {product.CategoryName && (
              <Badge variant="secondary" className="text-sm">
                {product.CategoryName}
              </Badge>
            )}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Precio:</span>
                  <span className="text-3xl font-bold text-green-600">
                    ${parseFloat(product.UnitPrice).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-700">Stock disponible:</span>
                  <span className={`text-lg font-semibold ${
                    product.UnitsInStock > 10 
                      ? 'text-green-600' 
                      : product.UnitsInStock > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                  }`}>
                    {product.UnitsInStock} unidades
                  </span>
                </div>
                
                {product.Discontinued === 1 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <Badge variant="destructive" className="mb-2">
                      Producto Descontinuado
                    </Badge>
                    <p className="text-sm text-red-700">
                      Este producto ya no está disponible para nuevas órdenes.
                    </p>
                  </div>
                )}
                
                {product.UnitsInStock === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-700">
                      Este producto está agotado temporalmente.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">ID del Producto:</span>
                  <p className="text-gray-900">{product.ProductID}</p>
                </div>
                {product.QuantityPerUnit && (
                  <div>
                    <span className="font-medium text-gray-600">Cantidad por Unidad:</span>
                    <p className="text-gray-900">{product.QuantityPerUnit}</p>
                  </div>
                )}
                {product.ReorderLevel && (
                  <div>
                    <span className="font-medium text-gray-600">Nivel de Reorden:</span>
                    <p className="text-gray-900">{product.ReorderLevel}</p>
                  </div>
                )}
                {product.SupplierID && (
                  <div>
                    <span className="font-medium text-gray-600">Proveedor ID:</span>
                    <p className="text-gray-900">{product.SupplierID}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Componente de cantidad */}
          {product.UnitsInStock > 0 && product.Discontinued !== 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Añadir al Carrito</CardTitle>
              </CardHeader>
              <CardContent>
                <Cantidad productoId={product.ProductID} cantidad={cantidad} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
