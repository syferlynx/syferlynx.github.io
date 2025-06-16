import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthWrapper: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);

  const toggleMode = (): void => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <>
      {isLoginMode ? (
        <LoginForm onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onToggleMode={toggleMode} />
      )}
    </>
  );
};

export default AuthWrapper;
