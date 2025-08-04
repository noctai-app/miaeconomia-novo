import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  Utensils,
  TrendingUp as Investment,
  Car,
  AlertTriangle,
  Package,
  CreditCard,
  Download,
  CheckCircle,
  Calendar,
  Lightbulb,
  Target,
  PiggyBank,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransacoes } from "@/hooks/useTransacoes";
import { useItensMercado } from "@/hooks/useItensMercado";
import { useDividas } from "@/hooks/useDividas";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useManutencoesPendentes } from "@/hooks/useManutencoesPendentes";
import { useProfile } from "@/hooks/useProfile";
import { useCategorias } from "@/hooks/useCategorias";

// Função para formatar a data corretamente
const formatarData = (dataString: string) => {
  if (!dataString) return "";
  const [ano, mes, dia] = dataString.split("T")[0].split("-");
  return `${dia}/${mes}/${ano}`;
};

// Função para obter a data atual no formato do banco (YYYY-MM-DD)
const getDataAtual = () => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// Função para obter o primeiro dia da semana no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaSemana = () => {
  const now = new Date();
  const primeiroDiaSemana = new Date(now);
  primeiroDiaSemana.setDate(now.getDate() - now.getDay());
  return `${primeiroDiaSemana.getFullYear()}-${String(
    primeiroDiaSemana.getMonth() + 1
  ).padStart(2, "0")}-${String(primeiroDiaSemana.getDate()).padStart(2, "0")}`;
};

// Função para obter o primeiro dia do mês no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaMes = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
};

// Função para obter o primeiro dia do ano no formato do banco (YYYY-MM-DD)
const getPrimeiroDiaAno = () => {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
};

// Função para comparar datas no formato do banco (YYYY-MM-DD)
const compararDatas = (data1: string, data2: string) => {
  return data1.split("T")[0] === data2;
};

// Função para formatar o nome do mês
const formatarMes = (data: Date) => {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${meses[data.getMonth()]} de ${data.getFullYear()}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("mês");
  const [showImportModal, setShowImportModal] = useState(false);
  const [importandoCategorias, setImportandoCategorias] = useState(false);
  const [categoriasImportadas, setCategoriasImportadas] = useState(false);
  const [progressoImportacao, setProgressoImportacao] = useState(0);
  
  // Estados para período personalizado
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [periodoPersonalizado, setPeriodoPersonalizado] = useState<{inicio: string, fim: string} | null>(null);

  // Usar dados reais dos hooks
  const { transacoes, loading: loadingTransacoes } = useTransacoes();
  const { itensMercado, loading: loadingItens } = useItensMercado();
  const { dividas, loading: loadingDividas } = useDividas();
  const { veiculos, loading: loadingVeiculos } = useVeiculos();
  const { profile } = useProfile();
  const { checkHasCategorias, importarCategoriasPadrao } = useCategorias();

  // Usar apenas um veículo para as manutenções se existir
  const primeiroVeiculo = veiculos && veiculos.length > 0 ? veiculos[0] : null;

  // Função para aplicar período personalizado
  const aplicarPeriodoPersonalizado = () => {
    if (dataInicio && dataFim) {
      setPeriodoPersonalizado({ inicio: dataInicio, fim: dataFim });
      setSelectedPeriod("personalizado");
      setShowCustomDateModal(false);
    }
  };

  // Processar dados com useMemo para performance
  const processedData = useMemo(() => {
    if (loadingTransacoes || !transacoes.length) {
      return {
        transacoesFiltradas: [],
        totalReceitas: 0,
        totalDespesas: 0,
        saldoPeriodo: 0,
        percentualDespesas: 0,
        receitasPeriodoAnterior: 0,
        variacaoPercentualReceitas: 0,
        saldoPeriodoAnterior: 0,
        variacaoPercentualSaldo: 0,
        gastosPorCategoria: {},
      };
    }

    const hoje = getDataAtual();

    // Função para obter datas do período anterior
    const getPeriodoAnterior = () => {
      const now = new Date();
      switch (selectedPeriod) {
        case "dia": {
          const ontem = new Date(now);
          ontem.setDate(now.getDate() - 1);
          const dataOntem = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, "0")}-${String(ontem.getDate()).padStart(2, "0")}`;
          return { inicio: dataOntem, fim: dataOntem };
        }
        case "semana": {
          const inicioSemanaAtual = new Date(now);
          inicioSemanaAtual.setDate(now.getDate() - now.getDay());
          
          const inicioSemanaAnterior = new Date(inicioSemanaAtual);
          inicioSemanaAnterior.setDate(inicioSemanaAtual.getDate() - 7);
          
          const fimSemanaAnterior = new Date(inicioSemanaAtual);
          fimSemanaAnterior.setDate(inicioSemanaAtual.getDate() - 1);
          
          return {
            inicio: `${inicioSemanaAnterior.getFullYear()}-${String(inicioSemanaAnterior.getMonth() + 1).padStart(2, "0")}-${String(inicioSemanaAnterior.getDate()).padStart(2, "0")}`,
            fim: `${fimSemanaAnterior.getFullYear()}-${String(fimSemanaAnterior.getMonth() + 1).padStart(2, "0")}-${String(fimSemanaAnterior.getDate()).padStart(2, "0")}`
          };
        }
        case "mes": {
          const mesAtual = now.getMonth();
          const anoAtual = now.getFullYear();

          let mesAnterior = mesAtual - 1;
          let anoAnterior = anoAtual;

          if (mesAnterior < 0) {
            mesAnterior = 11;
            anoAnterior--;
          }
          
          const primeiroDiaMesAnterior = new Date(anoAnterior, mesAnterior, 1);
          const ultimoDiaMesAnterior = new Date(anoAnterior, mesAnterior + 1, 0);
          
          return {
            inicio: `${primeiroDiaMesAnterior.getFullYear()}-${String(primeiroDiaMesAnterior.getMonth() + 1).padStart(2, "0")}-${String(primeiroDiaMesAnterior.getDate()).padStart(2, "0")}`,
            fim: `${ultimoDiaMesAnterior.getFullYear()}-${String(ultimoDiaMesAnterior.getMonth() + 1).padStart(2, "0")}-${String(ultimoDiaMesAnterior.getDate()).padStart(2, "0")}`
          };
        }
        case "ano": {
          const anoAnterior = now.getFullYear() - 1;
          return {
            inicio: `${anoAnterior}-01-01`,
            fim: `${anoAnterior}-12-31`
          };
        }
        case "personalizado": {
          // Para período personalizado, calcular período anterior com mesma duração
          if (periodoPersonalizado) {
            const inicio = new Date(periodoPersonalizado.inicio);
            const fim = new Date(periodoPersonalizado.fim);
            const duracao = fim.getTime() - inicio.getTime();
            
            const novoFim = new Date(inicio.getTime() - 24 * 60 * 60 * 1000); // Um dia antes do início
            const novoInicio = new Date(novoFim.getTime() - duracao);
            
            return {
              inicio: `${novoInicio.getFullYear()}-${String(novoInicio.getMonth() + 1).padStart(2, "0")}-${String(novoInicio.getDate()).padStart(2, "0")}`,
              fim: `${novoFim.getFullYear()}-${String(novoFim.getMonth() + 1).padStart(2, "0")}-${String(novoFim.getDate()).padStart(2, "0")}`
            };
          }
          return { inicio: "", fim: "" };
        }
        default:
          return { inicio: "", fim: "" };
      }
    };

    const transacoesFiltradas = transacoes.filter((transacao) => {
      const dataTransacao = transacao.data.split("T")[0];

      switch (selectedPeriod) {
        case "dia":
          return dataTransacao === hoje;
        case "semana":
          return dataTransacao >= getPrimeiroDiaSemana();
        case "mes":
          return dataTransacao >= getPrimeiroDiaMes();
        case "ano":
          return dataTransacao >= getPrimeiroDiaAno();
        case "personalizado":
          if (periodoPersonalizado) {
            return dataTransacao >= periodoPersonalizado.inicio && dataTransacao <= periodoPersonalizado.fim;
          }
          return false;
        default:
          return true;
      }
    });

    // Calcular receitas do período anterior
    const periodoAnterior = getPeriodoAnterior();
    const transacoesPeriodoAnterior = transacoes.filter((transacao) => {
      const dataTransacao = transacao.data.split("T")[0];
      return dataTransacao >= periodoAnterior.inicio && dataTransacao <= periodoAnterior.fim;
    });

    const receitasPeriodoAnterior = transacoesPeriodoAnterior
      .filter((t) => t.tipo === "receita")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);
    
    const despesasPeriodoAnterior = transacoesPeriodoAnterior
      .filter((t) => t.tipo === "despesa")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);

    const saldoPeriodoAnterior = receitasPeriodoAnterior - despesasPeriodoAnterior;

    const totalReceitas = transacoesFiltradas
      .filter((t) => t.tipo === "receita")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);

    const totalDespesas = transacoesFiltradas
      .filter((t) => t.tipo === "despesa")
      .reduce((total, transacao) => total + Number(transacao.valor), 0);

    const saldoPeriodo = totalReceitas - totalDespesas;
    const percentualDespesas =
      totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0;

    // Calcular gastos por categoria
    const gastosPorCategoria = transacoesFiltradas
      .filter((t) => t.tipo === "despesa")
      .reduce((acc, transacao) => {
        const categoria = transacao.categorias?.nome || "Outros";
        acc[categoria] = (acc[categoria] || 0) + Number(transacao.valor);
        return acc;
      }, {} as Record<string, number>);

    // Calcular variação percentual das receitas
    let variacaoPercentualReceitas = 0;
    if (receitasPeriodoAnterior > 0) {
      variacaoPercentualReceitas = ((totalReceitas - receitasPeriodoAnterior) / receitasPeriodoAnterior) * 100;
    } else if (totalReceitas > 0) {
      variacaoPercentualReceitas = 100;
    }

    // Calcular variação percentual do saldo
    let variacaoPercentualSaldo = 0;
    if (saldoPeriodoAnterior > 0) {
      variacaoPercentualSaldo = ((saldoPeriodo - saldoPeriodoAnterior) / saldoPeriodoAnterior) * 100;
    } else if (saldoPeriodoAnterior < 0 && saldoPeriodo >= 0) {
      variacaoPercentualSaldo = 100;
    } else if (saldoPeriodoAnterior === 0 && saldoPeriodo !== 0) {
      variacaoPercentualSaldo = saldoPeriodo > 0 ? 100 : -100;
    } else if (saldoPeriodoAnterior < 0 && saldoPeriodo < 0) {
      variacaoPercentualSaldo = ((saldoPeriodo - saldoPeriodoAnterior) / Math.abs(saldoPeriodoAnterior)) * 100;
    }

    return {
      transacoesFiltradas: transacoesFiltradas.sort((a, b) =>
        b.data.localeCompare(a.data)
      ),
      totalReceitas,
      totalDespesas,
      saldoPeriodo,
      percentualDespesas,
      receitasPeriodoAnterior,
      variacaoPercentualReceitas,
      saldoPeriodoAnterior,
      variacaoPercentualSaldo,
      gastosPorCategoria,
    };
  }, [transacoes, selectedPeriod, loadingTransacoes, periodoPersonalizado]);

  const {
    transacoesFiltradas,
    totalReceitas,
    totalDespesas,
    saldoPeriodo,
    percentualDespesas,
    variacaoPercentualReceitas,
    variacaoPercentualSaldo,
    gastosPorCategoria,
  } = processedData;

  // Função para gerar insights financeiros
  const gerarInsights = () => {
    const nomeUsuario = profile?.name || "Usuário";
    const insights = [];
    
    // Análise geral do saldo
    if (saldoPeriodo > 0) {
      insights.push(`💚 Parabéns, ${nomeUsuario}! Você teve um saldo positivo de R$ ${saldoPeriodo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} no período.`);
    } else if (saldoPeriodo < 0) {
      insights.push(`⚠️ Atenção, ${nomeUsuario}! Suas despesas superaram as receitas em R$ ${Math.abs(saldoPeriodo).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`);
    }

    // Análise do percentual de gastos
    if (percentualDespesas > 90) {
      insights.push("🚨 Suas despesas representam mais de 90% das suas receitas. É recomendado reduzir gastos urgentemente.");
    } else if (percentualDespesas > 80) {
      insights.push("⚡ Suas despesas estão consumindo mais de 80% da sua renda. Considere revisar seus gastos.");
    } else if (percentualDespesas < 70) {
      insights.push("✨ Excelente controle! Suas despesas estão abaixo de 70% da renda, permitindo boas economias.");
    }

    // Análise por categoria (categoria com maior gasto)
    const categoriaComMaiorGasto = Object.entries(gastosPorCategoria)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (categoriaComMaiorGasto) {
      const [categoria, valor] = categoriaComMaiorGasto;
      const percentualCategoria = (valor / totalDespesas) * 100;
      
      if (percentualCategoria > 40) {
        insights.push(`📊 A categoria "${categoria}" representa ${percentualCategoria.toFixed(1)}% dos seus gastos (R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}). Considere revisar esses gastos.`);
      }
      
      // Dicas específicas por categoria
      const dicasPorCategoria: Record<string, string> = {
        "Alimentação": "💡 Dica: Planeje suas refeições, faça lista de compras e evite pedidos por aplicativo frequentes.",
        "Transporte": "🚗 Dica: Considere usar transporte público, caronas ou trabalhar de casa alguns dias.",
        "Moradia": "🏠 Dica: Renegocie contratos, considere dividir custos ou mudança para local mais econômico.",
        "Lazer": "🎮 Dica: Explore opções gratuitas de entretenimento e estabeleça um orçamento mensal para lazer.",
      };
      
      if (dicasPorCategoria[categoria]) {
        insights.push(dicasPorCategoria[categoria]);
      }
    }

    // Meta de economia
    const metaEconomia = totalReceitas * 0.2; // 20% da renda
    const economiaAtual = totalReceitas - totalDespesas;
    
    if (economiaAtual < metaEconomia && totalReceitas > 0) {
      const diferenca = metaEconomia - economiaAtual;
      insights.push(`🎯 Meta: Tente economizar 20% da sua renda. Você precisa reduzir R$ ${diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em gastos para atingir essa meta.`);
    }

    return insights;
  };

  // Função para obter ícone da categoria
  const obterIconeCategoria = (
    categoria: string,
    tipo: "receita" | "despesa"
  ) => {
    const icones: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      Salário: DollarSign,
      Freelances: DollarSign,
      Investimentos: Investment,
      Moradia: Home,
      Alimentação: Utensils,
      Transporte: Car,
      default: tipo === "receita" ? DollarSign : TrendingDown,
    };
    return icones[categoria] || icones.default;
  };

  // Função para obter cor da categoria baseada na cor real da categoria
  const obterCorCategoria = (
    categoriaObj: { cor?: string } | null | undefined,
    tipo: "receita" | "despesa"
  ) => {
    if (categoriaObj?.cor) {
      return "bg-primary";
    }

    const cores: { [key: string]: string } = {
      default: tipo === "receita" ? "bg-green-500" : "bg-red-500",
    };
    return cores.default;
  };

  // Cálculos adicionais
  const despesasPendentes = totalDespesas * 0.1;

  // Itens com estoque baixo
  const itensEstoqueBaixo = itensMercado.filter(
    (item) => item.status === "estoque_baixo" || item.status === "sem_estoque"
  );

  // Dívidas vencidas
  const dividasVencidas = dividas.filter(
    (divida) => divida.status === "vencida"
  );
  const totalDividasVencidas = dividasVencidas.reduce(
    (total, divida) => total + Number(divida.valor_restante),
    0
  );

  // Preparar transações para exibição (últimas 5)
  const transacoesParaExibicao = transacoesFiltradas
    .slice(0, 5)
    .map((transacao) => ({
      id: transacao.id,
      description: transacao.descricao,
      date: formatarData(transacao.data),
      category: transacao.categorias?.nome || "Sem categoria",
      categoryColor: obterCorCategoria(transacao.categorias, transacao.tipo),
      amount: `${transacao.tipo === "receita" ? "+" : "-"}R$ ${Number(
        transacao.valor
      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      type: transacao.tipo === "receita" ? "income" : "expense",
      icon: obterIconeCategoria(
        transacao.categorias?.nome || "default",
        transacao.tipo
      ),
    }));

  const user = {
    name: profile?.name || "Usuário",
    getCurrentPeriod: () => {
      const now = new Date();
      const offset = -3;
      const today = new Date(now.getTime() + offset * 60 * 60 * 1000);

      switch (selectedPeriod) {
        case "dia": {
          const dataFormatada = formatarData(today.toISOString());
          return dataFormatada;
        }
        case "semana": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          return `Semana de ${formatarData(startOfWeek.toISOString())}`;
        }
        case "mes":
          return formatarMes(today);
        case "ano":
          return today.getFullYear().toString();
        case "personalizado":
          if (periodoPersonalizado) {
            return `${formatarData(periodoPersonalizado.inicio + "T00:00:00")} - ${formatarData(periodoPersonalizado.fim + "T00:00:00")}`;
          }
          return "Período personalizado";
        default:
          return "Período atual";
      }
    },
  };

  const stats = [
    {
      title: "Receitas do período",
      value: `R$ ${totalReceitas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      icon: variacaoPercentualReceitas >= 0 ? TrendingUp : TrendingDown,
    },
    {
      title: "Despesas do período",
      value: `R$ ${totalDespesas.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      changeType: "neutral",
      icon: TrendingDown,
    },
    {
      title: "Saldo do período",
      value: `R$ ${saldoPeriodo.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      changeType: variacaoPercentualSaldo >= 0 ? "positive" : "negative",
      change: `${variacaoPercentualSaldo >= 0 ? "+" : ""}${variacaoPercentualSaldo.toFixed(1)}%`,
      badge: "Variação",
      badgeType: variacaoPercentualSaldo >= 0 ? "good" : "bad",
      badgeStatus: variacaoPercentualSaldo >= 0 ? "Crescimento" : "Queda",    
      icon: variacaoPercentualSaldo >= 0 ? TrendingUp : TrendingDown,
    },
    {
      title: "Despesas/Receitas",
      value: `${percentualDespesas.toFixed(1)}%`,
      badge: "Saúde Financeira",
      badgeType:
        percentualDespesas < 80
          ? "good"
          : percentualDespesas < 90
          ? "warning"
          : "bad",
      badgeStatus:
        percentualDespesas < 80
          ? "Bom"
          : percentualDespesas < 90
          ? "Regular"
          : "Ruim",
      changeType: "neutral",
      icon: percentualDespesas < 80 ? TrendingUp : TrendingDown,
    },
  ];

  useEffect(() => {
    const checkAndShowModal = async () => {
      const hasCategories = await checkHasCategorias();
      if (!hasCategories) {
        setShowImportModal(true);
      }
    };
    checkAndShowModal();
  }, [checkHasCategorias]);

  const handleImportar = async () => {
    setImportandoCategorias(true);
    setProgressoImportacao(0);
    
    const interval = setInterval(() => {
      setProgressoImportacao(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    await importarCategoriasPadrao();
    
    setTimeout(() => {
      setProgressoImportacao(100);
      setImportandoCategorias(false);
      setCategoriasImportadas(true);
      
      setTimeout(() => {
        setShowImportModal(false);
        setCategoriasImportadas(false);
        setProgressoImportacao(0);
      }, 2000);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-primary rounded-full p-2 md:p-3">
              <span className="text-white font-bold text-lg md:text-xl">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Olá, {user.name}
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                {user.getCurrentPeriod()}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex gap-2">
            <Tabs
              value={selectedPeriod}
              onValueChange={setSelectedPeriod}
              className="w-full sm:w-auto"
            >
              <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                <TabsTrigger value="dia" className="text-sm">
                  Dia
                </TabsTrigger>
                <TabsTrigger value="semana" className="text-sm">
                  Semana
                </TabsTrigger>
                <TabsTrigger value="mês" className="text-sm">
                  Mês
                </TabsTrigger>
                <TabsTrigger value="ano" className="text-sm">
                  Ano
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Botão para período personalizado */}
            <Dialog open={showCustomDateModal} onOpenChange={setShowCustomDateModal}>
              <DialogTrigger asChild>
                <Button 
                  variant={selectedPeriod === "personalizado" ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Personalizado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Selecionar Período Personalizado
                  </DialogTitle>
                  <DialogDescription>
                    Escolha as datas de início e fim para analisar um período específico.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="data-inicio">Data de Início</Label>
                    <Input
                      id="data-inicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="data-fim">Data de Fim</Label>
                    <Input
                      id="data-fim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      min={dataInicio}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={aplicarPeriodoPersonalizado}
                    disabled={!dataInicio || !dataFim}
                    className="w-full"
                  >
                    Aplicar Período
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 md:p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs md:text-sm text-gray-600">
                    {stat.title}
                  </p>
                  {stat.icon && (
                    <stat.icon
                      className={`w-4 h-4 ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    />
                  )}
                </div>
                <p className="text-lg md:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs md:text-sm text-primary">
                    {stat.subtitle}
                  </p>
                )}
                {stat.change && (
                  <p
                    className={`text-xs md:text-sm ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                )}
                {stat.badge && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {stat.badge}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        stat.badgeType === "good"
                          ? "bg-green-100 text-green-800"
                          : stat.badgeType === "warning"
                          ? "bg-primary-foreground text-primary"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${
                          stat.badgeType === "good"
                            ? "bg-green-500"
                            : stat.badgeType === "warning"
                            ? "bg-primary"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {stat.badgeStatus}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Últimas Transações - {selectedPeriod}
            </h2>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/90 text-sm"
              onClick={() => navigate("/transacoes")}
            >
              Ver todas
            </Button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {transacoesParaExibicao.length > 0 ? (
              transacoesParaExibicao.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border border-gray-100 hover:bg-gray-50 gap-2 sm:gap-4"
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <transaction.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-3 md:space-x-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      {transaction.category}
                    </span>
                    <span
                      className={`text-sm md:text-base font-bold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 md:py-8 text-sm md:text-base text-gray-500">
                Nenhuma transação encontrada para o período selecionado.
              </div>
            )}
          </div>
        </Card>

        {/* Insights Financeiros */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Insights Financeiros
              </h2>
              <p className="text-sm text-gray-600">
                Análise personalizada dos seus gastos e dicas para economizar
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {gerarInsights().map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex-shrink-0 mt-0.5">
                  {insight.includes("💚") && <TrendingUp className="w-4 h-4 text-green-600" />}
                  {insight.includes("⚠️") && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                  {insight.includes("🚨") && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  {insight.includes("⚡") && <AlertTriangle className="w-4 h-4 text-orange-600" />}
                  {insight.includes("✨") && <TrendingUp className="w-4 h-4 text-green-600" />}
                  {insight.includes("📊") && <TrendingDown className="w-4 h-4 text-blue-600" />}
                  {insight.includes("💡") && <Lightbulb className="w-4 h-4 text-yellow-600" />}
                  {insight.includes("🚗") && <Car className="w-4 h-4 text-blue-600" />}
                  {insight.includes("🏠") && <Home className="w-4 h-4 text-blue-600" />}
                  {insight.includes("🎮") && <Package className="w-4 h-4 text-purple-600" />}
                  {insight.includes("🎯") && <Target className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {insight.replace(/[💚⚠️🚨⚡✨📊💡🚗🏠🎮🎯]/g, '').trim()}
                </p>
              </div>
            ))}
            
            {gerarInsights().length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm md:text-base">
                  Adicione mais transações para receber insights personalizados sobre suas finanças.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Modal de Importação de Categorias Padrão */}
        <AlertDialog open={showImportModal} onOpenChange={setShowImportModal}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900">
                Importar Categorias Padrão
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-gray-600 leading-relaxed">
                Parece que você ainda não tem categorias cadastradas. Para começar a organizar suas finanças, sugerimos importar um conjunto de categorias padrão. Você pode editá-las ou adicionar novas a qualquer momento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col space-y-4">
              {!importandoCategorias && !categoriasImportadas && (
                <AlertDialogAction 
                  onClick={handleImportar}
                  className="w-full py-3 text-base"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Importar Categorias Padrão
                </AlertDialogAction>
              )}
              
              {importandoCategorias && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-base text-gray-700 font-medium">Importando categorias...</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={progressoImportacao} 
                      className="w-full h-3 bg-gray-200"
                    />
                    <div 
                      className="absolute top-0 left-0 h-3 bg-green-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progressoImportacao}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">{progressoImportacao}% concluído</span>
                  </div>
                </div>
              )}
              
              {categoriasImportadas && (
                <div className="w-full flex flex-col items-center justify-center space-y-3 text-green-600">
                  <CheckCircle className="w-8 h-8" />
                  <span className="text-base font-semibold">Todas as categorias foram importadas com sucesso!</span>
                </div>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;