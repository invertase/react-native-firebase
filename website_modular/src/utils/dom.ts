import jsdom from 'jsdom';

export function getDocument(html: string) {
  return new jsdom.JSDOM(html).window.document as Document;
}
