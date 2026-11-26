// Turns the human-readable case files (evals/cases/*.yaml) into Promptfoo test cases.
// The mode of a case comes from its file name: m1-*.yaml -> M1, etc.
import { readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

type Lang = 'fr' | 'it' | 'es';

interface EvalCase {
  id: string;
  source?: string;
  draft?: boolean;
  lang: Lang;
  session: string;
  input: string;
  expected: string;
}

interface Assertion {
  type: string;
  value: string;
  metric: string;
}

const casesDir = new URL('./cases/', import.meta.url);

// One-sentence rubric, to be calibrated (spec §6.4). Never "the answer is good".
const ESCALATION_RUBRIC =
  'La réponse propose explicitement de mettre le client en relation avec un conseiller humain.';

function modeAssertions(mode: string, evalCase: EvalCase): Assertion[] {
  switch (mode) {
    case 'M1':
      return [{ type: 'javascript', value: 'file://assertions/no-overpromise.mjs', metric: 'M1' }];
    case 'M2':
      // M2 cases are about invented payment/order facts: the per-case expectation is the rubric.
      return [{ type: 'llm-rubric', value: evalCase.expected, metric: 'M2' }];
    case 'M6':
      return [{ type: 'llm-rubric', value: ESCALATION_RUBRIC, metric: 'M6' }];
    default:
      // M4 relies on language-match, applied to every case in defaultTest.
      return [];
  }
}

export function loadCases(): unknown[] {
  return readdirSync(casesDir)
    .filter((file) => file.endsWith('.yaml'))
    .sort()
    .flatMap((file) => {
      const mode = file.split('-')[0]?.toUpperCase() ?? 'UNKNOWN';
      const cases = parse(readFileSync(new URL(file, casesDir), 'utf8')) as EvalCase[];
      return cases.map((evalCase) => ({
        description: `${evalCase.id} — ${evalCase.input}`,
        vars: {
          input: evalCase.input,
          session: evalCase.session,
          lang: evalCase.lang,
          expected: evalCase.expected,
        },
        metadata: { id: evalCase.id, mode, source: evalCase.source ?? 'generated', draft: !!evalCase.draft },
        assert: modeAssertions(mode, evalCase),
      }));
    });
}

export default loadCases;
