import { TableHead, TableHeadProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDTableHeadProps extends TableHeadProps {
  variant?: 'contained' | 'gradient';
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: string;
  shadow?: string;
  coloredShadow?: string;
}

const MDTableHead = styled(TableHead, {
  shouldForwardProp: (prop) =>
    prop !== 'variant' &&
    prop !== 'bgColor' &&
    prop !== 'color' &&
    prop !== 'opacity' &&
    prop !== 'borderRadius' &&
    prop !== 'shadow' &&
    prop !== 'coloredShadow',
})<MDTableHeadProps>(({ theme, variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow }) => {
  const { palette, functions, borders, boxShadows } = theme;
  const { linearGradient, rgba, pxToRem } = functions;
  const { borderRadius: radius } = borders;
  const { colored } = boxShadows;

  const containedStyles = () => ({
    background: linearGradient(palette.background.default, palette.background.paper),
    color: palette.text.primary,
  });

  const gradientStyles = () => ({
    background: linearGradient(palette.primary.main, palette.primary.dark),
    color: palette.white.main,
  });

  const styles = () => {
    if (variant === 'contained') {
      return containedStyles();
    }
    if (variant === 'gradient') {
      return gradientStyles();
    }
    return {};
  };

  return {
    opacity,
    borderRadius: borderRadius || radius.lg,
    boxShadow: shadow || 'none',
    ...(coloredShadow && {
      '&:hover': {
        boxShadow: colored[coloredShadow],
      },
    }),
    ...styles(),
  };
});

export default MDTableHead; 