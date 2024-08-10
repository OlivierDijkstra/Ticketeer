import '@testing-library/jest-dom/vitest';

import { vi } from 'vitest';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// @ts-expect-error: Mocking PointerEvent
window.PointerEvent = class PointerEvent extends Event {};
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');

  return {
    ...actual,
    useQuery: vi.fn().mockResolvedValue({
      data: {
        config: {
          APP_LOCALE: 'en-US',
          APP_CURRENCY: 'USD',
        },
      },
    }),
  };
});
