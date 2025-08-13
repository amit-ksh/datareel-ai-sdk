import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DataReel } from "../sdk/datareel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface DatareelContextProps {
  brandColor: string;
}

interface DatareelContextValue {
  datareel: DataReel;
}

const DatareelContext = createContext<DatareelContextValue | null>(null);

interface DatareelProviderProps extends DatareelContextProps {
  children: ReactNode;
}

const queryClient = new QueryClient();

export function DatareelProvider({
  children,
  brandColor,
}: DatareelProviderProps) {
  const [datareel] = useState(() => new DataReel({}));

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;

      root.style.setProperty("--datareel-brand-color", brandColor);
      root.style.setProperty(
        "--datareel-brand-color-hover",
        adjustBrightness(brandColor, 0.8)
      );
      root.style.setProperty(
        "--datareel-brand-color-light",
        lightenColor(brandColor, 0.1)
      );
      root.style.setProperty("--datareel-brand-color-ring", brandColor);
    }
  }, [brandColor]);

  const contextValue: DatareelContextValue = {
    datareel,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DatareelContext.Provider value={contextValue}>
        {children}
      </DatareelContext.Provider>
    </QueryClientProvider>
  );
}

export function useDatareel(): DatareelContextValue {
  const context = useContext(DatareelContext);

  if (!context) {
    throw new Error("useDatareel must be used within a DatareelProvider");
  }

  return context;
}

export { DatareelContext };

const lightenColor = (hex: string, opacity: number = 0.1): string => {
  const rgb = parseInt(hex.replace("#", ""), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const adjustBrightness = (hex: string, factor: number): string => {
  const rgb = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, Math.floor((rgb >> 16) * factor)));
  const g = Math.max(
    0,
    Math.min(255, Math.floor(((rgb >> 8) & 0x00ff) * factor))
  );
  const b = Math.max(0, Math.min(255, Math.floor((rgb & 0x0000ff) * factor)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};
