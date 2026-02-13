// src/lib/seller-map.ts

/**
 * Mapa de Vendedores baseado na planilha completa.
 * Chave: Nome EXATO do vendedor como vem do banco.
 * Valor: Nome da Filial (Higienizado).
 */
export const SELLER_MAP: Record<string, string> = {
  // === 01 - ANANINDEUA ===
  "ARLETE DOS SANTOS SOUSA": "Ananindeua",
  "JOAO VICTOR SANTOS COSTA": "Ananindeua",
  "NATALIA RIOTINTO COSTA": "Ananindeua",
  "MELISSA YASMIN BOTELHO FREITAS": "Ananindeua",
  "IGOR RICARDO MONTEIRO DA COSTA_": "Ananindeua",
  "EWLLER AMOON SILVA": "Ananindeua",
  "BRENDA CORREA LEAL": "Ananindeua",
  "ERICA KARINA RODRIGUES REZENDE": "Ananindeua",
  "IGOR SANTOS DA SILVA": "Ananindeua",

  // === 02 - BELÉM ===
  "ANA BEATRIZ SANTOS PEDROZA": "Belem",
  "ERIC ERALD DOS REIS BRAGA_": "Belem",
  "LARYSSA DE SOUZA FERREIRA": "Belem",
  "IGOR SANTOS DA SILVA_": "Belem",
  "TAIS ALMEIDA FERREIRA": "Belem",
  "LUCAS PORTAL MORAES": "Belem",
  "MADSON LUIZ DE LIMA BENTES": "Belem",
  "ALLYSON GABRIEL LINHARES DA SILVA": "Belem",
  "RAFAEL DE LOUREIRO PIMENTEL": "Belem",
  "JOSE ABRAAO DA SILVA REBELO": "Belem",
  "WILLIAM DA CRUZ MONTEIRO": "Belem",
  "VICTOR DE MENESES MORAES_": "Belem",
  "DIEGO CAIADO BRAGA_": "Belem",

  // === 03 - ICOARACI ===
  "ALTAMIR BEZERRA SILVA JUNIOR": "Icoaraci",
  "BRENO ARRUDA DE LIMA-1": "Icoaraci",
  "ERICA KARINA RODRIGUES REZENDE_": "Icoaraci",
  "LUCAS PORTAL MORAES-1": "Icoaraci",
  "MELISSA YASMIN BOTELHO FREITAS-1": "Icoaraci",
  "SUELEN MAYARA ANDRADE SARMENTO-1": "Icoaraci",
  "DANIEL DE ABREU PEREIRA": "Icoaraci",
  "JASMINE SOARES DE ALBUQUERQUE": "Icoaraci",
  "IGOR SILVA VON PAUNGARTTEM": "Icoaraci",
  "HELIO VINICIUS VIEIRA SILVA": "Icoaraci",
  "PRISCILA DOS SANTOS LIMA SILVA": "Icoaraci",
  "OSVALDO NETO DA CONCEIÇÃO ABREU": "Icoaraci",
  "ANTONIO ALVARO PIRES COSTA": "Icoaraci",

  // === 04 - CASTANHAL ===
  "CLEILTON THIAGO DIAS CAMPOS": "Castanhal",
  "DANILA RODRIGUES MOTA": "Castanhal",
  "FRANCISCO CONCEIÇÃO DA COSTA": "Castanhal",
  "MAURO ANDRE PASTORI DE MAGALHAES": "Castanhal",
  "SUZANN KAILANY DA SILVA PINHEIRO": "Castanhal",
  "JOSE DIEGO FERREIRA DOS SANTOS": "Castanhal",
  "FRANK JUNIOR FERREIRA DA SILVA": "Castanhal",
  "SILAS MONTEIRO DE SOUZA": "Castanhal",
  "DILTON RIBEIRO DA SILVA": "Castanhal",
  "BRUNO ALMEIDA SILVA": "Castanhal",
  "RAIMUNDO NONATO DOS SANTOS NEGRAO": "Castanhal",

  // === 05 - BARCARENA ===
  "KAUANI VITORIA BOTELHO MAGNO": "Barcarena",
  "JULIA DA CAMARA MELO": "Barcarena",
  "THIAGO GUIMARAES RODRIGUES": "Barcarena",
  "SUELEN MAYARA ANDRADE SARMENTO": "Barcarena",
  "BRENO ARRUDA DE LIMA": "Barcarena",
  "RICARDO SANTOS PANTOJA": "Barcarena",
  "RICHARD MELO DA SILVA": "Barcarena",
  "THIAGO SILVA PETRY": "Barcarena",
  "MAIZA KEIZE DA SILVA SOUSA": "Barcarena",

  // === 06 - SOURE ===
  "PRISCILA BARBOSA SILVA": "Soure",

  // === 07 - BREVES ===
  "ALAN LOBATO DE ALMEIDA": "Breves",
  "ANTONIO ARAUJO DA COSTA": "Breves",
  "DEIVISON SILVA MATOS": "Breves",
  "JOSE DIEGO FERREIRA DOS SANTOS_": "Breves",
  "FABRICIO DE JESUS CUSTODIO": "Breves",
  "ARAO CARDOSO CAVALCANTE": "Breves",
  "INES DE PAULA DO N. LOPES": "Breves",
  "JOAO AUGUSTO DOS SANTOS MENDES": "Breves",

  // === 08 - SÃO MIGUEL ===
  "MARCOS ALEXANDRE SOUZA E SOUZA": "Sao Miguel",
  "ANDERSON DE MIRANDA SOARES FILHO": "Sao Miguel",
  "LEONARDO DA SILVA PANTOJA": "Sao Miguel",
  "STEPHANY DA SILVA MATOS": "Sao Miguel",
  "LARISSA DO SOCORRO NEVES DE LIMA": "Sao Miguel",

  // === 09 - CAPANEMA ===
  "MAISE DA SILVA SOUSA": "Capanema",
  "MARIA RAMILA DA SILVA QUEIROZ": "Capanema",
  "MURILO CARDOSO DO NASCIMENTO": "Capanema",
  "ANTONIO IZAU DE ALMEIDA TEIXEIRA": "Capanema",
  "CAMILLY VICTORIA DA COSTA ALVES": "Capanema",
  "ANDERSON JUNIOR SOUSA GOMES": "Capanema",
  "CARLOS RENAN RIBEIRO CARVALHO": "Capanema",
  "DANIEL NASCIMENTO CARDOSO": "Capanema",
  "MAURICIO JACKSON TRINDADE RODRIGUES": "Capanema",

  // === 10 - BRAGANÇA ===
  "MAIZA KEIZE DA SILVA SOUSA_": "Bragança",
  "GISELE DOS SANTOS CORREA": "Bragança",
  "DHONATA DOS SANTOS LIMA": "Bragança",
  "MARCELO VICTOR DE JESUS RAMOS MELO": "Bragança",

  // === 11 - CONCÓRDIA ===
  "RUTI CLEIA PAIVA DA SILVA": "Concordia",
  "HELYZEU SILVA DE SOUZA": "Concordia",
  "SILMARA DE SOUZA COSTA": "Concordia",

  // === 12 - TAILÂNDIA ===
  "GLADSON HERBETH DE OLIVEIRA SILVA": "Tailandia",
  "EDIVALDO DA SILVA OLIVEIRA": "Tailandia",
  "CARLOS JUNIOR FRANCO DE MOURA": "Tailandia",

  // === 13 - MOJU ===
  "BRUNA DA SILVA SANTOS": "Moju",
  "ANA LIVIA SARRAF SANTOS": "Moju",
  "YAN CARLOS BARBOSA PANTOJA": "Moju",

  // === 14 - TOMÉ-AÇU ===
  "FERNANDO CHAGAS DE ARAUJO": "TomeAcu",
  "OTONIELI PINHEIRO CHERMONT": "TomeAcu",
  "LEYVISON LOPES DE SOUZA": "TomeAcu",

  // === 15 - CAPITÃO POÇO ===
  "RONIEURISON LIMA DOS SANTOS": "Capitao Poço",
  "JAIR DA HORA BEZERRA DO NASCIMENTO": "Capitao Poço",
  "MARIA FERNANDA DE MARIA MAIA": "Capitao Poço",

  // === 16 - ALDEOTA ===
  "VIVIANE DA SILVA CARNEIRO": "Aldeota",
  "JOAO GABRIEL ANTUNES DOS SANTOS": "Aldeota",
  "ALEX RODRIGUES DA SILVA CABRAL": "Aldeota",
  "MYLENA GEOVANA CARDOSO DE ABREU": "Aldeota",
  "ANA BARBARA FREIRE LOPES": "Aldeota",

  // === 17 - PARANGABA ===
  "MIZAEL NASCIMENTO DE OLIVEIRA": "Parangaba",
  "GABRIEL DE OLIVEIRA SAMPAIO PIREZ": "Parangaba",
  "SIMONE SILVA DE FREITAS": "Parangaba",

  // === 18 - ZÉ BASTOS ===
  "VICTOR DE MENESES MORAES": "Ze Bastos",
  "ANA PAULA VALERIO DO NASCIMENTO": "Ze Bastos",
  "KAUAN LIMA CHAVES": "Ze Bastos",

  // === 19 - ACARÁ ===
  "JOSE DENER SILVA DOS SANTOS": "Acara",
  "MARLENE NUNES SANTIAGO": "Acara",
  "MARIA KARLIANY DA SILVA FREITAS": "Acara",

  // === 20 - CURUÇA ===
  "BRENDA DE CASSIA PINHEIRO DE SOUSA MASCARENHAS": "Curuça",
  "PHILIPE MAIA DO ROSARIO": "Curuça",

  // === 21 - IGARAPÉ-MIRI ===
  "MARENILSON SILVA DE SOUSA": "Igarape Miri",

  // === 22 - CAMETÁ ===
  "LEIVISON ALBERTO SERRAO DA SILVA": "Cameta",
  "FABIO ESTUMANO RODRIGUES": "Cameta",

  // === 24 - FEIRÃO ===
  "CARIVALDO VARGAS NORONHA JUNIOR": "Feirão",
  "CAMILE LIMA SANTOS": "Feirão",

  // === FEIRÕES ESPECÍFICOS ===
  "LOJA DE ICOARACI": "Feirão Mosqueiro", // 25
  "LOJA DE SALINAS": "Feirão Salinas", // 26 (Ajuste no nome se necessario)
  "LOJA DE IG-MIRI": "Feirão IG-Miri", // 27
  "LOJA DE STA MARIA": "Feirão Sta.Maria", // 28
  "LOJA DE VIGIA": "Feirão Vigia", // 29

  // === 50 - CONSÓRCIO ===
  "ERIC ERALD DOS REIS BRAGA": "Consorcio",
  "IGOR RICARDO MONTEIRO DA COSTA": "Consorcio",
  "KERVEN HENRIQUE BENTES CALDEIRA": "Consorcio",

  // === DIRETORIA / GERÊNCIA / SEM LOJA ===
  "EVANDRO GOMES DA SILVA": "Diretoria",
  "DANILLO SABEL PORTAL": "Diretoria",
  "DIEGO CAIADO BRAGA": "Gerencia"
};

/**
 * Tenta encontrar a filial baseada no nome EXATO do vendedor.
 * Não removemos o "_" ou "-1" aqui para não perder a loja correta da venda.
 */
export function getBranchBySeller(sellerName: string | null): string | null {
  if (!sellerName) return null;
  const key = sellerName.trim().toUpperCase().replace(/\s+/g, ' ');
  return SELLER_MAP[key] || null;
}

/**
 * Padroniza os nomes das filiais para exibição no Dashboard.
 * IDs atualizados conforme nova planilha.
 */
export function normalizeBranchName(rawName: string | null): string {
  if (!rawName) return "Indefinido";
  
  const name = rawName.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // 1. Filtros de Exclusão (Pátios Técnicos)
  if (name.includes("AVARIA") || name.includes("CD ") || name.includes("CENTRO DE DISTRIBUICAO") || name === "CD" || name.includes("DESMONTADA") || name === "OUTROS") return "Indefinido";

  // 2. Mapeamento Direto de Nomes Normalizados
  if (name.includes("ANANINDEUA")) return "01 - Ananindeua";
  if (name.includes("BELEM") || name.includes("MATRIZ") || name === "LOJA 02") return "02 - Belém";
  if (name.includes("ICOARACI")) return "03 - Icoaraci";
  if (name.includes("CASTANHAL")) return "04 - Castanhal";
  if (name.includes("BARCARENA")) return "05 - Barcarena";
  if (name.includes("SOURE")) return "06 - Soure";
  if (name.includes("BREVES")) return "07 - Breves";
  if (name.includes("SAO MIGUEL") || name.includes("SÃO MIGUEL")) return "08 - São Miguel";
  if (name.includes("CAPANEMA")) return "09 - Capanema";
  if (name.includes("BRAGANCA") || name.includes("BRAGANÇA")) return "10 - Bragança";
  if (name.includes("CONCORDIA") || name.includes("CONCÓRDIA")) return "11 - Concórdia";
  if (name.includes("TAILANDIA") || name.includes("TAILÂNDIA")) return "12 - Tailândia";
  if (name.includes("MOJU")) return "13 - Moju";
  if (name.includes("TOMEACU") || name.includes("TOME") || name.includes("TOME-ACU")) return "14 - Tomé-Açu";
  if (name.includes("CAPITAO POCO") || name.includes("CAPITÃO")) return "15 - Capitão Poço";
  if (name.includes("ALDEOTA")) return "16 - Aldeota";
  if (name.includes("PARANGABA")) return "17 - Parangaba";
  if (name.includes("ZE BASTOS") || name.includes("ZEBASTOS")) return "18 - Zé Bastos";
  if (name.includes("ACARA") || name.includes("ACARÁ")) return "19 - Acará";
  if (name.includes("CURUCA") || name.includes("CURUÇA")) return "20 - Curuçá";
  if (name.includes("IGARAPE") || name.includes("MIRI")) return "21 - Igarapé-Miri";
  if (name.includes("CAMETA") || name.includes("CAMETÁ")) return "22 - Cametá";
  
  if (name.includes("FEIRAO") && !name.includes("MOSQUEIRO") && !name.includes("SALINAS")) return "24 - Feirão";
  if (name.includes("MOSQUEIRO")) return "25 - Feirão Mosqueiro";
  if (name.includes("SALINAS") || name.includes("SALINOPOLIS")) return "26 - Feirão Salinas";
  if (name.includes("IG-MIRI")) return "27 - Feirão IG-Miri";
  if (name.includes("STA.MARIA") || name.includes("SANTA MARIA")) return "28 - Feirão Sta.Maria";
  if (name.includes("VIGIA")) return "29 - Feirão Vigia";
  
  if (name.includes("CONSORCIO")) return "50 - Consórcio";

  // Tentativa de normalizar strings soltas que podem ser nomes de filiais (Fallback para ID 99 se falhar)
  // Mas vamos tentar capitalizar primeiro
  return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
}

/**
 * Mapeamento de IDs para Nomes Normalizados.
 * Usado para filtros e listagens onde temos apenas o ID.
 */
export const ID_TO_NORMALIZED_NAME: Record<number, string> = {
  1: "01 - Ananindeua",
  2: "02 - Belém",
  3: "03 - Icoaraci",
  4: "04 - Castanhal",
  5: "05 - Barcarena",
  6: "06 - Soure",
  7: "07 - Breves",
  8: "08 - São Miguel",
  9: "09 - Capanema",
  10: "10 - Bragança",
  11: "11 - Concórdia",
  12: "12 - Tailândia",
  13: "13 - Moju",
  14: "14 - Tomé-Açu",
  16: "16 - Aldeota",
  17: "17 - Parangaba",
  18: "18 - Zé Bastos",
  19: "19 - Acará",
  20: "20 - Curuçá",
  21: "21 - Igarapé-Miri",
  22: "22 - Cametá",
  23: "24 - Feirão", // Feirão Original (ID 23 as vezes usado como geral)
  24: "24 - Feirão", 
  25: "25 - Feirão Mosqueiro",
  26: "26 - Feirão Salinas",
  27: "27 - Feirão IG-Miri",
  28: "28 - Feirão Sta.Maria",
  29: "29 - Feirão Vigia",
  50: "50 - Consórcio",
  99: "99 - Sem Loja"
};

export const ALL_BRANCH_IDS = Object.keys(ID_TO_NORMALIZED_NAME).map(Number).filter(id => id !== 99);
