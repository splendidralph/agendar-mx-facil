import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainCategory, Subcategory } from '@/types/category';

export const useCategories = () => {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Fetch main categories
        const { data: mainCategoriesData, error: mainCategoriesError } = await supabase
          .from('main_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (mainCategoriesError) throw mainCategoriesError;

        // Fetch subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (subcategoriesError) throw subcategoriesError;

        setMainCategories(mainCategoriesData || []);
        setSubcategories(subcategoriesData || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getSubcategoriesByMainCategory = (mainCategoryId: string): Subcategory[] => {
    return subcategories.filter(sub => sub.main_category_id === mainCategoryId);
  };

  const getMainCategoryById = (id: string): MainCategory | undefined => {
    return mainCategories.find(cat => cat.id === id);
  };

  const getSubcategoryById = (id: string): Subcategory | undefined => {
    return subcategories.find(sub => sub.id === id);
  };

  return {
    mainCategories,
    subcategories,
    loading,
    error,
    getSubcategoriesByMainCategory,
    getMainCategoryById,
    getSubcategoryById
  };
};