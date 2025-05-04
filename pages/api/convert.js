import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import formidable from 'formidable';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { files } = await parseForm(req);
    if (!files?.file?.[0]) return res.status(400).json({ error: 'Aucun fichier reçu' });

    const input = files.file[0].filepath; // tmp path de formidable
    const tmpOut = path.join(tmpdir(), randomBytes(8).toString('hex') + '.opus');

    await runOpus(input, tmpOut);
    const stat = fs.statSync(tmpOut);
    res.setHeader('Content-Type', 'audio/opus');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', 'attachment; filename="beatscoin.opus"');

    const stream = fs.createReadStream(tmpOut);
    stream.pipe(res);
    stream.on('close', () => {
      safeUnlink(input);
      safeUnlink(tmpOut);
    });
  } catch (e) {
    console.error('[convert API] ', e);
    res.status(500).json({ error: e.message });
  }
}

function parseForm(req) {
  const form = formidable({ multiples: false, maxFileSize: 50 * 1024 * 1024 });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

function runOpus(input, output) {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), 'scripts', 'opusprov4.py');
    const p = spawn('python', [script, input, output], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      shell: false,
    });
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error('opusprov4.py failed'))));
  });
}

function safeUnlink(f) {
  fs.unlink(f, () => {});
}
