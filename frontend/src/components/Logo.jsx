import logo from '../assets/logo.png';

const sizes = {
  sm: 32,
  md: 44,
  lg: 72,
};

const Logo = ({ size = 'md', showText = true, text = 'TaskFlow', className = '' }) => {
  const px = sizes[size] || sizes.md;

  return (
    <div className={`logo-brand ${className}`}>
      <img
        src={logo}
        alt="TaskFlow logo"
        className="logo-img"
        width={px}
        height={px}
      />
      {showText && <span className="logo-text">{text}</span>}
    </div>
  );
};

export default Logo;
