import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

// Tailwind CSS is assumed to be available
import 'tailwindcss/tailwind.css';

// i18n configuration for translation
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';



// lucide-react icons
const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const WalletIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucude-wallet"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M10 12h4"/><path d="M12 12v4"/></svg>);
const UserIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>);
const LogOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);
const GoldIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gem"><path d="M6 3h12l4 6-10 13L2 9l4-6z"/><polyline points="12 17 12 9 12 9"/><path d="M2 9h20"/><path d="M12 17h10l-4 4-10-13"/></svg>);
const CreditCardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>);
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const BillsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-receipt"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8"/><path d="M8 12h8"/><path d="M8 17h8"/></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Main App Component
const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyCGyV8kKU_0-wGWRRlxXdoqkU7-2z_U6es",
    authDomain: "goldscheme-b4f0e.firebaseapp.com",
    projectId: "goldscheme-b4f0e",
    storageBucket: "goldscheme-b4f0e.firebasestorage.app",
    messagingSenderId: "819096658243",
    appId: "1:819096658243:web:8926b022d6bca28cfa8ff6",
    measurementId: "G-H5ESLXDXWB"
  };

  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [myProfile, setMyProfile] = useState(null); 
  const [userPlans, setUserPlans] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeactivateConfirmModal, setShowDeactivateConfirmModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [items, setItems] = useState([
    { id: '1', name: 'Gold Chain', salePrice: 32000, hsn: '71131900', purity: '22K', weight: 6.230, labour: 1500 },
    { id: '2', name: 'Silver', salePrice: 38000, hsn: '71131900', purity: '24K', weight: 8.5, labour: 2000 },
  ]);
  const [billItems, setBillItems] = useState([]);
  const [posCustomerName, setPosCustomerName] = useState('');

  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };
  const __app_id = firebaseConfig.projectId;

  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      setAuth(authInstance);
      setDb(dbInstance);

      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };

      if (isSignInWithEmailLink(authInstance, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }
        signInWithEmailLink(authInstance, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem('emailForSignIn');
          })
          .catch((error) => {
            console.error('Error signing in with email link:', error);
          });
      }

      onAuthStateChanged(authInstance, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setUserId(currentUser.uid);
        } else {
          try {
            await signInAnonymously(authInstance);
          } catch (error) {
            console.error("Authentication failed:", error);
          }
        }
        setIsAuthReady(true);
      });
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      setIsAuthReady(true);
    }
  }, []);

  useEffect(() => {
    if (db && userId) {
      const qPlans = query(collection(db, `artifacts/${__app_id}/users/${userId}/myPlans`));
      const unsubscribePlans = onSnapshot(qPlans, (snapshot) => {
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserPlans(plans);
      });

      const userDocRef = doc(db, `artifacts/${__app_id}/users/${userId}/userData/userModel`);
      const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setMyProfile(docSnap.data());
        } else {
          setDoc(userDocRef, {
            name: user?.displayName || t('new_user'),
            email: user?.email || t('email_not_available'),
            mobile: t('info_not_available'),
            active: true,
            role: 'user', // Default role for new users
            created_at: new Date().toISOString(),
          }).then(() => console.log('Default user profile created.'));
        }
      });

      return () => {
        unsubscribePlans();
        unsubscribeUser();
      };
    }
  }, [db, userId, user, __app_id, t]);

  useEffect(() => {
    if (db) {
      const qSchemes = query(collection(db, `artifacts/${__app_id}/joinSchemes`));
      const unsubscribeSchemes = onSnapshot(qSchemes, (snapshot) => {
        const schemeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSchemes([...schemeList]);
      });
      return () => unsubscribeSchemes();
    }
  }, [db, __app_id]);

  useEffect(() => {
    if (db && myProfile?.role === 'admin') { // Fetch only if the current user is an admin
      const qUsers = query(collection(db, `artifacts/${__app_id}/public/data/users`));
      const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
        const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(userList);
      });
      return () => unsubscribeUsers();
    }
  }, [db, myProfile, __app_id]);

  const handleRegister = async (name, email, password, mobile) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUserId = userCredential.user.uid;
      const userDocRef = doc(db, `artifacts/${__app_id}/users/${newUserId}/userData/userModel`);
      const publicUserDocRef = doc(db, `artifacts/${__app_id}/public/data/users`, newUserId);

      await setDoc(userDocRef, {
        name: name,
        email: email,
        mobile: mobile,
        active: true,
        role: 'user',
        created_at: new Date().toISOString(),
      });
      await setDoc(publicUserDocRef, {
        name: name,
        email: email,
        mobile: mobile,
        active: true,
        userId: newUserId,
      });

      setModalMessage(t('registration_success'));
      setShowModal(true);
      setCurrentPage('Login');
    } catch (error) {
      setModalMessage(t('registration_failed', { message: error.message }));
      setShowModal(true);
      console.error('Registration failed:', error);
    }
  };

  const handleEditProfile = async (updatedName, updatedMobile) => {
    if (db && userId) {
      try {
        const userDocRef = doc(db, `artifacts/${__app_id}/users/${userId}/userData/userModel`);
        const publicUserDocRef = doc(db, `artifacts/${__app_id}/public/data/users`, userId);
        
        await updateDoc(userDocRef, {
          name: updatedName,
          mobile: updatedMobile,
          updated_at: new Date().toISOString(),
        });

        await updateDoc(publicUserDocRef, {
          name: updatedName,
          mobile: updatedMobile,
        });

        setModalMessage(t('profile_update_success'));
        setShowModal(true);
        setCurrentPage('UserScreen');
      } catch (error) {
        setModalMessage(t('profile_update_fail'));
        setShowModal(true);
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setUser(null);
        setUserId(null);
        setCurrentPage('Login');
        setMyProfile(null);
        setUserPlans([]);
        setAllUsers([]);
        setSchemes([]);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  };

  const handleJoinPlan = async (scheme) => {
    if (db && userId) {
      try {
        const planDocRef = doc(collection(db, `artifacts/${__app_id}/users/${userId}/myPlans`));
        await setDoc(planDocRef, {
          ...scheme,
          joinDate: new Date().toISOString(),
          paidAmount: 0,
          paidWeight: 0,
          progress: 0,
          status: 'Active',
          maturityDate: new Date(new Date().setMonth(new Date().getMonth() + scheme.tenure)).toISOString(),
        });
        setModalMessage(t('join_plan_success', { title: scheme.title }));
        setShowModal(true);
        setCurrentPage('MyPlans');
      } catch (error) {
        setModalMessage(t('join_plan_fail'));
        setShowModal(true);
        console.error('Error joining plan:', error);
      }
    }
  };

  const handleAddPayment = async () => {
    if (db && userId && selectedPlanForPayment) {
      try {
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
          setModalMessage(t('enter_valid_amount'));
          setShowModal(true);
          return;
        }

        const newPaidAmount = selectedPlanForPayment.paidAmount + amount;
        const newProgress = (newPaidAmount / selectedPlanForPayment.totalAmount) * 100;
        
        const newPaidWeight = (newPaidAmount / 20000) * 2.220; 

        const planRef = doc(db, `artifacts/${__app_id}/users/${userId}/myPlans`, selectedPlanForPayment.id);
        await updateDoc(planRef, {
          paidAmount: newPaidAmount,
          paidWeight: newPaidWeight,
          progress: newProgress,
        });

        await addDoc(collection(db, `artifacts/${__app_id}/users/${userId}/paymentEntries`), {
          planId: selectedPlanForPayment.id,
          date: new Date().toISOString(),
          amount: amount,
          status: 'RECEIVED',
          reference: paymentReference || 'Cash/UPI',
        });

        setShowPaymentModal(false);
        setModalMessage(t('payment_success', { amount: amount }));
        setShowModal(true);
        setPaymentAmount('');
        setPaymentReference('');
      } catch (error) {
        setModalMessage(t('payment_fail'));
        setShowModal(true);
        console.error('Error adding payment:', error);
      }
    }
  };

  const handleToggleUserActive = async (targetUserId, currentStatus) => {
    if (db) {
      try {
        const userDocRef = doc(db, `artifacts/${__app_id}/users/${targetUserId}/userData/userModel`);
        await updateDoc(userDocRef, {
          active: !currentStatus,
        });
        const publicUserDocRef = doc(db, `artifacts/${__app_id}/public/data/users`, targetUserId);
        await updateDoc(publicUserDocRef, {
          active: !currentStatus,
        });
        setModalMessage(t('user_status_change_success', { status: t(currentStatus ? 'inactive' : 'active') }));
        setShowModal(true);
        setShowDeactivateConfirmModal(false);
      } catch (error) {
        setModalMessage(t('user_status_change_fail'));
        setShowModal(true);
        console.log('Error toggling user active status:', error);
      }
    }
  };
  
  const handleAddScheme = async (newScheme) => {
    if (db) {
      try {
        await addDoc(collection(db, `artifacts/${__app_id}/joinSchemes`), newScheme);
        setModalMessage(t('add_scheme_success'));
        setShowModal(true);
        setCurrentPage('JoinPlans');
      } catch (error) {
        setModalMessage(t('add_scheme_fail'));
        setShowModal(true);
        console.error('Error adding scheme:', error);
      }
    }
  };
  
  const handleUpdateScheme = async (schemeId, updatedScheme) => {
    if (db) {
      try {
        const schemeRef = doc(db, `artifacts/${__app_id}/joinSchemes`, schemeId);
        await updateDoc(schemeRef, updatedScheme);
        setModalMessage(t('update_scheme_success'));
        setShowModal(true);
        setCurrentPage('JoinPlans');
      } catch (error) {
        setModalMessage(t('update_scheme_fail'));
        setShowModal(true);
        console.error('Error updating scheme:', error);
      }
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (db) {
      try {
        await deleteDoc(doc(db, `artifacts/${__app_id}/joinSchemes`, schemeId));
        setModalMessage(t('delete_scheme_success'));
        setShowModal(true);
        setCurrentPage('JoinPlans');
      } catch (error) {
        setModalMessage(t('delete_scheme_fail'));
        setShowModal(true);
        console.error('Error deleting scheme:', error);
      }
    }
  };

  const Login = ({ authInstance, setCurrentPage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpEmail, setOtpEmail] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        await signInWithEmailAndPassword(authInstance, email, password);
        setModalMessage(t('login_success'));
        setShowModal(true);
      } catch (error) {
        setModalMessage(t('login_fail'));
        setShowModal(true);
        console.error('Login failed:', error);
      }
    };

    const handleSendOtp = async (e) => {
      e.preventDefault();
      try {
        const actionCodeSettings = {
          url: window.location.href,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(authInstance, otpEmail, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', otpEmail);
        setIsOtpSent(true);
        setModalMessage(t('login_link_sent'));
        setShowModal(true);
      } catch (error) {
        setModalMessage(t('otp_send_fail'));
        setShowModal(true);
        console.error('OTP send failed:', error);
      }
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-end mb-4">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border rounded p-1"
            >
              <option value="ta">{t('tamil')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
          <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">{t('login_title')}</h2>
          <div className="grid grid-cols-1 gap-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('email_label')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('password_label')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105"
              >
                {t('login_with_email')}
              </button>
            </form>
            
            <div className="flex items-center justify-between text-gray-500 my-4">
              <hr className="flex-grow border-t-2 border-gray-200" />
              <span className="mx-4">{t('or')}</span>
              <hr className="flex-grow border-t-2 border-gray-200" />
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('otp_email_label')}</label>
                <input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105"
              >
                {t('send_otp_email')}
              </button>
              {isOtpSent && <p className="text-center text-sm text-green-600 mt-2">{t('check_email')}</p>}
            </form>

            <button
              onClick={() => setCurrentPage('Register')}
              className="mt-4 w-full text-indigo-600 py-3 px-4 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-colors transform hover:scale-105"
            >
              {t('create_new_account')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Register Screen Component
  const RegisterScreen = ({ onRegister, setCurrentPage }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onRegister(name, email, password, mobile);
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">{t('register_new_user')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('name_label')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('email_label')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('password_label')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('mobile_label')}</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105"
            >
              {t('register')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('Login')}
              className="mt-4 w-full text-indigo-600 py-3 px-4 rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-colors transform hover:scale-105"
            >
              {t('back_to_login')}
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  // Dashboard Component
  const Dashboard = ({ isAdmin, userPlans, allUsers, schemes }) => {
    const [goldPrice, setGoldPrice] = useState(null);
    const [silverPrice, setSilverPrice] = useState(null);

    useEffect(() => {
      const fetchPrices = async () => {
        try {
          const res = await fetch(
            'https://api.metalpriceapi.com/v1/latest?api_key=85121dcdae0e02977db7bb967e5d63bc&&base=INR&currencies=XAU,XAG'
          );
          const data = await res.json();
          if (data && data.rates) {
            const goldRate = data.rates.XAU;
            const silverRate = data.rates.XAG;
            if (goldRate) {
              const inrPerOunce = 1 / goldRate;
              setGoldPrice(inrPerOunce / 31.1035);
            }
            if (silverRate) {
              const inrPerOunceSilver = 1 / silverRate;
              setSilverPrice(inrPerOunceSilver / 31.1035);
            }
          }
        } catch (error) {
          console.error('Failed to fetch metal prices:', error);
        }
      };
      fetchPrices();
    }, []);

    const { t } = useTranslation();

    if (isAdmin) {
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter((u) => u.active).length;
      const totalSchemes = schemes.length;
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">{t('dashboard')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('total_users')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{totalUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('active_users')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{activeUsers}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('total_schemes')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{totalSchemes}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('tn_metal_prices')}</h3>
              {goldPrice && silverPrice ? (
                <div className="mt-2 text-indigo-600">
                  <p>{t('gold_price_per_gram')}: {formatCurrency(goldPrice)}</p>
                  <p>{t('silver_price_per_gram')}: {formatCurrency(silverPrice)}</p>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">{t('loading')}</p>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      const totalPlans = userPlans.length;
      const totalPaid = userPlans.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
      const totalDue = userPlans.reduce(
        (sum, p) => sum + ((p.totalAmount || 0) - (p.paidAmount || 0)),
        0
      );
      const totalWeight = userPlans.reduce((sum, p) => sum + (p.paidWeight || 0), 0);
      return (
        <div className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">{t('dashboard')}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('total_plans')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{totalPlans}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('total_paid')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('total_due')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {formatCurrency(totalDue)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('total_gold_weight')}</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {totalWeight.toFixed(3)} g
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{t('tn_metal_prices')}</h3>
              {goldPrice && silverPrice ? (
                <div className="mt-2 text-indigo-600">
                  <p>{t('gold_price_per_gram')}: {formatCurrency(goldPrice)}</p>
                  <p>{t('silver_price_per_gram')}: {formatCurrency(silverPrice)}</p>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">{t('loading')}</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // PosTerminalScreen Component
  const PosTerminalScreen = ({ items, billItems, setBillItems, posCustomerName, setPosCustomerName }) => {
    const { t } = useTranslation();
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(0);

    const handleAddItem = () => {
      if (selectedItem && quantity > 0) {
        const item = items.find(i => i.id === selectedItem);
        if (item) {
          const newItem = {
            ...item,
            billId: Date.now(),
            quantity: quantity,
            payableAmount: (item.salePrice * quantity) - discount,
            netWeight: item.weight * quantity,
          };
          setBillItems(prev => [...prev, newItem]);
        }
      }
    };

    const handleRemoveItem = (billId) => {
      setBillItems(prev => prev.filter(item => item.billId !== billId));
    };

    const totalItems = billItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalTaxableAmount = billItems.reduce((sum, item) => sum + item.payableAmount, 0);
    const totalTax = totalTaxableAmount * 0.03; // Assuming 3% GST
    const totalPayable = totalTaxableAmount + totalTax;

    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">{t('pos_terminal')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">{t('customer_name_label')}</label>
              <input type="text" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} className="mt-1 p-2 border rounded-md" placeholder={t('customer_name_label')} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">{t('select_item_label')}</label>
              <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="mt-1 p-2 border rounded-md">
                <option value="">{t('select_item_label')}</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">{t('quantity_label')}</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1 p-2 border rounded-md" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">{t('discount_label')}</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="mt-1 p-2 border rounded-md" />
            </div>
          </div>
          <button onClick={handleAddItem} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105 mb-6">
            {t('add_item')}
          </button>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('selected_items')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('item_name_label')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('quantity_label')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('sale_price_label')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discount_label')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payable_amount_label')}</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {billItems.map(item => (
                  <tr key={item.billId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.salePrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.discount || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.payableAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleRemoveItem(item.billId)} className="text-red-600 hover:text-red-900">
                        {t('remove_item')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:w-1/3 space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">{t('bill_summary')}</h3>
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <span className="text-gray-500">{t('total_taxable_amount')}:</span>
            <span className="font-semibold">{formatCurrency(totalTaxableAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t('total_tax')}:</span>
            <span className="font-semibold">{formatCurrency(totalTax)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-gray-400 pt-4">
            <span>{t('total_payable')}:</span>
            <span>{formatCurrency(totalPayable)}</span>
          </div>
          <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105 mt-4">
            {t('print_bill')}
          </button>
        </div>
      </div>
    );
  };

  const MyPlans = ({ userPlans, onPaymentClick }) => {
    const { t } = useTranslation();
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">{t('my_plans')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userPlans.length > 0 ? (
            userPlans.map((plan) => {
              const dueAmount = plan.totalAmount - plan.paidAmount;
              const monthsPaid = plan.paidAmount / plan.monthlyAmount;

              return (
                <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border-2 border-gray-200 hover:border-indigo-500 transition-all">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <GoldIcon /> {plan.title} ({plan.groupCode})
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
                    <hr className="my-4" />
                    <div className="space-y-2 text-gray-700">
                      <p>
                        <span className="font-medium">{t('joined_date')}</span> {new Date(plan.joinDate).toLocaleDateString('ta-IN')}
                      </p>
                      <p>
                        <span className="font-medium">{t('total_amount')}</span> {formatCurrency(plan.totalAmount)}
                      </p>
                      <p>
                        <span className="font-medium">{t('paid_amount')}</span> {formatCurrency(plan.paidAmount)}
                      </p>
                      <p>
                        <span className="font-medium">{t('due_amount')}</span> {formatCurrency(dueAmount)}
                      </p>
                      <p className="font-bold text-red-600">
                        <span className="font-medium text-gray-700">{t('due_details')}</span> {t('months_remaining', { count: plan.tenure - Math.floor(monthsPaid) })}
                      </p>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${plan.progress > 100 ? 100 : plan.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-sm text-gray-500 mt-1">{t('progress_completed', { progress: plan.progress.toFixed(2) })}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onPaymentClick(plan)}
                    className="mt-6 flex items-center justify-center w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors transform hover:scale-105"
                  >
                    <CreditCardIcon className="mr-2" /> {t('pay')}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 text-lg col-span-3">{t('no_plans_message')}</p>
          )}
        </div>
      </div>
    );
  };
  
  const JoinPlans = ({ schemes, onJoinPlan, onAddScheme, onEditScheme, onDeleteScheme, isAdmin }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedScheme, setSelectedScheme] = useState(null);
    const { t } = useTranslation();
  
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-800">
            {t("plans")}
          </h2>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> {t("new_scheme")}
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border-2 border-gray-200 hover:border-blue-500 transition-all"
            >
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <GoldIcon /> {scheme.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{scheme.subtitle}</p>
                <hr className="my-4" />
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">{t("group_code")}</span>{" "}
                    {scheme.groupCode}
                  </p>
                  <p>
                    <span className="font-medium">{t("monthly_amount")}</span>{" "}
                    {formatCurrency(scheme.monthlyAmount)}
                  </p>
                  <p>
                    <span className="font-medium">{t("tenure")}</span>{" "}
                    {scheme.tenure} {t("months")}
                  </p>
                    
                     <p>
                    <span className="font-medium">{t("discountPerGram")}</span>{" "}
                    {scheme.discountPerGram}
                  </p>
                    <p>
                    <span className="font-medium">{t("vatDiscountPercentage")}</span>{" "}
                    {scheme.vatDiscountPercentage}
                  </p>
                   <p>
                    <span className="font-medium">{t("finalSettlementDiscount")}</span>{" "}
                    {scheme.finalSettlementDiscount}
                    </p>
                  <p>
                    <span className="font-medium">{t("total_amount")}</span>{" "}
                    {formatCurrency(scheme.totalAmount)}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  {scheme.description}
                </p>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                {!isAdmin && (
                  <button
                    onClick={() => onJoinPlan(scheme)}
                    className="flex-1 flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105"
                  >
                    <PlusIcon className="mr-2" /> {t("join")}
                  </button>
                )}

                {isAdmin && (
                  <div className="flex-1 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedScheme(scheme);
                        setShowEditModal(true);
                      }}
                      className="flex-1 flex items-center justify-center text-blue-600 py-3 px-4 rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors transform hover:scale-105"
                      title={t("edit_scheme_title")}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDeleteScheme(scheme.id)}
                      className="flex-1 flex items-center justify-center text-red-600 py-3 px-4 rounded-xl border-2 border-red-600 hover:bg-red-50 transition-colors transform hover:scale-105"
                      title={t("delete_scheme_title")}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {showAddModal && (
          <AddSchemeModal
            onClose={() => setShowAddModal(false)}
            onAddScheme={onAddScheme}
          />
        )}
        {showEditModal && (
          <EditSchemeModal
            scheme={selectedScheme}
            onClose={() => setShowEditModal(false)}
            onUpdateScheme={onEditScheme}
          />
        )}
      </div>
    );
  };
  
  // AddSchemeModal component
  const AddSchemeModal = ({ onClose, onAddScheme }) => {
    const [groupCode, setGroupCode] = useState('');
    const [monthlyAmount, setMonthlyAmount] = useState('');
    const [tenure, setTenure] = useState('');
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [description, setDescription] = useState('');
    const [discountPerGram, setDiscountPerGram] = useState(0)
    const [vatDiscountPercentage, setVatDiscountPercentage] = useState(0)
    const [finalSettlementDiscount, setFinalSettlementDiscount] = useState(0)
    const { t } = useTranslation();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onAddScheme({
        groupCode,
        monthlyAmount: parseFloat(monthlyAmount),
        tenure: parseInt(tenure),
        title,
        subtitle,
        description,
        totalAmount: parseFloat(monthlyAmount) * parseInt(tenure),
         discountPerGram,
        vatDiscountPercentage,
        finalSettlementDiscount
      });
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full m-4">
          <h3 className="text-2xl font-bold text-indigo-800 mb-4 text-center">{t('add_new_scheme')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder={t('scheme_title')} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="text" placeholder={t('subtitle')} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="text" placeholder={t('group_code_placeholder')} value={groupCode} onChange={(e) => setGroupCode(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="number" placeholder={t('monthly_amount_placeholder')} value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="number" placeholder={t('tenure_placeholder')} value={tenure} onChange={(e) => setTenure(e.target.value)} className="w-full p-3 border rounded-md" required />
             <input type="number" placeholder={t('discount_per_gram')} value={discountPerGram} onChange={(e) => setDiscountPerGram(e.target.value)} className="w-full p-3 border rounded-md" required />
 <input type="number" placeholder={t('vatDiscountPercentage')} value={vatDiscountPercentage} onChange={(e) => setVatDiscountPercentage(e.target.value)} className="w-full p-3 border rounded-md" required />
 <input type="number" placeholder={t('finalSettlementDiscount')} value={finalSettlementDiscount} onChange={(e) => setFinalSettlementDiscount(e.target.value)} className="w-full p-3 border rounded-md" required />
 <textarea placeholder={t('description')} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-md" rows="3" required />
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors">{t('cancel')}</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors">{t('add')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // EditSchemeModal component
  const EditSchemeModal = ({ scheme, onClose, onUpdateScheme }) => {
    const [groupCode, setGroupCode] = useState(scheme.groupCode);
    const [monthlyAmount, setMonthlyAmount] = useState(scheme.monthlyAmount);
    const [tenure, setTenure] = useState(scheme.tenure);
    const [title, setTitle] = useState(scheme.title);
    const [subtitle, setSubtitle] = useState(scheme.subtitle);
    const [description, setDescription] = useState(scheme.description);
     const [discountPerGram, setDiscountPerGram] = useState(scheme.discountPerGram)
    const [vatDiscountPercentage, setVatDiscountPercentage] = useState(scheme.vatDiscountPercentage)
    const [finalSettlementDiscount, setFinalSettlementDiscount] = useState(scheme.finalSettlementDiscount)
    const { t } = useTranslation();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdateScheme(scheme.id, {
        groupCode,
        monthlyAmount: parseFloat(monthlyAmount),
        tenure: parseInt(tenure),
        title,
        subtitle,
        description,
        totalAmount: parseFloat(monthlyAmount) * parseInt(tenure),
      });
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full m-4">
          <h3 className="text-2xl font-bold text-indigo-800 mb-4 text-center">{t('edit_scheme_title')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder={t('scheme_title')} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="text" placeholder={t('subtitle')} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="text" placeholder={t('group_code_placeholder')} value={groupCode} onChange={(e) => setGroupCode(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="number" placeholder={t('monthly_amount_placeholder')} value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} className="w-full p-3 border rounded-md" required />
            <input type="number" placeholder={t('tenure_placeholder')} value={tenure} onChange={(e) => setTenure(e.target.value)} className="w-full p-3 border rounded-md" required />
             <input type="number" placeholder={t('discount_per_gram')} value={discountPerGram} onChange={(e) => setDiscountPerGram(e.target.value)} className="w-full p-3 border rounded-md" required />
 <input type="number" placeholder={t('vatDiscountPercentage')} value={vatDiscountPercentage} onChange={(e) => setVatDiscountPercentage(e.target.value)} className="w-full p-3 border rounded-md" required />
 <input type="number" placeholder={t('finalSettlementDiscount')} value={finalSettlementDiscount} onChange={(e) => setFinalSettlementDiscount(e.target.value)} className="w-full p-3 border rounded-md" required />

<textarea placeholder={t('description')} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-md" rows="3" required />
            <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors">{t('cancel')}</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors">{t('update')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // UserScreen Component
  const UserScreen = ({ user, myProfile, userPlans, onToggleUserActive, onLogout, setCurrentPage }) => {
    const { t } = useTranslation();
    const totalSchemes = userPlans.length;
    const totalDue = userPlans.reduce((sum, plan) => sum + (plan.totalAmount - plan.paidAmount), 0);
    const activeStatus = myProfile?.active ? 'Active' : 'Deactivated';

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">{t('user_profile')}</h2>
                             <div className="flex items-center justify-between mb-8">
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border rounded p-1"
            >
              <option value="ta">{t('tamil')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="https://picsum.photos/seed/useravatar/100/100" alt="Avatar" className="w-16 h-16 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{myProfile?.name || t('no_name')}</h3>
                <p className="text-gray-500">
                  {myProfile?.email || user?.email || t('email_not_available')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${myProfile?.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {activeStatus}
              </span>
              <button
                onClick={() => onToggleUserActive(userId, myProfile.active)}
                className={`p-2 rounded-full text-white transition-colors transform hover:scale-110 ${myProfile?.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                title={myProfile?.active ? t('deactivate_user') : t('activate_user')}
              >
                {myProfile?.active ? <TrashIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <hr className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">{t('mobile_label')}</p>
              <p className="mt-1 text-gray-900">{myProfile?.mobile || t('info_not_available')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('plan_count')}</p>
              <p className="mt-1 text-gray-900">{totalSchemes}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('due_total')}</p>
              <p className="mt-1 text-gray-900">{formatCurrency(totalDue)}</p>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentPage('EditUserScreen')}
            className="mt-8 w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105"
          >
            <EditIcon className="mr-2" /> {t('edit_profile')}
          </button>

          <button
            onClick={onLogout}
            className="mt-4 w-full flex items-center justify-center bg-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-gray-600 transition-colors transform hover:scale-105"
          >
            <LogOutIcon className="mr-2" /> {t('logout')}
          </button>
        </div>
      </div>
    );
  };
  
  // EditUserScreen Component
  const EditUserScreen = ({ myProfile, onEditProfile, setCurrentPage }) => {
    const [name, setName] = useState(myProfile?.name || '');
    const [mobile, setMobile] = useState(myProfile?.mobile || '');
    const { t } = useTranslation();

    const handleSubmit = (e) => {
      e.preventDefault();
      onEditProfile(name, mobile);
    };

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-indigo-800 mb-6">{t('edit_profile_title')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('name_label')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('mobile_label')}</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl shadow-md hover:bg-blue-700 transition-colors transform hover:scale-105"
            >
              {t('update')}
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('UserScreen')}
              className="mt-4 w-full text-blue-600 py-3 px-4 rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors transform hover:scale-105"
            >
              {t('back')}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // AllUsersScreen Component
  const AllUsersScreen = ({ allUsers, onToggleUserActive }) => {
    const { t } = useTranslation();
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">{t('all_users')}</h2>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {allUsers.length > 0 ? (
              allUsers.map((user) => (
                <li key={user.userId} className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <img src="https://picsum.photos/seed/useravatar/100/100" alt="Avatar" className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs">ID: {user.userId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t(user.active ? 'active' : 'inactive')}
                    </span>
                    <button
                      onClick={() => onToggleUserActive(user.userId, user.active)}
                      className={`p-2 rounded-full text-white transition-colors transform hover:scale-110 ${user.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                      title={user.active ? t('deactivate_user') : t('activate_user')}
                    >
                      {user.active ? <TrashIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500 text-lg">{t('no_users_message')}</li>
            )}
          </ul>
        </div>
      </div>
    );
  };
  

  // Deactivate Confirmation Modal
  const DeactivateConfirmModal = ({ onClose, onConfirm, currentStatus }) => {
    const { t } = useTranslation();
    const statusText = currentStatus ? t('deactivate') : t('activate');
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <h3 className="text-xl font-bold text-red-600 text-center mb-4">{t('confirm_title')}</h3>
          <p className="text-gray-800 text-center mb-6">
            {t('confirm_deactivate_message', { status: statusText })}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 text-gray-700 font-semibold py-3 px-4 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-red-700 transition-colors"
            >
              {t('confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Custom Modal for Messages
  const MessageModal = ({ message, onClose }) => {
    const { t } = useTranslation();
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <p className="text-gray-800 text-center mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors transform hover:scale-105"
          >
            {t('ok')}
          </button>
        </div>
      </div>
    );
  };
  
  // Add Payment Modal Component
  const PaymentModal = ({ plan, onClose, onAddPayment, paymentAmount, setPaymentAmount, paymentReference, setPaymentReference }) => {
    const { t } = useTranslation();
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full m-4">
          <h3 className="text-2xl font-bold text-indigo-800 mb-4 text-center">{t('pay_modal_title')}</h3>
          <p className="text-gray-700 mb-6 text-center">
            {t('pay_message', { title: plan.title })}
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('amount_label')}</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                placeholder={t('amount_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('reference_label')}</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                placeholder={t('reference_placeholder')}
              />
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 text-gray-700 font-semibold py-3 px-4 rounded-xl border-2 border-gray-300 hover:bg-gray-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onAddPayment}
              className="flex-1 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
            >
              {t('submit_payment')}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Show a loading state while Firebase auth is ready
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-indigo-800 text-xl font-semibold">{t('loading')}</div>
      </div>
    );
  }

  // Display Login/Register page if user is not authenticated
  if (!user) {
    switch (currentPage) {
      case "Register":
        return (
          <>
            {showModal && (
              <MessageModal
                message={modalMessage}
                onClose={() => setShowModal(false)}
              />
            )}
            <RegisterScreen
              onRegister={handleRegister}
              setCurrentPage={setCurrentPage}
            />
          </>
        );
      default:
        return (
        <>
          {showModal && (
            <MessageModal
              message={modalMessage}
              onClose={() => setShowModal(false)}
            />
          )}
          <Login authInstance={auth} setCurrentPage={setCurrentPage} />
        </>
        );
    }
  }

  const isAdmin = myProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <main className="flex flex-row">
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 md:h-screen bg-white shadow-xl md:rounded-r-3xl z-40">
        <div className="p-6 md:flex flex-col h-full hidden">
          <div className="flex items-center justify-center mb-8">
            <h1 className="text-2xl font-bold text-indigo-800">DigiGold</h1>
          </div>
          <ul className="space-y-2 flex-grow">
            <li>
              <button
                onClick={() => setCurrentPage("Dashboard")}
                className={`w-full flex items-center p-3 rounded-xl transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${
                  currentPage === "Dashboard"
                    ? "bg-indigo-50 text-indigo-800 font-semibold"
                    : "text-gray-600"
                }`}
              >
                <HomeIcon className="mr-3" />
                {t("dashboard")}
              </button>
            </li>
            {!isAdmin && (
              <li>
                <button
                  onClick={() => setCurrentPage("MyPlans")}
                  className={`w-full flex items-center p-3 rounded-xl transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${
                    currentPage === "MyPlans"
                      ? "bg-indigo-50 text-indigo-800 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  <WalletIcon className="mr-3" />
                  {t("my_plans")}
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => setCurrentPage("JoinPlans")}
                className={`w-full flex items-center p-3 rounded-xl transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${
                  currentPage === "JoinPlans"
                    ? "bg-indigo-50 text-indigo-800 font-semibold"
                    : "text-gray-600"
                }`}
              >
                <PlusIcon className="mr-3" />
                {t("plans")}
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage("UserScreen")}
                className={`w-full flex items-center p-3 rounded-xl transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${
                  currentPage === "UserScreen"
                    ? "bg-indigo-50 text-indigo-800 font-semibold"
                    : "text-gray-600"
                }`}
              >
                <UserIcon className="mr-3" />
                {t("profile")}
              </button>
            </li>
            {isAdmin && (
              <li>
                <button
                  onClick={() => setCurrentPage("AllUsersScreen")}
                  className={`w-full flex items-center p-3 rounded-xl transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${
                    currentPage === "AllUsersScreen"
                      ? "bg-indigo-50 text-indigo-800 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  <UsersIcon className="mr-3" />
                  {t("all_users")}
                </button>
              </li>
            )}
            {isAdmin && (
              <li>
                <button
                  onClick={() => setCurrentPage("PosTerminalScreen")}
                  className={`w-full flex items-center p-3 rounded-xl transition-colors hover:bg-indigo-100 hover:text-indigo-800 ${
                    currentPage === "PosTerminalScreen"
                      ? "bg-indigo-50 text-indigo-800 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  <BillsIcon className="mr-3" />
                  {t("print_bill")}
                </button>
              </li>
            )}
          </ul>
           <div className=" p-2 bg-white border-b-2 border-gray-200 flex justify-end">
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="border rounded p-1"
          >
            <option value="ta">{t('tamil')}</option>
            <option value="en">{t('english')}</option>
          </select>
        </div>
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl transition-colors text-white bg-gray-500 hover:bg-gray-600"
            >
              <LogOutIcon className="mr-2" /> {" "}
              {t("logout")}
            </button>
          </div>
        </div>
        <div className="md:hidden flex justify-around p-2 bg-white border-t-2 border-gray-200">
          <button
            onClick={() => setCurrentPage("Dashboard")}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              currentPage === "Dashboard" ? "text-indigo-800" : "text-gray-500"
            }`}
          >
            <HomeIcon />
            <span className="text-xs">{t("dashboard_nav")}</span>
          </button>
          {!isAdmin && (
            <button
              onClick={() => setCurrentPage("MyPlans")}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                currentPage === "MyPlans" ? "text-indigo-800" : "text-gray-500"
              }`}
            >
              <WalletIcon /> {" "}
              <span className="text-xs">{t("plans_nav")}</span>
            </button>
          )}
          <button
            onClick={() => setCurrentPage("JoinPlans")}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              currentPage === "JoinPlans"
                ? "text-indigo-800"
                : "text-gray-500"
            }`}
          >
            <PlusIcon /> {" "}
            <span className="text-xs">{t("join_nav")}</span>
          </button>
          <button
            onClick={() => setCurrentPage("UserScreen")}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              currentPage === "UserScreen"
                ? "text-indigo-800"
                : "text-gray-500"
            }`}
          >
            <UserIcon /> {" "}
            <span className="text-xs">{t("profile_nav")}</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setCurrentPage("AllUsersScreen")}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                currentPage === "AllUsersScreen"
                  ? "text-indigo-800"
                  : "text-gray-500"
              }`}
            >
              <UsersIcon /> {" "}
              <span className="text-xs">{t("users_nav")}</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setCurrentPage("PosTerminalScreen")}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                currentPage === "PosTerminalScreen"
                  ? "text-indigo-800"
                  : "text-gray-500"
              }`}
            >
              <BillsIcon /> {" "}
              <span className="text-xs">{t("print_bill")}</span>
            </button>
          )}
        </div>
      </nav>
        <div className="container mx-auto">
          {currentPage === "Dashboard" && (
            <Dashboard
              isAdmin={isAdmin}
              userPlans={userPlans}
              allUsers={allUsers}
              schemes={schemes}
            />
          )}
          {currentPage === "MyPlans" && !isAdmin && (
            <MyPlans
              userPlans={userPlans}
              onPaymentClick={(plan) => {
                setSelectedPlanForPayment(plan);
                setShowPaymentModal(true);
              }}
            />
          )}
          {currentPage === "JoinPlans" && (
            <JoinPlans
              schemes={schemes}
              onJoinPlan={handleJoinPlan}
              onAddScheme={handleAddScheme}
              onEditScheme={handleUpdateScheme}
              onDeleteScheme={handleDeleteScheme}
              isAdmin={isAdmin}
            />
          )}
          {currentPage === "UserScreen" && (
            <UserScreen
              user={user}
              myProfile={myProfile}
              userPlans={userPlans}
              onToggleUserActive={(id, status) => {
                setUserToDeactivate({ id, status });
                setShowDeactivateConfirmModal(true);
              }}
              onLogout={handleLogout}
              setCurrentPage={setCurrentPage}
            />
          )}
          {currentPage === "EditUserScreen" && (
            <EditUserScreen
              myProfile={myProfile}
              onEditProfile={handleEditProfile}
              setCurrentPage={setCurrentPage}
            />
          )}
          {currentPage === "AllUsersScreen" && isAdmin && (
            <AllUsersScreen
              allUsers={allUsers}
              onToggleUserActive={(id, status) => {
                setUserToDeactivate({ id, status });
                setShowDeactivateConfirmModal(true);
              }}
            />
          )}
          {currentPage === "AllUsersScreen" && !isAdmin && (
            <div className="p-6 text-center text-gray-500 text-lg">
              {t("unauthorized_page")}
            </div>
          )}
          {currentPage === "PosTerminalScreen" && isAdmin && (
            <PosTerminalScreen
              items={items}
              billItems={billItems}
              setBillItems={setBillItems}
              posCustomerName={posCustomerName}
              setPosCustomerName={setPosCustomerName}
            />
          )}
          {currentPage === "PosTerminalScreen" && !isAdmin && (
            <div className="p-6 text-center text-gray-500 text-lg">
              {t("unauthorized_page")}
            </div>
          )}
        </div>
      </main>

      {showPaymentModal && (
        <PaymentModal
          plan={selectedPlanForPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentAmount("");
            setPaymentReference("");
          }}
          onAddPayment={handleAddPayment}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentReference={paymentReference}
          setPaymentReference={setPaymentReference}
        />
      )}

      {showDeactivateConfirmModal && (
        <DeactivateConfirmModal
          onClose={() => setShowDeactivateConfirmModal(false)}
          currentStatus={userToDeactivate.status}
          onConfirm={() =>
            handleToggleUserActive(userToDeactivate.id, userToDeactivate.status)
          }
        />
      )}

      {showModal && (
        <MessageModal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default App;
