/**
 * Configuración de Jest para CommonJS con dynamic imports
 */
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/lib/**/test.test.js',
    '**/test.test.js'
  ],
  // Habilitar experimental-vm-modules para dynamic imports
  setupFilesAfterEnv: [],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};