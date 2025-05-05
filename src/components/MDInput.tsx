import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface MDInputProps extends TextFieldProps {
  variant?: 'standard' | 'outlined' | 'filled';
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  label?: string;
  helperText?: string;
}

const MDInput = styled(TextField, {
  shouldForwardProp: (prop) =>
    prop !== 'error' &&
    prop !== 'success',
})<MDInputProps>(({ theme, error, success }) => {
  const { palette, borders, boxShadows } = theme;
  const { borderRadius } = borders;
  const { colored } = boxShadows;

  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: borderRadius.lg,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: palette.primary.main,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: palette.primary.main,
      },
      ...(error && {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: palette.error.main,
        },
      }),
      ...(success && {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: palette.success.main,
        },
      }),
    },
    '& .MuiInputLabel-root': {
      color: palette.text.secondary,
      '&.Mui-focused': {
        color: palette.primary.main,
      },
      ...(error && {
        color: palette.error.main,
      }),
      ...(success && {
        color: palette.success.main,
      }),
    },
    '& .MuiFormHelperText-root': {
      ...(error && {
        color: palette.error.main,
      }),
      ...(success && {
        color: palette.success.main,
      }),
    },
  };
});

export default MDInput; 