export default {
  plugins: [],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  },
  define: {
    'process.env': {}
  }
} 