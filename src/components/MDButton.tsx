import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDButtonProps extends ButtonProps {
  variant?: 'text' | 'contained' | 'outlined' | 'gradient';
  color?: 'inherit' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark' | 'white';
  size?: 'small' | 'medium' | 'large';
  circular?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

const MDButton = styled(Button, {
  shouldForwardProp: (prop) =>
    prop !== 'color' &&
    prop !== 'circular' &&
    prop !== 'iconOnly',
})<MDButtonProps>(({ theme, color, circular, iconOnly }) => {
  const { palette, functions, borders, boxShadows } = theme;
  const { linearGradient, pxToRem } = functions;
  const { borderRadius } = borders;
  const { colored } = boxShadows;

  const styles = () => {
    if (color === 'gradient') {
      return {
        background: linearGradient(palette.primary.main, palette.primary.dark),
        color: palette.white.main,
        '&:hover': {
          background: linearGradient(palette.primary.dark, palette.primary.main),
        },
      };
    }

    return {};
  };

  return {
    ...(circular && {
      borderRadius: borderRadius.section,
    }),
    ...(iconOnly && {
      width: pxToRem(40),
      minWidth: pxToRem(40),
      height: pxToRem(40),
      padding: 0,
      '& .MuiSvgIcon-root': {
        marginRight: 0,
      },
    }),
    ...styles(),
  };
});

export default MDButton; 