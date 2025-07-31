// theme/globalStyles.js
import { GlobalStyles } from "@mui/material";

const globalStyles = (
  <GlobalStyles
    styles={{
      'input::-ms-reveal, input::-ms-clear': {
        display: 'none',
      },
      'input[type="password"]::-webkit-credentials-auto-fill-button': {
        display: 'none !important',
        WebkitAppearance: 'none !important',
      },
      'input[type="password"]::-webkit-clear-button': {
        display: 'none !important',
        WebkitAppearance: 'none !important',
      },
    }}
  />
);

export default globalStyles;
