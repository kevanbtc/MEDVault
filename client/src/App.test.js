import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MEDVault header', () => {
  render(<App />);
  const headerElement = screen.getByText(/MEDVault/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders Money tab', () => {
  render(<App />);
  const moneyTab = screen.getByText(/Money/i);
  expect(moneyTab).toBeInTheDocument();
});

test('renders cost-saving playbook by default', () => {
  render(<App />);
  const playbook = screen.getByText(/Cost-Saving Playbook/i);
  expect(playbook).toBeInTheDocument();
});