import { AuthRocket } from 'auth-rocket-client';

const auth = new AuthRocket({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

async function example() {
  try {
    const token = await auth.login({ username: 'user', password: 'pass' });
    console.log('Login successful, token:', token);

    auth.getUser().subscribe(user => {
      console.log('Current user:', user);
    });

    const data = await auth.authenticatedRequest<any>({
      method: 'GET',
      url: '/some-protected-endpoint',
    });
    console.log('Protected data:', data);

    auth.logout();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();