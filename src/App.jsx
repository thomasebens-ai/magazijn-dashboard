import React, { useState, useEffect } from 'react';

export default function App() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Jouw Google API
  const API_URL = 'https://script.google.com/macros/s/AKfycbwC8lA-Im1obJfn_6MKCbXv_rswuJdI7JQp0t28114yt-XSU3eXoq2ru9TDvyFm6eUo/exec';

  const isPositive = (val) => {
    if (val === true || val === 1) return true;
    if (val === false || val === 0 || val === null || val === undefined || val === '') return false;
    const str = String(val).trim().toUpperCase();
    return str === 'TRUE' || str === 'WAAR' || str === 'JA' || str === 'YES' || str === '1';
  };

  const getValue = (row, fieldType, shift) => {
    const keys = Object.keys(row);
    const targetType = fieldType.toLowerCase().replace(/[^a-z]/g, '');
    const targetShift = shift.toLowerCase();

    for (const key of keys) {
      const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanKey.includes(targetType) && cleanKey.includes(targetShift)) {
        return row[key];
      }
    }
    return undefined;
  };

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Fout bij ophalen (${res.status}).`);

      const rows = await res.json();
      if (!Array.isArray(rows)) throw new Error('Onverwacht dataformaat ontvangen.');

      const active = [];

      rows.forEach((row) => {
        // --- AM VERWERKING ---
        const amCoolVal = getValue(row, 'cool', 'am');
        const amAanwezigVal = getValue(row, 'aanwezig', 'am');
        const amChauffeur = getValue(row, 'chauffeur', 'am');

        const amCool = isPositive(amCoolVal);
        const amAanwezig = isPositive(amAanwezigVal);
        const validAmName = amChauffeur && String(amChauffeur).trim() !== '-' && String(amChauffeur).trim() !== 'OPEN ROUTE';

        if (amCool && !amAanwezig && validAmName) {
          active.push({
            shift: 'AM',
            name: String(amChauffeur).trim(),
            route: getValue(row, 'ritnummer', 'am') || '-',
            plate: getValue(row, 'kenteken', 'am') || 'ONBEKEND',
            temp: getValue(row, 'temp', 'am') || '-',
            battery: getValue(row, 'accu', 'am') || '-'
          });
        }

        // --- PM VERWERKING ---
        const pmCoolVal = getValue(row, 'cool', 'pm');
        const pmAanwezigVal = getValue(row, 'aanwezig', 'pm');
        const pmChauffeur = getValue(row, 'chauffeur', 'pm');

        const pmCool = isPositive(pmCoolVal);
        const pmAanwezig = isPositive(pmAanwezigVal);
        const validPmName = pmChauffeur && String(pmChauffeur).trim() !== '-' && String(pmChauffeur).trim() !== 'OPEN ROUTE';

        if (pmCool && !pmAanwezig && validPmName) {
          active.push({
            shift: 'PM',
            name: String(pmChauffeur).trim(),
            route: getValue(row, 'ritnummer', 'pm') || '-',
            plate: getValue(row, 'kenteken', 'pm') || 'ONBEKEND',
            temp: getValue(row, 'temp', 'pm') || '-',
            battery: getValue(row, 'accu', 'pm') || '-'
          });
        }
      });

      setDrivers(active);
      setError(null);
    } catch (err) {
      setError(err.message || 'Kon geen verbinding maken met de Google API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0b0f19',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Vernieuwde, superstrakke Header */}
      <header style={{
        padding: '24px 40px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0b0f19',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Strak SVG icoon */}
          <div style={{
            backgroundColor: '#10b981',
            borderRadius: '14px',
            width: '52px',
            height: '52px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 0 24px rgba(16, 185, 129, 0.2)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ 
              margin: '0 0 4px 0', 
              fontSize: '26px', 
              fontWeight: '800', 
              letterSpacing: '-0.5px', 
              color: '#ffffff',
              lineHeight: '1.2'
            }}>
              Live Chauffeurs Dashboard
            </h1>
            <p style={{ 
              margin: 0, 
              color: '#64748b', 
              fontSize: '14px', 
              fontWeight: '500',
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Actief overzicht</span>
              <span style={{ color: '#334155', fontSize: '10px' }}>●</span>
              <span><strong style={{ color: '#10b981', fontWeight: '700' }}>{drivers.length}</strong> ritten momenteel actief</span>
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '24px',
          border: '1px solid #334155',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          color: '#10b981',
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          LIVE VERBINDING
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        {loading && drivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '120px 0', color: '#64748b' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '0.5px' }}>DATA SYNCHRONISEREN...</div>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#1a0b12',
            border: '1px solid #9f1239',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '520px',
            margin: '80px auto',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #f43f5e', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto',
              color: '#f43f5e', fontSize: '24px', fontWeight: 'bold'
            }}>!</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#f43f5e', fontSize: '22px', fontWeight: '800' }}>
              Verbindingsfout
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
              Kon de data niet ophalen van een of beide sheets (AM/PM).<br/>Controleer de namen van de tabbladen.
            </p>
            <button
              onClick={fetchData}
              style={{
                backgroundColor: '#701a2b',
                color: '#fda4af',
                border: '1px solid #9f1239',
                padding: '10px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Probeer opnieuw
            </button>
          </div>
        ) : drivers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '100px 20px',
            backgroundColor: '#131b2e',
            border: '1px solid #1e293b',
            borderRadius: '12px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#94a3b8', margin: '0 0 6px 0' }}>
              Geen openstaande ritten gereed
            </h2>
            <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>
              Alle bussen met voltooide Cool check zijn al gemeld als aanwezig.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {drivers.map((item, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#131b2e',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Blauw-groene (Teal) Kenteken header */}
                <div style={{
                  backgroundColor: '#0d9488', 
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '4px solid #0f766e'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      backgroundColor: '#1d4ed8',
                      color: '#ffffff',
                      borderRadius: '4px',
                      padding: '3px 6px',
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.5px'
                    }}>
                      NL
                    </div>
                    <span style={{
                      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: '24px',
                      fontWeight: '900',
                      letterSpacing: '2px', 
                      color: '#ffffff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}>
                      {item.plate}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {item.shift}
                  </span>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Chauffeur
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', margin: '4px 0 20px 0' }}>
                      {item.name}
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#0b0f19',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    border: '1px solid #1e293b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Ritnummer</span>
                      <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#cbd5e1', fontWeight: '600' }}>
                        {item.route}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Temperatuur</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}>
                        {item.temp}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Accu Lading</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '3px 10px',
                        borderRadius: '6px'
                      }}>
                        {item.battery}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}