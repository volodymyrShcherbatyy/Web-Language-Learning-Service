module.exports = {
  apps: [
    {
      name: 'language-learning-backend',
      script: './app.js',
      cwd: '/var/www/language-learning-service',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: '/var/log/app/backend-error.log',
      out_file: '/var/log/app/backend-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
