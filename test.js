import assert from 'node:assert/strict';
import {debuglog} from 'node:util';
import {convert} from '@asciidoctor/core';
import prismExtension, {register} from './index.js';

const debug = debuglog('asciidoctor:prism-extension');

assert.equal(prismExtension.register, register);
register();

async function main() {
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
  await assert.rejects(() => convert(doc, {backend, attributes: ['source-highlighter=prism']}), /(loaded: bash)/);

  // Loaded language makes the conversion
  var options = {attributes, backend, safe: 'server'};
  var output = await convert(doc, options);
  debug(output);

  assert.ok(output.match('<div class="listingblock">'));
  assert.ok(output.match('<pre class="highlight highlight-prismjs prismjs language-yaml">'));
  assert.ok(output.match('<code class="language-yaml" data-lang="yaml">'));
  assert.ok(output.match('<span class="token key atrule">'));
  assert.ok(!output.match('<style type="text/css" class="prism-theme">'));

  // Fully fledged document
  var options = {attributes, backend, standalone: true, safe: 'server'};
  var output = await convert(doc, options);
  debug(output);

  assert.ok(output.match('<style type="text/css" class="prism-theme">'));

  // Disabling stylesheet
  var attributes = [
    'prism-languages=yaml',
    'prism-theme!',
    'source-highlighter=prism',
  ];
  var options = {attributes, backend, standalone: true, safe: 'server'};
  var output = await convert(doc, options);

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

  await assert.doesNotReject(() => convert(doc, options));

  // Default theme works
  var attributes = [
    'prism-theme',
    'source-highlighter=prism',
  ];
  var options = {attributes, backend, standalone: true, safe: 'server'};
  var output = await convert(doc, options);
  assert.ok(output.match('<style type="text/css" class="prism-theme">'));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
