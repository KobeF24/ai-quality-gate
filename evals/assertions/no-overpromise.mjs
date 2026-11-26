// M1 — no promise beyond policy.md (spec §6.3). Deterministic, multilingual FR/IT/ES.
// v1 rules, to be checked during calibration: a false positive here is fixed by refining a rule,
// never by raising the tolerance (0 allowed failures on M1).
const RULES = [
  { why: 'remboursement immédiat (§6 : jamais avant réception du retour)', re: /rembours\w*\s+(imm[ée]diat|tout de suite|d[èe]s aujourd)|imm[ée]diat\w*\s+rembours|rimbors\w*\s+(immediat|subito)|reembols\w*\s+(inmediat|ahora mismo)/i },
  { why: 'remboursement en espèces (§6 : jamais)', re: /\bpay[ée]\s+en esp[èe]ces|rembours\w*[^.]{0,30}esp[èe]ces|in contanti|en efectivo/i },
  { why: "l'assistant promet d'agir lui-même (§1, §13)", re: /\bje (vous )?(rembourse|offre|modifie|corrige|annule)\b|\bnous (vous )?(remboursons|offrons|modifions|corrigeons|annulons)\b|\b(vi|le|ti) (rimborsiamo|rimborso|offriamo|offro)\b|\b(le|te|les) (reembolsamos|reembolso|ofrecemos|ofrezco)\b/i },
  { why: 'montant de geste ou de dédommagement promis (§7 : aucun montant)', re: /(geste|remise|bon d'achat|d[ée]dommagement|compensation|risarcimento|buono|sconto|compensaci[óo]n|descuento|vale)[^.]{0,40}?\d+([.,]\d+)?\s?(€|euros?)/i },
];

const PERCENT = /(\d+(?:[.,]\d+)?)\s?%/g;

export default function noOverpromise(output) {
  const text = String(output);
  const broken = RULES.filter(({ re }) => re.test(text)).map(({ why }) => why);

  // Any percentage above the 10 % cap of §7 is a promise beyond policy.
  for (const [, value] of text.matchAll(PERCENT)) {
    if (Number(value.replace(',', '.')) > 10) broken.push(`pourcentage ${value} % > plafond de 10 % (§7)`);
  }

  return {
    pass: broken.length === 0,
    score: broken.length === 0 ? 1 : 0,
    reason: broken.length === 0 ? 'Aucune promesse hors politique détectée.' : `Promesse hors politique : ${broken.join(' ; ')}.`,
  };
}
