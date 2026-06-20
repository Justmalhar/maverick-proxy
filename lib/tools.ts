import { tool } from 'ai';
import { z } from 'zod';
import { generateImage, generateVideo, generateSong, deepResearch } from './generate';
import { runCode, createDocument } from './sandbox';

// Maverick's tool belt — exposed to the agent and (individually) via REST.
export const agentTools = {
  generate_image: tool({
    description: 'Generate or edit an image from a text prompt. Returns image URLs.',
    inputSchema: z.object({
      prompt: z.string().describe('Description of the image to create or edit'),
      model: z.string().optional().describe('Optional model alias (image-fast | image-quality | image-pro)'),
    }),
    execute: async ({ prompt, model }) => generateImage(prompt, model),
  }),
  generate_video: tool({
    description: 'Generate a short video from a text prompt. Returns a video URL.',
    inputSchema: z.object({ prompt: z.string(), model: z.string().optional() }),
    execute: async ({ prompt, model }) => generateVideo(prompt, model),
  }),
  generate_song: tool({
    description: 'Generate an original song from a text prompt. Returns an audio URL.',
    inputSchema: z.object({ prompt: z.string(), model: z.string().optional() }),
    execute: async ({ prompt, model }) => generateSong(prompt, model),
  }),
  deep_research: tool({
    description: 'Research a topic on the web and return a thorough, cited report.',
    inputSchema: z.object({ query: z.string().describe('The research question') }),
    execute: async ({ query }) => deepResearch(query),
  }),
  run_code: tool({
    description: 'Execute Python or Node.js code in a secure sandbox. Returns stdout/stderr.',
    inputSchema: z.object({
      code: z.string(),
      language: z.enum(['python', 'node']).optional(),
    }),
    execute: async ({ code, language }) => runCode(code, language ?? 'python'),
  }),
  create_document: tool({
    description: 'Create a document (docx, pdf, or markdown) from Markdown content.',
    inputSchema: z.object({
      title: z.string(),
      markdown: z.string(),
      format: z.enum(['docx', 'pdf', 'md']).optional(),
    }),
    execute: async ({ title, markdown, format }) => createDocument(title, markdown, format ?? 'docx'),
  }),
};
