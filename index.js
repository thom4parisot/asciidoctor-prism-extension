import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SyntaxHighlighter} from '@asciidoctor/core';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';

Prism.hooks.add('before-tokenize', (env) => {
  env.code = env.code.replace(/<b class="conum">\((\d+)\)<\/b>/gi, '____$1____');
});

// available list of themes: https://github.com/PrismJS/prism/tree/master/themes
const DEFAULT_THEME = 'prism.css';

// css, markup (html, xml, css, svg) and javascript are loaded by default
const DEFAULT_LANGUAGES = [
  'asciidoc',
  'bash',
  'json',
  'markdown',
  'typescript',
  'yaml',
].join(',');

const getDocumentLanguages = (document) => {
  return (document.getAttribute('prism-languages') || DEFAULT_LANGUAGES)
    .split(',')
    .map(lang => lang.trim());
};

const getDocumentTheme = (document) => {
  return document.hasAttribute('prism-theme') ? document.getAttribute('prism-theme') || DEFAULT_THEME : null;
};

function register(registry = SyntaxHighlighter) {
  registry.register(PrismExtension, 'prism');
}

const PrismExtension = {
  name: 'prism',

  register,

  async format (node, lang) {
    node.removeSubstitution('specialcharacters');
    node.removeSubstitution('specialchars');

    const content = await node.getContent();
    return `<pre class="highlight highlight-prismjs prismjs language-${lang}"><code class="language-${lang}" data-lang="${lang}">${content}</code></pre>`;
  },

  highlight (node, content, lang) {
    const languages = getDocumentLanguages(node.document);
    loadLanguages(languages);

    if (lang && Prism.languages[lang] === undefined) {
      const source = node.getSourceLines().join('\n');
      throw TypeError(`Prism language ${lang} is not loaded (loaded: ${languages}).\n${source}`);
    }

    return lang
      ? Prism.highlight(
          content, Prism.languages[lang]
        ).replace(/____(\d+)____/gi, '<b class="conum">($1)</b>')
      : content;
  },

  handlesHighlighting () {
    return true;
  },

  hasDocinfo() {
    return true;
  },

  docinfo (location, doc) {
    if (!doc.basebackend('html')) {
      return '';
    }

    const theme = getDocumentTheme(doc);

    if (!theme) {
      return '';
    }

    const prism_folder = dirname(fileURLToPath(import.meta.resolve('prismjs')));
    const theme_location = join(prism_folder, 'themes', theme);
    const output = readFileSync(theme_location);

    return `<style type="text/css" class="prism-theme">${output}</style>`;
  }
};

export {register};
export default PrismExtension;
