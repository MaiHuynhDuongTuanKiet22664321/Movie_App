interface Spacing{
    space_2:number;
    space_4:number;
    space_8:number;
    space_10:number;
    space_12:number;
    space_15:number;
    space_16:number;
    space_18:number;
    space_20:number;
    space_24:number;
    space_28:number;
    space_32:number;
    space_36:number;
    space_48:number;
    space_64:number;
    space_96:number;
    space_128:number;
    space_192:number;
    space_256:number;
    space_384:number;
    space_512:number;
    space_1024:number;
    space_2048:number;
    space_4096:number;
}

export const SPACING: Spacing = {
    space_2: 2,
    space_4: 4,
    space_8: 8,
    space_10: 10,
    space_12: 12,
    space_15:15,
    space_16: 16,
    space_20: 20,
    space_18: 18,
    space_24: 24,
    space_28: 28,
    space_32: 32,
    space_36: 36,
    space_48: 48,
    space_64: 64,
    space_96: 96,
    space_128: 128,
    space_192: 192,
    space_256: 256,
    space_384: 384,
    space_512: 512,
    space_1024: 1024,
    space_2048: 2048,
    space_4096: 4096,
}

interface Color {
  Red:string,
  RedRGB:string,
  Black: string;
  BlackRGB5: string;
  BlackRGB10: string;
  Orange: string;
  OrangeRGBBA0: string;
  Grey: string;
  DarkGrey: string;
  Yellow: string;
  White:string;
  WhiteRGBA75:string;
  WhiteRGBA50:string;
  WhiteRGBA25:string;
  WhiteRGBA10:string;
  WhiteRGBA5:string;
  WhiteRGBA2:string;
  WhiteRGBA1:string;
  WhiteRGBA075:string;
  WhiteRGBA05:string;
  WhiteRGBA025:string;
  WhiteRGBA0125:string;
  WhiteRGBA32:string;
}

export const COLORS: Color = {
  Red:"#FF0000",
  RedRGB:'rgba(236, 69, 69, 0.94)',
  Black: "#000000",
  BlackRGB5: 'rgba(253, 248, 248, 0.26)',
  BlackRGB10: 'rgba(0, 0, 0, 0.1)',
  Orange: "#f35714ff",
  OrangeRGBBA0: 'rgba(255, 165, 0, 0.1)',
  Grey: "#808080",
  DarkGrey: "#A9A9A9",
  Yellow: "#FFFF00",
  White: "#FFFFFF",
  WhiteRGBA75: 'rgba(255, 255, 255, 0.75)',
  WhiteRGBA50: 'rgba(255, 255, 255, 0.5)',
  WhiteRGBA25: 'rgba(255, 255, 255, 0.25)',
  WhiteRGBA10: 'rgba(255, 255, 255, 0.1)',
  WhiteRGBA5: 'rgba(255, 255, 255, 0.05)',
  WhiteRGBA2: 'rgba(255, 255, 255, 0.02)',
  WhiteRGBA1: 'rgba(255, 255, 255, 0.01)',
  WhiteRGBA075: 'rgba(255, 255, 255, 0.0075)',
  WhiteRGBA05: 'rgba(255, 255, 255, 0.005)',
  WhiteRGBA025: 'rgba(255, 255, 255, 0.0025)',
  WhiteRGBA0125: 'rgba(255, 255, 255, 0.00125)',
  WhiteRGBA32: 'rgba(255, 255, 255, 0.032)',
};


interface FontFamily {
    poppins_black : string;
    poppins_bold : string;
    poppins_medium : string;
    poppins_regular : string;
    poppins_semibold : string;
    poppins_thin : string;
    poppins_light : string;
    poppins_extralight: string;
    poppins_extrabold : string;
  }
  
  export const FONT_FAMILY: FontFamily = {
    poppins_black: 'Poppins-Black',
    poppins_bold: 'Poppins-Bold',
    poppins_medium: 'Poppins-Medium',
    poppins_regular: 'Poppins-Regular',
    poppins_semibold: 'Poppins-SemiBold',
    poppins_thin: 'Poppins-Thin',
    poppins_light: 'Poppins-Light',
    poppins_extralight: 'Poppins-ExtraLight',
    poppins_extrabold: 'Poppins-ExtraBold',
  };



  interface FontSize {
    size_8: number;
    size_10: number;
    size_12: number;
    size_14: number;
    size_16: number;
    size_18: number;
    size_20: number;
    size_22: number;
    size_24: number;
    size_28: number;
    size_30: number;
    size_32: number;
    size_36: number;
    size_40: number;
    size_48: number;
    size_56: number;
    size_64: number;
    size_72: number;
    size_80: number;
    size_88: number;
    size_96: number;
  }

  export const FONT_SIZE: FontSize = {
    size_8: 8,
    size_10: 10,
    size_12: 12,
    size_14: 14,
    size_16: 16,
    size_18: 18,
    size_20: 20,
    size_22: 22,
    size_24: 24,
    size_28: 28,
    size_30: 30,
    size_32: 32,
    size_36: 36,
    size_40: 40,
    size_48: 48,
    size_56: 56,
    size_64: 64,
    size_72: 72,
    size_80: 80,
    size_88: 88,
    size_96: 96,

  };


  interface BorderRadius{
    radius_4:number;
    radius_8:number;
    radius_12:number;
    radius_15:number;
    radius_16:number;
    radius_20:number;
    radius_24:number;
    radius_28:number;
    radius_32:number;
    radius_36:number;
    radius_40:number;
    radius_48:number;
    radius_56:number;
    radius_64:number;
    radius_72:number;
    radius_80:number;
    radius_88:number;
    radius_96:number;
    radius_104:number;
    radius_112:number;
    radius_120:number;
  }

  export const BORDER_RADIUS: BorderRadius = {
    radius_4: 4,
    radius_8: 8,
    radius_12: 12,
    radius_15: 15,
    radius_16: 16,
    radius_20: 20,
    radius_24: 24,
    radius_28: 28,
    radius_32: 32,
    radius_36: 36,
    radius_40: 40,
    radius_48: 48,
    radius_56: 56,
    radius_64: 64,
    radius_72: 72,
    radius_80: 80,
    radius_88: 88,
    radius_96: 96,
    radius_104: 104,
    radius_112: 112,
    radius_120: 120,
  };