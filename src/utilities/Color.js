// color.js
export const Color = {
  hexToRgb(hex){
    const n=parseInt(hex.slice(1),16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  },
  rgbToHex(r,g,b){
    return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  },
  rgbToHsl(r,g,b){
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if(max===min){h=s=0;} else {
      const d=max-min;
      s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){
        case r:h=(g-b)/d+(g<b?6:0);break;
        case g:h=(b-r)/d+2;break;
        case b:h=(r-g)/d+4;break;
      }
      h/=6;
    }
    return {h,s,l};
  }
};

