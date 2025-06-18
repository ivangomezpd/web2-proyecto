import { getAllProducts, getAllCategories, getProductsByCategoryPaginated } from "@/lib/db/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductSidebar from "@/components/app/ProductSidebar";
import Pagination from "@/components/app/Pagination";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category = 'all', search = '', page = '1' } = searchParams;
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = 10;
  
  // Fetch categories and products based on filters with pagination
  const [categories, productsData] = await Promise.all([
    getAllCategories(),
    getProductsByCategoryPaginated(category, search, currentPage, itemsPerPage)
  ]);

  const { products, pagination } = productsData;
  const selectedCategory = category;
  const searchQuery = search;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Nuestros Productos</h1>
        <p className="text-lg text-gray-600">
          {searchQuery 
            ? `Buscando "${searchQuery}"` 
            : selectedCategory !== 'all' 
              ? `Categoría: ${categories.find((c: any) => c.CategoryID.toString() === selectedCategory)?.CategoryName}`
              : 'Descubre nuestra amplia selección de productos de calidad'
          }
        </p>
        {pagination.totalItems > 0 && (
          <div className="text-sm text-gray-500 mt-2 space-y-1">
            <p>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.totalItems)} de {pagination.totalItems} productos
            </p>
            <p>
              Página {currentPage} de {pagination.totalPages}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <ProductSidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No se encontraron productos
              </h2>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? `No hay productos que coincidan con "${searchQuery}"`
                  : 'No hay productos en esta categoría'
                }
              </p>
              <Link 
                href="/products"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card key={product.ProductID} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-6xl text-gray-400 font-bold">
                        {product.ProductName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          <Link 
                            href={`/product/${product.ProductID}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {product.ProductName}
                          </Link>
                        </CardTitle>
                      </div>
                      {product.CategoryName && (
                        <Badge variant="secondary" className="w-fit">
                          {product.CategoryName}
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Precio:</span>
                          <span className="text-lg font-bold text-green-600">
                            ${parseFloat(product.UnitPrice).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stock:</span>
                          <span className={`text-sm font-medium ${
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
                          <Badge variant="destructive" className="w-fit">
                            Descontinuado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Link 
                          href={`/product/${product.ProductID}`}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
                        >
                          Ver Detalles
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Toggle (for future implementation) */}
      <div className="lg:hidden mt-8 text-center">
        <p className="text-sm text-gray-500">
          Usa los filtros en la versión de escritorio para una mejor experiencia
        </p>
      </div>
    </div>
  );
}
