import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4CAF50", 
    },
    secondary: {
      main: "#F5F5DC", 
    },
    info: {
      main: "#2196F3", 
    },
    background: {
      default: "#F5F5DC", 
      paper: "#FFFFFF", 
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", 
    h1: {
      fontWeight: 600,
      color: "#4CAF50",
    },
    h4: {
      fontWeight: 500,
      color: "#2196F3",
    },
  },
});

export default theme;