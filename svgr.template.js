const template = ({ imports, interfaces, componentName, props, jsx }, { tpl }) => {
  return tpl`
${imports};

${interfaces};

export const ${componentName.replace('Svg', '')} = (${props}) => (
  ${jsx}
);
`;
};

module.exports = template;
