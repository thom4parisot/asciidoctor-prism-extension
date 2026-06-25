import {SyntaxHighlighter} from '@asciidoctor/core';
import type {Block, Document, SyntaxHighlighterBase} from '@asciidoctor/core';

export type SyntaxHighlighterRegistry = Pick<typeof SyntaxHighlighter, 'register'>;

export interface PrismSyntaxHighlighter {
  readonly name: 'prism';
  register(registry?: SyntaxHighlighterRegistry): void;
  format(
    node: Block,
    lang: string,
    opts?: {
      nowrap?: boolean;
      transform?: Function;
    }
  ): Promise<string>;
  highlight(
    node: Block,
    content: string,
    lang?: string,
    opts?: {
      callouts?: unknown;
      css_mode?: string;
      highlight_lines?: number[];
      number_lines?: string;
      start_line_number?: number;
      style?: string;
    }
  ): string;
  handlesHighlighting(): boolean;
  hasDocinfo(location?: string): boolean;
  docinfo(location: string, doc: Document): string;
}

declare const prismExtension: PrismSyntaxHighlighter & SyntaxHighlighterBase;

export function register(registry?: SyntaxHighlighterRegistry): void;
export default prismExtension;
