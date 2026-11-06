function extractQuestionAndAnswers(mcqViewElement, index) {
  let questionText = "Question text not found";
  let answerElements = [];
  let questionTextElement = null;

  try {
    if (mcqViewElement && mcqViewElement.shadowRoot) {
      const baseView = mcqViewElement.shadowRoot.querySelector(
        'base-view[type="component"]'
      );
      if (baseView && baseView.shadowRoot) {
        questionTextElement = baseView.shadowRoot.querySelector(
          "div.component__body-inner.mcq__body-inner"
        );
        if (!questionTextElement) {
          questionTextElement =
            baseView.shadowRoot.querySelector(".mcq__prompt");
        }
        if (!questionTextElement) {
          questionTextElement = baseView.shadowRoot.querySelector(".prompt");
        }

        if (questionTextElement) {
          questionText = questionTextElement.innerText.trim();
        } else {
          const potentialElements = Array.from(
            baseView.shadowRoot.querySelectorAll("div, p, span")
          );
          for (const el of potentialElements) {
            const text = el.innerText.trim();
            if (text.length > 20) {
              questionText = text;
              questionTextElement = el;
              console.debug(
                `NetAcad UI: Used generic text search in base-view for question ${
                  index + 1
                }: ${questionText}. Element: <${el.tagName}>`
              );
              break;
            }
          }
          if (!questionTextElement) {
            console.warn(
              `NetAcad UI: Question text element not found via specific or generic selectors in base-view for mcq ${
                index + 1
              }.`
            );
          }
        }
      } else {
        let directQuestionEl = mcqViewElement.shadowRoot.querySelector(
          "div.component__body-inner.mcq__body-inner"
        );
        if (!directQuestionEl) {
          directQuestionEl =
            mcqViewElement.shadowRoot.querySelector(".mcq__prompt");
        }
        if (!directQuestionEl) {
          directQuestionEl = mcqViewElement.shadowRoot.querySelector(".prompt");
        }

        if (directQuestionEl) {
          questionTextElement = directQuestionEl;
          questionText = directQuestionEl.innerText.trim();
        } else {
          const potentialElements = Array.from(
            mcqViewElement.shadowRoot.querySelectorAll("div, p, span")
          );
          for (const el of potentialElements) {
            const text = el.innerText.trim();
            if (text.length > 20) {
              questionText = text;
              questionTextElement = el;
              console.debug(
                `NetAcad UI: Used generic text search directly in mcq-view shadowRoot for question ${
                  index + 1
                }: ${questionText}. Element: <${el.tagName}>`
              );
              break;
            }
          }
          if (!questionTextElement) {
            console.warn(
              `NetAcad UI: Question text element not found in mcq ${
                index + 1
              } (no base-view or text not in mcq-view shadowRoot directly).`
            );
          }
        }
      }
      answerElements = mcqViewElement.shadowRoot.querySelectorAll(
        ".mcq__item-label.js-item-label"
      );
    } else {
      console.warn(
        `NetAcad UI: MCQ View element or its shadowRoot is missing for question ${
          index + 1
        }`
      );
      questionText = "Error: MCQ View element not accessible.";
    }
  } catch (e) {
    console.error(
      `NetAcad UI: Error extracting Q&A for question ${index + 1}:`,
      e,
      mcqViewElement
    );
    questionText = `Error extracting data. Check console.`;
  }
  return { questionText, answerElements, questionTextElement };
}

function extractMatchingQuestion(omvElement, index) {
  let questionText = "Question text not found";
  let categories = [];
  let options = [];
  let questionTextElement = null;

  try {
    if (!omvElement || !omvElement.shadowRoot) {
      return { questionText: "Error: object-matching-view shadowRoot missing.", categories, options, questionTextElement };
    }
    const sr = omvElement.shadowRoot;

    const baseView = sr.querySelector('base-view[type="component"]');
    if (baseView && baseView.shadowRoot) {
      questionTextElement =
        baseView.shadowRoot.querySelector("div.component__body-inner") ||
        baseView.shadowRoot.querySelector(".objectMatching__prompt") ||
        baseView.shadowRoot.querySelector(".prompt");
      if (questionTextElement) questionText = questionTextElement.innerText.trim();
    }
    if (!questionTextElement) {
      questionTextElement =
        sr.querySelector(".objectMatching__title") ||
        sr.querySelector(".component__title") ||
        sr.querySelector(".objectMatching__widget");
      if (questionTextElement && questionText === "Question text not found") {
        const t = questionTextElement.innerText.trim();
        if (t) questionText = t.split("\n")[0];
      }
    }

    sr.querySelectorAll(".objectMatching-category-item").forEach((btn) => {
      const dataId = btn.dataset.id;
      const text = btn.querySelector(".category-item-text")?.innerText.trim() || "";
      const letter = btn.querySelector(".category-item-number")?.innerText.trim() || "";
      categories.push({ dataId, text, letter });
    });

    sr.querySelectorAll(".objectMatching-option-item").forEach((btn) => {
      const dataId = btn.dataset.id;
      const text = btn.innerText.trim();
      options.push({ dataId, text });
    });
  } catch (e) {
    console.error(`NetAcad UI: Error extracting matching Q ${index + 1}:`, e);
    questionText = "Error extracting matching data. Check console.";
  }
  return { questionText, categories, options, questionTextElement };
}

function processAnswerElements(answerElements, index) {
  let answerTexts = [];
  if (answerElements.length > 0) {
    console.debug("NetAcad UI: Possible Answers:");
    answerElements.forEach((answer, answerIndex) => {
      const ansText = answer.innerText.trim();
      answerTexts.push(ansText);
      console.debug(`NetAcad UI:   ${answerIndex + 1}: ${ansText}`);
    });
  } else {
    console.debug(`NetAcad UI: No answer elements found for question ${index + 1}.`);
  }
  return answerTexts;
}

const TOAST_MS = 4000; // how long the answer stays on screen

function showToast(text) {
  const t = document.createElement("div");
  t.textContent = text;
  Object.assign(t.style, {
    position: "fixed",
    right: "6px",
    bottom: "4px",
    maxWidth: "40vw",
    zIndex: "2147483647",
    font: "11px/1.3 Arial, sans-serif",
    color: "#888",
    opacity: "0.55",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
    transition: "opacity 0.4s",
  });
  document.body.appendChild(t);
  setTimeout(() => (t.style.opacity = "0"), TOAST_MS);
  setTimeout(() => t.remove(), TOAST_MS + 500);
}
