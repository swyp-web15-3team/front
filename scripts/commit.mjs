import { execSync, spawnSync } from 'node:child_process';
import * as p from '@clack/prompts';

const TYPES = [
  { emoji: '✨', type: 'update', desc: '해당 파일에 새로운 기능이 생김' },
  { emoji: '🎉', type: 'add', desc: '없던 파일을 생성함, 초기 세팅' },
  { emoji: '🐛', type: 'bugfix', desc: '버그 수정' },
  { emoji: '♻️', type: 'refactor', desc: '코드 리팩토링' },
  { emoji: '🔧', type: 'fix', desc: '코드 수정' },
  { emoji: '🚚', type: 'move', desc: '파일 옮김/정리' },
  { emoji: '🔥', type: 'del', desc: '기능/파일을 삭제' },
  { emoji: '✅', type: 'test', desc: '테스트 코드를 작성' },
  { emoji: '💄', type: 'style', desc: 'css' },
  { emoji: '🙈', type: 'gitfix', desc: 'gitignore 수정' },
  { emoji: '📦', type: 'script', desc: 'package.json 변경(npm 설치 등)' },
];

const staged = execSync('git diff --cached --name-only').toString().trim();
if (!staged) {
  p.log.error('스테이징된 변경 사항이 없습니다. git add 후 다시 실행해주세요.');
  process.exit(1);
}

p.intro('커밋 메시지 작성');

const type = await p.select({
  message: '어떤 작업인가요?',
  options: TYPES.map((t) => ({
    value: t,
    label: `${t.emoji} ${t.type}`,
    hint: t.desc,
  })),
});

if (p.isCancel(type)) {
  p.cancel('취소되었습니다.');
  process.exit(1);
}

const description = await p.text({
  message: '작업 내용을 입력하세요:',
  validate: (value) => {
    if (!value || !value.trim()) return '작업 내용을 입력해주세요.';
  },
});

if (p.isCancel(description)) {
  p.cancel('취소되었습니다.');
  process.exit(1);
}

const message = `${type.emoji} ${type.type}: ${description.trim()}`;

const confirm = await p.confirm({
  message: `다음 메시지로 커밋할까요?\n\n  ${message}\n`,
});

if (p.isCancel(confirm) || !confirm) {
  p.cancel('취소되었습니다.');
  process.exit(1);
}

const result = spawnSync('git', ['commit', '-m', message], {
  stdio: 'inherit',
});

process.exit(result.status ?? 0);
