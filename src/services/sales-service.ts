import { MicroworkSaleItem } from "@/lib/types-microwork";
import { format, parseISO, isValid, getYear, getMonth, startOfYear, subYears, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getBranchBySeller, normalizeBranchName, ID_TO_NORMALIZED_NAME } from "@/lib/seller-map";

export async function fetchSalesData(startDate: Date, endDate: Date, branchIds: number[]) {
  // 1. Busca TUDO
  const response = await fetch("/api/sales", {
    method: "POST",
    body: JSON.stringify({
      dataInicio: format(startDate, "yyyy-MM-dd HH:mm"),
      dataFim: format(endDate, "yyyy-MM-dd HH:mm"),
      empresas: "all"
    })
  });

  if (!response.ok) return null;

  const rawData: MicroworkSaleItem[] = await response.json();
  let safeData = Array.isArray(rawData) ? rawData : [];
  if (safeData.length > 0) {
    console.log("DEBUG: First item raw:", safeData[0]);
  }

  // 2. FILTRAGEM EM MEMÓRIA
  if (branchIds.length > 0 && branchIds.length < 20) {
    const targetNames = branchIds.map(id => ID_TO_NORMALIZED_NAME[id]);
    safeData = safeData.filter(item => {
      const rawName = item.vendedor || "";
      const rawPatio = item.patio || "Indefinido";
      const mappedBranch = getBranchBySeller(rawName);
      const normalizedRowName = normalizeBranchName(mappedBranch || rawPatio);

      // Se normalizou para "Indefinido" (ex: era CD ou Avaria e sem vendedor), ignoramos se estiver filtrando lojas específicas
      if (normalizedRowName === "Indefinido") return false;

      return targetNames.includes(normalizedRowName);
    });
  }

  // --- TRANSFORMAÇÃO DE DADOS (LÓGICA CORRIGIDA) ---

  // PASSO 1: CALCULAR O RANKING PRIMEIRO (AGRUPAR POR VENDEDOR)
  const salesBySeller = safeData.reduce((acc, item) => {
    const rawName = item.vendedor || "Desconhecido";
    
    // A. Descobre a filial usando o nome EXATO (com _ ou -1) para preservar o histórico da loja
    const mappedBranch = getBranchBySeller(rawName);
    const rawPatio = item.patio || "Indefinido";
    const filialReal = normalizeBranchName(mappedBranch || rawPatio);

    // B. Limpa o nome APENAS para exibição. 
    // Isso junta "NOME_" e "NOME" numa pessoa só e exibe o NOME COMPLETO.
    const displayName = rawName.trim().toUpperCase()
      .replace(/_+$/, '')      // Remove underline no final
      .replace(/-[0-9]+$/, '') // Remove -1 no final
      .replace(/\s+/g, ' ');   // Remove espaços extras

    if (!acc[displayName]) {
      acc[displayName] = { name: displayName, filial: filialReal, total: 0, qtd: 0 };
    }
    
    acc[displayName].total += item.valorvenda || 0;
    acc[displayName].qtd += item.quantidade || 0;
    
    return acc;
  }, {} as Record<string, any>);

  // PASSO 2: APLICAR A REGRA "PISO ZERO" (SEM NEGATIVOS)
  const rankingVendedores = Object.values(salesBySeller)
    .map((vendedor: any) => ({
        ...vendedor,
        // Se a quantidade for negativa (mais devoluções que vendas), zera.
        qtd: vendedor.qtd < 0 ? 0 : vendedor.qtd,
        total: vendedor.total < 0 ? 0 : vendedor.total
    }))
    .sort((a, b) => {
      if (b.qtd === a.qtd) {
        return b.total - a.total; // Critério de desempate: Valor Monetário
      }
      return b.qtd - a.qtd; // Critério principal: Quantidade
    });



  // C) Gráfico Diário
  const salesByDate = safeData.reduce((acc, item) => {
    if (!item.datamovimentacao) return acc;
    const dateObj = parseISO(item.datamovimentacao);
    if (!isValid(dateObj)) return acc;
    
    const day = format(dateObj, "dd");
    if (!acc[day]) acc[day] = { day, vendas: 0, valor: 0 };
    
    acc[day].vendas += item.quantidade || 0;
    acc[day].valor += item.valorvenda || 0; 
    
    return acc;
  }, {} as Record<string, any>);
  
  // Opcional: Zerar negativos no gráfico diário também para consistência visual
  const graficoDiario = Object.values(salesByDate)
    .map((d: any) => ({
        ...d,
        vendas: d.vendas < 0 ? 0 : d.vendas,
        valor: d.valor < 0 ? 0 : d.valor
    }))
    .sort((a: any, b: any) => parseInt(a.day) - parseInt(b.day));

  // D) Faturamento por Filial
  const salesByBranch = safeData.reduce((acc, item) => {
    const rawName = item.vendedor || "";
    // Tenta mapear vendedor -> filial
    let mappedBranch = getBranchBySeller(rawName);
    
    // Se não achou mapeamento, verifica se o próprio NOME Do vendedor é uma filial (Ex: "Aldeota")
    if (!mappedBranch && rawName) {
       const possibleBranch = normalizeBranchName(rawName);
       if (possibleBranch !== "Indefinido" && possibleBranch !== "Outros") {
          mappedBranch = possibleBranch; 
       }
    }

    const rawPatio = item.patio || "Outros";
    // Prioriza o mappedBranch (vendedor ou nome da loja no campo vendedor), senão usa o pátio
    const branchName = normalizeBranchName(mappedBranch || rawPatio);
    
    if (!acc[branchName]) acc[branchName] = { name: branchName, value: 0, qtd: 0 }; 
    acc[branchName].value += item.valorvenda || 0;
    acc[branchName].qtd += item.quantidade || 0; 
    
    return acc;
  }, {} as Record<string, any>);

  const COLORS = ['#DC2626', '#3F3F46', '#B91C1C', '#52525B', '#991B1B', '#71717A', '#7F1D1D', '#27272A'];

  const graficoPizza = Object.values(salesByBranch)
    .filter((item: any) => item.name !== "Indefinido") // Remove indefinidos da visualização
    .map((item: any) => ({
        ...item,
        // Aplica piso zero nas filiais também para garantir que o Treemap não quebre com valores negativos
        // E atende a regra: "se o valor for zero e tiver estorno ele continuará zero" (não negativar)
        value: item.value < 0 ? 0 : item.value,
        qtd: item.qtd < 0 ? 0 : item.qtd
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ 
      ...item, 
      color: COLORS[index % COLORS.length] 
    }));

  // E) Ranking de Modelos
  const salesByModel = safeData.reduce((acc, item) => {
    const rawModel = item.modelo || "Modelo Indefinido";
    const modelName = rawModel.trim(); 
    if (!acc[modelName]) acc[modelName] = { name: modelName, qtd: 0, valor: 0 };
    
    acc[modelName].qtd += item.quantidade || 0;
    acc[modelName].valor += item.valorvenda || 0;
    
    return acc;
  }, {} as Record<string, any>);

  const rankingModelos = Object.values(salesByModel)
    .map((modelo: any) => ({
        ...modelo,
        qtd: modelo.qtd < 0 ? 0 : modelo.qtd,
        valor: modelo.valor < 0 ? 0 : modelo.valor
    }))
    .sort((a, b) => b.valor - a.valor);

  // PASSO 3: CALCULAR KPIs (AGORA SINCRONIZADOS COM A TABELA)
  // Usamos os totais do graficoPizza (que alimenta a Tabela de Análise Comercial)
  // para garantir que os números batam exatos.
  const totalFaturamento = graficoPizza.reduce((acc, v) => acc + v.value, 0);
  const totalVendas = graficoPizza.reduce((acc, v) => acc + v.qtd, 0);
  const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;

  return {
    kpis: { totalFaturamento, totalVendas, ticketMedio },
    rankingVendedores,
    graficoDiario,
    graficoPizza,
    rankingModelos,
    rawData: safeData
  };
}

// Cache simples em memória (Global fora da função)
let cacheAnoAnterior: { data: MicroworkSaleItem[], timestamp: number } | null = null;
const CACHE_ANO_ANTERIOR_TTL = 1000 * 60 * 60 * 24; // 24 Horas (Dados Históricos mudam pouco)

let cacheAnoAtual: { data: MicroworkSaleItem[], timestamp: number } | null = null;
const CACHE_ANO_ATUAL_TTL = 1000 * 60 * 10; // 10 Minutos (Dados Recentes)

export async function fetchYearlyComparison(branchIds: number[]) {
  const today = new Date();
  const currentYear = getYear(today);
  const previousYear = currentYear - 1;

  // 1. Buscar Dados do Ano ANTERIOR (Com Cache Longo)
  let dataAnoAnterior: MicroworkSaleItem[] = [];
  const now = Date.now();

  if (cacheAnoAnterior && (now - cacheAnoAnterior.timestamp < CACHE_ANO_ANTERIOR_TTL)) {
    // console.log("HIT CACHE ANO ANTERIOR");
    dataAnoAnterior = cacheAnoAnterior.data;
  } else {
    // console.log("MISS CACHE ANO ANTERIOR - BUSCANDO...");
    const startPrev = startOfYear(subYears(today, 1)); // 01/01/2025
    const endPrev = endOfDay(new Date(previousYear, 11, 31)); // 31/12/2025

    const responsePrev = await fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        dataInicio: format(startPrev, "yyyy-MM-dd HH:mm"),
        dataFim: format(endPrev, "yyyy-MM-dd HH:mm"),
        empresas: "all"
      })
    });

    if (responsePrev.ok) {
      dataAnoAnterior = await responsePrev.json();
      if (Array.isArray(dataAnoAnterior) && dataAnoAnterior.length > 0) {
        cacheAnoAnterior = { data: dataAnoAnterior, timestamp: now };
      }
    }
  }

  // 2. Buscar Dados do Ano ATUAL (Com Cache Curto)
  let dataAnoAtual: MicroworkSaleItem[] = [];
  
  if (cacheAnoAtual && (now - cacheAnoAtual.timestamp < CACHE_ANO_ATUAL_TTL)) {
    // console.log("HIT CACHE ANO ATUAL");
    dataAnoAtual = cacheAnoAtual.data;
  } else {
    // console.log("MISS CACHE ANO ATUAL - BUSCANDO...");
    const startCurr = startOfYear(today); // 01/01/2026
    const endCurr = endOfDay(today);      // Hoje

    const responseCurr = await fetch("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        dataInicio: format(startCurr, "yyyy-MM-dd HH:mm"),
        dataFim: format(endCurr, "yyyy-MM-dd HH:mm"),
        empresas: "all"
      })
    });

    if (responseCurr.ok) {
      dataAnoAtual = await responseCurr.json();
      if (Array.isArray(dataAnoAtual)) {
         cacheAnoAtual = { data: dataAnoAtual, timestamp: now };
      }
    }
  }

  // 3. Combinar Dados
  const rawData = [...(Array.isArray(dataAnoAnterior) ? dataAnoAnterior : []), ...(Array.isArray(dataAnoAtual) ? dataAnoAtual : [])];
  let safeData = rawData;

  if (branchIds.length > 0 && branchIds.length < 20) {
    const targetNames = branchIds.map(id => ID_TO_NORMALIZED_NAME[id]);
    safeData = safeData.filter(item => {
      const rawName = item.vendedor || "";
      const rawPatio = item.patio || "Indefinido";
      const mappedBranch = getBranchBySeller(rawName);
      const normalizedRowName = normalizeBranchName(mappedBranch || rawPatio);
      
      // Se normalizou para "Indefinido" (ex: era CD ou Avaria e sem vendedor), ignoramos se estiver filtrando lojas específicas
      if (normalizedRowName === "Indefinido") return false;

      return targetNames.includes(normalizedRowName);
    });
  }

  const comparisonMap: Record<number, any> = {};
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(currentYear, i, 1);
    comparisonMap[i] = {
      monthIndex: i,
      monthName: format(monthDate, "MMM", { locale: ptBR }), 
      anoAtual: 0,
      anoAnterior: 0,
      yearCurrent: currentYear,
      yearPrev: previousYear
    };
  }

  safeData.forEach(item => {
    if (!item.datamovimentacao) return;
    const dateObj = parseISO(item.datamovimentacao);
    if (!isValid(dateObj)) return;

    const itemYear = getYear(dateObj);
    const itemMonth = getMonth(dateObj); 

    if (itemYear === currentYear) {
      comparisonMap[itemMonth].anoAtual += item.quantidade || 0;
    } else if (itemYear === previousYear) {
      comparisonMap[itemMonth].anoAnterior += item.quantidade || 0;
    }
  });

  // Limpa negativos
  const finalComparison = Object.values(comparisonMap).map((m: any) => ({
      ...m,
      anoAtual: m.anoAtual < 0 ? 0 : m.anoAtual,
      anoAnterior: m.anoAnterior < 0 ? 0 : m.anoAnterior
  }));

  return finalComparison;
}