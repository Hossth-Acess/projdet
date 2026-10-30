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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { supabase, isSupabaseConfigured } from './services/supabase';

// Chunk isolado via code splitting sob demanda (visitantes regulares não baixam este código)
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// URL Secreta Dedicada configurada no plano.md
const SECRET_ADMIN_PATH = '/B4t8aBacktalk2-Plural-Applied-Slimy/Mashed0-Gyration-Overstay-Scrap-Multitude-proj';

// Imagens padrão de fábrica da engenharia PROJDET
const DEFAULT_HERO_IMAGE_DESKTOP = 'https://txfimdsadaasfgttvczz.supabase.co/storage/v1/object/public/project-images/hero-desktop-1793304150655.webp';
const DEFAULT_HERO_IMAGE_MOBILE = 'https://txfimdsadaasfgttvczz.supabase.co/storage/v1/object/public/project-images/hero-mobile-1793304158990.webps';

export default function App() {
  // Estado para rota dedicada e indexável da Política de Privacidade & LGPD
  const [isPrivacyRoute, setIsPrivacyRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = (window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      return path === '/politica-de-privacidade' || path === '/privacidade' || hash === '#privacidade';
    }
    return false;
  });

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
              try { localStorage.setItem('projdet_hero_image_desktop', data.image_desktop); } catch (e) { }
            }
            if (data.image_mobile) {
              setHeroImageMobile(data.image_mobile);
              try { localStorage.setItem('projdet_hero_image_mobile', data.image_mobile); } catch (e) { }
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

  // 2. GARANTE QUE O SITE RECARREGUE SEMPRE NO INÍCIO (TOPO) QUANDO NA HOME
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (window.location.hash !== '#admin' && !isPrivacyRoute) {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        window.history.replaceState(null, null, window.location.pathname);
      }
    }
  }, [isPrivacyRoute]);

  // 3. Monitora se o usuário acessou pela URL secreta, rota de privacidade ou atalhos
  useEffect(() => {
    const checkRoutes = () => {
      // Normaliza o caminho ignorando barras no final e diferenças de maiúsculas/minúsculas
      const currentPath = (window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
      const targetAdminPath = SECRET_ADMIN_PATH.replace(/\/+$/, '').toLowerCase();
      const currentHash = (window.location.hash || '').toLowerCase();

      // Checagem de rota administrativa
      if (currentPath === targetAdminPath || currentHash === '#admin') {
        setIsAdminOpen(true);
      }

      // Checagem de rota da Política de Privacidade (Canônica para Googlebot e LGPD)
      if (
        currentPath === '/politica-de-privacidade' || 
        currentPath === '/privacidade' || 
        currentHash === '#privacidade'
      ) {
        setIsPrivacyRoute(true);
      } else if (currentPath !== targetAdminPath && currentHash !== '#admin') {
        setIsPrivacyRoute(false);
      }
    };

    checkRoutes();
    window.addEventListener('hashchange', checkRoutes);
    window.addEventListener('popstate', checkRoutes);
    return () => {
      window.removeEventListener('hashchange', checkRoutes);
      window.removeEventListener('popstate', checkRoutes);
    };
  }, []);

  // Navegação sem recarregar a página (History API) para a Política de Privacidade
  const navigateToPrivacy = () => {
    window.history.pushState(null, '', '/politica-de-privacidade');
    setIsPrivacyRoute(true);
    window.scrollTo(0, 0);
  };

  // Retorno à página inicial sem recarregar
  const navigateToHome = () => {
    window.history.pushState(null, '', '/');
    setIsPrivacyRoute(false);
    window.scrollTo(0, 0);
  };

  // 4. Injeta dinamicamente metadados SEO, Canonical e Robots para indexação do Google
  useEffect(() => {
    let robotsMeta = document.querySelector('meta[name="robots"]');
    let metaDescription = document.querySelector('meta[name="description"]');
    let linkCanonical = document.querySelector('link[rel="canonical"]');

    if (isAdminOpen) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.name = 'robots';
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = 'noindex, nofollow';
    } else if (isPrivacyRoute) {
      document.title = 'Política de Privacidade & Sigilo Industrial | PROJDET';
      if (robotsMeta) robotsMeta.content = 'index, follow';
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Diretrizes oficiais de privacidade, conformidade estrita com a LGPD (Lei 13.709/2018) e cláusula pétrea de sigilo industrial (NDA) da PROJDET Engenharia em Piracicaba-SP.');
      }
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', 'https://projdet.com.br/politica-de-privacidade');
    } else {
      document.title = 'PROJDET | Projetos Mecânicos, Detalhamento e Modelagem 3D';
      if (robotsMeta) robotsMeta.content = 'index, follow';
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Especialistas em projetos mecânicos, detalhamento técnico executivo e desenvolvimento de equipamentos industriais em Piracicaba-SP. Atendimento em caldeiraria, estruturas metálicas, tubulações e agricultura.');
      }
      if (linkCanonical) {
        linkCanonical.setAttribute('href', 'https://projdet.com.br/');
      }
    }
  }, [isPrivacyRoute, isAdminOpen]);

  // Se a rota ativa for a Política de Privacidade dedicada, renderiza a página oficial indexável
  if (isPrivacyRoute) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <PrivacyPolicyPage onBackToHome={navigateToHome} />
        <CookieBanner onOpenPolicy={navigateToPrivacy} />
      </div>
    );
  }

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

      {/* 3. Rodapé Técnico Industrial com link canônico para a Política de Privacidade */}
      <Footer
        onOpenPrivacy={navigateToPrivacy}
      />

      {/* 4. Banner LGPD discreto com link para a rota oficial e consentimento em LocalStorage */}
      <CookieBanner
        onOpenPolicy={navigateToPrivacy}
      />

      {/* 5. Painel Administrativo em Rota Secreta Protegida (React.lazy) */}
      {isAdminOpen && (
        <Suspense fallback={
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--color-1)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-6)',
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
