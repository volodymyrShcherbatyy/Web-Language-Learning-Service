const DEFAULT_SESSION_SIZE = 10;

function scoreProgressRow(progress) {
  const now = Date.now();
  const nextReviewTime = progress.next_review_at ? new Date(progress.next_review_at).getTime() : 0;

  if (progress.status === 'new') {
    return 300;
  }

  if (progress.status === 'learning' && (!nextReviewTime || nextReviewTime <= now)) {
    return 250;
  }

  if (progress.status === 'learned' && nextReviewTime && nextReviewTime <= now) {
    return 180;
  }

  if (progress.status === 'learning') {
    return 120;
  }

  return 50;
}

function chooseExerciseType(progress) {
  if (progress.status === 'new') {
    return 'new_word';
  }

  if (progress.status === 'learning') {
    return 'repetition';
  }

  return 'reinforcement';
}

function buildSessionExercises(progressRows, requestedSize = DEFAULT_SESSION_SIZE) {
  const ranked = [...progressRows]
    .sort((a, b) => scoreProgressRow(b) - scoreProgressRow(a))
    .slice(0, requestedSize);

  return ranked.map((row, index) => ({
    conceptId: row.concept_id,
    exerciseType: chooseExerciseType(row),
    orderIndex: index + 1
  }));
}

function nextStatusAfterAnswer(currentStatus, isCorrect) {
  if (!isCorrect) {
    return currentStatus === 'learned' ? 'learning' : currentStatus;
  }

  if (currentStatus === 'new') {
    return 'learning';
  }

  if (currentStatus === 'learning') {
    return 'learned';
  }

  return 'learned';
}

function computeNextReviewAt(progressStatus, isCorrect) {
  const now = new Date();

  if (!isCorrect) {
    now.setHours(now.getHours() + 6);
    return now;
  }

  if (progressStatus === 'new') {
    now.setDate(now.getDate() + 1);
    return now;
  }

  if (progressStatus === 'learning') {
    now.setDate(now.getDate() + 3);
    return now;
  }

  now.setDate(now.getDate() + 7);
  return now;
}

module.exports = {
  buildSessionExercises,
  nextStatusAfterAnswer,
  computeNextReviewAt,
  DEFAULT_SESSION_SIZE
};
