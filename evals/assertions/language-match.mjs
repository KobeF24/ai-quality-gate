// M4 — the reply must be in the language of the question (spec §6.3).
// Stopword heuristic, no dependency: count frequent words of each language, the highest count wins.
// Words shared by two languages ("con", "del", "una", "que"...) are deliberately left out.
// Each word belongs to ONE language only. Words shared by two of them are excluded on purpose:
// "le" (fr/it), "il" (fr/it), "non" (fr/it), "al" (it/es), "su" (it/es), "en" (fr/es), "ha" (it/es),
// "con", "del", "una", "que", "per"... A shared word made m5-08 a false failure (fr = it = es = 2).
const STOPWORDS = {
  fr: ['je', 'vous', 'votre', 'vos', 'nous', 'les', 'des', 'est', 'pour', 'pas', 'dans', 'avec', 'sur', 'aux', 'cette', 'commande', 'merci', 'être', 'peut', 'mais', 'une', 'compte', 'données', 'maintenant', 'livraison', 'retour', 'remboursement', 'notre'],
  it: ['gli', 'della', 'delle', 'degli', 'dei', 'è', 'lei', 'suo', 'sua', 'mio', 'mia', 'mie', 'nel', 'sono', 'questo', 'ordine', 'grazie', 'può', 'posso', 'essere', 'alla', 'anche', 'conto', 'dati', 'adesso', 'spedizione', 'reso', 'rimborso', 'nostro', 'nostra', 'questa'],
  es: ['el', 'los', 'las', 'es', 'usted', 'para', 'está', 'pedido', 'gracias', 'puede', 'puedo', 'este', 'muy', 'también', 'sus', 'pero', 'hay', 'son', 'cuenta', 'datos', 'ahora', 'esto', 'eso', 'envío', 'devolución', 'reembolso', 'nuestro', 'nuestra'],
};

export function detectLanguage(text) {
  const words = String(text).toLowerCase().match(/[\p{L}']+/gu) ?? [];
  const scores = Object.fromEntries(
    Object.entries(STOPWORDS).map(([lang, list]) => [lang, words.filter((w) => list.includes(w)).length]),
  );
  const [best, second] = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  // A tie is not a verdict: report it as undecidable instead of silently picking the first language.
  if (best[1] === 0 || best[1] === second[1]) return { lang: 'unknown', scores };
  return { lang: best[0], scores };
}

export default function languageMatch(output, context) {
  const expected = context.vars.lang;
  const { lang, scores } = detectLanguage(output);
  const pass = lang === expected;
  return {
    pass,
    score: pass ? 1 : 0,
    reason: `Langue attendue : ${expected}, détectée : ${lang} (${JSON.stringify(scores)}).`,
  };
}
