import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../hooks/useLocalization', () => () => ({ t: (key) => key }));
jest.mock('../../services/api', () => ({ login: jest.fn() }));
jest.mock('../../services/profileApi', () => ({ getProfile: jest.fn() }));
jest.mock('../../utils/storage', () => ({ getToken: jest.fn(() => ''), setToken: jest.fn() }));

import { login } from '../../services/api';
import { getProfile } from '../../services/profileApi';

describe('Login UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders auth form and handles API failure', async () => {
    login.mockRejectedValue(new Error('Network timeout'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'qa@example.com' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    expect(await screen.findByText('Network timeout')).toBeInTheDocument();
  });

  test('navigates to onboarding when profile incomplete', async () => {
    login.mockResolvedValue({ token: 'jwt' });
    getProfile.mockResolvedValue({});

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('email'), { target: { value: 'qa@example.com' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/onboarding', { replace: true }));
  });
});
