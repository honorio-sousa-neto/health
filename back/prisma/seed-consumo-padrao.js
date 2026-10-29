/**
 * Seed do consumo padrão (receitas de consumíveis por serviço).
 *
 *   node prisma/seed-consumo-padrao.js                    aplica tudo
 *   node prisma/seed-consumo-padrao.js --dry-run          simula
 *   node prisma/seed-consumo-padrao.js --skip-classificacao
 *
 * Idempotente: pode correr as vezes que forem precisas. Os consumíveis são
 * reaproveitados pelo nome e as receitas substituídas, nunca acumuladas.
 *
 * Os serviços são resolvidos por NOME, não por ID — o seeder funciona em
 * qualquer base, desde que os serviços já existam (correr depois de
 * seed-services.js).
 *
 * GERADO por scripts/gerar-seeder.ts a partir de dados já validados contra o
 * Mapa de Rentabilidade/Custeio. Para actualizar: altere as receitas na
 * aplicação e volte a correr o gerador.
 *
 * Cobertura: 88 serviços, 74 consumíveis, 581 linhas.
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");
const SKIP_CLASSIFICACAO = process.argv.includes("--skip-classificacao");

/**
 * Classificação por categoria-raiz:
 *   Farmácia            -> PRODUCT     (vendáveis, com stock)
 *   Laboratório (raiz)  -> CONSUMABLE  (reagentes e materiais)
 *   restantes           -> SERVICE
 * As subcategorias do Laboratório (Bioquímica, Serologia, ...) são exames,
 * logo SERVICE.
 */
function classificar(raiz, temSubcategoria) {
  const r = (raiz || "").toLowerCase();
  if (r.startsWith("farm")) return "PRODUCT";
  if (r.startsWith("laborat") && !temSubcategoria) return "CONSUMABLE";
  return "SERVICE";
}

/** Catálogo de consumíveis. */
const CONSUMIVEIS = [
  { nome: "Ácido fosfórico", preco: 170, material: "reagent", unidade: "fr" },
  { nome: "Adesivo", preco: 32, material: "consumable", unidade: "un" },
  { nome: "Água destilada", preco: 25, material: "consumable", unidade: "un" },
  { nome: "Água oxigenada", preco: 35, material: "consumable", unidade: "fr" },
  { nome: "Agulha descartável", preco: 12.43, material: "consumable", unidade: "un" },
  { nome: "Agulha gengival", preco: 159, material: "consumable", unidade: "un" },
  { nome: "Álcool (aplicação)", preco: 20, material: "consumable", unidade: "un" },
  { nome: "Algodão (aplicação)", preco: 20, material: "consumable", unidade: "un" },
  { nome: "Anestésico com vasoconstritor", preco: 800, material: "reagent", unidade: "amp" },
  { nome: "Anestésico sem vasoconstritor", preco: 500, material: "reagent", unidade: "amp" },
  { nome: "Babete", preco: 100.35, material: "consumable", unidade: "un" },
  { nome: "Bata descartável", preco: 1100, material: "epi", unidade: "un" },
  { nome: "Bisturi", preco: 12.43, material: "consumable", unidade: "un" },
  { nome: "Bond (adesivo dentário)", preco: 210, material: "reagent", unidade: "fr" },
  { nome: "Borboleta", preco: 35, material: "consumable", unidade: "un" },
  { nome: "Bránula", preco: 145, material: "consumable", unidade: "un" },
  { nome: "Cimento obturador provisório", preco: 0, material: "reagent", unidade: "un" },
  { nome: "Compressas", preco: 195, material: "consumable", unidade: "un" },
  { nome: "Copo descartável", preco: 100, material: "consumable", unidade: "un" },
  { nome: "Enxaguante bucal", preco: 150, material: "consumable", unidade: "fr" },
  { nome: "Escova de dentes", preco: 150, material: "consumable", unidade: "un" },
  { nome: "Escova de Robson", preco: 500, material: "consumable", unidade: "un" },
  { nome: "Espátula de madeira", preco: 100, material: "consumable", unidade: "un" },
  { nome: "Espéculo", preco: 1000, material: "consumable", unidade: "un" },
  { nome: "Fita reativa", preco: 175, material: "consumable", unidade: "un" },
  { nome: "Frasco colector", preco: 210, material: "consumable", unidade: "un" },
  { nome: "Gel de ecografia", preco: 225, material: "consumable", unidade: "fr" },
  { nome: "Guardanapos", preco: 15, material: "consumable", unidade: "un" },
  { nome: "Iodopovidona (Betadine)", preco: 250, material: "consumable", unidade: "fr" },
  { nome: "Lamela", preco: 50, material: "glassware", unidade: "un" },
  { nome: "Lâmina de vidro", preco: 0, material: "glassware", unidade: "un" },
  { nome: "Lanceta", preco: 480, material: "consumable", unidade: "un" },
  { nome: "Ligadura", preco: 195, material: "consumable", unidade: "un" },
  { nome: "Luvas de exame", preco: 35, material: "epi", unidade: "par" },
  { nome: "Máscara descartável", preco: 40, material: "epi", unidade: "un" },
  { nome: "Papel descartável", preco: 2500, material: "consumable", unidade: "un" },
  { nome: "Pasta de dentes", preco: 200, material: "consumable", unidade: "un" },
  { nome: "Pasta profilática", preco: 50, material: "consumable", unidade: "un" },
  { nome: "Película radiográfica", preco: 3125, material: "consumable", unidade: "un" },
  { nome: "Ponta amarela", preco: 60, material: "consumable", unidade: "un" },
  { nome: "Ponta azul", preco: 60, material: "consumable", unidade: "un" },
  { nome: "Ponta destartarizadora", preco: 500, material: "consumable", unidade: "un" },
  { nome: "Reagente 1", preco: 90, material: "consumable", unidade: "un" },
  { nome: "Reagente Anti-A (10 mL)", preco: 165, material: "reagent", unidade: "fr" },
  { nome: "Reagente Anti-AB (10 mL)", preco: 165, material: "reagent", unidade: "fr" },
  { nome: "Reagente Anti-B (10 mL)", preco: 165, material: "reagent", unidade: "fr" },
  { nome: "Reagente Anti-D (10 mL)", preco: 165, material: "reagent", unidade: "fr" },
  { nome: "Reagente Widal Anti-H 5 mL", preco: 220, material: "reagent", unidade: "fr" },
  { nome: "Reagente Widal Anti-O 5 mL", preco: 220, material: "reagent", unidade: "fr" },
  { nome: "Resina composta A2", preco: 176, material: "reagent", unidade: "un" },
  { nome: "Rolete de algodão", preco: 31.6, material: "consumable", unidade: "un" },
  { nome: "Rolo de papel", preco: 980, material: "consumable", unidade: "rolo" },
  { nome: "Sabonete", preco: 200, material: "consumable", unidade: "un" },
  { nome: "Selante de fissuras", preco: 0, material: "reagent", unidade: "un" },
  { nome: "Seringa descartável", preco: 50, material: "consumable", unidade: "un" },
  { nome: "Sistema de soro", preco: 200, material: "consumable", unidade: "un" },
  { nome: "Solução de Dec", preco: 100, material: "consumable", unidade: "fr" },
  { nome: "Soro fisiológico", preco: 850, material: "consumable", unidade: "fr" },
  { nome: "Sugador", preco: 120, material: "consumable", unidade: "un" },
  { nome: "Teste Chicungunha", preco: 1200, material: "reagent", unidade: "teste" },
  { nome: "Teste Dengue", preco: 1200, material: "reagent", unidade: "teste" },
  { nome: "Teste Fator Reumatoide (cx 25)", preco: 530, material: "reagent", unidade: "cx" },
  { nome: "Teste HBS Ag", preco: 600, material: "reagent", unidade: "teste" },
  { nome: "Teste HCG (gravidez)", preco: 530, material: "reagent", unidade: "teste" },
  { nome: "Teste HCV", preco: 530, material: "reagent", unidade: "teste" },
  { nome: "Teste HIV", preco: 1420, material: "reagent", unidade: "teste" },
  { nome: "Teste PCR (caixa 25)", preco: 600, material: "reagent", unidade: "cx" },
  { nome: "Teste TASO (caixa 25)", preco: 530, material: "reagent", unidade: "cx" },
  { nome: "Teste VDRL", preco: 530, material: "reagent", unidade: "teste" },
  { nome: "Tubo com anticoagulante", preco: 220, material: "glassware", unidade: "tubo" },
  { nome: "Tubo de ensaio", preco: 220, material: "glassware", unidade: "tubo" },
  { nome: "Tubo seco", preco: 220, material: "glassware", unidade: "tubo" },
  { nome: "Vela", preco: 100, material: "consumable", unidade: "un" },
  { nome: "Zaragatoa", preco: 250, material: "consumable", unidade: "un" },
];

/** Receitas: quanto cada serviço consome de cada consumível. */
const RECEITAS = [
  { servico: "Ácido Úrico", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Aplicação Selantes de Fissuras (por dente)", itens: [{ c: "Ácido fosfórico", q: 1 }, { c: "Babete", q: 1 }, { c: "Bond (adesivo dentário)", q: 1 }, { c: "Copo descartável", q: 1 }, { c: "Enxaguante bucal", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Rolete de algodão", q: 1 }, { c: "Selante de fissuras", q: 1 }, { c: "Sugador", q: 1 }] },
  { servico: "Bilirrubina Direta", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Bilirrubina Total", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Ponta azul", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Chicungunha", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste Chicungunha", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "Colesterol", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Consulta Normal (Marcada)", itens: [{ c: "Espátula de madeira", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }] },
  { servico: "Creatinina", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Dengue", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste Dengue", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "Destartarização", itens: [{ c: "Babete", q: 1 }, { c: "Copo descartável", q: 1 }, { c: "Enxaguante bucal", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Ponta destartarizadora", q: 1 }, { c: "Sugador", q: 1 }] },
  { servico: "Ecocardiograma", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Abdominal", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Mamária", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Morfológica", itens: [{ c: "Espéculo", q: 1 }, { c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Obstétrica", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Partes Moles", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Pélvica", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Prostática", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Renal", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Testicular (1x)", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Testicular (2x)", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Ecografia Transvaginal", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Eletrocardiograma", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Guardanapos", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Espermograma", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Fita reativa", q: 1 }, { c: "Frasco colector", q: 1 }, { c: "Lamela", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }] },
  { servico: "Extração (Raiz Residual)", itens: [{ c: "Agulha gengival", q: 1 }, { c: "Anestésico com vasoconstritor", q: 1 }, { c: "Babete", q: 1 }, { c: "Bisturi", q: 1 }, { c: "Cimento obturador provisório", q: 1 }, { c: "Compressas", q: 1 }, { c: "Iodopovidona (Betadine)", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Resina composta A2", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Sugador", q: 1 }] },
  { servico: "Extração de Molares", itens: [{ c: "Agulha gengival", q: 1 }, { c: "Anestésico com vasoconstritor", q: 1 }, { c: "Anestésico sem vasoconstritor", q: 1 }, { c: "Babete", q: 1 }, { c: "Bisturi", q: 1 }, { c: "Copo descartável", q: 1 }, { c: "Iodopovidona (Betadine)", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Resina composta A2", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Sugador", q: 1 }] },
  { servico: "Exudado Vaginal", itens: [{ c: "Lamela", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Zaragatoa", q: 1 }] },
  { servico: "Falciformação", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Lamela", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Vela", q: 1 }] },
  { servico: "Fator Reumatoide", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste Fator Reumatoide (cx 25)", q: 0.04 }, { c: "Tubo seco", q: 1 }] },
  { servico: "Fezes", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Frasco colector", q: 1 }, { c: "Luvas de exame", q: 1 }] },
  { servico: "Ginecologia", itens: [{ c: "Gel de ecografia", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Papel descartável", q: 1 }, { c: "Rolo de papel", q: 1 }] },
  { servico: "Glicemia", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Glucose", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Gota Espessa", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Lâmina de vidro", q: 1 }, { c: "Lanceta", q: 1 }, { c: "Luvas de exame", q: 1 }] },
  { servico: "Grupo Sanguíneo", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Reagente Anti-A (10 mL)", q: 0.02 }, { c: "Reagente Anti-AB (10 mL)", q: 0.02 }, { c: "Reagente Anti-B (10 mL)", q: 0.02 }, { c: "Reagente Anti-D (10 mL)", q: 0.02 }, { c: "Seringa descartável", q: 1 }] },
  { servico: "HBS Ag", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste HBS Ag", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "HCG (Teste de Gravidez)", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste HCG (gravidez)", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "HCV", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste HCV", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "HDL", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Hemograma Completo", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo com anticoagulante", q: 1 }] },
  { servico: "HIV", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste HIV", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "Internamento 12h (Beta)", itens: [{ c: "Água oxigenada", q: 1 }, { c: "Agulha descartável", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bisturi", q: 1 }, { c: "Borboleta", q: 1 }, { c: "Bránula", q: 1 }, { c: "Compressas", q: 1 }, { c: "Escova de dentes", q: 1 }, { c: "Iodopovidona (Betadine)", q: 1 }, { c: "Ligadura", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Pasta de dentes", q: 1 }, { c: "Sabonete", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Sistema de soro", q: 1 }, { c: "Soro fisiológico", q: 1 }] },
  { servico: "Internamento 24h (Gama)", itens: [{ c: "Água oxigenada", q: 1 }, { c: "Agulha descartável", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bisturi", q: 1 }, { c: "Borboleta", q: 1 }, { c: "Bránula", q: 1 }, { c: "Compressas", q: 1 }, { c: "Escova de dentes", q: 1 }, { c: "Iodopovidona (Betadine)", q: 1 }, { c: "Ligadura", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Pasta de dentes", q: 1 }, { c: "Sabonete", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Sistema de soro", q: 1 }, { c: "Soro fisiológico", q: 1 }] },
  { servico: "Internamento 6h (Alfa)", itens: [{ c: "Água oxigenada", q: 1 }, { c: "Agulha descartável", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bisturi", q: 1 }, { c: "Borboleta", q: 1 }, { c: "Bránula", q: 1 }, { c: "Compressas", q: 1 }, { c: "Escova de dentes", q: 1 }, { c: "Iodopovidona (Betadine)", q: 1 }, { c: "Ligadura", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Pasta de dentes", q: 1 }, { c: "Sabonete", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Sistema de soro", q: 1 }, { c: "Soro fisiológico", q: 1 }] },
  { servico: "LDL", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Observação 1h (Alfa)", itens: [{ c: "Adesivo", q: 1 }, { c: "Agulha descartável", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bránula", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Sistema de soro", q: 1 }, { c: "Soro fisiológico", q: 1 }] },
  { servico: "Observação 2h (Beta)", itens: [{ c: "Adesivo", q: 2 }, { c: "Agulha descartável", q: 2 }, { c: "Álcool (aplicação)", q: 2 }, { c: "Algodão (aplicação)", q: 2 }, { c: "Bránula", q: 2 }, { c: "Luvas de exame", q: 2 }, { c: "Máscara descartável", q: 2 }, { c: "Seringa descartável", q: 2 }, { c: "Sistema de soro", q: 2 }, { c: "Soro fisiológico", q: 2 }] },
  { servico: "Observação 3h (Gama)", itens: [{ c: "Adesivo", q: 3 }, { c: "Agulha descartável", q: 3 }, { c: "Álcool (aplicação)", q: 3 }, { c: "Algodão (aplicação)", q: 3 }, { c: "Bránula", q: 3 }, { c: "Luvas de exame", q: 3 }, { c: "Máscara descartável", q: 3 }, { c: "Seringa descartável", q: 2 }, { c: "Sistema de soro", q: 3 }, { c: "Soro fisiológico", q: 3 }] },
  { servico: "Observação 4h (Delta)", itens: [{ c: "Adesivo", q: 3 }, { c: "Agulha descartável", q: 3 }, { c: "Álcool (aplicação)", q: 3 }, { c: "Algodão (aplicação)", q: 3 }, { c: "Bránula", q: 3 }, { c: "Luvas de exame", q: 3 }, { c: "Máscara descartável", q: 3 }, { c: "Seringa descartável", q: 2 }, { c: "Sistema de soro", q: 3 }, { c: "Soro fisiológico", q: 3 }] },
  { servico: "PCR", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste PCR (caixa 25)", q: 0.04 }, { c: "Tubo seco", q: 1 }] },
  { servico: "Pequenas Cirurgias (Alfa)", itens: [{ c: "Adesivo", q: 1 }, { c: "Água oxigenada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bisturi", q: 1 }, { c: "Compressas", q: 1 }, { c: "Iodopovidona (Betadine)", q: 1 }, { c: "Ligadura", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Solução de Dec", q: 1 }, { c: "Soro fisiológico", q: 1 }] },
  { servico: "Pequenas Cirurgias (Beta)", itens: [{ c: "Adesivo", q: 3 }, { c: "Água oxigenada", q: 3 }, { c: "Álcool (aplicação)", q: 3 }, { c: "Algodão (aplicação)", q: 3 }, { c: "Bisturi", q: 3 }, { c: "Compressas", q: 3 }, { c: "Iodopovidona (Betadine)", q: 3 }, { c: "Ligadura", q: 3 }, { c: "Luvas de exame", q: 3 }, { c: "Máscara descartável", q: 3 }, { c: "Seringa descartável", q: 3 }, { c: "Solução de Dec", q: 3 }, { c: "Soro fisiológico", q: 3 }] },
  { servico: "Pequenas Cirurgias (Gama)", itens: [{ c: "Adesivo", q: 7 }, { c: "Água oxigenada", q: 7 }, { c: "Álcool (aplicação)", q: 7 }, { c: "Algodão (aplicação)", q: 7 }, { c: "Bisturi", q: 7 }, { c: "Compressas", q: 7 }, { c: "Iodopovidona (Betadine)", q: 7 }, { c: "Ligadura", q: 7 }, { c: "Luvas de exame", q: 7 }, { c: "Máscara descartável", q: 7 }, { c: "Seringa descartável", q: 7 }, { c: "Solução de Dec", q: 7 }, { c: "Soro fisiológico", q: 7 }] },
  { servico: "Próflacia Completa", itens: [{ c: "Babete", q: 1 }, { c: "Copo descartável", q: 1 }, { c: "Enxaguante bucal", q: 1 }, { c: "Escova de Robson", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Máscara descartável", q: 1 }, { c: "Pasta profilática", q: 1 }, { c: "Sugador", q: 1 }] },
  { servico: "Raio X da Bacia (Pélvis)", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Raio X da Coluna Cervical", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X da Coluna Dorsal (Torácica)", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Raio X da Coluna Lombar", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X da Coluna Total", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 6 }] },
  { servico: "Raio X da Mão AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Abdómen", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 1 }] },
  { servico: "Raio X do Abdómen + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Antebraço AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Braço", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Raio X do Braço Axial", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Crânio AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Fémur AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Joelho AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Raio X do Joelho Comparativo", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Ombro", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Raio X do Pé AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Punho AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Tórax AP", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 1 }] },
  { servico: "Raio X do Tórax AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X do Tornozelo AP + Perfil", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Raio X Seios Perinasais", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Reacção Widal", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Reagente Widal Anti-H 5 mL", q: 0.038462 }, { c: "Reagente Widal Anti-O 5 mL", q: 0.038462 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "TASO", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste TASO (caixa 25)", q: 0.04 }, { c: "Tubo seco", q: 1 }] },
  { servico: "Técnica de Cavu", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Técnica de Joelho em Carga", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "Técnica de Rã", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 4 }] },
  { servico: "Técnica de Rótula", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Bata descartável", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Película radiográfica", q: 2 }] },
  { servico: "TGO", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "TGP", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
  { servico: "Urina", itens: [{ c: "Fita reativa", q: 1 }, { c: "Frasco colector", q: 1 }, { c: "Lamela", q: 1 }, { c: "Luvas de exame", q: 1 }] },
  { servico: "V.S", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo com anticoagulante", q: 1 }] },
  { servico: "VDRL", itens: [{ c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Teste VDRL", q: 1 }, { c: "Tubo seco", q: 1 }] },
  { servico: "VLDL", itens: [{ c: "Água destilada", q: 1 }, { c: "Álcool (aplicação)", q: 1 }, { c: "Algodão (aplicação)", q: 1 }, { c: "Luvas de exame", q: 1 }, { c: "Ponta amarela", q: 1 }, { c: "Seringa descartável", q: 1 }, { c: "Tubo de ensaio", q: 1 }] },
];

async function aplicarClassificacao() {
  const servicos = await prisma.service.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, type: true, category: { select: { name: true, category: { select: { name: true } } } } },
  });

  const mudancas = [];
  for (const s of servicos) {
    const raiz = s.category?.category?.name ?? s.category?.name ?? "";
    const proposto = classificar(raiz, !!s.category?.category);
    if (s.type !== proposto) mudancas.push({ id: s.id, de: s.type, para: proposto });
  }

  if (!mudancas.length) {
    console.log("  classificação já correcta, nada a fazer");
    return;
  }

  const resumo = {};
  mudancas.forEach((m) => {
    const k = m.de + " -> " + m.para;
    resumo[k] = (resumo[k] || 0) + 1;
  });
  Object.entries(resumo).forEach(([k, v]) => console.log("  " + String(v).padStart(4) + "  " + k));

  if (DRY_RUN) return;
  await prisma.$transaction(
    mudancas.map((m) => prisma.service.update({ where: { id: m.id }, data: { type: m.para } }))
  );
}

async function aplicarConsumiveis() {
  const categoria = await prisma.category.findFirst({
    where: { name: "Laboratório", categoryId: null, deletedAt: null },
    select: { id: true },
  });
  if (!categoria) throw new Error('Categoria "Laboratório" não encontrada — correr seed-services.js primeiro.');

  const unidades = await prisma.unitOfMeasure.findMany({ select: { id: true, abbreviation: true } });
  const unidadeId = new Map(unidades.map((u) => [u.abbreviation, u.id]));

  const existentes = await prisma.service.findMany({
    where: { name: { in: CONSUMIVEIS.map((c) => c.nome) }, deletedAt: null },
    select: { id: true, name: true },
  });
  const porNome = new Map(existentes.map((s) => [s.name, s.id]));

  const criar = CONSUMIVEIS.filter((c) => !porNome.has(c.nome)).length;
  console.log("  " + criar + " a criar, " + (CONSUMIVEIS.length - criar) + " já existem");
  if (DRY_RUN) return porNome;

  for (const c of CONSUMIVEIS) {
    const dados = {
      type: "CONSUMABLE",
      unit_price: c.preco,
      materialCategory: c.material,
      ...(unidadeId.has(c.unidade) ? { unitId: unidadeId.get(c.unidade) } : {}),
    };
    const id = porNome.get(c.nome);
    if (id) {
      await prisma.service.update({ where: { id }, data: dados });
    } else {
      const novo = await prisma.service.create({
        data: { name: c.nome, categoryId: categoria.id, ...dados },
        select: { id: true },
      });
      porNome.set(c.nome, novo.id);
    }
  }
  return porNome;
}

async function aplicarReceitas(idPorNome) {
  const nomes = RECEITAS.map((r) => r.servico);
  const servicos = await prisma.service.findMany({
    where: { name: { in: nomes }, deletedAt: null },
    select: { id: true, name: true },
  });
  const idServico = new Map(servicos.map((s) => [s.name, s.id]));

  const emFalta = nomes.filter((n) => !idServico.has(n));
  if (emFalta.length) {
    console.log("  " + emFalta.length + " serviço(s) não encontrado(s) pelo nome — receita ignorada:");
    emFalta.forEach((n) => console.log("      - " + n));
  }

  const aplicaveis = RECEITAS.filter((r) => idServico.has(r.servico));
  console.log("  " + aplicaveis.length + " receitas aplicáveis");
  if (DRY_RUN) return;

  for (const r of aplicaveis) {
    const serviceId = idServico.get(r.servico);
    const itens = r.itens
      .map((i) => ({ consumableId: idPorNome.get(i.c), quantity: i.q }))
      .filter((i) => i.consumableId);

    await prisma.$transaction(async (tx) => {
      await tx.materialOfService.deleteMany({
        where: { serviceId, consumableId: { notIn: itens.map((i) => i.consumableId) } },
      });
      for (const it of itens) {
        await tx.materialOfService.upsert({
          where: { consumableId_serviceId: { consumableId: it.consumableId, serviceId } },
          update: { quantity: it.quantity },
          create: { serviceId, consumableId: it.consumableId, quantity: it.quantity },
        });
      }
    });
  }
}

async function main() {
  console.log(DRY_RUN ? "[SIMULAÇÃO] nada será gravado\n" : "");

  if (SKIP_CLASSIFICACAO) {
    console.log("Classificação: ignorada (--skip-classificacao)");
  } else {
    console.log("Classificação de serviços/produtos/consumíveis:");
    await aplicarClassificacao();
  }

  console.log("\nCatálogo de consumíveis:");
  const idPorNome = await aplicarConsumiveis();

  console.log("\nReceitas de consumo padrão:");
  await aplicarReceitas(idPorNome);

  if (!DRY_RUN) {
    const nConsumiveis = await prisma.service.count({ where: { type: "CONSUMABLE", deletedAt: null } });
    const nLinhas = await prisma.materialOfService.count();
    const comReceita = await prisma.materialOfService.groupBy({ by: ["serviceId"], _count: true });
    console.log("\n✅ Concluído.");
    console.log("   " + nConsumiveis + " consumíveis | " + comReceita.length + " serviços com consumo padrão | " + nLinhas + " linhas");
  }

  await prisma.$disconnect();
}

module.exports = main;

// Só corre sozinho quando invocado directamente; via seed-all.js é importado.
if (require.main === module) {
  main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
