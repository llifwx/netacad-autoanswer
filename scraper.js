function findQuestionElements() {
  const found = [];
  const pageView = document.querySelector("app-root")?.shadowRoot?.querySelector("page-view");
  pageView?.shadowRoot?.querySelectorAll("article-view").forEach((av) => {
    av.shadowRoot?.querySelectorAll("block-view").forEach((bv) => {
      const sr = bv.shadowRoot;
      if (!sr) return;
      const q = sr.querySelector("mcq-view") || sr.querySelector("object-matching-view");
      if (q) found.push(q);
    });
  });
  return found;
}

// The question the user is looking at: the one with the most visible area.
function pickVisibleQuestion(els) {
  let best = null, bestArea = -1;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    const h = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
    const w = Math.min(r.right, innerWidth) - Math.max(r.left, 0);
    const area = Math.max(0, h) * Math.max(0, w);
    if (area > bestArea) { best = el; bestArea = area; }
  }
  return best;
}

function extractQA(el, index) {
  if (el.tagName.toLowerCase() === "object-matching-view") {
    const m = extractMatchingQuestion(el, index);
    if (!m.categories.length || !m.options.length) return null;
    return {
      question: `MATCHING QUESTION. ${m.questionText}\nCategories: ${m.categories
        .map((c) => `${c.letter}=${c.text}`)
        .join(" | ")}\nOptions: ${m.options.map((o, i) => `${i + 1}=${o.text}`).join(" | ")}\nReturn answer as 'A: <option text> /// B: <option text> /// ...' in category order, using the EXACT option texts.`,
      answers: [
        ...m.categories.map((c) => `[CATEGORY ${c.letter}] ${c.text}`),
        ...m.options.map((o, i) => `[OPTION ${i + 1}] ${o.text}`),
      ],
    };
  }
  const ex = extractQuestionAndAnswers(el, index);
  const answers = processAnswerElements(ex.answerElements, index);
  if (ex.questionText.startsWith("Error") || ex.questionText === "Question text not found" || !answers.length) return null;
  return { question: ex.questionText, answers };
}

// Called on hotkey: one request for the question currently on screen.
async function scrapeData() {
  const els = findQuestionElements();
  const el = pickVisibleQuestion(els);
  if (!el) return false;

  const qa = extractQA(el, els.indexOf(el));
  if (!qa) { showToast("?"); return false; }

  const answer = await getAiAnswer(qa.question, qa.answers);
  if (answer.startsWith("Error")) console.warn("NetAcad AI:", answer);
  showToast(answer.startsWith("Error") ? "!" : answer.split(/\s*\/\/\/\s*|\n/).filter(Boolean).join("\n"));
  return true;
}
