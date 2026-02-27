import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 部署时需要设置 base 路径
  // 如果仓库名是 notice，则 base 为 /notice/
  // 如果是 username.github.io 仓库，则 base 为 /
  base: './'
});
