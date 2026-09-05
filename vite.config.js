import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

function versionPlugin() {
  return {
    name: 'version-plugin',
    buildStart() {
      const version = Date.now().toString();
      fs.writeFileSync('public/version.json', JSON.stringify({ version }));
    },
  };
}

export default defineConfig({
  plugins: [react(), versionPlugin()],
});
