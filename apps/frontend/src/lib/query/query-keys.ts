export const queryKeys = {
  // Auth
  auth: {
    all: () => ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },
} as const;
