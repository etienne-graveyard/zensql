export interface InputStream {
  next(): string;
  peek(): string;
  eof(): boolean;
  croak(msg: string): never;
}

export function InputStream(input: string): InputStream {
  let pos = 0;
  let line = 1;
  let col = 0;

  return {
    next: next,
    peek: peek,
    eof: eof,
    croak: croak,
  };

  function next(): string {
    const ch = input.charAt(pos++);
    if (ch == '\n') {
      line++;
      col = 0;
    } else {
      col++;
    }
    return ch;
  }

  function peek(): string {
    return input.charAt(pos);
  }

  function eof(): boolean {
    return peek() == '';
  }

  function croak(msg: string): never {
    throw new Error(msg + ' (' + line + ':' + col + ')');
  }
}
