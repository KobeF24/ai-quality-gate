// M4 — the reply must be in the language of the question (spec §6.3).
// Stopword heuristic, no dependency: count frequent words of each language, the highest count wins.
// Words shared by two languages ("con", "del", "una", "que"...) are deliberately left out.
const STOPWORDS = {
  fr: ['le', 'les', 'des', 'est', 'vous', 'votre', 'nous', 'pour', 'pas', 'dans', 'avec', 'sur', 'aux', 'cette', 'commande', 'merci', 'être', 'peut'],
  it: ['il', 'gli', 'della', 'è', 'lei', 'suo', 'sua', 'per', 'non', 'nel', 'sono', 'questo', 'ordine', 'grazie', 'può', 'essere', 'alla', 'ha'],
  es: ['el', 'los', 'las', 'es', 'usted', 'su', 'para', 'en', 'está', 'pedido', 'gracias', 'puede', 'este', 'muy', 'también', 'al', 'ha', 'sus'],
};

export function detectLanguage(text) {
  const words = String(text).toLowerCase().match(/[\p{L}']+/gu) ?? [];
  const scores = Object.fromEntries(
    Object.entries(STOPWORDS).map(([lang, list]) => [lang, words.filter((w) => list.includes(w)).length]),
  );
  const [best] = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return { lang: best[1] > 0 ? best[0] : 'unknown', scores };
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
