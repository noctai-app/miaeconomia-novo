import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MetaForm {
  titulo: string;
  tipo: 'economia' | 'receita' | 'despesa' | 'investimento';
  valor_alvo: number;
  valor_atual: number;
  data_inicio: string;
  data_limite: string;
  status: 'ativa' | 'concluida' | 'pausada' | 'vencida';
  categoria_meta_id?: string;
  descricao?: string;
}

interface CategoriaMeta {
  id: string;
  nome: string;
  cor: string;
  descricao: string;
  ativa: boolean;
}

interface NovaMetaModalProps {
  onAdicionarMeta: (meta: MetaForm) => void;
  categoriasMetas: CategoriaMeta[];
  // Adicionar esta nova prop para criar categorias
  onCriarCategoria?: (categoria: { nome: string; cor: string; descricao: string; ativa: boolean }) => Promise<void>;
}

export const NovaMetaModal = ({ onAdicionarMeta, categoriasMetas, onCriarCategoria }: NovaMetaModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'economia' as const,
    valorAlvo: '',
    valorAtual: '',
    dataInicio: '',
    dataLimite: '',
    categoriaId: '',
    descricao: ''
  });
  const [importandoCategorias, setImportandoCategorias] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.valorAlvo || !formData.dataLimite || !formData.categoriaId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const novaMeta: MetaForm = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      valor_alvo: Number(formData.valorAlvo),
      valor_atual: Number(formData.valorAtual) || 0,
      data_inicio: formData.dataInicio || new Date().toISOString().split('T')[0],
      data_limite: formData.dataLimite,
      status: 'ativa',
      categoria_meta_id: formData.categoriaId,
      descricao: formData.descricao
    };

    onAdicionarMeta(novaMeta);
    
    // Resetar formulário
    setFormData({
      titulo: '',
      tipo: 'economia',
      valorAlvo: '',
      valorAtual: '',
      dataInicio: '',
      dataLimite: '',
      categoriaId: '',
      descricao: ''
    });
    
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para importar categorias padrão
  const handleImportarCategoriasPadrao = async () => {
    if (!onCriarCategoria) {
      toast({
        title: "Erro",
        description: "Função de criar categoria não disponível.",
        variant: "destructive"
      });
      return;
    }

    setImportandoCategorias(true);

    const categoriasPadrao = [
      { nome: 'Emergência', cor: '#EF4444', descricao: 'Reserva para emergências e imprevistos' },
      { nome: 'Viagem', cor: '#3B82F6', descricao: 'Economias para viagens e férias' },
      { nome: 'Investimentos', cor: '#10B981', descricao: 'Aportes em investimentos' },
      { nome: 'Casa Própria', cor: '#F59E0B', descricao: 'Economia para compra da casa própria' },
      { nome: 'Compras', cor: '#8B5CF6', descricao: 'Objetivo de comprar' },
    ];

    try {
      for (const categoria of categoriasPadrao) {
        await onCriarCategoria({ ...categoria, ativa: true });
      }
      toast({
        title: "Sucesso!",
        description: "Categorias padrão importadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao importar categorias padrão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar as categorias padrão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setImportandoCategorias(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Meta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Meta *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Ex: Reserva de emergência"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoria">Categoria *</Label>
                {/* Botão para importar categorias padrão */}
                {onCriarCategoria && categoriasMetas.length === 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleImportarCategoriasPadrao}
                    disabled={importandoCategorias}
                    className="bg-purple-500 hover:bg-purple-600 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    {importandoCategorias ? 'Importando...' : 'Importar Categorias Padrão'}
                  </Button>
                )}
              </div>
              <select
                id="categoria"
                value={formData.categoriaId}
                onChange={(e) => handleInputChange('categoriaId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categoriasMetas.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Meta</Label>
            <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economia">Economia</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Redução de Despesa</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorAlvo">Valor Alvo (R$) *</Label>
              <Input
                id="valorAlvo"
                type="number"
                min="0"
                step="0.01"
                value={formData.valorAlvo}
                onChange={(e) => handleInputChange('valorAlvo', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorAtual">Valor Atual (R$)</Label>
              <Input
                id="valorAtual"
                type="number"
                min="0"
                step="0.01"
                value={formData.valorAtual}
                onChange={(e) => handleInputChange('valorAtual', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataLimite">Data Limite *</Label>
              <Input
                id="dataLimite"
                type="date"
                value={formData.dataLimite}
                onChange={(e) => handleInputChange('dataLimite', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Descreva sua meta..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600">
              Criar Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};