const path = require('path');

const template = (filePaths) => {
  const exportEntries = filePaths.map(({ path: filePath }) => {
    const basename = path.basename(filePath, path.extname(filePath));
    return `export * from './${basename}'`;
  });
  return exportEntries.join('\n');
};

module.exports = template;
