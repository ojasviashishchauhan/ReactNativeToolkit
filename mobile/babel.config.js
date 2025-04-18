module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './src',
            '@assets': './assets',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@hooks': './src/hooks',
            '@api': './src/api',
            '@constants': './src/constants',
            '@types': './src/types',
            '@contexts': './src/contexts',
            '@utils': './src/utils',
          },
        },
      ],
      'react-native-reanimated/plugin', // Add this if using reanimated
    ],
  };
};