import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Three.js
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
}));
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}));

test('renders chat interface', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/type your message/i);
  expect(inputElement).toBeInTheDocument();
});
