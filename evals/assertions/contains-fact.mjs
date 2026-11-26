// MT — metamorphic relation (ISTQB CT-AI ch. 9): an equivalent question (translated, rephrased,
// angrier) must keep the same policy fact as its source case. Deterministic.
// The expected fact is a case-insensitive pattern accepting digits and words in FR/IT/ES.
export default function containsFact(output, context) {
  const { fact, family } = context.vars;
  if (!fact) {
    return { pass: false, score: 0, reason: 'Cas métamorphique sans fait attendu (champ `fact`).' };
  }
  const found = new RegExp(fact, 'iu').test(String(output));
  return {
    pass: found,
    score: found ? 1 : 0,
    reason: found
      ? `Fait de la famille « ${family} » bien présent.`
      : `Fait attendu absent (famille « ${family} », motif /${fact}/) : la réponse change selon la formulation.`,
  };
}
