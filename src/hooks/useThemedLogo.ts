import { useTheme } from "next-themes";
import exosLogoDark from "@/assets/logo-concept-layers.png";
import exosLogoLight from "@/assets/logo-concept-layers-light.png";

export const useThemedLogo = () => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? exosLogoDark : exosLogoLight;
};
