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

module.exports = function prismExtension () {
  this.treeProcessor(function(){
    this.process(doc => {
      if (doc.backend !== 'html5') {
        return doc;
      }

      const languages = getDocumentLanguages(doc);
      loadLanguages(languages);

      doc.findBy({ context: 'listing' }, hasLanguage).forEach(block => {
        const lang = block.getAttribute('language');

        if (Prism.languages[lang] === undefined) {
          throw TypeError(`Prism language ${lang} is not loaded (loaded: ${languages}).`);
        }

        const output = Prism.highlight(unescape(block.getContent()), Prism.languages[lang]);
        block.lines = output.replace(/____(\d+)____/gi, '<b class="conum">($1)</b>').split('\n');
        block.removeSubstitution('specialcharacters');
        block.removeSubstitution('specialchars');
        block.addRole('prismjs');
        block.addRole('highlight-prismjs');
      });
    });
  });

  this.docinfoProcessor(function(){
    this.process((doc) => {
      if (doc.backend !== 'html5') {
        return '';
      }

      const theme = doc.getAttribute('prism-theme') || DEFAULT_THEME;

      if (!doc.hasAttribute('prism-theme') || !theme) {
        return '';
      }

      const prism_folder = dirname(require.resolve('prismjs'));
      const theme_location = join(prism_folder, 'themes', theme);
      const output = readFileSync(theme_location);

      return `<style type="text/css" class="prism-theme">${output}</style>`;
    });
  });
};
