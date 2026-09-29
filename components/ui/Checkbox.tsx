import { cn } from '@/lib/utils';

type CheckboxShape = 'square' | 'round';

interface CheckboxProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'children'
> {
  /** 체크 박스 옆에 붙는 라벨. 없으면 박스만 렌더한다. */
  label?: React.ReactNode;
  /** square: 목록/필터용 기본값. round: 약관 동의처럼 체크가 늘 보여야 하는 곳. */
  shape?: CheckboxShape;
  /**
   * 이미 button 등 상호작용 요소 안에 있어 input을 중첩할 수 없을 때 쓴다.
   * 모양만 그리고 상태는 부모가 aria-pressed/aria-checked로 알린다.
   */
  presentational?: boolean;
  labelClassName?: string;
}

const BOX_CLASSNAME =
  'flex size-5 shrink-0 items-center justify-center transition-colors';

// round는 체크 표시를 항상 띄워두고 색으로만 상태를 구분한다(약관 동의 UI 관습).
const SHAPE_CLASSNAME: Record<CheckboxShape, (checked: boolean) => string> = {
  square: (checked) =>
    cn(
      'rounded-md border',
      checked
        ? 'border-primary bg-primary text-on-primary'
        : 'border-border-strong bg-canvas text-transparent'
    ),
  round: (checked) =>
    cn(
      'rounded-full',
      checked
        ? 'bg-primary text-on-primary'
        : 'bg-surface-sunken text-fg-subtle'
    ),
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Checkbox({
  label,
  shape = 'square',
  presentational,
  checked,
  className,
  labelClassName,
  disabled,
  ...props
}: CheckboxProps) {
  const box = (
    <span
      aria-hidden
      className={cn(
        BOX_CLASSNAME,
        SHAPE_CLASSNAME[shape](!!checked),
        presentational && className
      )}
    >
      <CheckIcon />
    </span>
  );

  // 부모가 이미 button이면 input을 중첩할 수 없어 모양만 그린다.
  if (presentational) return box;

  return (
    // relative: sr-only input(absolute)을 박스 옆에 붙잡아 둔다. 없으면 input이
    // 먼 조상 기준으로 놓여, 스크롤 목록 안에서 포커스될 때 모달 패널이 그 위치로
    // 스크롤돼 내용이 통째로 사라진 것처럼 보인다.
    <label
      className={cn(
        'relative flex items-center gap-2',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="peer sr-only"
        {...props}
      />
      {/* sr-only input이라 포커스 링을 박스가 대신 받는다 */}
      <span className="peer-focus-visible:outline-primary-focus flex peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
        {box}
      </span>
      {label !== undefined && (
        <span className={cn('text-body-sm', labelClassName)}>{label}</span>
      )}
    </label>
  );
}
