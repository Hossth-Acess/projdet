/**
 * COMPONENTE: CookieBanner (Banner Flutuante de Conformidade LGPD)
 * -----------------------------------------------------------------------------
 * Conformidade com a Lei Geral de Proteção de Dados (LGPD):
 * - Banner flutuante no canto inferior que não obstrui a leitura principal
 * - Persistência da aceitação no localStorage ('projdet_cookies_accepted')
 * - Link semântico direto para a página oficial de Política de Privacidade (/politica-de-privacidade)
 * - Constantes comentadas no topo para ajuste de animações de entrada e saída
 */
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Calibre a velocidade de surgimento do banner:
 */
const LGPD_TRANSITION_DURATION = '200ms'; // Duração da animação de entrada/saída
const LGPD_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva de aceleração suave

export default function CookieBanner({ onOpenPolicy }) {
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

  if (!isBannerVisible) return null;

  return (
    <>
      {/* BANNER FLUTUANTE INFERIOR (PADRÃO FORGEX ESCURO) */}
      <aside
        role="region"
        aria-label="Aviso de Privacidade e Cookies"
        className="lgpd-banner-floating"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 990,
          maxWidth: '440px',
          backgroundColor: 'var(--color-2)', // Cor 2: Preto Grafite Usinado
          border: '1px solid var(--color-3)', // Cor 3: Cinza Neutro de Precisão
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.55)',
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
              backgroundColor: 'var(--color-1)',
              border: '1px solid var(--color-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-6)',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={20} />
          </div>

          <div>
            <h4 style={{ color: 'var(--color-6)', fontSize: '0.94rem', fontWeight: 700, marginBottom: '4px' }}>
              Privacidade & Contato Direto
            </h4>
            <p style={{ color: 'var(--color-4)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              Nosso site não armazena dados de usuários em bancos de dados. Suas solicitações são enviadas diretamente aos nossos canais oficiais (E-mail e WhatsApp). Usamos apenas armazenamento local para registrar sua preferência de navegação.
            </p>
          </div>
        </div>

        {/* Ações: Link para Rota da Política e Botão de Aceite */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href="/politica-de-privacidade"
            onClick={(e) => {
              if (onOpenPolicy) {
                e.preventDefault();
                onOpenPolicy();
              }
            }}
            style={{
              color: 'var(--color-4)',
              fontSize: '0.80rem',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 500
            }}
            className="lgpd-policy-link"
          >
            Ler Política Completa
          </a>

          <button
            type="button"
            onClick={handleAcceptCookies}
            className="btn-industrial"
            style={{
              backgroundColor: 'var(--color-6)',
              color: 'var(--color-1)',
              border: 'none',
              padding: '9px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '40px'
            }}
          >
            <Check size={16} />
            <span>Concordar & Fechar</span>
          </button>
        </div>
      </aside>

      {/* ESTILOS DE ENTRADA DO BANNER */}
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
        .lgpd-policy-link:hover {
          color: var(--color-6) !important;
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
