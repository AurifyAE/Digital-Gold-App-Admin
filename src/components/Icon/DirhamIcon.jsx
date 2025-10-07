import React from 'react';
import Dirham_Greeen from '../../assets/images/Dirham_Greeen.png';
import Dirham_Indigo from '../../assets/images/Dirham_Indigo.png';
import Dirham_Orange from '../../assets/images/Dirham_Orange.png';
import Dirham_Red from '../../assets/images/Dirham_Red.png';
import Dirham_Black from '../../assets/images/Dirham_Black.png';
import Dirham_White from '../../assets/images/Dirham_White.png';
import Dirham_Purple from '../../assets/images/Dirham_Purple.png';
import Dirham_Blue from '../../assets/images/Dirham_Blue.png';
import Dirham_Gray from '../../assets/images/Dirham_Gray.png';

const DirhamIcon = ({ color = 'green', size = 'small', className = '' }) => {
  const colorMap = {
    green: Dirham_Greeen,
    blue: Dirham_Blue,
    purple: Dirham_Purple,
    orange: Dirham_Orange,
    red: Dirham_Red,
    black: Dirham_Black,
    white: Dirham_White,
    indigo: Dirham_Indigo,
    gray: Dirham_Gray,
  };
  const sizeMap = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };
  const src = colorMap[color] || colorMap.green;
  const sizeClass = sizeMap[size] || sizeMap.small;
  return <img src={src} alt="AED" className={`${sizeClass} ${className}`} />;
};

export default DirhamIcon;