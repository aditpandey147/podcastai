// frontend/src/pages/UpgradeRequired.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown, ArrowLeft } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function UpgradeRequired() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ background: '#020914' }}>
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 grid place-items-center p-6">
          <div
            className="max-w-md w-full rounded-2xl p-8 text-center"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(110,53,237,.15), transparent 60%), linear-gradient(180deg, rgba(4,26,53,.65), rgba(3,17,38,.85))',
              border: '1px solid rgba(150,120,255,.4)',
            }}
          >
            <div
              className="w-16 h-16 rounded-full grid place-items-center mx-auto mb-5"
              style={{
                background:
                  'linear-gradient(135deg, rgba(110,53,237,.3), rgba(52,131,255,.3))',
                border: '1px solid rgba(150,120,255,.5)',
              }}
            >
              <Lock size={28} className="text-[#c9b5ff]" />
            </div>

            <h2 className="text-2xl font-bold text-[#eaf1ff] mb-2">
              Upgrade Required
            </h2>
            <p className="text-[13.5px] text-[#8fa0ba] mb-6 leading-relaxed">
              This page is only available on higher plans. Upgrade to unlock
              premium features.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 h-[44px] rounded-[10px] text-[13px] font-medium flex items-center justify-center gap-2 transition"
                style={{
                  background: 'rgba(6,20,42,.7)',
                  border: '1px solid #17385f',
                  color: '#aebfd5',
                }}
              >
                <ArrowLeft size={14} />
                Go Back
              </button>
              <button
                onClick={() => navigate('/upgrades')}
                className="flex-1 h-[44px] rounded-[10px] text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition hover:brightness-110"
                style={{
                  background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
                  boxShadow: '0 8px 24px rgba(110,53,237,.35)',
                }}
              >
                <Crown size={14} />
                See Plans
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}