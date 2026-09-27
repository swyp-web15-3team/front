import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'kakao';

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  /** 부모 너비를 꽉 채운다. 모달의 취소/확인 쌍처럼 나란히 놓을 때 쓴다. */
  fullWidth?: boolean;
}

// docs/DESIGN.md의 button-* 컴포넌트 스펙.
// min-h-11(44px)은 터치 타깃 최소 크기라서 변형마다 반복하지 않고 base에 둔다.
const BASE_CLASSNAME =
  'text-button inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2.5 transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus';

const VARIANT_CLASSNAME: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-focus',
  secondary:
    'border-border-strong bg-canvas text-fg border hover:bg-surface-muted',
  inverse: 'bg-surface-inverse text-fg-on-dark hover:opacity-90',
  kakao: 'bg-kakao text-fg hover:brightness-95',
};

export function Button({
  variant = 'primary',
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        BASE_CLASSNAME,
        VARIANT_CLASSNAME[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}
