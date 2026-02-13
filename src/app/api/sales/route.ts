import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { dataInicio, dataFim } = await request.json();

    // === ESTRATÉGIA "REDE DE ARRASTO" ===
    // Sempre buscamos de 1 a 20. O filtro específico será feito no Frontend (Service).
    // Isso resolve o problema de IDs desconhecidos/trocados.
    const listaIds = Array.from({ length: 20 }, (_, i) => i + 1);

    const token = process.env.MICROWORK_TOKEN;
    
    // Filtro otimizado
    const filtros = `SemAutorizacaoExpedicao=True;Tipodemovimento=2,25,26,22,11,9,17,10,21,32;DesconsiderarEstornadoDevolvido=False;ComAutorizacaoExpedicao=True;Periododamovimentacaofinal=${dataFim};ComExpedicao=True;SemExpedicao=True;Periododamovimentacaoinicial=${dataInicio};MovimentosCancelados=False`;

    const payload = {
      idrelatorioconfiguracao: 248,
      idrelatorioconsulta: 50,
      idrelatorioconfiguracaoleiaute: 248,
      idrelatoriousuarioleiaute: 143,
      ididioma: 1,
      listaempresas: listaIds,
      filtros: filtros
    };

    const response = await fetch("https://microworkcloud.com.br/api/integracao/terceiro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json([], { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);

  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json([], { status: 500 });
  }
}