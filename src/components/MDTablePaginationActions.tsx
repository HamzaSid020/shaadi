import { IconButton, Box } from '@mui/material';
import { FirstPage, KeyboardArrowLeft, KeyboardArrowRight, LastPage } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
  variant?: 'contained' | 'gradient';
  bgColor?: string;
  color?: string;
  opacity?: number;
  borderRadius?: string;
  shadow?: string;
  coloredShadow?: string;
}

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== 'variant' &&
    prop !== 'bgColor' &&
    prop !== 'color' &&
    prop !== 'opacity' &&
    prop !== 'borderRadius' &&
    prop !== 'shadow' &&
    prop !== 'coloredShadow',
})<Omit<TablePaginationActionsProps, 'count' | 'page' | 'rowsPerPage' | 'onPageChange'>>(
  ({ theme, variant, bgColor, color, opacity, borderRadius, shadow, coloredShadow }) => {
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
  }
);

const MDTablePaginationActions = (props: TablePaginationActionsProps) => {
  const { count, page, rowsPerPage, onPageChange, ...rest } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <StyledBox {...rest} sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPage />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPage />
      </IconButton>
    </StyledBox>
  );
};

export default MDTablePaginationActions; 