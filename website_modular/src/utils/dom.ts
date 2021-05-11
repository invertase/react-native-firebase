import jsdom from 'jsdom';

/**
 * Returns a virtual Document from a string of HTML.
 */
export function getDocument(html: string) {
  return new jsdom.JSDOM(`<body>${html}</body>`).window.document as Document;
}

/**
 * Selects all types from a document.
 *
 * A type is defined as a list element of a H2.
 *
 * @param document
 * @returns
 */
export function getModuleTypes(document: Document): { [key: string]: string } {
  const elements = document.querySelectorAll('h2 + ul li a');

  const types = {};

  elements.forEach(element => {
    types[element.innerHTML] = element.getAttribute('href');
  });

  return types;
}
