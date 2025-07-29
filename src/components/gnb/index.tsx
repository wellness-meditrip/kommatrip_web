/** @jsxImportSource @emotion/react */
import { ReactNode, useMemo } from 'react';
import { Text } from '../text';
import { menuItem, wrapper } from './index.styles';

interface MenuItem {
  name: string;
  icon: {
    active: ReactNode;
    inactive: ReactNode;
  };

  path: string;
  canGuest: boolean;
}

interface Props {
  menus: MenuItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}

export function GNB({ menus, activePath, onNavigate }: Props) {
  const isActiveMenu = useMemo(() => (path: string) => activePath === path, [activePath]);

  return (
    <nav css={wrapper}>
      {menus.map((menu) => (
        <button key={menu.path} css={menuItem} onClick={() => onNavigate(menu.path)}>
          {isActiveMenu(menu.path) ? menu.icon.active : menu.icon.inactive}
          <Text typo="button_S" color={isActiveMenu(menu.path) ? 'primary50' : 'black'}>
            {menu.name}
          </Text>
        </button>
      ))}
    </nav>
  );
}
