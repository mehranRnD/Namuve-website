export const config = {
  development: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3000/api',
    corsOrigins: ['http://localhost:3000']
  },
  production: {
    baseUrl: 'https://namuve.com',
    apiUrl: 'https://namuve.com/api',
    corsOrigins: ['https://namuve.com']
  }
};

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env];
};
