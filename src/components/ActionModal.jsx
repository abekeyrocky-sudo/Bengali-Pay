import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { sounds } from '../utils/audio';

export const ActionModal = () => {
  const { modalConfig, closeModal } = useApp();

  useEffect(() => {
    if (modalConfig) {
      if (modalConfig.type === 'success') {
        sounds.playWin();
      } else {
        sounds.playClick();
      }

      if (modalConfig.autoClose && modalConfig.autoClose > 0) {
        const timer = setTimeout(() => {
          closeModal();
          if (modalConfig.onConfirm) modalConfig.onConfirm();
        }, modalConfig.autoClose);
        return () => clearTimeout(timer);
      }
    }
  }, [modalConfig]);

  if (!modalConfig) return null;

  const {
    type = 'info',
    title = '',
    message = '',
    confirmText = 'ঠিক আছে',
    cancelText = null,
    onConfirm = null,
    onCancel = null
  } = modalConfig;

  const handleConfirm = () => {
    sounds.playClick();
    closeModal();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    sounds.playClick();
    closeModal();
    if (onCancel) onCancel();
  };

  // Type-specific colors & icons
  const getTypeDetails = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={34} color="#059669" strokeWidth={2.5} />,
          iconBg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          iconBorder: 'rgba(16, 185, 129, 0.25)',
          buttonBg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          buttonShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
          accentColor: '#16a34a'
        };
      case 'warn':
        return {
          icon: <AlertTriangle size={34} color="#d97706" strokeWidth={2.5} />,
          iconBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          iconBorder: 'rgba(245, 158, 11, 0.25)',
          buttonBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          buttonShadow: '0 8px 20px rgba(217, 119, 6, 0.35)',
          accentColor: '#d97706'
        };
      case 'fail':
      default:
        return {
          icon: <XCircle size={34} color="#e11d48" strokeWidth={2.5} />,
          iconBg: 'linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)',
          iconBorder: 'rgba(225, 29, 72, 0.25)',
          buttonBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
          buttonShadow: '0 8px 20px rgba(225, 29, 72, 0.35)',
          accentColor: '#e11d48'
        };
    }
  };

  const details = getTypeDetails();

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'modalFadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '315px',
          background: '#ffffff',
          borderRadius: '26px',
          padding: '26px 20px 20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.06)',
          textAlign: 'center',
          position: 'relative',
          animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Soft Ambient Header Glow */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: details.buttonBg
        }} />

        {/* Close Button */}
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#f1f5f9',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={16} />
        </button>

        {/* 3D Styled Icon Circle */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: details.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '4px solid #ffffff',
          boxShadow: `0 8px 22px ${details.iconBorder}`
        }}>
          {details.icon}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '800',
          color: '#0f172a',
          fontFamily: "'Noto Serif Bengali', 'Outfit', serif",
          marginBottom: '8px',
          lineHeight: '1.3'
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '13.5px',
          color: '#475569',
          fontFamily: "'Noto Serif Bengali', 'Outfit', sans-serif",
          lineHeight: '1.5',
          marginBottom: '22px',
          fontWeight: '500'
        }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleConfirm}
            style={{
              width: '100%',
              padding: '13px 20px',
              background: details.buttonBg,
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '800',
              fontFamily: "'Noto Serif Bengali', 'Outfit', sans-serif",
              borderRadius: '16px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: details.buttonShadow,
              transition: 'transform 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {confirmText}
          </button>

          {cancelText && (
            <button
              onClick={handleCancel}
              style={{
                width: '100%',
                padding: '11px 20px',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: "'Noto Serif Bengali', 'Outfit', sans-serif",
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer'
              }}
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
