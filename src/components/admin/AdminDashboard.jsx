/**
 * COMPONENTE: AdminDashboard (Orquestrador & Autenticação do Painel PROJDET)
 * -----------------------------------------------------------------------------
 * Atua como o maestro do painel administrativo PROJDET:
 * - A Fechadura de Login (Supabase Auth com proteção contra autofill de navegador)
 * - Cabeçalho executivo (Sair / Fechar)
 * - Integração modular dos componentes AdminProducts e AdminProductForm
 * - Configuração de Imagens de Alta Definição da Hero Section (com upload WebP e sincronização Supabase)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Terminal,
  Loader2,
  LogOut,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { deleteFileFromStorage, deleteFilesFromStorage, compressImageNative } from '../../lib/imageUtils';
import AdminProducts from './AdminProducts';
import AdminProductForm from './AdminProductForm';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Calibre a velocidade dos feedbacks e transições do dashboard:
 */
const ADMIN_TRANSITION_DURATION = '180ms';
const ADMIN_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const STORAGE_BUCKET = 'project-images';

// Imagens padrão de fábrica da engenharia PROJDET
const DEFAULT_HERO_DESKTOP = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=2000&q=85';
const DEFAULT_HERO_MOBILE = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1080&q=85';

// Estilo base compartilhado para inputs (garante fundo escuro e texto nítido em qualquer estado)
const inputBaseStyle = {
  width: '100%',
  backgroundColor: '#090E17',
  color: '#FFFFFF',
  border: '1px solid #1E293B',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 14px',
  fontSize: '0.88rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box'
};

export default function AdminDashboard({
  onClose,
  heroImageDesktop = '',
  heroImageMobile = '',
  heroVideoId,
  onUpdateHeroImage,
  onUpdateHeroVideo
}) {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Alterna visibilidade da senha
  const [loginError, setLoginError] = useState('');

  // --- ESTADOS DE NAVEGAÇÃO E DADOS ---
  const [currentView, setCurrentView] = useState('list'); // 'list', 'form', 'hero_settings'
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState(null);

  // --- ESTADOS DO PROJETO EM EDIÇÃO ---
  const [editingId, setEditingId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // --- ESTADOS DAS IMAGENS DA HERO SECTION (DESKTOP & MOBILE COM UPLOAD SUPABASE) ---
  const [heroImageDesktopInput, setHeroImageDesktopInput] = useState(() => {
    try {
      return localStorage.getItem('projdet_hero_image_desktop') || heroImageDesktop || DEFAULT_HERO_DESKTOP;
    } catch (e) {
      return DEFAULT_HERO_DESKTOP;
    }
  });

  const [heroImageMobileInput, setHeroImageMobileInput] = useState(() => {
    try {
      return localStorage.getItem('projdet_hero_image_mobile') || heroImageMobile || '';
    } catch (e) {
      return '';
    }
  });

  // Estados dos vídeos preservados para compatibilidade
  const [heroDesktopInput, setHeroDesktopInput] = useState(() => {
    try { return localStorage.getItem('projdet_hero_video_desktop') || heroVideoId || 'LPzLwzLczRQ'; } catch (e) { return 'LPzLwzLczRQ'; }
  });
  const [heroMobileInput, setHeroMobileInput] = useState(() => {
    try { return localStorage.getItem('projdet_hero_video_mobile') || ''; } catch (e) { return ''; }
  });

  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [previewTab, setPreviewTab] = useState('desktop'); // 'desktop' ou 'mobile'

  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  // Sincroniza estados das imagens da Hero quando as props externas forem atualizadas pelo Supabase
  useEffect(() => {
    if (heroImageDesktop) setHeroImageDesktopInput(heroImageDesktop);
  }, [heroImageDesktop]);
  useEffect(() => {
    if (heroImageMobile) setHeroImageMobileInput(heroImageMobile);
  }, [heroImageMobile]);

  // Extrator universal de ID do YouTube
  const extractYoutubeId = (urlOrId) => {
    if (!urlOrId) return '';
    const clean = urlOrId.trim();
    if (clean.includes('/shorts/')) return clean.split('/shorts/')[1]?.split('?')[0] || clean;
    if (clean.includes('watch?v=')) return clean.split('v=')[1]?.split('&')[0] || clean;
    if (clean.includes('youtu.be/')) return clean.split('youtu.be/')[1]?.split('?')[0] || clean;
    return clean;
  };

  // 1. MONITOR DE SESSÃO DO SUPABASE AUTH
  useEffect(() => {
    async function checkSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);
        }
      } catch (err) {
        console.error('[AUTH] Erro ao recuperar sessão:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // 2. CARREGAMENTO DOS PROJETOS
  const fetchProjects = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('[PROJETOS] Erro ao carregar catálogo:', err);
      setStatusFeedback({ type: 'error', text: 'Não foi possível carregar os projetos cadastrados.' });
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Limpa feedback automaticamente após 4 segundos
  useEffect(() => {
    if (statusFeedback) {
      const timer = setTimeout(() => setStatusFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusFeedback]);

  // LOGIN DO ADMINISTRADOR
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase não configurado no arquivo .env.');
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;
      setUser(data.user);
      setStatusFeedback({ type: 'success', text: 'Sessão administrativa autenticada com sucesso!' });
    } catch (err) {
      setLoginError(err.message || 'Falha na autenticação. Verifique os dados digitados.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Obtém dinamicamente a URL principal do site (variável via VITE_SITE_URL ou dinâmica via navegador)
  const getMainSiteUrl = () => {
    // 1. Prioriza a variável de ambiente VITE_SITE_URL se configurada
    const envUrl = import.meta.env.VITE_SITE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      return envUrl.trim();
    }
    // 2. Resolução dinâmica automática compatível com qualquer domínio em produção
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin || '/';
    }
    return '/';
  };

  // LOGOUT COMUM (DESAUTENTICAÇÃO)
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  // LOGOUT COM ENCERRAMENTO COMPLETO E REDIRECIONAMENTO PARA O DOMÍNIO PRINCIPAL (BOTÃO FECHAR)
  const handleCloseAndLogout = async () => {
    try {
      // 1. Encerra a sessão administrativa no Supabase Auth
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    } catch (err) {
      console.error('[AUTH] Erro ao deslogar no encerramento:', err);
    } finally {
      // 2. Aciona o callback onClose local se fornecido
      if (onClose) onClose();

      // 3. Redireciona para o domínio principal dinâmico da landing page
      const mainUrl = getMainSiteUrl();
      if (typeof window !== 'undefined') {
        window.location.href = mainUrl;
      }
    }
  };

  // SALVAR / ATUALIZAR PROJETO
  const handleSaveProject = async (formData, isEditingParam, idParam) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // Determina se é edição com dupla verificação (parâmetro explícito ou estado editingId)
      const isEditing = isEditingParam !== undefined ? isEditingParam : Boolean(editingId);
      const targetId = idParam || editingId;

      if (isEditing && targetId) {
        // Atualiza o registro existente no Supabase
        const { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', targetId);
        if (error) throw error;
        setStatusFeedback({ type: 'success', text: 'Projeto atualizado com sucesso no catálogo!' });
      } else {
        // Insere novo projeto com a próxima ordem disponível
        const nextOrder = projects.length > 0 ? Math.max(...projects.map(p => p.display_order || 0)) + 1 : 1;
        const { error } = await supabase
          .from('projects')
          .insert([{ ...formData, display_order: nextOrder }]);
        if (error) throw error;
        setStatusFeedback({ type: 'success', text: 'Novo projeto adicionado com sucesso!' });
      }

      await fetchProjects();
      setCurrentView('list');
      setEditingProject(null);
      setEditingId(null);
    } catch (err) {
      console.error('[PROJETOS] Erro ao salvar:', err);
      setStatusFeedback({ type: 'error', text: 'Erro ao salvar projeto no banco de dados.' });
      throw err;
    }
  };

  // EXCLUIR PROJETO E SUAS MÍDIAS FÍSICAS (ZERO ARQUIVOS ÓRFÃOS)
  const handleDeleteProduct = async (id, mainImageUrl, galleryUrls = []) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // Agrupa todas as URLs vinculadas ao projeto (capa + fotos da galeria)
      const urlsToRemove = [];
      if (mainImageUrl) urlsToRemove.push(mainImageUrl);
      if (Array.isArray(galleryUrls)) {
        urlsToRemove.push(...galleryUrls);
      }

      // Remove todas as imagens do bucket 'project-images' em chamada atômica
      if (urlsToRemove.length > 0) {
        await deleteFilesFromStorage(urlsToRemove, STORAGE_BUCKET);
      }

      // Remove o registro da tabela 'projects'
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setStatusFeedback({ type: 'success', text: 'Projeto e suas mídias foram excluídos permanentemente.' });
      await fetchProjects();
      setCurrentView('list');
      setEditingProject(null);
      setEditingId(null);
    } catch (err) {
      console.error('[PROJETOS] Erro ao excluir:', err);
      setStatusFeedback({ type: 'error', text: 'Falha ao excluir o projeto do banco de dados.' });
    }
  };

  // REORDENAÇÃO DE PROJETOS
  const handleUpdateOrder = (newOrderedProjects) => {
    setProjects(newOrderedProjects);
  };

  const handleSaveOrder = async (reorderedProjects) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const updates = reorderedProjects.map((proj, idx) => ({
        id: proj.id,
        display_order: idx + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('projects')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
        if (error) throw error;
      }

      setStatusFeedback({ type: 'success', text: 'Ordem do catálogo atualizada com sucesso!' });
      await fetchProjects();
    } catch (err) {
      console.error('[PROJETOS] Erro ao salvar ordem:', err);
      setStatusFeedback({ type: 'error', text: 'Erro ao persistir a ordem no banco de dados.' });
    }
  };

  // ATUALIZAÇÃO DIRETA DE VÍDEO NO PROJETO (COLUNA youtube_video_id CORRETA)
  const handleUpdateProductVideo = async (projectId, newVideoUrl) => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const cleanVideo = extractYoutubeId(newVideoUrl);
      const { error } = await supabase
        .from('projects')
        .update({ youtube_video_id: cleanVideo || null })
        .eq('id', projectId);

      if (error) throw error;
      setStatusFeedback({ type: 'success', text: 'Simulação 3D atualizada com sucesso!' });
      await fetchProjects();
    } catch (err) {
      console.error('[PROJETOS] Erro ao atualizar vídeo rápido:', err);
      setStatusFeedback({ type: 'error', text: 'Falha ao salvar link da simulação 3D.' });
    }
  };

  // --- UPLOAD DE IMAGEM DA HERO COM COMPRESSÃO NATIVA WEBP & LIMPEZA DE ANTERIOR ---
  const handleHeroImageUpload = async (e, target = 'desktop') => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    const setUploading = target === 'desktop' ? setIsUploadingDesktop : setIsUploadingMobile;
    try {
      setUploading(true);
      const compressedBlob = await compressImageNative(file);
      const fileName = `hero-${target}-${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, compressedBlob, { contentType: 'image/webp', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // Se a imagem anterior já era hospedada no Supabase Storage, remove para não gerar órfãos
      const currentUrl = target === 'desktop' ? heroImageDesktopInput : heroImageMobileInput;
      if (currentUrl && currentUrl.includes(`/${STORAGE_BUCKET}/`)) {
        await deleteFileFromStorage(currentUrl, STORAGE_BUCKET);
      }

      if (target === 'desktop') {
        setHeroImageDesktopInput(publicUrl);
      } else {
        setHeroImageMobileInput(publicUrl);
      }
      setStatusFeedback({ type: 'success', text: `Imagem ${target === 'desktop' ? 'Desktop' : 'Mobile'} enviada e comprimida com sucesso!` });
    } catch (err) {
      console.error('[HERO_UPLOAD] Erro ao enviar imagem:', err);
      setStatusFeedback({ type: 'error', text: 'Erro ao fazer upload da imagem para o Supabase Storage.' });
    } finally {
      setUploading(false);
    }
  };

  // --- SALVAR IMAGENS DA HERO SECTION NO SUPABASE E LOCALSTORAGE ---
  const handleSaveHeroSettings = async (e) => {
    e.preventDefault();
    setIsSavingHero(true);
    try {
      // 1. Atualiza no localStorage
      localStorage.setItem('projdet_hero_image_desktop', heroImageDesktopInput);
      if (heroImageMobileInput) {
        localStorage.setItem('projdet_hero_image_mobile', heroImageMobileInput);
      } else {
        localStorage.removeItem('projdet_hero_image_mobile');
      }

      // 2. Dispara a atualização imediata no frontend do site
      if (onUpdateHeroImage) {
        onUpdateHeroImage(heroImageDesktopInput, heroImageMobileInput);
      }

      // 3. Persiste no Supabase na tabela hero_settings
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('hero_settings')
          .upsert({
            id: 'current',
            image_desktop: heroImageDesktopInput,
            image_mobile: heroImageMobileInput || null,
            video_desktop: heroDesktopInput || null,
            video_mobile: heroMobileInput || null,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.warn('[SUPABASE_HERO] Aviso na gravação da tabela hero_settings:', error);
        }
      }

      setStatusFeedback({ type: 'success', text: 'Imagens da Hero Section salvas e publicadas com sucesso!' });
    } catch (err) {
      console.error('[HERO_SAVE] Erro ao salvar configurações:', err);
      setStatusFeedback({ type: 'error', text: 'Falha ao salvar as imagens.' });
    } finally {
      setIsSavingHero(false);
    }
  };

  // --- RESTAURAR IMAGENS PADRÃO DE FÁBRICA & LIMPEZA DE CUSTOMIZADAS ---
  const handleRestoreDefaultImages = async () => {
    if (!window.confirm('Restaurar as imagens industriais padrão da PROJDET?')) return;
    
    // Remove do Supabase Storage arquivos customizados anteriores para manter o bucket limpo
    if (heroImageDesktopInput && heroImageDesktopInput.includes(`/${STORAGE_BUCKET}/`)) {
      await deleteFileFromStorage(heroImageDesktopInput, STORAGE_BUCKET);
    }
    if (heroImageMobileInput && heroImageMobileInput.includes(`/${STORAGE_BUCKET}/`)) {
      await deleteFileFromStorage(heroImageMobileInput, STORAGE_BUCKET);
    }

    setHeroImageDesktopInput(DEFAULT_HERO_DESKTOP);
    setHeroImageMobileInput(DEFAULT_HERO_MOBILE);
    setStatusFeedback({ type: 'success', text: 'Imagens padrão restauradas. Clique em Salvar para publicar.' });
  };

  // TAG DE ESTILOS GLOBAIS COMPARTILHADA
  const sharedStyleTag = (
    <style>{`
      .admin-input-styled:focus {
        border-color: #0066FF !important;
        box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.25) !important;
      }
      .spin-loader {
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @media (max-width: 640px) {
        .admin-header-email {
          display: none !important;
        }
      }
    `}</style>
  );

  // --- SEÇÃO 1: CARREGANDO AUTENTICAÇÃO ---
  if (authLoading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090E17',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0066FF',
        fontFamily: 'monospace'
      }}>
        {sharedStyleTag}
        <Loader2 size={36} className="spin-loader" style={{ marginBottom: '16px' }} />
        <span>VALIDANDO CREDENCIAIS CRIPTOGRAFADAS...</span>
      </div>
    );
  }

  // --- SEÇÃO 2: FECHADURA DE LOGIN (SUPABASE AUTH) ---
  if (!user) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090E17',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        {sharedStyleTag}
        <div style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0F172A',
          border: '1px solid #1E293B',
          borderRadius: 'var(--radius-card)',
          padding: '36px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 20px',
              backgroundColor: '#090E17',
              border: '1px solid #1E293B',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px'
            }}>
              <img
                src="/logo.png"
                alt="PROJDET"
                style={{ height: '42px', width: 'auto', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.04em', margin: 0 }}>
              PROJDET COMMAND
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '6px' }}>
              Acesso Restrito à Engenharia
            </p>
          </div>

          {loginError && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: '#F87171',
              fontSize: '0.82rem',
              marginBottom: '18px'
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="admin-email-field"
                style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}
              >
                E-mail Operacional
              </label>
              <input
                id="admin-email-field"
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                style={inputBaseStyle}
                className="admin-input-styled"
                placeholder="engenharia@projdet.com.br"
              />
            </div>

            {/* CAMPO DE SENHA COM BOTÃO DE OLHO */}
            <div>
              <label
                htmlFor="admin-password-field"
                style={{ display: 'block', color: '#94A3B8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}
              >
                Chave de Acesso
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  id="admin-password-field"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={{ ...inputBaseStyle, paddingRight: '44px' }}
                  className="admin-input-styled"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: showPassword ? '#38BDF8' : '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-industrial"
              style={{
                backgroundColor: '#0066FF',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                padding: '12px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isLoggingIn ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="spin-loader" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Terminal size={16} />
                  <span>Acessar Painel</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- SEÇÃO 3: PAINEL ADMINISTRATIVO AUTENTICADO ---
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#090E17',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-heading)',
      color: '#FFFFFF',
      overflowY: 'auto'
    }}>
      {sharedStyleTag}

      {/* HEADER EXECUTIVO RESPONSIVO */}
      <header style={{
        backgroundColor: '#0F172A',
        borderBottom: '1px solid #1E293B',
        padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 24px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxSizing: 'border-box',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="PROJDET"
            style={{ height: '22px', width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
          <span style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
            PROJDET COMMAND
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* E-mail no topo removido conforme solicitação */}
          <button
            type="button"
            onClick={handleLogout}
            className="btn-industrial"
            style={{ padding: '6px 10px', fontSize: '0.75rem', backgroundColor: '#1E293B', color: '#CBD5E1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>
          <button
            type="button"
            onClick={handleCloseAndLogout}
            className="btn-industrial"
            title="Encerrar sessão e voltar ao site principal"
            style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#0066FF', color: '#FFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} />
            <span>Fechar</span>
          </button>
        </div>
      </header>

      {/* FEEDBACK DE STATUS */}
      {statusFeedback && (
        <div style={{
          padding: '10px 24px',
          backgroundColor: statusFeedback.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: statusFeedback.type === 'success' ? '#34D399' : '#F87171'
        }}>
          {statusFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusFeedback.text}</span>
        </div>
      )}

      {/* SUB-HEADER COM SELETOR DE MÓDULOS */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1E293B',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => { setEditingProject(null); setEditingId(null); setCurrentView('list'); }}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: (currentView === 'list' || currentView === 'form') ? '1px solid #0066FF' : '1px solid #1E293B',
              backgroundColor: (currentView === 'list' || currentView === 'form') ? 'rgba(0,102,255,0.15)' : 'transparent',
              color: (currentView === 'list' || currentView === 'form') ? '#38BDF8' : '#94A3B8',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Catálogo de Projetos ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setCurrentView('hero_settings')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: currentView === 'hero_settings' ? '1px solid #0066FF' : '1px solid #1E293B',
              backgroundColor: currentView === 'hero_settings' ? 'rgba(0,102,255,0.15)' : 'transparent',
              color: currentView === 'hero_settings' ? '#38BDF8' : '#94A3B8',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mídia da Hero (Imagens)
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO ORQUESTRADA */}
      <div style={{ padding: '24px', flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* TELA 1: Catálogo com Tabela Desktop, Cards Mobile e Controle de Ordem */}
        {currentView === 'list' && (
          <AdminProducts
            projects={projects}
            loading={loadingProjects}
            onNewProject={() => {
              setEditingProject(null);
              setEditingId(null);
              setCurrentView('form');
            }}
            onEditProject={(project) => {
              setEditingProject(project);
              setEditingId(project.id);
              setCurrentView('form');
            }}
            onDeleteProject={(project) => handleDeleteProduct(project.id, project.image_url, project.technical_specs?.gallery)}
            onSaveOrder={handleSaveOrder}
            onUpdateOrder={handleUpdateOrder}
            onUpdateVideo={handleUpdateProductVideo}
          />
        )}

        {/* TELA 2: Formulário com Abas, Reordenação de Mídias e Categorias Dinâmicas */}
        {currentView === 'form' && (
          <AdminProductForm
            initialData={editingProject}
            editingId={editingId}
            onSave={handleSaveProject}
            onDelete={handleDeleteProduct}
            onCancel={() => {
              setEditingProject(null);
              setEditingId(null);
              setCurrentView('list');
            }}
            supabase={supabase}
          />
        )}

        {/* TELA 3: GESTÃO DE IMAGENS DE ALTA DEFINIÇÃO DA HERO SECTION COM PREVIEW */}
        {currentView === 'hero_settings' && (
          <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header da Seção */}
            <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: 'var(--radius-card)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={22} style={{ color: '#0066FF' }} />
                  <span>Imagens de Fundo da Hero Section (Início)</span>
                </h3>
                <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, maxWidth: '680px' }}>
                  Defina as fotografias industriais 3D da abertura da página inicial. As imagens são carregadas instantaneamente com alta fidelidade visual, zero custos de tráfego e sem dependência de players de terceiros.
                </p>
              </div>
            </div>

            {/* GRID: FORMULÁRIO À ESQUERDA & PREVIEW AO VIVO À DIREITA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>

              {/* COLUNA 1: FORMULÁRIO DE UPLOAD DAS IMAGENS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                <form onSubmit={handleSaveHeroSettings} style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: 'var(--radius-card)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                  {/* Campo Desktop */}
                  <div>
                    <label htmlFor="hero-desktop-img-field" style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Foto Desktop (Horizontal 16:9) *
                    </label>

                    {/* Botão de Upload Direto */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="file"
                        ref={desktopFileInputRef}
                        onChange={(e) => handleHeroImageUpload(e, 'desktop')}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        disabled={isUploadingDesktop}
                        onClick={() => desktopFileInputRef.current?.click()}
                        className="btn-industrial"
                        style={{
                          backgroundColor: '#1E293B',
                          color: '#FFFFFF',
                          border: '1px solid #334155',
                          padding: '8px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isUploadingDesktop ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isUploadingDesktop ? (
                          <>
                            <Loader2 size={14} className="spin-loader" />
                            <span>Comprimindo & Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} style={{ color: '#38BDF8' }} />
                            <span>Escolher do Computador (WebP)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      id="hero-desktop-img-field"
                      type="url"
                      required
                      placeholder="https://... ou use o botão de upload acima"
                      value={heroImageDesktopInput}
                      onChange={e => setHeroImageDesktopInput(e.target.value)}
                      style={inputBaseStyle}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                      Resolução recomendada: 1920×1080p ou 2560×1440p para computadores e monitores largos.
                    </span>
                  </div>

                  {/* Campo Mobile */}
                  <div>
                    <label htmlFor="hero-mobile-img-field" style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Foto Mobile (Vertical 9:16 ou Enquadramento Central)
                    </label>

                    {/* Botão de Upload Direto Mobile */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="file"
                        ref={mobileFileInputRef}
                        onChange={(e) => handleHeroImageUpload(e, 'mobile')}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        disabled={isUploadingMobile}
                        onClick={() => mobileFileInputRef.current?.click()}
                        className="btn-industrial"
                        style={{
                          backgroundColor: '#1E293B',
                          color: '#FFFFFF',
                          border: '1px solid #334155',
                          padding: '8px 14px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: isUploadingMobile ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isUploadingMobile ? (
                          <>
                            <Loader2 size={14} className="spin-loader" />
                            <span>Comprimindo & Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} style={{ color: '#38BDF8' }} />
                            <span>Escolher do Computador (WebP)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <input
                      id="hero-mobile-img-field"
                      type="url"
                      placeholder="Opcional. Se vazio, o sistema adapta a foto Desktop"
                      value={heroImageMobileInput}
                      onChange={e => setHeroImageMobileInput(e.target.value)}
                      style={inputBaseStyle}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                      Resolução recomendada: 1080×1920p vertical para smartphones.
                    </span>
                  </div>

                  {/* Botão de Salvar */}
                  <button
                    type="submit"
                    disabled={isSavingHero || isUploadingDesktop || isUploadingMobile}
                    className="btn-industrial"
                    style={{
                      backgroundColor: '#0066FF',
                      color: '#FFF',
                      border: 'none',
                      fontWeight: 700,
                      padding: '13px 20px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: (isSavingHero || isUploadingDesktop || isUploadingMobile) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '6px',
                      boxShadow: '0 4px 14px rgba(0, 102, 255, 0.35)'
                    }}
                  >
                    {isSavingHero ? (
                      <>
                        <Loader2 size={16} className="spin-loader" />
                        <span>Salvando no Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Salvar e Publicar Imagens da Hero</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Bloco de Vantagens Técnicas */}
                <div style={{ backgroundColor: '#090E17', border: '1px solid #1E293B', borderRadius: 'var(--radius-card)', padding: '18px' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} />
                    <span>Vantagens do Modo Fotográfico Industrial</span>
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: '#94A3B8', lineHeight: 1.7 }}>
                    <li><strong>Velocidade Máxima:</strong> Abertura da home em menos de 100ms.</li>
                    <li><strong>Compressão Automática:</strong> O upload converte para WebP leve (&lt; 200KB).</li>
                    <li><strong>Sem Risco de Custo:</strong> A cota gratuita do Supabase suporta mais de 15.000 visualizações mensais de imagens.</li>
                    <li><strong>Visual Limpo:</strong> Imagens puras sem qualquer logotipo, player ou marca d'água.</li>
                  </ul>
                </div>

              </div>

              {/* COLUNA 2: PREVIEW INTERATIVO AO VIVO */}
              <div style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: 'var(--radius-card)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Seletor de Aba de Preview */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1E293B', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase' }}>
                    Preview em Tempo Real
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('desktop')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: previewTab === 'desktop' ? '1px solid #0066FF' : '1px solid #1E293B',
                        backgroundColor: previewTab === 'desktop' ? 'rgba(0, 102, 255, 0.2)' : 'transparent',
                        color: previewTab === 'desktop' ? '#38BDF8' : '#94A3B8',
                        cursor: 'pointer'
                      }}
                    >
                      Desktop (16:9)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('mobile')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        border: previewTab === 'mobile' ? '1px solid #0066FF' : '1px solid #1E293B',
                        backgroundColor: previewTab === 'mobile' ? 'rgba(0, 102, 255, 0.2)' : 'transparent',
                        color: previewTab === 'mobile' ? '#38BDF8' : '#94A3B8',
                        cursor: 'pointer'
                      }}
                    >
                      Mobile (9:16)
                    </button>
                  </div>
                </div>

                {/* Moldura com a Imagem Selecionada e Textos da PROJDET */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#05070B',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #1E293B',
                  padding: '16px',
                  minHeight: '360px'
                }}>
                  {previewTab === 'desktop' ? (
                    // Simulação Desktop (16:9)
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '460px',
                      aspectRatio: '16/9',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid #334155',
                      backgroundColor: '#090E17',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '16px',
                      boxSizing: 'border-box'
                    }}>
                      <img
                        src={heroImageDesktopInput || DEFAULT_HERO_DESKTOP}
                        alt="Preview Desktop"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9, 14, 23, 0.95) 0%, rgba(9, 14, 23, 0.40) 45%, transparent 75%)' }} />
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: '#94A3B8', fontWeight: 700 }}>PRECISÃO. PERFORMANCE.</span>
                        <h5 style={{ fontSize: '0.85rem', color: '#FFF', fontWeight: 800, margin: '2px 0 6px 0', lineHeight: 1.2 }}>Engenharia que Move a Indústria</h5>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '0.60rem', backgroundColor: '#FFF', color: '#000', padding: '3px 6px', borderRadius: '3px', fontWeight: 700 }}>Explorar</span>
                          <span style={{ fontSize: '0.60rem', backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', padding: '3px 6px', borderRadius: '3px' }}>Orçamento ↗</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Simulação Mobile (9:16)
                    <div style={{
                      position: 'relative',
                      width: '200px',
                      height: '355px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '2px solid #334155',
                      backgroundColor: '#090E17',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '16px',
                      boxSizing: 'border-box'
                    }}>
                      <img
                        src={heroImageMobileInput || heroImageDesktopInput || DEFAULT_HERO_MOBILE}
                        alt="Preview Mobile"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9, 14, 23, 0.95) 0%, rgba(9, 14, 23, 0.40) 45%, transparent 75%)' }} />
                      <div style={{ position: 'relative', zIndex: 2 }}>
                        <span style={{ fontSize: '0.50rem', fontFamily: 'monospace', color: '#94A3B8', fontWeight: 700 }}>PRECISÃO.</span>
                        <h5 style={{ fontSize: '0.75rem', color: '#FFF', fontWeight: 800, margin: '2px 0 6px 0', lineHeight: 1.2 }}>Engenharia para Frente</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.58rem', backgroundColor: '#FFF', color: '#000', padding: '3px 6px', borderRadius: '3px', fontWeight: 700, textAlign: 'center' }}>Explorar</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'center', margin: 0 }}>
                  A visualização acima simula fielmente o enquadramento final que os visitantes verão na home.
                </p>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
