import axios from 'axios';

export async function logout(): Promise<void> {
  await axios.post('/api/auth/logout');
}
