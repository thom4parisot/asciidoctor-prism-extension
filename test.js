'use strict';

const asciidoctor = require('@asciidoctor/core')();
const prismExtension = require('./index.js');
const assert = require('assert').strict;
const debug = require('util').debuglog('asciidoctor:prism-extension');

asciidoctor.SyntaxHighlighter.register('prism', prismExtension);

var doc = `= Document
:source-highlighter: prism
:prism-languages: bash

[source,yaml]
.example.yml
----
language: node_js
node_js: node

script: npm test
----
`;

const backend = 'html5';
var attributes = [
  'prism-languages=yaml',
  'prism-theme=prism.css',
  'source-highlighter=prism',
];

// Throw a TypeError if a source is converted without the backend being loaded
assert.throws(() => asciidoctor.convert(doc, {backend, attributes: ['source-highlighter=prism']}), /(loaded: bash)/);

// Loaded language makes the conversion
var options = {attributes, backend, safe: 'server'};
var output = asciidoctor.convert(doc, options);
debug(output);

assert.ok(output.match('<div class="listingblock">'));
assert.ok(output.match('<pre class="highlight highlight-prismjs prismjs">'));
assert.ok(output.match('<code class="language-yaml" data-lang="yaml">'));
assert.ok(output.match('<span class="token key atrule">'));
assert.ok(!output.match('<style type="text/css" class="prism-theme">'));

// Fully fledged document
var options = {attributes, backend, header_footer: true, safe: 'server'};
var output = asciidoctor.convert(doc, options);
debug(output);

assert.ok(output.match('<style type="text/css" class="prism-theme">'));

// Disabling stylesheet
var attributes = [
  'prism-languages=yaml',
  'prism-theme!',
  'source-highlighter=prism',
];
var options = {attributes, backend, header_footer: true, safe: 'server'};
var output = asciidoctor.convert(doc, options);

assert.ok(!output.match('<style type="text/css" class="prism-theme">'));

// Listing without language
var doc = `= Document
:source-highlighter: prism

[source]
.options/zones.txt
----
Europe/London
America/New_York
----
`;

assert.doesNotThrow(() => asciidoctor.convert(doc, options))
