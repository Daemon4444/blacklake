module.exports = {
  apps: [{
    name: 'blacklake-api',
    script: 'server/app.js',
    cwd: '/root/blacklake',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      PORT: 8787
    }
  }]
};
