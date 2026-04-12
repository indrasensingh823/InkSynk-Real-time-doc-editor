import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Signup.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name!");
      return;
    }

    if (pass !== confirmPass) {
      alert("Passwords don't match!");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

      // ✅ Save name in Firebase Auth profile
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      alert("Account created successfully!");
      navigate('/main');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join us today!</p>
        </div>

        <form onSubmit={handleSignup} className="signup-form">

          {/* ✅ Name Field */}
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="signup-input"
            />
            <span className="input-focus-border"></span>
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="signup-input"
            />
            <span className="input-focus-border"></span>
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength="6"
              className="signup-input"
            />
            <span className="input-focus-border"></span>
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              minLength="6"
              className="signup-input"
            />
            <span className="input-focus-border"></span>
          </div>

          <button type="submit" className="signup-btn" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
            <span className="btn-overlay"></span>
          </button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login" className="login-text">Log in</Link>
        </p>
      </div>

      <div className="signup-background">
        <div className="bg-shapes">
          <div className="shape-1"></div>
          <div className="shape-2"></div>
          <div className="shape-3"></div>
          <div className="shape-4"></div>
        </div>
      </div>
    </div>
  );
}