// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'webapp-railway',
      script: 'server-simple.js',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}