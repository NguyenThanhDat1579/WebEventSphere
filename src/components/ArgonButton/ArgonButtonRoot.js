// @mui material components
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

export default styled(Button)(({ theme, ownerState }) => {
  const { palette, functions, borders } = theme;
  const { color, variant, size, circular, iconOnly } = ownerState;

  const { white, dark, text, transparent, gradients } = palette;
  const { boxShadow, linearGradient, pxToRem, rgba } = functions;
  const { borderRadius } = borders;

  // resolve default text color
  const resolveTextColor = () => {
    if (color === "white" || !palette[color]) return gradients.dark.main;
    if (color === "light") return gradients.dark.state;
    return "#fff";
  };

  const colorValue = resolveTextColor();

  // styles for the button with variant="contained"
  const containedStyles = () => {
    const backgroundValue = palette[color]?.main || white.main;
    const focusedBackgroundValue = palette[color]?.focus || white.focus;
    const boxShadowValue = palette[color]
      ? boxShadow([0, 0], [0, 3.2], palette[color].main, 0.5)
      : boxShadow([0, 0], [0, 3.2], dark.main, 0.5);

    return {
      background: backgroundValue,
      color: colorValue,

      "&:hover": {
        backgroundColor: backgroundValue,
        color: colorValue,
      },

      "&:focus:not(:hover)": {
        backgroundColor: focusedBackgroundValue,
        boxShadow: boxShadowValue,
        color: colorValue,
      },

      "&:active": {
        backgroundColor: backgroundValue,
        color: colorValue,
      },

      "&:disabled": {
        backgroundColor: backgroundValue,
        color: colorValue,
      },
    };
  };

  // styles for the button with variant="outlined"
  const outliedStyles = () => {
    const backgroundValue = color === "white" ? rgba(white.main, 0.1) : transparent.main;
    const borderColorValue = palette[color]?.main || rgba(white.main, 0.75);
    const boxShadowValue = palette[color]
      ? boxShadow([0, 0], [0, 3.2], palette[color].main, 0.5)
      : boxShadow([0, 0], [0, 3.2], white.main, 0.5);

    return {
      background: backgroundValue,
      color: colorValue,
      borderColor: borderColorValue,

      "&:hover": {
        background: transparent.main,
        borderColor: borderColorValue,
        color: colorValue,
      },

      "&:focus:not(:hover)": {
        background: transparent.main,
        boxShadow: boxShadowValue,
        color: colorValue,
      },

      "&:active:not(:hover)": {
        backgroundColor: borderColorValue,
        color: white.main,
        opacity: 0.85,
      },

      "&:disabled": {
        color: colorValue,
        borderColor: borderColorValue,
      },
    };
  };

  // styles for the button with variant="gradient"
  const gradientStyles = () => {
    const backgroundValue =
      color === "white" || !gradients[color]
        ? white.main
        : linearGradient(gradients[color].main, gradients[color].state);

    return {
      background: backgroundValue,
      color: colorValue,

      "&:focus:not(:hover)": {
        boxShadow: "none",
        color: colorValue,
      },

      "&:disabled": {
        background: backgroundValue,
        color: colorValue,
      },
    };
  };

  // styles for the button with variant="text"
  const textStyles = () => {
    return {
      color: colorValue,

      "&:hover": {
        color: colorValue,
      },

      "&:focus:not(:hover)": {
        color: colorValue,
      },

      "&:active": {
        color: colorValue,
      },

      "&:disabled": {
        color: colorValue,
      },
    };
  };

  // styles for the button with circular={true}
  const circularStyles = () => ({
    borderRadius: borderRadius.section,
  });

  // styles for the button with iconOnly={true}
  const iconOnlyStyles = () => {
    let sizeValue = pxToRem(38);
    if (size === "small") sizeValue = pxToRem(25.4);
    else if (size === "large") sizeValue = pxToRem(52);

    let paddingValue = `${pxToRem(11)} ${pxToRem(11)} ${pxToRem(10)}`;
    if (size === "small") paddingValue = pxToRem(4.5);
    else if (size === "large") paddingValue = pxToRem(16);

    return {
      width: sizeValue,
      minWidth: sizeValue,
      height: sizeValue,
      minHeight: sizeValue,
      padding: paddingValue,

      "& .material-icons": {
        marginTop: 0,
      },

      "&:hover, &:focus, &:active": {
        transform: "none",
        color: colorValue,
      },
    };
  };

  return {
    ...(variant === "contained" && containedStyles()),
    ...(variant === "outlined" && outliedStyles()),
    ...(variant === "gradient" && gradientStyles()),
    ...(variant === "text" && textStyles()),
    ...(circular && circularStyles()),
    ...(iconOnly && iconOnlyStyles()),
  };
});
