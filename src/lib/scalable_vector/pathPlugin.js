export const PathPlugin = {
  name: 'pathUtils',
  init(wrapper) {
    wrapper.path = (commands) => {
      return wrapper.add('path', { d: Array.isArray(commands) ? commands.join(' ') : commands });
    };
    
    wrapper.arc = (cx, cy, r, startAngle, endAngle) => {
      const start = polarToCartesian(cx, cy, r, endAngle);
      const end = polarToCartesian(cx, cy, r, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      const d = [
        "M", start.x, start.y, 
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ");
      
      return wrapper.add('path', { d });
    };
    
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    }
  }
};
