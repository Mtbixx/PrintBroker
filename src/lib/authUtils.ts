export function checkAuth() {
  const user = localStorage.getItem('user');
  return !!user;
}

export function isUnauthorizedError(error: any) {
  return error?.response?.status === 401;
} 