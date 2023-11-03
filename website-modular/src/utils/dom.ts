import jsdom from 'jsdom';
import sanitizeHtml from 'sanitize-html';

/**
 * Returns a virtual Document from a string of HTML.
 */
export function getDocument(html: string) {
    return new jsdom.JSDOM(`<body>${html}</body>`).window.document as Document;
}

export type ModuleTypes = { [key: string]: string };

/**
 * Selects all types from a document.
 *
 * A type is defined as a list element of a H2.
 *
 * @param document
 * @returns
 */
export function getModuleTypes(document: Document): ModuleTypes {
    const elements = document.querySelectorAll('h2 + ul li a');

    const types: ModuleTypes = {};

    elements.forEach((element) => {
        const href = element.getAttribute('href');
        if (!href) return;
        types[element.innerHTML] = href.replace('.md', '');
    });

    return types;
}

/**
 * Markdown produces definitions a `p` tags which start with a
 * symbol. To get these into a readable format, we first find the nodes
 * and then wrap the code within `pre` tags.
 *
 * @param document
 */
export function sanitizeDefinitions(document: Document) {
    document.querySelectorAll('p').forEach((node) => {
        const html = node.innerHTML;

        if (
            html.startsWith('\\+') ||
            html.startsWith('▸') ||
            html.startsWith('Ƭ') ||
            html.startsWith('▪') ||
            html.startsWith('•')
        ) {
            const pre = document.createElement('pre');
            pre.setAttribute('data-sanitized', 'true');

            const div = document.createElement('div');

            // Remove any internal HTML
            div.innerHTML =
                sanitizeHtml(node.innerHTML, {
                    allowedTags: [], // remove all tags and return text content only
                    allowedAttributes: {}, // remove all tags and return text content only
                }).substring(1) + '&nbsp;';

            pre.appendChild(div);
            node.replaceWith(pre);
        }
    });
}

/**
 * Converts any `pre` elements which have been sanitized and applies
 * custom styling/highlighting to the string.
 *
 * @param document
 * @param types
 */
export function highlightDefinitions(document: Document, types: ModuleTypes) {
    document
        .querySelectorAll('pre[data-sanitized="true"] > div')
        .forEach((node) => {
            let html = node.innerHTML;

            // Colorize any TypeScript base types
            html = html.replace(
                /(string|number|boolean|unknown|any|void|null|undefined|never|object)/g,
                '<span style="color: #abe338;">$1</span>',
            );

            // Colorize any web/global types
            html = html.replace(
                /(Promise|Blob|Uint8Array|ArrayBuffer)/g,
                '<span style="color: #ffa07a;">$1</span>',
            );

            // Convert any static words to a color and lowercase
            html = html.replace(
                /Const|Readonly|Optional/g,
                (v) =>
                    `<span style="color: #d4d0ab;">${v.toLowerCase()}</span>`,
            );

            // Colorize any known types, and provide a link to the page.
            Object.entries(types).forEach(([type, href]) => {
                const regex = new RegExp(`(${type})`, 'g');
                html = html.replace(
                    regex,
                    `<a href="${href}" style="color: #00e0e0">$1</a>`,
                );
            });

            node.innerHTML = html;
        });
}
