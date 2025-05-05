import { Card, CardProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'contained' | 'gradient';
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: string;
  shadow?: string;
  coloredShadow?: string;
}

const MDCard = styled(Card, {
  shouldForwardProp: (prop) =>
    prop !== 'variant' &&
    prop !== 'bgColor' &&
    prop !== 'color' &&
    prop !== 'opacity' &&
    prop !== 'borderRadius' &&
    prop !== 'shadow' &&
    prop !== 'coloredShadow',
})<MDCardProps>(({ theme, variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow }) => {
  const { palette } = theme;

  const containedStyles = () => ({
    background: `linear-gradient(45deg, ${palette.background.default}, ${palette.background.paper})`,
    color: palette.text.primary,
  });

  const gradientStyles = () => ({
    background: `linear-gradient(45deg, ${palette.primary.main}, ${palette.primary.dark})`,
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

export default MDCard; 