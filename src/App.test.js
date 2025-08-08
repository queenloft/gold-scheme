import { render, screen } from '@testing-library/react';
import App from './App';
import i18n from './i18n';

test('renders loading text', () => {
  i18n.changeLanguage('en');
  render(<App />);
  const loadingText = screen.getByText(/loading/i);
  expect(loadingText).toBeInTheDocument();
});
