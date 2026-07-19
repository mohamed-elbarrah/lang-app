const mockAuth = {
  api: {
    signUpEmail: jest.fn().mockResolvedValue({
      user: { id: 'mock-id', email: 'test@test.com' },
      token: 'mock-token',
    }),
    signInEmail: jest.fn().mockResolvedValue({
      user: { id: 'mock-id', email: 'test@test.com' },
      token: 'mock-token',
    }),
  },
};

export const betterAuth = jest.fn(() => mockAuth);
export const auth = mockAuth;
export default mockAuth;
