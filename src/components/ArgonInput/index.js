import React, { forwardRef, useState } from "react";
import PropTypes from "prop-types";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import ArgonInputRoot from "components/ArgonInput/ArgonInputRoot";
import { useArgonController } from "context";

const ArgonInput = forwardRef(({ size, error, success, disabled, type, ...rest }, ref) => {
  const [controller] = useArgonController();
  const { darkMode } = controller;

  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const handleTogglePassword = () => setShowPassword(!showPassword);

  return (
    <ArgonInputRoot
      {...rest}
      ref={ref}
      type={isPasswordType && !showPassword ? "password" : "text"}
      endAdornment={
        isPasswordType && (
          <InputAdornment position="end">
            <IconButton
              onClick={handleTogglePassword}
              edge="end"
              size="small"
              tabIndex={-1}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )
      }
      ownerState={{ size, error, success, disabled, darkMode, type }}
    />
  );
});

ArgonInput.defaultProps = {
  size: "medium",
  error: false,
  success: false,
  disabled: false,
  type: "text",
};

ArgonInput.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  error: PropTypes.bool,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

export default ArgonInput;