import { Sandbox } from '@vercel/sandbox';

// Code execution + document creation in an isolated Vercel Sandbox.
// Runtime requires Vercel Sandbox to be enabled (OIDC token / team config).

export interface RunResult { exitCode: number; stdout: string; stderr: string }

/** Run a snippet in a fresh sandbox. Defaults to Python. */
export async function runCode(code: string, language: 'python' | 'node' = 'python'): Promise<RunResult> {
  const sandbox = await Sandbox.create();
  try {
    const file = language === 'python' ? 'main.py' : 'main.mjs';
    await sandbox.writeFiles([{ path: file, content: Buffer.from(code, 'utf8') }]);
    const cmd = language === 'python' ? 'python3' : 'node';
    const finished = await sandbox.runCommand({ cmd, args: [file] });
    return {
      exitCode: finished.exitCode ?? 0,
      stdout: await finished.stdout(),
      stderr: await finished.stderr(),
    };
  } finally {
    await sandbox.stop();
  }
}

export interface DocResult { filename: string; base64: string; mime: string }

/**
 * Create a document (md → docx/pdf) in the sandbox via pandoc and return it.
 * Falls back to returning the raw markdown if conversion isn't available.
 */
export async function createDocument(title: string, markdown: string, format: 'docx' | 'pdf' | 'md' = 'docx'): Promise<DocResult> {
  if (format === 'md') {
    return { filename: `${slug(title)}.md`, base64: Buffer.from(markdown, 'utf8').toString('base64'), mime: 'text/markdown' };
  }
  const sandbox = await Sandbox.create();
  try {
    await sandbox.writeFiles([{ path: 'doc.md', content: Buffer.from(markdown, 'utf8') }]);
    const out = `${slug(title)}.${format}`;
    const finished = await sandbox.runCommand({ cmd: 'pandoc', args: ['doc.md', '-o', out] });
    if ((finished.exitCode ?? 1) !== 0) {
      // pandoc unavailable → return markdown
      return { filename: `${slug(title)}.md`, base64: Buffer.from(markdown, 'utf8').toString('base64'), mime: 'text/markdown' };
    }
    const stream = await sandbox.readFile({ path: out });
    const buf = stream ? await streamToBuffer(stream) : Buffer.from(markdown, 'utf8');
    const mime = format === 'pdf' ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return { filename: out, base64: buf.toString('base64'), mime };
  } finally {
    await sandbox.stop();
  }
}

async function streamToBuffer(stream: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'document';
}
