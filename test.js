'use strict';

const asciidoctor = require('asciidoctor.js')();
const prismExtension = require('./index.js');
const assert = require('assert').strict;
const debug = require('util').debuglog('asciidoctor:prism-extension');

asciidoctor.Extensions.register(prismExtension);

const doc = `= Document
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
];

// Throw a TypeError if a source is converted without the backend being loaded
assert.throws(() => asciidoctor.convert(doc, {backend}), TypeError);
assert.throws(() => asciidoctor.convert(doc, {backend}), /(loaded: bash)/);

// Loaded language makes the conversion
var options = {attributes, backend, safe: 'server'};
var output = asciidoctor.convert(doc, options);
debug(output);

assert.ok(output.match('<div class="listingblock prismjs highlight-prismjs">'));
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
];
var options = {attributes, backend, header_footer: true, safe: 'server'};
var output = asciidoctor.convert(doc, options);

assert.ok(!output.match('<style type="text/css" class="prism-theme">'));
