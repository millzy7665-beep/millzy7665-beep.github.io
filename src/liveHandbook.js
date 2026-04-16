import { doc, onSnapshot } from "firebase/firestore";
import { getFirestoreDb } from "./firebase";

function isValidSection(section) {
  return section && typeof section.title === "string" && typeof section.content === "string";
}

function isValidQuizQuestion(question) {
  return (
    question &&
    typeof question.q === "string" &&
    Array.isArray(question.options) &&
    question.options.every((option) => typeof option === "string") &&
    typeof question.correct === "number" &&
    typeof question.explanation === "string"
  );
}

function mergeChapter(baseChapter, overrideChapter) {
  return {
    ...baseChapter,
    ...(typeof overrideChapter.title === "string" ? { title: overrideChapter.title } : {}),
    ...(typeof overrideChapter.icon === "string" ? { icon: overrideChapter.icon } : {}),
    ...(typeof overrideChapter.color === "string" ? { color: overrideChapter.color } : {}),
    ...(Array.isArray(overrideChapter.sections)
      ? { sections: overrideChapter.sections.filter(isValidSection) }
      : {}),
    ...(Array.isArray(overrideChapter.quiz)
      ? { quiz: overrideChapter.quiz.filter(isValidQuizQuestion) }
      : {}),
  };
}

export function mergeLiveChapters(baseChapters, payload) {
  if (!payload || payload.enabled === false || !Array.isArray(payload.chapters)) {
    return baseChapters;
  }

  const overridesById = new Map(
    payload.chapters
      .filter((chapter) => chapter && typeof chapter.id === "string")
      .map((chapter) => [chapter.id, chapter])
  );

  return baseChapters.map((chapter) => {
    const override = overridesById.get(chapter.id);
    return override ? mergeChapter(chapter, override) : chapter;
  });
}

export function subscribeToLiveHandbook(baseChapters, onUpdate) {
  const db = getFirestoreDb();

  if (!db) {
    onUpdate(baseChapters);
    return () => {};
  }

  const handbookDoc = doc(db, "public", "handbookContent");

  return onSnapshot(
    handbookDoc,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(baseChapters);
        return;
      }

      onUpdate(mergeLiveChapters(baseChapters, snapshot.data()));
    },
    () => {
      onUpdate(baseChapters);
    }
  );
}