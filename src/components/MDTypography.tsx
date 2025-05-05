import { Typography, TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDTypographyProps extends TypographyProps {
  textGradient?: boolean;
}

const MDTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textGradient',
})<MDTypographyProps>(({ theme, textGradient }) => ({
  ...(textGradient && {
    background: 'linear-gradient(45deg, #7C3AED, #10B981)',
    display: 'inline-block',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    position: 'relative',
    zIndex: 1,
  }),
}));

export default MDTypography; 