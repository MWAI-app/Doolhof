const GAME_URL = "https://mwai-app.github.io/Doolhof/";

function buildShareMessage(level, score, trophyLabel) {
  return `Ik heb level ${level} gehaald in Doolhof met trofee ${trophyLabel} en een score van ${score}! Kun jij dat verslaan? 🏆🌀`;
}

export async function shareProgress(level, score, trophyLabel) {
  const text = buildShareMessage(level, score, trophyLabel);

  if (navigator.share) {
    try {
      await navigator.share({ title: "Doolhof", text, url: GAME_URL });
      return "shared";
    } catch (err) {
      if (err && err.name === "AbortError") return "cancelled";
    }
  }

  try {
    await navigator.clipboard.writeText(`${text} ${GAME_URL}`);
    return "copied";
  } catch {
    return "unavailable";
  }
}
