import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Routes } from "./routes";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

const theme = createMuiTheme({
  overrides: {
    MuiPickersClock: {
      clock: {
        backgroundColor: "#a56863",
      },
    },
    MuiPickersToolbar: {
      toolbar: {
        backgroundColor: "#a56863",
      },
    },
    MuiPickersDay: {
      daySelected: {
        backgroundColor: "#a56863",
      },
    },
    MuiTypography: {
      colorPrimary: {
        color: "#a56863",
      },
    },
    MuiButton: {
      textPrimary: {
        color: "#a56863",
      },
    },
    MuiPickersMonth: {
      monthSelected: {
        color: "#a56863",
      },
      root: {
        "&:focus": {
          color: "#a56863",
        },
      },
    },
    palette: {
      primary: {
        main: "#a56863",
      },
    },
    primaryCardHeader: {
      backgroundColor: "#a56863",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes />
      </Router>
    </ThemeProvider>
  );
}

export default App;
