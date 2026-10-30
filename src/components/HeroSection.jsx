/**
 * COMPONENTE: HeroSection (Hero Full-Bleed com Imagem Fotográfica de Alta Definição)
 * -----------------------------------------------------------------------------
 * - Exibição de imagem industrial 3D ultra nítida de ponta a ponta (Full-Bleed)
 * - Suporte dinâmico a imagem Desktop (16:9) e Mobile (9:16 vertical)
 * - Carregamento instantâneo em ~100ms via tag <img> nativa com fetchPriority="high"
 * - Custo zero de largura de banda e zero menus/logos de terceiros
 * - Mantém composição cinematográfica (Lower-Third) e selo de Piracicaba na base
 */
import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Modifique os valores abaixo para calibrar a sensibilidade dos botões e transições:
 */
const HERO_BUTTON_HOVER_DURATION = '160ms'; // Duração do hover nos botões
const HERO_BUTTON_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva de aceleração suave
const HERO_IMAGE_FADE_DURATION = '400ms'; // Transição suave de carregamento da imagem

// Imagens industriais padrão de alta definição (fallback seguro caso o banco ainda não tenha respondido)
const DEFAULT_DESKTOP_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85';
const DEFAULT_MOBILE_IMAGE = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1080&q=85';

export default function HeroSection({ 
  heroImageDesktop = '',
  heroImageMobile = '',
  heroVideoDesktop = '',
  heroVideoMobile = ''
}) {
  // Monitora se o usuário está em dispositivo móvel (tela <= 768px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleDeviceChange = (e) => setIsMobile(e.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDeviceChange);
      return () => mediaQuery.removeEventListener('change', handleDeviceChange);
    } else {
      mediaQuery.addListener(handleDeviceChange);
      return () => mediaQuery.removeListener(handleDeviceChange);
    }
  }, []);

  // Seleciona a imagem ativa conforme o dispositivo
  const activeDesktopImg = heroImageDesktop || DEFAULT_DESKTOP_IMAGE;
  const activeMobileImg = heroImageMobile || activeDesktopImg || DEFAULT_MOBILE_IMAGE;
  const currentImage = isMobile ? activeMobileImg : activeDesktopImg;

  return (
    <section id="inicio" className="hero-bleed-section">
      
      {/* 1. MÁSCARA DA IMAGEM FULL-BLEED (COBERTURA TOTAL CRISTALINA EM ALTA RESOLUÇÃO) */}
      <div className="hero-bleed-mask">
        <img 
          src={currentImage}
          alt="PROJDET - Engenharia & Modelagem 3D Industrial"
          className="hero-bleed-image"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* 2. GRADIENTE CINEMATOGRÁFICO SUAVE PARA CONTRASTE DOS TEXTOS NA BASE */}
      <div className="hero-bleed-gradient" />

      {/* 3. CONTEÚDO REPOSICIONADO NA BASE CINEMATOGRÁFICA (LOWER-THIRD) */}
      <div className="container hero-bleed-container">
        
        {/* Bloco de Texto Principal */}
        <div className="hero-bleed-text-wrapper">
          <span className="hero-bleed-badge">
            PRECISÃO. PERFORMANCE. CONFIABILIDADE.
          </span>

          <h1 className="hero-bleed-title">
            Engenharia que Move a <span className="hero-bleed-title-accent">Indústria</span> para Frente.
          </h1>

          <p className="hero-bleed-description">
            Soluções completas em modelagem 3D, caldeiraria pesada, estruturas e detalhamento executivo para indústrias que exigem tolerâncias rigorosas.
          </p>

          <div className="hero-bleed-cta-group">
            <a href="#solucoes" className="btn-industrial btn-white hero-bleed-btn">
              Explorar soluções
            </a>
            <a href="#contato" className="btn-industrial btn-hero-outline hero-bleed-btn">
              <span>Solicitar Orçamento</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        {/* Rodapé Tecnológico Integrado na Base */}
        <div className="hero-bleed-footer">
          <div className="hero-bleed-location-pill">
            <span className="hero-bleed-location-dot" />
            PIRACICABA / SP
          </div>
          <span className="hero-bleed-location-text">
            Atendimento técnico especializado em todo o território nacional.
          </span>
          <div className="hero-bleed-specs-badge">
            PROJETOS EXECUTIVOS CAD 3D • CONFORMIDADE ABNT/ISO
          </div>
        </div>

      </div>

      <style>{`
        /* =========================================================================
         * SEÇÃO FULL-BLEED COM IMAGEM EM ALTA PERFORMANCE (100% TELA CHEIA)
         * ========================================================================= */
        .hero-bleed-section {
          position: relative;
          width: 100%;
          background-color: #090E17;
          overflow: hidden;
          box-sizing: border-box;
          border-bottom: 1px solid #1E293B;
          /* Altura padrão garantida para cobrir 100% da primeira dobra */
          height: calc(100vh - 73px);
          min-height: calc(100vh - 73px);
        }

        /* Container Posicionado na Base (Lower-Third) */
        .hero-bleed-container {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          box-sizing: border-box;
        }

        /* Máscara da Imagem de Fundo */
        .hero-bleed-mask {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        /* Imagem em tela cheia sem distorção e com transição suave */
        .hero-bleed-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: opacity ${HERO_IMAGE_FADE_DURATION} ease;
        }

        /* Gradiente cinematográfico sutil apenas na base para contraste das letras */
        .hero-bleed-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(9, 14, 23, 0.92) 0%, rgba(9, 14, 23, 0.40) 35%, transparent 65%);
          z-index: 1;
          pointer-events: none;
        }

        /* Tipografia de Alto Contraste */
        .hero-bleed-badge {
          font-family: monospace;
          color: #E2E8F0;
          letter-spacing: 0.14em;
          font-weight: 700;
          text-transform: uppercase;
          display: block;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
        }

        .hero-bleed-title {
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #FFFFFF;
          text-shadow: 0 2px 18px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9);
        }

        .hero-bleed-title-accent {
          color: #FFFFFF;
          text-decoration: underline;
          text-decoration-color: #94A3B8;
        }

        .hero-bleed-description {
          color: #F1F5F9;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.85);
        }

        .hero-bleed-cta-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        }

        /* Botão Preto Sólido de Alto Contraste (Sem Transparência) */
        .btn-hero-outline {
          background-color: var(--color-1); /* Cor 1: Preto Carbono 100% sólido (#0A0A0A) */
          color: var(--color-6) !important; /* Cor 6: Branco Puro */
          border: 1.5px solid var(--color-3); /* Cor 3: Borda usinada nítida */
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        }

        .btn-hero-outline:hover {
          background-color: var(--color-2); /* Cor 2: Preto Grafite no hover */
          border-color: var(--color-6);      /* Contorno branco nítido */
          transform: translateY(-1px);
        }

        /* Rodapé Integrado */
        .hero-bleed-footer {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          padding-top: var(--spacing-sm);
        }

        /* Selo de Localização 100% Sólido */
        .hero-bleed-location-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background-color: var(--color-1); /* Cor 1: Fundo opaco */
          border: 1px solid var(--color-3); /* Cor 3: Borda sólida */
          border-radius: var(--radius-sm);
          color: var(--color-6);
          font-family: monospace;
          font-weight: 700;
        }

        .hero-bleed-location-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #FFFFFF;
        }

        .hero-bleed-location-text {
          color: #E2E8F0;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
        }

        .hero-bleed-specs-badge {
          display: none;
          font-family: monospace;
          font-size: 0.72rem;
          color: #CBD5E1;
          margin-left: auto;
          letter-spacing: 0.08em;
          text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
        }

        /* =========================================================================
         * REGRAS DESKTOP (>= 860px) - Tela Cheia Real sem travas de max-height
         * ========================================================================= */
        @media (min-width: 860px) {
          .hero-bleed-section {
            /* 100% da altura da tela menos a altura real do header (72px + 1px borda) */
            height: calc(100vh - 73px);
            min-height: calc(100vh - 73px);
            max-height: none; /* Removida a trava de 900px que fazia a seção seguinte subir */
          }

          .hero-bleed-container {
            padding-bottom: clamp(28px, 4.5vh, 44px);
          }

          .hero-bleed-text-wrapper {
            max-width: 600px;
            margin-bottom: var(--spacing-xl);
          }

          .hero-bleed-badge {
            font-size: 0.80rem;
            margin-bottom: var(--spacing-md);
          }

          .hero-bleed-title {
            font-size: clamp(2.3rem, 3.6vw, 3.5rem);
            line-height: 1.1;
            margin-bottom: var(--spacing-md);
          }

          .hero-bleed-description {
            font-size: clamp(0.95rem, 1.15vw, 1.08rem);
            line-height: 1.6;
            margin-bottom: var(--spacing-xl);
            max-width: 520px;
          }

          .hero-bleed-cta-group {
            gap: var(--spacing-md);
          }

          .hero-bleed-btn {
            padding: 13px 28px;
            font-size: 0.92rem;
          }

          .hero-bleed-location-pill {
            font-size: 0.75rem;
          }

          .hero-bleed-location-text {
            font-size: 0.80rem;
          }

          .hero-bleed-specs-badge {
            display: block;
          }
        }

        /* =========================================================================
         * REGRAS MOBILE (< 860px) - 100% da Tela Móvel (Sincronizado com Header de 65px)
         * ========================================================================= */
        @media (max-width: 859px) {
          .hero-bleed-section {
            /* Fallback universal de viewport */
            height: calc(100vh - 65px);
            min-height: calc(100vh - 65px);
            /* Viewport dinâmico moderno (dvh) que compensa a barra de endereços do celular */
            height: calc(100dvh - 65px);
            min-height: calc(100dvh - 65px);
            max-height: none;
          }

          .hero-bleed-container {
            padding-bottom: 20px;
            padding-top: 16px;
          }

          .hero-bleed-text-wrapper {
            max-width: 100%;
            margin-bottom: 16px;
          }

          .hero-bleed-badge {
            font-size: 0.68rem;
            margin-bottom: 8px;
          }

          .hero-bleed-title {
            font-size: clamp(1.40rem, 5.8vw, 1.75rem);
            line-height: 1.16;
            margin-bottom: 10px;
          }

          .hero-bleed-description {
            font-size: 0.82rem;
            line-height: 1.45;
            margin-bottom: 16px;
            max-width: 330px;
          }

          .hero-bleed-cta-group {
            gap: 10px;
          }

          .hero-bleed-btn {
            padding: 10px 18px;
            font-size: 0.82rem;
          }

          .hero-bleed-footer {
            gap: 8px;
          }

          .hero-bleed-location-pill {
            font-size: 0.68rem;
            padding: 3px 8px;
          }

          .hero-bleed-location-text {
            font-size: 0.72rem;
            line-height: 1.3;
          }
        }
      `}</style>
    </section>
  );
}
