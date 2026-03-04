import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  company: null,
  subscription: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':   return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS': return { ...state, ...action.payload, loading: false, error: null };
    case 'LOGOUT':        return { ...initialState, token: null, loading: false };
    case 'SET_ERROR':     return { ...state, error: action.payload, loading: false };
    case 'UPDATE_USER':   return { ...state, user: action.payload };
    default: return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      // No token — not logged in, stop loading
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: data.data.user,
            company: data.data.user.company,
            subscription: data.data.subscription,
            token,
          },
        });
      } catch (err) {
        // Token invalid or expired — clear it silently, don't show toast here
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const token = data.data.token;
    localStorage.setItem('token', token);
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: data.data.user,
        company: data.data.user.company,
        subscription: null,
        token,
      },
    });
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const token = data.data.token;
    localStorage.setItem('token', token);
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        user: data.data.user,
        company: null,
        subscription: null,
        token,
      },
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);