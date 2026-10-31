// 놀토의 정적 미리보기 서버. 외부 패키지는 쓰지 않는다.
// 사용: node scripts/serve.mjs [포트]   기본 포트 4173, 주소 127.0.0.1
// GitHub Pages처럼 .으로 시작하는 경로(.git, .qa, .kiro 등)는 내보내지 않는다.
import {createServer} from 'node:http';
import {createReadStream, statSync} from 'node:fs';
import {dirname, extname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const HOST = process.env.HOST ?? '127.0.0.1';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.hwpx': 'application/hwp+zip',
};

function send(response, status, message) {
  response.writeHead(status, {'Content-Type': 'text/plain; charset=utf-8'});
  response.end(message);
}

const server = createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    return send(response, 400, '잘못된 주소입니다.');
  }
  if (pathname.split('/').some(segment => segment.startsWith('.'))) return send(response, 404, '없는 파일입니다.');
  let file = resolve(ROOT, '.' + pathname);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return send(response, 403, '허용하지 않는 경로입니다.');
  try {
    let stat = statSync(file);
    if (stat.isDirectory()) {
      file = join(file, 'index.html');
      stat = statSync(file);
    }
    response.writeHead(200, {
      'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') return response.end();
    createReadStream(file).pipe(response);
  } catch {
    send(response, 404, '없는 파일입니다.');
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `포트 ${PORT}을(를) 이미 쓰고 있습니다. 다른 포트를 주세요. 예: node scripts/serve.mjs 4191`
    : error.message);
  process.exit(1);
});

server.listen(PORT, HOST, () => console.log(`놀토의 미리보기: http://${HOST}:${PORT}/ (멈추려면 Ctrl+C)`));
