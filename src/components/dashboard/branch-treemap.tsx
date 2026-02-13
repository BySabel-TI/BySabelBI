"use client";

import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { formatBranchName } from "@/lib/utils";

// Interface flexível para evitar erros de tipagem
interface BranchData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface BranchTreemapProps {
  data: BranchData[];
}

const fmtBRL = (val: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

// --- COMPONENTE CUSTOMIZADO BLINDADO ---
const CustomizedContent = (props: any) => {
  // Extraímos tudo com valores padrão para evitar crash
  const { x, y, width, height, name, value, color } = props;

  // Se as dimensões forem inválidas (NaN ou 0), não renderiza nada para não quebrar
  if (!width || !height || width <= 0 || height <= 0) return null;

  // Lógica de exibição baseada no tamanho disponível
  const showText = width > 60 && height > 40;
  const showValue = width > 80 && height > 60;

  // Tenta pegar a cor direto das props ou do payload (compatibilidade entre versões)
  const finalColor = color || props.payload?.color || "#333";
  // Tenta pegar o nome seguro
  const safeName = name || props.payload?.name || "Loja";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: finalColor,
          stroke: "#09090b", // Cor do fundo (background) para separar os blocos
          strokeWidth: 2,
        }}
        rx={6}
        ry={6}
      />
      
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
          style={{ 
            textShadow: "0px 1px 3px rgba(0,0,0,0.8)",
            pointerEvents: "none" // Importante para não bloquear o Tooltip
          }}
        >
          {formatBranchName(safeName.toString()).split(" ")[0]}
        </text>
      )}

      {showValue && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={10}
          fontWeight={500}
          style={{ pointerEvents: "none" }}
        >
          {fmtBRL(value)}
        </text>
      )}
    </g>
  );
};

// --- TOOLTIP CUSTOMIZADO ---
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-xl z-50">
        <p className="font-bold text-zinc-200 mb-1">{formatBranchName(data.name)}</p>
        <p className="text-shineray-red font-mono font-bold text-sm">
          {fmtBRL(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

export function BranchTreemap({ data }: BranchTreemapProps) {
  // Proteção contra dados vazios ou inválidos
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        Sem dados para exibir
      </div>
    );
  }

  // Filtra dados zerados que podem causar divisão por zero/NaN no cálculo do Treemap
  const safeData = data.filter(d => d.value > 0);

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
        Sem faturamento no período
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={safeData}
          dataKey="value"
          aspectRatio={4 / 3}
          stroke="none"
          isAnimationActive={false} // Desativar animação inicial evita alguns erros de hidratação
          content={<CustomizedContent />}
        >
          <Tooltip content={<CustomTooltip />} cursor={false} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}