'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/use-auth-store';

interface Comment {
  id: string;
  author: string;
  createdAt: string;
  content: string;
  isOwner: boolean;
}

const INITIAL_VISIBLE_COUNT = 2;

// TODO: 댓글 API 연동 후 목업 데이터 제거하고 TanStack Query로 교체
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    author: '위스키사냥꾼',
    createdAt: '3시간 전',
    content:
      '리쿼마운틴 아키하바라점에서 18000엔대에 면세로 겨우 구했습니다! 박스 패키지 구성 대박입니다.',
    isOwner: true,
  },
  {
    id: '2',
    author: '위스키 좋아',
    createdAt: '3시간 전',
    content:
      '리쿼마운틴 아키하바라점에서 18000엔대에 면세로 겨우 구했습니다! 박스 패키지 구성 대박입니다.',
    isOwner: false,
  },
  {
    id: '3',
    author: '하이볼러버',
    createdAt: '5시간 전',
    content: '이 가격이면 지금 사는 게 맞는 것 같아요. 재고 얼마 없다던데.',
    isOwner: false,
  },
  {
    id: '4',
    author: '오사카직구러',
    createdAt: '1일 전',
    content: '작년보다 엔화가 싸져서 확실히 이득 보는 느낌입니다.',
    isOwner: false,
  },
];

export function CommentSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [content, setContent] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [reportedIds, setReportedIds] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!isAuthenticated || !content.trim()) return;

    setComments((prev) => [
      {
        id: crypto.randomUUID(),
        author: '나',
        createdAt: '방금 전',
        content: content.trim(),
        isOwner: true,
      },
      ...prev,
    ]);
    setContent('');
  };

  const handleDelete = (id: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleEditSave = (id: string) => {
    if (!editingContent.trim()) return;

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? { ...comment, content: editingContent.trim() }
          : comment
      )
    );
    handleEditCancel();
  };

  const handleReport = (id: string) => {
    setReportedIds((prev) => [...prev, id]);
  };

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <div className="mt-8">
      <div className="rounded-md border border-gray-300">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={!isAuthenticated}
          placeholder={
            isAuthenticated
              ? '댓글을 입력해주세요.'
              : '댓글을 작성하려면 로그인 해주세요.'
          }
          rows={3}
          className="w-full resize-none rounded-md p-3 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-400"
        />
        <div className="flex justify-end border-t border-gray-200 p-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isAuthenticated || !content.trim()}
            className="rounded-md bg-gray-200 px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            등록
          </button>
        </div>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-gray-200">
        {visibleComments.map((comment) => (
          <li key={comment.id} className="flex gap-3 py-4">
            <div className="size-8 shrink-0 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{comment.author}</span>
                  <span className="text-xs text-gray-400">
                    {comment.createdAt}
                  </span>
                </div>
                {comment.isOwner ? (
                  <div className="flex gap-2 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => handleEditStart(comment)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReport(comment.id)}
                    disabled={reportedIds.includes(comment.id)}
                    className="text-xs text-gray-500 disabled:text-gray-300"
                  >
                    {reportedIds.includes(comment.id) ? '신고완료' : '신고'}
                  </button>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm outline-none"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={handleEditCancel}>
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditSave(comment.id)}
                      className="font-bold"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + 2)}
          className={cn('mt-2 w-full bg-gray-100 py-2 text-sm text-gray-600')}
        >
          더보기
        </button>
      )}
    </div>
  );
}
