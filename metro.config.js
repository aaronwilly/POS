const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const {
  createSentryMetroSerializer,
} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },

  resolver: {
    extraNodeModules: {
      assert: require.resolve('empty-module'),
      http: require.resolve('empty-module'),
      https: require.resolve('empty-module'),
      os: require.resolve('empty-module'),
      url: require.resolve('empty-module'),
      zlib: require.resolve('empty-module'),
      path: require.resolve('empty-module'),
      stream: require.resolve('readable-stream'),
      crypto: require.resolve('react-native-quick-crypto'),
    },
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'mjs', 'cjs', 'png'],
  },

  serializer: {
    customSerializer: createSentryMetroSerializer(),
  },
};

module.exports = mergeConfig(defaultConfig, config);
