import { Alert, AlertProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDAlertProps extends AlertProps {
  variant?: 'standard' | 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'light' | 'dark';
  severity?: 'error' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
}

const MDAlert = styled(Alert, {
  shouldForwardProp: (prop) =>
    prop !== 'color' &&
    prop !== 'dismissible',
})<MDAlertProps>(({ theme, color, dismissible }) => {
  const { palette, functions, borders, boxShadows } = theme;
  const { linearGradient, rgba, pxToRem } = functions;
  const { borderRadius } = borders;
  const { colored } = boxShadows;

  const styles = () => {
    if (color === 'gradient') {
      return {
        background: linearGradient(palette.primary.main, palette.primary.dark),
        color: palette.white.main,
      };
    }

    return {};
  };

  return {
    borderRadius: borderRadius.lg,
    ...(dismissible && {
      paddingRight: pxToRem(40),
    }),
    ...styles(),
  };
});

export default MDAlert; 