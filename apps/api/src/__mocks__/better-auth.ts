const mockResponse = {
  user: { id: 'mock-id', email: 'test@test.com', name: null, role: 'user' },
  token: 'mock-token',
};

const mockAuth = {
  api: {
    signUpEmail: jest.fn().mockResolvedValue({
      headers: new Headers({ 'set-cookie': 'better-auth.session_token=mock-token.signature; Path=/' }),
      response: mockResponse,
    }),
    signInEmail: jest.fn().mockResolvedValue({
      headers: new Headers({ 'set-cookie': 'better-auth.session_token=mock-token.signature; Path=/' }),
      response: mockResponse,
    }),
    signOut: jest.fn().mockResolvedValue({
      headers: new Headers({ 'set-cookie': 'better-auth.session_token=; Path=/; Max-Age=0' }),
      response: { success: true },
    }),
    getSession: jest.fn().mockResolvedValue({
      user: { id: 'mock-id', email: 'test@test.com', name: null, role: 'user' },
      session: { id: 'session-id', expiresAt: new Date(Date.now() + 86400000) },
    }),
  },
};

export const createAuth = jest.fn(() => mockAuth);
export const getAuth = jest.fn(() => mockAuth);
export default mockAuth;
