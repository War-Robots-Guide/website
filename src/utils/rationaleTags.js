const TAG_START_SOURCE = '(?<!\\[)(?:👥|‼️|(?:⬆|⬇|👁)\\uFE0F?)(?!\\uFE0F?\\])';
const FIRST_TAG_REGEX = new RegExp(TAG_START_SOURCE, 'u');
const TAG_REGEX = new RegExp(`(${TAG_START_SOURCE})\\s*([\\s\\S]*?)(?=(?:${TAG_START_SOURCE}|$))`, 'gu');

export function parseRationaleAndTags(rawDescription) {
  if (!rawDescription) {
    return { mainRationale: '', tagNotes: [] };
  }

  // Find the first index where an unbracketed tag emoji starts a note
  const firstMatch = FIRST_TAG_REGEX.exec(rawDescription);
  if (!firstMatch) {
    return { mainRationale: rawDescription.trim(), tagNotes: [] };
  }
  const firstTagIndex = firstMatch.index;

  const mainRationale = rawDescription.slice(0, firstTagIndex).trim();
  const tagsSegment = rawDescription.slice(firstTagIndex);

  const tagNotes = [];
  TAG_REGEX.lastIndex = 0;
  let match;
  while ((match = TAG_REGEX.exec(tagsSegment)) !== null) {
    const tagEmoji = match[1];
    const text = match[2].trim();
    if (text || tagEmoji) {
      tagNotes.push({ tag: tagEmoji, text });
    }
  }

  return { mainRationale: mainRationale || rawDescription.trim(), tagNotes };
}

