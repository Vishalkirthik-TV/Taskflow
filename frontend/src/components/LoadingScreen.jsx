import Logo from './Logo';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <div className="loading-screen">
    <Logo size="md" showText={false} />
    <p className="loading-screen-text">{message}</p>
  </div>
);

export default LoadingScreen;
