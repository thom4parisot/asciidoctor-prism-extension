'use strict';

const {readFileSync} = require('fs');
const {join, dirname} = require('path');
const Prism = require('prismjs');
const loadLanguages = require('prismjs/components/index.js');

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

const hasLanguage = (block) => block.getAttribute('language');

const getDocumentLanguages = (document) => {
  return document.getAttribute('prism-languages', DEFAULT_LANGUAGES)
    .split(',')
    .map(lang => lang.trim());
};

const unescape = html => {
  return html.replace(/=&gt;/gi, '=>')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
};

module.exports = {
  initialize (name, backend = 'html5') {
    const languages = DEFAULT_LANGUAGES.split(',') /*getDocumentLanguages(doc) */;

    loadLanguages(languages);
    this.backend = backend;
    this.theme = true;
    this.super();
  },

  format (node, language) {
    node.removeSubstitution('specialcharacters');
    node.removeSubstitution('specialchars');

    const lang = node.getAttribute('language');

    // if (Prism.languages[lang] === undefined) {
    //   throw TypeError(`Prism language ${lang} is not loaded (loaded: ${languages}).`);
    // }

    const output = Prism.highlight(
      node.getContent(),
      Prism.languages['javascript']
    ).replace(/____(\d+)____/gi, '<b class="conum">($1)</b>');


    return `<pre class="prismjs highlight-prismjs"><code>${output}</code></pre>`;
  },

  handlesHighlighting () {
    return true;
  },

  hasDocinfo() {
    return true;
  },

  docinfo () {
    if (this.backend !== 'html5') {
      return '';
    }

    const theme = this.theme || DEFAULT_THEME;

    if (!this.theme || !theme) {
      return '';
    }

    const prism_folder = dirname(require.resolve('prismjs'));
    const theme_location = join(prism_folder, 'themes', theme);
    const output = readFileSync(theme_location);

    return `<style type="text/css" class="prism-theme">${output}</style>`;
  }
}
