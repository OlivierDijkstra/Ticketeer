import colors from 'tailwindcss/colors';

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const GRAPH_COLORS = {
  light: {
    primary: colors.black,
    secondary: colors.blue[600],
  },
  dark: {
    primary: colors.white,
    secondary: colors.blue[600],
  },
};

// Pretty format for date-fns format()
export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy HH:mm';
export const DEFAULT_PRETTY_DATE_FORMAT = 'dd MMMM yyyy - HH:mm';
