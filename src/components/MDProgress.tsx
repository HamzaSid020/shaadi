import { LinearProgress, LinearProgressProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDProgressProps extends Omit<LinearProgressProps, 'color'> {
  variant?: 'determinate' | 'indeterminate' | 'buffer' | 'query';
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'inherit';
  value?: number;
  label?: boolean;
}

const MDProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) =>
    prop !== 'color' &&
    prop !== 'label',
})<MDProgressProps>(({ theme, color, label }) => {
  const { palette } = theme;

  const styles = () => {
    if (color === 'gradient') {
      return {
        background: `linear-gradient(45deg, ${palette.primary.main}, ${palette.primary.dark})`,
      };
    }

    return {};
  };

  return {
    height: '0.5rem',
    borderRadius: '0.25rem',
    overflow: 'hidden',
    ...(label && {
      height: '1rem',
    }),
    ...styles(),
  };
});

export default MDProgress; 