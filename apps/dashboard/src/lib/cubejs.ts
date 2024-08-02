import cube from '@cubejs-client/core';

export const cubeApi = cube(process.env.NEXT_PUBLIC_CUBEJS_TOKEN || '', {
  apiUrl: process.env.NEXT_PUBLIC_CUBEJS_URL + '/cubejs-api/v1' || 'http://localhost:4000/cubejs-api/v1',
});
