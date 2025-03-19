declare module 'react-colorful' {
  import * as React from 'react';

  interface HexColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    className?: string;
    style?: React.CSSProperties;
  }

  export const HexColorPicker: React.FC<HexColorPickerProps>;
}
