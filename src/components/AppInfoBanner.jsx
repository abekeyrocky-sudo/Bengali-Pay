import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import cigaretteIcon from '../assets/cigarette-icon.png';

export const AppInfoBanner = () => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      marginTop: '28px',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '24px',
      padding: '24px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      border: '1.5px solid rgba(34, 197, 94, 0.3)',
      color: '#1e293b'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Section 1: Brand & Tagline */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '18px',
          padding: '18px',
          border: '1px solid #86efac',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#15803d' }}>
                Bengali Pay
              </span>
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#facc15',
                color: '#713f12',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '16px'
              }}>
                ৳
              </span>
            </div>
            <p style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#166534',
              lineHeight: '1.4'
            }}>
              বাংলাদেশের মানুষের জন্য<br />বাংলাদেশের অ্যাপ
            </p>
          </div>

          <div style={{
            marginTop: '12px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#15803d'
          }}>
            গ্রাম-বাংলার মাটির সুবাস ও টোকেন রিওয়ার্ড
          </div>
        </div>

        {/* Section 2: অ্যাপের মূল তথ্য */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px 18px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h4 style={{
            fontSize: '15px',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '12px',
            borderBottom: '2px solid #86efac',
            paddingBottom: '4px'
          }}>
            অ্যাপের মূল তথ্য
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800'
              }}>
                ৳
              </span>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px' }}>কারেন্সি: </span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>বাংলাদেশি টাকা (৳)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fce7f3',
                color: '#db2777',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '11px'
              }}>
                BK
              </span>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px' }}>উইথড্র পদ্ধতি: </span>
                <span style={{ fontWeight: '800', color: '#e2136e' }}>bKash</span> / <span style={{ fontWeight: '800', color: '#f97316' }}>Nagad</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800'
              }}>
                ৳
              </span>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px' }}>মিনিমাম উইথড্র: </span>
                <span style={{ fontWeight: '800', color: '#16a34a' }}>500 ৳</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b', fontSize: '11px' }}>রিকোয়ার্ড টোকেন: </span>
              <span style={{ fontWeight: '800', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                50 <img src={cigaretteIcon} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: আজ করুন টোকেন জিতুন টাকা তুলুন */}
        <div style={{
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          borderRadius: '18px',
          padding: '16px 18px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '900',
              fontFamily: "'Baloo Da 2', sans-serif",
              color: '#fef08a',
              lineHeight: '1.3'
            }}>
              আজ করুন<br />
              টোকেন জিতুন<br />
              টাকা তুলুন!
            </h4>
            <div style={{
              display: 'inline-block',
              marginTop: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '3px 10px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              এটা তো সিম্পল!
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#bbf7d0' }}>
              সহজ টাস্ক • ইনস্ট্যান্ট পে
            </span>
          </div>
        </div>

        {/* Section 4: App Theme Checkpoints */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '16px 18px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            fontSize: '15px',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '10px'
          }}>
            App Theme & Specs
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            {[
              'Cartoon & Nature Vibe',
              'Bangladeshi Culture',
              'Fun & Engaging Design',
              'Simple & Easy UI',
              'Mobile Friendly (100%)',
              'Lightweight & Fast'
            ].map((theme, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={14} color="#16a34a" />
                <span style={{ fontWeight: '600', color: '#334155' }}>{theme}</span>
              </div>
            ))}
          </div>

          {/* Flow Tagline */}
          <div style={{
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: '800',
            color: '#15803d'
          }}>
            <span>Play</span>
            <ArrowRight size={12} />
            <span>Earn</span>
            <ArrowRight size={12} />
            <span>Withdraw</span>
          </div>
        </div>
      </div>
    </div>
  );
};
