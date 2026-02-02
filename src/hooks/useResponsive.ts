// src/hooks/useResponsive.js
import { useState, useEffect } from "react";

const checkIsMobile = () => window.innerWidth < 768;

export const useResponsive = (onMobileChange?: (isMobile: boolean) => void) => {
    const [isMobile, setIsMobile] = useState(checkIsMobile);
    const [prefersDarkScheme, setPrefersDarkScheme] = useState(() =>
        window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false
    );

    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = checkIsMobile();
            if (newIsMobile !== isMobile) {
                setIsMobile(newIsMobile);
                if (onMobileChange) {
                    onMobileChange(newIsMobile);
                }
            }
        };

        const handlePrefersColorSchemeChange = (event: MediaQueryListEvent) => {
            setPrefersDarkScheme(event.matches);
        };

        window.addEventListener("resize", handleResize);
        const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQueryList.addEventListener("change", handlePrefersColorSchemeChange);

        return () => {
            window.removeEventListener("resize", handleResize);
            mediaQueryList.removeEventListener("change", handlePrefersColorSchemeChange);
        };
    }, [isMobile, onMobileChange]);

    return { isMobile, prefersDarkScheme };
};
