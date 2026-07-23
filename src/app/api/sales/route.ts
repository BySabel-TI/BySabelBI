import { NextResponse } from "next/server";

interface CacheEntry {
  data: unknown[];
  timestamp: number;
}

// Cache em memória no servidor (persistente durante a vida do processo Node.js)
const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dataInicio, dataFim, forceRefresh } = body;

    const cacheKey = `${dataInicio}|${dataFim}`;
    const now = Date.now();

    // Se não for forçar atualização, verifica cache no servidor
    if (!forceRefresh) {
      const cached = serverCache.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data, {
          headers: { "X-Cache-Status": "HIT" },
        });
      }
    }

    // === ESTRATÉGIA "REDE DE ARRASTO" ===
    // Sempre buscamos de 1 a 20. O filtro específico será feito no Frontend (Service).
    const listaIds = Array.from({ length: 20 }, (_, i) => i + 1);
    const token = process.env.MICROWORK_TOKEN;

    const filtros = `SemAutorizacaoExpedicao=True;Tipodemovimento=2,25,26,22,11,9,17,10,21,32;DesconsiderarEstornadoDevolvido=False;ComAutorizacaoExpedicao=True;Periododamovimentacaofinal=${dataFim};ComExpedicao=True;SemExpedicao=True;Periododamovimentacaoinicial=${dataInicio};MovimentosCancelados=False`;

    const payload = {
      idrelatorioconfiguracao: 248,
      idrelatorioconsulta: 50,
      idrelatorioconfiguracaoleiaute: 248,
      idrelatoriousuarioleiaute: 143,
      ididioma: 1,
      listaempresas: listaIds,
      filtros: filtros,
    };

    const response = await fetch("https://microworkcloud.com.br/api/integracao/terceiro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const data = await response.json();
    const safeData = Array.isArray(data) ? data : [];

    // Salva no cache do servidor
    serverCache.set(cacheKey, { data: safeData, timestamp: now });

    return NextResponse.json(safeData, {
      headers: { "X-Cache-Status": forceRefresh ? "BYPASS" : "MISS" },
    });
  } catch (error) {
    console.error("Erro interno no proxy /api/sales:", error);
    return NextResponse.json([], { status: 500 });
  }
}