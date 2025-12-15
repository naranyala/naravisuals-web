
export const ExportPlugin = {
  name: 'export',
  init(wrapper) {
    wrapper.toDataURL = (type = 'image/png') => {
      const svgData = new XMLSerializer().serializeToString(wrapper.el);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    };
    
    wrapper.download = (filename = 'drawing.svg') => {
      const link = document.createElement('a');
      link.href = wrapper.toDataURL();
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  }
};
