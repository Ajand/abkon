import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
} from "@material-ui/core";
import { BrowserRouter } from "react-router-dom";

import Router from "./Router";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4D77FF",
    },
    secondary: {
      main: "#F2FA5A",
    },
    background: {
      default: "#56BBF1",
      paper: "#f8f8f8"
    },
  },
  typography: {
    fontFamily: [
      "Rubik",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
