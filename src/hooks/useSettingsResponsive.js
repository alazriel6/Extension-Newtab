import { useMemo } from "react";
import useScreenSize from "./useScreenSize";
import { responsiveConfig } from "../utils/responsiveConfig";
import { getResponsiveValue } from "../utils/getResponsiveValue";

/**
 * Hook untuk mendapatkan semua responsive values untuk Settings
 * Mengembalikan object dengan button dan modal responsive styles
 */
export default function useSettingsResponsive() {
  const screen = useScreenSize();

  return useMemo(() => {
    const button = {
      padding: getResponsiveValue(screen, responsiveConfig.settingsButton.padding),
      fontSize: getResponsiveValue(screen, responsiveConfig.settingsButton.fontSize),
    };

    const modal = {
      width: getResponsiveValue(screen, responsiveConfig.settingsModal.width),
      height: getResponsiveValue(screen, responsiveConfig.settingsModal.height),
      padding: getResponsiveValue(screen, responsiveConfig.settingsModal.padding),
      gap: getResponsiveValue(screen, responsiveConfig.settingsModal.gap),
      tabPadding: getResponsiveValue(screen, responsiveConfig.settingsModal.tabPadding),
      fontSize: getResponsiveValue(screen, responsiveConfig.settingsModal.fontSize),
    };

    const position = getResponsiveValue(screen, responsiveConfig.positions.settings);

    return { button, modal, position, screen };
  }, [screen]);
}
