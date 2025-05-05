import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDBoxProps extends BoxProps {
  variant?: 'contained' | 'gradient';
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: string;
  shadow?: string;
  coloredShadow?: string;
}

const MDBox = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'variant' &&
    prop !== 'bgColor' &&
    prop !== 'color' &&
    prop !== 'opacity' &&
    prop !== 'borderRadius' &&
    prop !== 'shadow' &&
    prop !== 'coloredShadow',
})<MDBoxProps>(({ theme, variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow }) => {
  const { palette } = theme;

  const containedStyles = () => ({
    background: palette.background.paper,
    color: palette.text.primary,
  });

  const gradientStyles = () => ({
    background: palette.primary.main,
    color: '#fff',
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
    borderRadius: borderRadius || theme.shape.borderRadius,
    boxShadow: shadow || 'none',
    ...(coloredShadow && {
      '&:hover': {
        boxShadow: theme.shadows[4],
      },
    }),
    ...styles(),
  };
});

export default MDBox; 