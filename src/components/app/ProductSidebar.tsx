'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface Category {
  CategoryID: number;
  CategoryName: string;
  Description: string;
  ProductCount: number;
}

interface ProductSidebarProps {
  categories: Category[];
  selectedCategory?: string;
  searchQuery?: string;
}

export default function ProductSidebar({ 
  categories, 
  selectedCategory = 'all',
  searchQuery = ''
}: ProductSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        updateFilters(selectedCategory, localSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery, selectedCategory, searchQuery]);

  const updateFilters = (category: string, search: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    
    if (search && search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    updateFilters(categoryId, localSearchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(selectedCategory, localSearchQuery);
  };

  const clearFilters = () => {
    setLocalSearchQuery('');
    router.push('/products');
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery;

  return (
    <div className="w-80 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Filtros</h2>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Buscar Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="w-full"
              disabled={isSearching}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Categorías
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* All Categories */}
            <button
              onClick={() => handleCategoryClick('all')}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Todas las categorías</span>
                <Badge variant="secondary" className="text-xs">
                  {categories.reduce((sum, cat) => sum + cat.ProductCount, 0)}
                </Badge>
              </div>
            </button>

            {/* Individual Categories */}
            {categories.map((category) => (
              <button
                key={category.CategoryID}
                onClick={() => handleCategoryClick(category.CategoryID.toString())}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCategory === category.CategoryID.toString()
                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{category.CategoryName}</div>
                    {category.Description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {category.Description}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                    {category.ProductCount}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Filtros Activos:</h3>
            <div className="space-y-1">
              {selectedCategory !== 'all' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Categoría:</span>
                  <Badge variant="outline" className="text-xs">
                    {categories.find(c => c.CategoryID.toString() === selectedCategory)?.CategoryName}
                  </Badge>
                </div>
              )}
              {searchQuery && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Búsqueda:</span>
                  <Badge variant="outline" className="text-xs">
                    "{searchQuery}"
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 