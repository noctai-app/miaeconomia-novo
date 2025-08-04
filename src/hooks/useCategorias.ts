import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Categoria {
  id: string;
  user_id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (categoria: Omit<Categoria, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .insert([{
          ...categoria,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      setCategorias(prev => [...prev, data]);
      
      toast({
        title: "Categoria criada",
        description: "Categoria criada com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCategoria = async (id: string, updates: Partial<Categoria>) => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCategorias(prev => prev.map(cat => cat.id === id ? data : cat));
      
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!",
      });
      
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar categoria",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategorias(prev => prev.filter(cat => cat.id !== id));
      
      toast({
        title: "Categoria removida",
        description: "Categoria removida com sucesso!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover categoria",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Nova função para importar categorias padrão
  const importarCategoriasPadrao = async () => {
    type CategoriaPadrao = { nome: string; tipo: "receita" | "despesa"; cor: string; icone: string; };
    const categoriasPadrao: CategoriaPadrao[] = [
      // Receitas
      { nome: 'Salário', tipo: 'receita', cor: '#10B981', icone: 'DollarSign' },
      { nome: 'Outras receitas', tipo: 'receita', cor: '#3B82F6', icone: 'Briefcase' },
      { nome: 'Investimentos', tipo: 'receita', cor: '#8B5CF6', icone: 'TrendingUp' },
      { nome: 'Vendas', tipo: 'receita', cor: '#F59E0B', icone: 'ShoppingBag' },
      { nome: 'Aluguel Recebido', tipo: 'receita', cor: '#059669', icone: 'Home' },
      // Despesas
      { nome: 'Alimentação', tipo: 'despesa', cor: '#EF4444', icone: 'Utensils' },
      { nome: 'Transporte', tipo: 'despesa', cor: '#F97316', icone: 'Car' },
      { nome: 'Moradia', tipo: 'despesa', cor: '#6366F1', icone: 'Home' },
      { nome: 'Saúde', tipo: 'despesa', cor: '#EC4899', icone: 'Heart' },
      { nome: 'Educação', tipo: 'despesa', cor: '#14B8A6', icone: 'BookOpen' },
      { nome: 'Lazer', tipo: 'despesa', cor: '#8B5CF6', icone: 'Gamepad2' },
      { nome: 'Roupas', tipo: 'despesa', cor: '#F59E0B', icone: 'Shirt' },
      { nome: 'Tecnologia', tipo: 'despesa', cor: '#6B7280', icone: 'Smartphone' },
      { nome: 'Outras despesas', tipo: 'despesa', cor: '#84CC16', icone: 'DollarSign' },
    ];

    try {
      for (const categoria of categoriasPadrao) {
        await createCategoria(categoria);
      }
      toast({
        title: "Sucesso!",
        description: "Categorias padrão importadas com sucesso.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao importar categorias padrão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar as categorias padrão. Tente novamente.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const checkHasCategorias = async (): Promise<boolean> => {
    try {
      const { data, error, count } = await supabase
        .from('categorias')
        .select('id', { count: 'exact' })
        .limit(1);

      if (error) throw error;
      return count !== null && count > 0;
    } catch (error: any) {
      console.error("Erro ao verificar categorias existentes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar se há categorias existentes.",
        variant: "destructive",
      });
      return false;
    }
  };


  useEffect(() => {
    fetchCategorias();
  }, []);

  // Filtros para compatibilidade com componentes existentes
  const categoriasReceita = categorias.filter(c => c.tipo === 'receita');
  const categoriasDespesa = categorias.filter(c => c.tipo === 'despesa');

  return {
    categorias,
    categoriasReceita,
    categoriasDespesa,
    loading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    importarCategoriasPadrao, // Adiciona a nova função ao retorno do hook
    checkHasCategorias, // Adiciona a nova função ao retorno do hook
    refetch: fetchCategorias
  };
};
