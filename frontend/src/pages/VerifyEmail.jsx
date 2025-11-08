import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await verifyEmail(token);
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        setTimeout(() => navigate('/'), 2000);
      }
    };
    verify();
  }, [token, verifyEmail, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verifying Email...</h2>
        <p>Please wait while we verify your email address.</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
