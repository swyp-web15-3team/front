import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 bg-yellow-50 px-6">
      <div className="flex w-full justify-between">
        <p>LOGO</p>
        <Link href="/privacy">개인정보처리방침</Link>
      </div>
      <div className="flex gap-4">
        <span>프로젝트 이름</span>
        <span>스위프웹 15기 3팀</span>
      </div>
      <div>Copyright ⓒ 프로젝트이름</div>
    </footer>
  );
}
