const {
  LIGHTHOUSE_TARGET_URLS,
  LIGHTHOUSE_START_SERVER_COMMAND,
} = require('./scripts/lighthouse/config.cjs');

module.exports = {
  ci: {
    collect: {
      url: LIGHTHOUSE_TARGET_URLS,
      startServerCommand: LIGHTHOUSE_START_SERVER_COMMAND,
      startServerReadyPattern: 'Ready in|started server on|Local:',
      startServerReadyTimeout: 120000,
      numberOfRuns: 1,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci_reports/mobile',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};
