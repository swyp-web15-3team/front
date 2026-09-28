import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '@/components/ui/Checkbox';

describe('Checkbox', () => {
  it('라벨을 눌러도 토글된다 (input이 sr-only라서)', async () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} label="전체동의" />);

    await userEvent.click(screen.getByText('전체동의'));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('checked를 input에 반영한다', () => {
    render(<Checkbox checked label="동의" onChange={vi.fn()} />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('disabled면 클릭해도 토글되지 않는다', async () => {
    const onChange = vi.fn();
    render(
      <Checkbox checked={false} onChange={onChange} label="동의" disabled />
    );

    await userEvent.click(screen.getByText('동의'));

    expect(onChange).not.toHaveBeenCalled();
  });

  // button 안에 중첩될 때 input이 없어야 HTML이 유효하다.
  it('presentational이면 input을 렌더하지 않는다', () => {
    render(<Checkbox presentational checked />);

    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});
