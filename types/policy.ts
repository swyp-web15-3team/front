/** 문자열은 문단, sub는 소제목, list는 목록, table은 첫 행을 헤더로 쓰는 표 */
export type PolicyBlock =
  | string
  | { sub: string }
  | { list: string[]; ordered?: boolean }
  | { table: string[][] };

export interface PolicySection {
  title: string;
  blocks: PolicyBlock[];
}

export interface PolicyDoc {
  title: string;
  intro?: PolicyBlock[];
  sections: PolicySection[];
}
