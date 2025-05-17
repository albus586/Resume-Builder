/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output mode for Docker
  webpack: (config) => {
    // Add rule to transform any CSS with modern color formats
    config.module.rules.push({
      test: /\.css$/i,
      use: [
        {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: [
                // Plugin to transform modern color formats
                ["postcss-color-function", { preserveCustomProps: true }],
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

module.exports = nextConfig;
