import { render, screen } from '@testing-library/react';
import ForgotPasswordPage from '../app/(auth)/forgot-password/page';
test('recovery reports its availability honestly', () => {
  render(<ForgotPasswordPage />);
  expect(screen.getByRole('heading', { name: 'Password recovery unavailable' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
});
