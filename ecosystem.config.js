module.exports = {
  apps: [
    {
      name: "app",
      script: "./bin/www",
      env_production: {
        NODE_ENV: "production",
      },
      out_file: `${__dirname}/logs/out.log`,
      err_file: `${__dirname}/logs/error.log`
    },
  ],
};