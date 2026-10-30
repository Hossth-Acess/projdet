/**
 * COMPONENTE: Header (Navegação Superior Industrial - Padrão Usabilidade & ForgeX)
 * -----------------------------------------------------------------------------
 * - Desktop: Navegação limpa com logotipo oficial, links centrais e CTA escuro
 * - Mobile Ergonômico: Botão compacto em linha única que não espreme o logotipo
 * - Menu Sanduíche em Overlay Flutuante: Aparece SOBRE o site sem empurrar a página
 * - Touch targets acessíveis de 48px para o polegar e fechamento automático com ESC
 */
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, PhoneCall } from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Modifique os valores abaixo para calibrar a velocidade do menu e hover:
 */
const HEADER_TRANSITION_DURATION = '180ms'; // Duração do hover de links e botões
const MOBILE_MENU_ANIMATION_DURATION = '220ms'; // Velocidade de descida do menu flutuante
const MOBILE_MENU_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva de aceleração suave

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu móvel automaticamente se a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 860 && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  // Fecha o menu móvel ao pressionar a tecla ESC (Acessibilidade WCAG)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="header-master-wrapper">
      <div className="container header-container-inner">
        
        {/* LOGOTIPO OFICIAL DA PROJDET (COM ESCALA CALIBRADA PARA MOBILE) */}
        <a href="#inicio" className="header-brand-link">
          <img
            src="/logo.png"
            alt="PROJDET"
            className="header-brand-logo"
          />
          <div className="header-brand-text">
            <span className="header-brand-name">
              PROJDET
            </span>
            <span className="header-brand-subtitle">
              Engenharia & Projetos
            </span>
          </div>
        </a>

        {/* LINKS CENTRAIS DE NAVEGAÇÃO (APENAS DESKTOP) */}
        <nav className="desktop-nav">
          <a href="#inicio" className="header-nav-link">Início</a>
          <a href="#quem-somos" className="header-nav-link">Quem Somos</a>
          <a href="#solucoes" className="header-nav-link">Soluções</a>
          <a href="#contato" className="header-nav-link">Contato</a>
        </nav>

        {/* BLOCO DE AÇÃO À DIREITA (DESKTOP & MOBILE ADAPTADOS) */}
        <div className="header-actions-group">
          
          {/* Botão Desktop Completo */}
          <a
            href="#contato"
            className="btn-industrial btn-black desktop-cta-btn"
          >
            <span>Solicitar Orçamento</span>
            <ArrowUpRight size={15} />
          </a>

          {/* Botão Mobile Compacto (Em linha única sem esmagar o logo) */}
          <a
            href="#contato"
            className="btn-industrial btn-black mobile-cta-btn"
          >
            <span>Orçamento</span>
            <ArrowUpRight size={13} />
          </a>

          {/* Botão Sanduíche Mobile com Touch Target de 42px */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* 
        MENU MOBILE FLUTUANTE EM OVERLAY (NÃO EMPURRA O SITE PARA BAIXO):
        Posicionado em absolute top: 100% com sombra profunda e backdrop-filter.
      */}
      {mobileOpen && (
        <div className="mobile-overlay-menu">
          <nav className="mobile-menu-nav">
            <a 
              href="#inicio" 
              onClick={() => setMobileOpen(false)} 
              className="mobile-menu-link"
            >
              <span>Início</span>
              <span className="mobile-link-indicator">01</span>
            </a>
            <a 
              href="#quem-somos" 
              onClick={() => setMobileOpen(false)} 
              className="mobile-menu-link"
            >
              <span>Quem Somos</span>
              <span className="mobile-link-indicator">02</span>
            </a>
            <a 
              href="#solucoes" 
              onClick={() => setMobileOpen(false)} 
              className="mobile-menu-link"
            >
              <span>Soluções & Projetos</span>
              <span className="mobile-link-indicator">03</span>
            </a>
            <a 
              href="#contato" 
              onClick={() => setMobileOpen(false)} 
              className="mobile-menu-link"
            >
              <span>Contato & Localização</span>
              <span className="mobile-link-indicator">04</span>
            </a>
          </nav>

          {/* Rodapé Interno do Menu com Ação Comercial Rápida */}
          <div className="mobile-menu-footer">
            <a
              href="#contato"
              onClick={() => setMobileOpen(false)}
              className="btn-industrial btn-black mobile-menu-main-cta"
            >
              <span>Solicitar Orçamento Técnico</span>
              <ArrowUpRight size={16} />
            </a>
            <div className="mobile-menu-support-info">
              <span>PIRACICABA / SP • ATENDIMENTO NACIONAL</span>
            </div>
          </div>
        </div>
      )}

      {/* BACKDROP SEMITRANSPARENTE (Fecha o menu ao clicar fora) */}
      {mobileOpen && (
        <div 
          className="mobile-menu-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <style>{`
        /* =========================================================================
         * ESTRUTURA DO CABEÇALHO MASTER
         * ========================================================================= */
        .header-master-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background-color: #FFFFFF;
          border-bottom: 1px solid var(--color-border-clean);
          width: 100%;
        }

        .header-container-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          box-sizing: border-box;
        }

        /* Logotipo e Assinatura */
        .header-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          text-decoration: none;
        }

        .header-brand-logo {
          height: 34px;
          width: auto;
          flex-shrink: 0;
        }

        .header-brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .header-brand-name {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.04em;
          color: #0F172A;
          line-height: 1;
        }

        .header-brand-subtitle {
          font-size: 0.65rem;
          color: #64748B;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          margin-top: 2px;
          white-space: nowrap;
        }

        /* Navegação Central Desktop */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: clamp(18px, 2vw, 32px);
        }

        .header-nav-link {
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 0.90rem;
          color: #334155 !important;
          transition: color ${HEADER_TRANSITION_DURATION} ${MOBILE_MENU_EASE};
          text-decoration: none;
        }

        .header-nav-link:hover {
          color: #0F172A !important;
          font-weight: 600;
        }

        /* Grupo de Ações */
        .header-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .desktop-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          font-size: 0.86rem;
          white-space: nowrap;
        }

        .mobile-cta-btn {
          display: none;
          align-items: center;
          gap: 4px;
          padding: 7px 12px;
          font-size: 0.76rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .mobile-toggle-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: #F8FAFC;
          border: 1px solid var(--color-border-clean);
          border-radius: var(--radius-sm);
          color: #0F172A;
          cursor: pointer;
          transition: background-color ${HEADER_TRANSITION_DURATION};
        }

        .mobile-toggle-btn:hover {
          background-color: #E2E8F0;
        }

        /* =========================================================================
         * MENU MOBILE SUSPENSO (OVERLAY - NÃO MOVE O SITE PARA BAIXO)
         * ========================================================================= */
        .mobile-overlay-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          width: 100%;
          background-color: #FFFFFF;
          border-bottom: 2px solid #0066FF;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          z-index: 1050;
          padding: 16px 20px 24px 20px;
          box-sizing: border-box;
          animation: slideDownOverlay ${MOBILE_MENU_ANIMATION_DURATION} ${MOBILE_MENU_EASE};
        }

        @keyframes slideDownOverlay {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-menu-nav {
          display: flex;
          flex-direction: column;
        }

        /* Item de Menu com Touch Target Generoso de 48px */
        .mobile-menu-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 48px;
          padding: 10px 4px;
          border-bottom: 1px solid #F1F5F9;
          font-family: var(--font-heading);
          font-size: 0.98rem;
          font-weight: 600;
          color: #0F172A !important;
          text-decoration: none;
          transition: color ${HEADER_TRANSITION_DURATION};
        }

        .mobile-menu-link:hover, .mobile-menu-link:active {
          color: #0066FF !important;
        }

        .mobile-link-indicator {
          font-family: monospace;
          font-size: 0.72rem;
          color: #94A3B8;
        }

        .mobile-menu-footer {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mobile-menu-main-cta {
          width: 100%;
          padding: 13px;
          font-size: 0.92rem;
          font-weight: 700;
          justify-content: center;
          box-sizing: border-box;
        }

        .mobile-menu-support-info {
          text-align: center;
          font-family: monospace;
          font-size: 0.68rem;
          color: #64748B;
          letter-spacing: 0.06em;
        }

        /* Fundo Semitransparente que escurece o restante do site */
        .mobile-menu-backdrop {
          position: fixed;
          top: 72px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(9, 14, 23, 0.50);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 1040;
        }

        /* =========================================================================
         * REGRAS RESPONSIVAS
         * ========================================================================= */
        @media (min-width: 860px) {
          .desktop-nav {
            display: flex !important;
          }
          .desktop-cta-btn {
            display: inline-flex !important;
          }
          .mobile-cta-btn {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }

        @media (max-width: 859px) {
          .header-container-inner {
            height: 64px;
          }
          .desktop-nav {
            display: none !important;
          }
          .desktop-cta-btn {
            display: none !important;
          }
          .mobile-cta-btn {
            display: inline-flex !important;
          }
          .mobile-toggle-btn {
            display: flex !important;
          }
          .header-brand-logo {
            height: 30px;
          }
          .header-brand-name {
            font-size: 1.05rem;
          }
          .header-brand-subtitle {
            font-size: 0.58rem;
          }
        }
      `}</style>
    </header>
  );
}
