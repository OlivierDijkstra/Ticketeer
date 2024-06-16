import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ThemeSwitcher } from '@/components/ThemeSwitcher';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
  }),
}));

describe('ThemeSwitcher', () => {
  test('it renders correctly', () => {
    const comp = render(<ThemeSwitcher />);
    expect(comp.container).toMatchSnapshot();
  });

  test('it toggles correctly', async () => {
    render(<ThemeSwitcher />);

    const user = userEvent.setup();

    const button = screen.getByRole('button');
    await user.click(button);

    const menu = screen.getByRole('menu');
    const menuItems = screen.getAllByRole('menuitem');

    expect(button.attributes).toHaveProperty('aria-expanded');
    expect(menu).toBeInTheDocument();

    expect(menuItems).toHaveLength(3);
  });
});
