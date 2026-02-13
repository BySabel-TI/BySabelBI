export type StatusMoto = "disponivel" | "reservada" | "transito" | "manutencao";

export interface Moto {
  id: string;
  modelo: string; // ex: "SHI 175"
  cor: string;    // ex: "Vermelho"
  corHex: string; // ex: "#DC2626"
  ano: string;
  chassi: string; // Parcial para identificar
  patio: string;  // ex: "Matriz", "Filial 01"
  status: StatusMoto;
  valor: number;
  entrada: string; // Data de entrada
}