import {SyntaxHighlighter} from '@asciidoctor/core';
import prismExtension, {register} from 'asciidoctor-prism-extension';

const name: string = prismExtension.name;
const handlesHighlighting: boolean = prismExtension.handlesHighlighting();
const hasDocinfo: boolean = prismExtension.hasDocinfo('head');

register();
register(SyntaxHighlighter);
prismExtension.register();
prismExtension.register(SyntaxHighlighter);
SyntaxHighlighter.register(prismExtension, name);

export {handlesHighlighting, hasDocinfo};
