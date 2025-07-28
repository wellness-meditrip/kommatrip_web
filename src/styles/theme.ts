import colors from './colors';
import typography from './typography';

const theme = {
  colors,
  typo: typography,
  size: {
    minWidth: '320px',
    maxWidth: '480px',
    appBarHeight: '52px',
    gnbHeight: '60px',
    ctaButtonHeight: '76px',
  },
  zIndex: {
    overlay: 5,
    appBar: 10,
    gnb: 10,
    fab: 10,
    ctaButton: 10,
    dim: 20,
    actionSheet: 30,
    bottomSheet: 30,
    dialog: 40,
    toast: 50,
  },
} as const;

export default theme;
