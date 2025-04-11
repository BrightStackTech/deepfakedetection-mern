import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Confirmation() {
  const { token } = useParams();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/confirmation/${token}`);
        setMessage(response.data.message);
      } catch (error) {
        setMessage('Email confirmation failed. Please try again.');
      }
    };
    confirmEmail();
  }, [token]);

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="bg-white px-10 py-8 rounded-[20px] border border-2">
        <div className="text-3xl font-semibold text-black">{message}</div>
        <button className="mt-4 bg-[#1473E6] text-white px-4 py-2 rounded-md" onClick={() => window.location.href = '/login'}>Log In</button>
      </div>
    </div>
  );
}

export default Confirmation;