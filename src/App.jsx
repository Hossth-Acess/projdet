/**
 * COMPONENTE PRINCIPAL: App.jsx
 * -----------------------------------------------------------------------------
 * Renderiza as seções modulares aprovadas pelo usuário:
 * - Header (Navegação fixa com logo e botão preto sólido)
 * - HeroSection (Seção 1: Início com imagem de alta performance e sincronização Supabase)
 * - AboutSection (Seção 2: Quem Somos & Faixa de Métricas)
 * - SolutionsSection (Seção 3: Soluções & Projetos Unificados)
 * - ContactSection (Seção 5: Contato & Bloco CTA ForgeX com Formulário B2B)
 * - Footer (Etapa 4: Rodapé Industrial Técnico)
 * - CookieBanner (Etapa 4: Banner & Modal de Privacidade LGPD)
 * - AdminDashboard (Etapa 5: Painel Administrativo em Rota Secreta com React.lazy)
 */
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SolutionsSection from './components/SolutionsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import { supabase, isSupabaseConfigured } from './services/supabase';

// Chunk isolado via code splitting sob demanda (visitantes regulares não baixam este código)
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// URL Secreta Dedicada configurada no plano.md
const SECRET_ADMIN_PATH = '/B4t8aBacktalk2-Plural-Applied-Slimy/Mashed0-Gyration-Overstay-Scrap-Multitude-proj';

// Imagens padrão de fábrica da engenharia PROJDET
const DEFAULT_HERO_IMAGE_DESKTOP = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85';
const DEFAULT_HERO_IMAGE_MOBILE = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1080&q=85';

export default function App() {
  // Estado para controle do modal de políticas/LGPD acionado pelo rodapé ou banner
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Estado para abertura do painel administrativo
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Estados das imagens da Hero Section (Desktop & Mobile com recuperação do localStorage)
  const [heroImageDesktop, setHeroImageDesktop] = useState(() => {
    try {
      return localStorage.getItem('projdet_hero_image_desktop') || DEFAULT_HERO_IMAGE_DESKTOP;
    } catch (e) {
      return DEFAULT_HERO_IMAGE_DESKTOP;
    }
  });

  const [heroImageMobile, setHeroImageMobile] = useState(() => {
    try {
      return localStorage.getItem('projdet_hero_image_mobile') || DEFAULT_HERO_IMAGE_MOBILE;
    } catch (e) {
      return DEFAULT_HERO_IMAGE_MOBILE;
    }
  });

  // Estados dos vídeos preservados para compatibilidade
  const [heroVideoDesktop, setHeroVideoDesktop] = useState(() => {
    try {
      return localStorage.getItem('projdet_hero_video_desktop') || localStorage.getItem('projdet_hero_video_id') || 'LPzLwzLczRQ';
    } catch (e) {
      return 'LPzLwzLczRQ';
    }
  });

  const [heroVideoMobile, setHeroVideoMobile] = useState(() => {
    try {
      return localStorage.getItem('projdet_hero_video_mobile') || '';
    } catch (e) {
      return '';
    }
  });

  // 1. SINCRONIZAÇÃO EM TEMPO REAL COM A TABELA hero_settings DO SUPABASE
  useEffect(() => {
    async function syncHeroSettings() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('hero_settings')
            .select('*')
            .eq('id', 'current')
            .maybeSingle();

          if (data && !error) {
            if (data.image_desktop) {
              setHeroImageDesktop(data.image_desktop);
              try { localStorage.setItem('projdet_hero_image_desktop', data.image_desktop); } catch (e) {}
            }
            if (data.image_mobile) {
              setHeroImageMobile(data.image_mobile);
              try { localStorage.setItem('projdet_hero_image_mobile', data.image_mobile); } catch (e) {}
            }
            if (data.video_desktop) {
              setHeroVideoDesktop(data.video_desktop);
            }
            if (data.video_mobile) {
              setHeroVideoMobile(data.video_mobile);
            }
          }
        } catch (err) {
          console.warn('[HERO] Sincronização offline ou aguardando criação da tabela:', err);
        }
      }
    }

    syncHeroSettings();
  }, []);

  // 2. GARANTE QUE O SITE RECARREGUE SEMPRE NO INÍCIO (TOPO) E NÃO PRESO EM #CONTATO
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (window.location.hash !== '#admin') {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        window.history.replaceState(null, null, window.location.pathname);
      }
    }
  }, []);

  // 3. Monitora se o usuário acessou pela URL secreta ou pelo atalho hash #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === SECRET_ADMIN_PATH || hash === '#admin') {
        setIsAdminOpen(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg-body)'
    }}>
      {/* 1. Topo: Cabeçalho com fundo branco, logotipo e botão preto sólido */}
      <Header />

      {/* 2. Conteúdo Principal da Landing Page */}
      <main style={{ flex: 1 }}>
        {/* Seção 1: Início (Hero Full-Bleed de Alta Definição) */}
        <HeroSection 
          heroImageDesktop={heroImageDesktop}
          heroImageMobile={heroImageMobile}
          heroVideoDesktop={heroVideoDesktop} 
          heroVideoMobile={heroVideoMobile} 
        />

        {/* Seção 2: Quem Somos (3 Cards industriais e Faixa de Métricas) */}
        <AboutSection />

        {/* Seção 3: Soluções & Projetos Unificados (4 Cards brancos e Setores) */}
        <SolutionsSection />

        {/* Seção 5: Contato & CTA Final (Card escuro ForgeX e canais B2B) */}
        <ContactSection />
      </main>

      {/* 3. Rodapé Técnico Industrial com acionamento do Modal de Privacidade */}
      <Footer 
        onOpenPrivacy={() => setIsPrivacyOpen(true)} 
      />

      {/* 4. Banner & Modal LGPD com persistência em LocalStorage */}
      <CookieBanner
        isOpenModal={isPrivacyOpen}
        onCloseModal={() => setIsPrivacyOpen(false)}
        onOpenModal={() => setIsPrivacyOpen(true)}
      />

      {/* 5. Painel Administrativo em Rota Secreta Protegida (React.lazy) */}
      {isAdminOpen && (
        <Suspense fallback={
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#090E17',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38BDF8',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            Carregando Painel Administrativo PROJDET...
          </div>
        }>
          <AdminDashboard
            onClose={() => {
              setIsAdminOpen(false);
              if (window.location.hash === '#admin') {
                window.location.hash = '';
              }
            }}
            heroImageDesktop={heroImageDesktop}
            heroImageMobile={heroImageMobile}
            heroVideoId={heroVideoDesktop}
            onUpdateHeroImage={(desktopImg, mobileImg) => {
              setHeroImageDesktop(desktopImg);
              setHeroImageMobile(mobileImg);
            }}
            onUpdateHeroVideo={(desktopId, mobileId) => {
              setHeroVideoDesktop(desktopId);
              setHeroVideoMobile(mobileId);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
