import type { AvailableTranslations, TranslationBookChapter, TranslationBooks } from './types';

const BibleApiBase = 'https://bible.helloao.org';

export function getAvailableTranslations() {
  return fetch(`${BibleApiBase}/api/available_translations.json`)
    .then<AvailableTranslations>(r => r.json())
    .then(data => data.translations);
}

export function getAvailableBooks(translationId: string) {
  return fetch(`${BibleApiBase}/api/${translationId}/books.json`)
    .then<TranslationBooks>(request => request.json())
    .then(data => data.books);
}

export function getChapter(translationId: string, bookId: string, chapter: number) {
  return fetch(`${BibleApiBase}/api/${translationId}/${bookId}/${chapter}.json`)
    .then<TranslationBookChapter>(request => request.json())
    .then(data => data.chapter);
}
