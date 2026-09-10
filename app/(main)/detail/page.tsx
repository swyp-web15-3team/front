import Image from 'next/image';
import { CardShop } from './_components/CardShop';

export default function detailPage() {
  return (
    <>
      <div className="flex gap-4">
        <div>
          <Image
            src="https://placehold.co/300x350.png"
            alt="Product Image"
            width={300}
            height={350}
          />
        </div>
        <div>
          <p>제목</p>
          <p>내용</p>
          <div>{/* 태그들 */}</div>
          <div className="flex flex-col">
            <div className="flex justify-between">
              <p>종류</p>
              <p>싱크몰트 위스키</p>
            </div>
            <div className="flex justify-between">
              <p>용량</p>
              <p>700ml</p>
            </div>
            <div className="flex justify-between">
              <p>도수</p>
              <p>43.0%</p>
            </div>
            <div className="flex justify-between">
              <p>원산지</p>
              <p>일본</p>
            </div>
            <div className="flex justify-between">
              <p>예상 총 관세</p>
              <p>면세 대상 (1병 & 400 이하)</p>
            </div>
          </div>
          <p className="border border-gray-300 p-1">
            1인당 주류 면세 한도는 2병(합산 2L 이하, $400 이하)입니다. 현재
            야마자키 12년 1병(약 $125 내외)은 단독 반입 시 세금이 부과되지 않는
            면세 상태입니다.
          </p>
          <div className="my-2 flex gap-2">
            <div className="flex flex-col items-center">
              <button>❤️</button>
              <span className="text-xs">89</span>
            </div>
            <button className="w-full bg-gray-100">컬렉션</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div>
          <p>국내 대형마트</p>
          <div className="flex flex-col gap-2">
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
          </div>
        </div>
        <div>
          <p>면세점</p>
          <div className="flex flex-col gap-2">
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
          </div>
        </div>
        <div>
          <p>일본 로컬샵</p>
          <div className="flex flex-col gap-2">
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
            <CardShop
              shopName="이마트 양재점"
              price="320,000원"
              addressName="이마트 양재점"
              mapAddress="서울특별시 서초구 매헌로 16(이마트 양재점)"
            />
          </div>
        </div>
      </div>
    </>
  );
}
