/**
 * COMPONENTE: CookieBanner (Banner Flutuante & Modal de Privacidade LGPD)
 * -----------------------------------------------------------------------------
 * Conformidade com a Lei Geral de Proteção de Dados (LGPD):
 * - Banner flutuante no canto inferior direito que não obstrui a leitura principal
 * - Persistência da aceitação no localStorage ('projdet_cookies_accepted')
 * - Modal técnico com as diretrizes de sigilo industrial (NDA) da PROJDET
 * - Constantes comentadas no topo para ajuste de animações de entrada e saída
 */
import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Check, Lock } from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Calibre a velocidade de surgimento do banner e do fade do modal:
 */
const LGPD_TRANSITION_DURATION = '200ms'; // Duração da animação de entrada/saída
const LGPD_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva de aceleração suave

export default function CookieBanner({ isOpenModal, onCloseModal, onOpenModal }) {
  // Estado de visibilidade do banner flutuante
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  // Verificação preventiva no localStorage ao carregar a página
  useEffect(() => {
    try {
      const isAccepted = localStorage.getItem('projdet_cookies_accepted');
      if (!isAccepted) {
        // Delay técnico sutil (1.2s) para não disputar atenção com a Hero Section
        const timer = setTimeout(() => {
          setIsBannerVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Fallback gracioso caso o navegador bloqueie o localStorage
      setIsBannerVisible(true);
    }
  }, []);

  // Manipulador de aceitação de cookies essenciais
  const handleAcceptCookies = () => {
    try {
      localStorage.setItem('projdet_cookies_accepted', 'true');
    } catch (e) {
      console.warn('[LGPD] Não foi possível salvar preferências no localStorage.');
    }
    setIsBannerVisible(false);
  };

  return (
    <>
      {/* 1. BANNER FLUTUANTE INFERIOR (PADRÃO FORGEX ESCURO) */}
      {isBannerVisible && (
        <aside
          role="region"
          aria-label="Aviso de Privacidade e Cookies"
          className="lgpd-banner-floating"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 990,
            maxWidth: '430px',
            backgroundColor: '#090E17',
            border: '1px solid #1E293B',
            borderRadius: 'var(--radius-card)',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: `lgpdSlideIn ${LGPD_TRANSITION_DURATION} ${LGPD_TRANSITION_EASE}`
          }}
        >
          {/* Conteúdo Informativo */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0, 102, 255, 0.15)',
                border: '1px solid rgba(0, 102, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} />
            </div>

            <div>
              <h4 style={{ color: '#FFFFFF', fontSize: '0.94rem', fontWeight: 700, marginBottom: '4px' }}>
                Privacidade & Conformidade Técnica
              </h4>
              <p style={{ color: '#94A3B8', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Utilizamos cookies essenciais para garantir a fluidez da simulação mecânica 3D e a segurança da navegação, em estrito acordo com a LGPD.
              </p>
            </div>
          </div>

          {/* Ações: Termos e Aceite */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onOpenModal}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#CBD5E1',
                fontSize: '0.82rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '8px 10px',
                fontWeight: 500
              }}
            >
              Diretrizes de Privacidade
            </button>

            <button
              type="button"
              onClick={handleAcceptCookies}
              className="btn-industrial"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: 'none',
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px' // Alvo de toque acessível
              }}
            >
              <Check size={16} />
              <span>Concordar & Fechar</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. MODAL DETALHADO DE DIRETRIZES DE PRIVACIDADE E SIGILO */}
      {isOpenModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-lgpd-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 14, 23, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={onCloseModal}
        >
          <div
            style={{
              backgroundColor: '#090E17',
              border: '1px solid #1E293B',
              borderRadius: 'var(--radius-card)',
              maxWidth: '620px',
              width: '100%',
              padding: 'clamp(24px, 3vw, 36px)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
              color: '#CBD5E1',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topo do Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} color="#0066FF" />
                <h3 id="modal-lgpd-title" style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                  Segurança, LGPD & Sigilo Industrial
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px'
                }}
                aria-label="Fechar janela de termos"
              >
                <X size={22} />
              </button>
            </div>

            {/* Conteúdo Institucional */}
            <div style={{ fontSize: '0.88rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '14px', color: '#94A3B8' }}>
              <p>
                A <strong style={{ color: '#FFFFFF' }}>PROJDET Engenharia & Detalhamentos Mecânicos</strong> atua com rigor na proteção de informações de projetos confidenciais e propriedade intelectual:
              </p>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid #1E293B', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>1. Acordos de Não Divulgação (NDA)</strong>
                Todos os desenhos técnicos, plantas de processo e dados de projetos recebidos são tratados sob estrita confidencialidade técnica.
              </div>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid #1E293B', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>2. Armazenamento Seguro</strong>
                Informações de contato e memoriais submetidos via canais corporativos não são compartilhados com terceiros e destinam-se exclusivamente à formulação de orçamentos.
              </div>

              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid #1E293B', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>3. Cookies Estritamente Necessários</strong>
                Utilizados para calibrar a reprodução de videos e salvar suas preferências de navegação localmente.
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onCloseModal}
                className="btn-industrial"
                style={{
                  backgroundColor: '#0066FF',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS & ANIMAÇÕES COM COMPOSITOR */}
      <style>{`
        @keyframes lgpdSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 600px) {
          .lgpd-banner-floating {
            left: 12px !important;
            right: 12px !important;
            bottom: 12px !important;
            max-width: none !important;
          }
        }
      `}</style>
    </>
  );
}
