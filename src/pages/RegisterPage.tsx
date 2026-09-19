import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, UserCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const googleProvider = new GoogleAuthProvider();

export default function RegisterPage() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'admin' | 'doctor' | 'patient' | 'receptionist',
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isCompletingProfile = !!user && !profile;

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
    if (user && !profile) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email || '',
        name: prev.name || user.displayName || '' 
      }));
    }
  }, [user, profile, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isCompletingProfile && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      let currentUser = user;
      
      if (!isCompletingProfile) {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        currentUser = userCredential.user;
      }

      if (!currentUser) throw new Error('Authentication failed');

      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        createdAt: serverTimestamp(),
      });

      // Trigger AI Welcome Package
      try {
        await fetch('/api/auth/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, role: formData.role }),
        });
      } catch (welcomeError) {
        console.error('Failed to send welcome package:', welcomeError);
      }

      toast.success(isCompletingProfile ? 'Profile completed!' : 'Account created! Check your "portal" for a welcome guide.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        toast.success('Authenticated! Complete your profile.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-blue-600 items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 text-center px-12">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl font-bold text-white mb-6"
          >
            Empowering <br /> Healthcare Heroes.
          </motion.h2>
          <p className="text-white/80 text-lg max-w-md mx-auto">
            Join the MedPulse network. Secure, scalable, and built for medical excellence.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl"
        >
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 text-center">
              {isCompletingProfile ? 'Complete Your Profile' : 'Join MedPulse'}
            </h1>
            <p className="text-slate-500 mb-8 md:mb-10 text-center text-sm md:text-base">
              {isCompletingProfile ? 'Tell us a bit more about you before we start.' : 'Start your digital healthcare journey today.'}
            </p>

            {!isCompletingProfile && (
              <div className="mb-6 md:mb-8">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Sign up with Google
                </button>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Or email</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6" id="register-form">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      id="name-input"
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Role</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select 
                      id="role-select"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none appearance-none"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    id="email-input"
                    type="email" 
                    required
                    disabled={isCompletingProfile}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@hospital.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {!isCompletingProfile && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        id="password-input"
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        id="confirm-password-input"
                        type="password" 
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                id="submit-register-btn"
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {loading ? 'Processing...' : (isCompletingProfile ? 'Finish Setup' : 'Create Account')}
                <ArrowRight size={20} />
              </button>
            </form>

            <p className="mt-8 text-center text-slate-600">
              Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
