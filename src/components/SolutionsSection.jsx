/**
 * COMPONENTE: SolutionsSection (Seção 3: Soluções & Projetos Dinâmicos do Supabase)
 * -----------------------------------------------------------------------------
 * Conecta-se diretamente à tabela 'projects' no Supabase e lê suas colunas:
 * - title, description, category, technical_specs (JSONB), image_url, youtube_video_id
 * - Estruturação 100% dinâmica baseada no banco de dados real
 * - Abas de filtro geradas a partir das categorias existentes na tabela
 * - Modal interativo para assistir à simulação mecânica 3D do projeto no YouTube
 * - Botão de ação com link direto para WhatsApp com o nome do projeto
 * - Paleta monocromática estrita: Preto, Branco e Cinza (Padrão ForgeX)
 */
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Play, 
  X, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Images,
  Video,
  MessageCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Calibre a sensibilidade dos hovers, abertura do modal e troca de slides do carrossel:
 */
const CARD_TRANSITION_DURATION = '200ms';
const CARD_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const MODAL_FADE_DURATION = '220ms';
const MODAL_FADE_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const CAROUSEL_SLIDE_DURATION = '200ms';
const CAROUSEL_SLIDE_EASE = 'ease-in-out';

/**
 * Mapeamento em português das categorias em inglês cadastradas na coluna 'category'
 */
const CATEGORY_LABELS = {
  boilers_tanks: 'Caldeiraria & Tanques',
  structures: 'Estruturas Metálicas',
  piping: 'Tubulações & PipeRacks',
  machining: 'Usinagem & Dispositivos',
  agriculture: 'Implementos Agrícolas',
  surface_treatment: 'Tratamento de Superfícies'
};

export default function SolutionsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Estado do Modal Executivo (armazena o projeto selecionado para exibição detalhada)
  const [modalProject, setModalProject] = useState(null);
  // Aba ativa de mídia no modal: 'gallery' (fotos) ou 'video' (simulação 3D)
  const [modalMediaTab, setModalMediaTab] = useState('gallery');
  // Índice da imagem ativa no carrossel de fotos
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Monitor de carregamento do player do YouTube (para feedback instantâneo sem tela preta)
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Pré-aquece a conexão com os servidores do YouTube em segundo plano (DNS + TLS Handshake)
  useEffect(() => {
    const preconnectDomains = [
      'https://www.youtube.com',
      'https://i.ytimg.com',
      'https://googlevideo.com'
    ];
    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }, []);

  // Fecha o modal e reseta os estados auxiliares
  const handleCloseModal = () => {
    setModalProject(null);
    setActiveImageIndex(0);
    setIsVideoLoading(true);
  };

  // Abre o modal apontando diretamente para o vídeo ou galeria
  const handleOpenModal = (project, defaultTab = 'gallery') => {
    setModalProject(project);
    setActiveImageIndex(0);
    setIsVideoLoading(true); // Reseta o estado para dar feedback visual imediato
    // Se o projeto tiver vídeo e a intenção for simulação 3D, abre na aba de vídeo
    if (defaultTab === 'video' && project.youtube_video_id) {
      setModalMediaTab('video');
    } else {
      setModalMediaTab('gallery');
    }
  };

  // Trava a rolagem do fundo e permite fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modalProject) {
        handleCloseModal();
      }
    };
    if (modalProject) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalProject]);

  /**
   * Leitura das colunas da tabela 'projects' diretamente do Supabase
   */
  useEffect(() => {
    async function loadProjectsFromDatabase() {
      try {
        setLoading(true);
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('projects')
            .select('id, title, slug, category, description, technical_specs, image_url, youtube_video_id, is_featured, display_order')
            .order('display_order', { ascending: true });

          if (error) {
            console.error('[DATABASE] Erro retornado ao buscar projects:', error);
          } else if (data) {
            setProjects(data);
          }
        }
      } catch (err) {
        console.error('[DATABASE] Falha de conexão com a tabela projects:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProjectsFromDatabase();
  }, []);

  // Extrai as categorias presentes no banco de dados para criar as abas dinâmicas
  const availableCategories = ['all', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  // Filtra os projetos pela aba ativa
  const displayedProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="solucoes" style={{
      backgroundColor: '#FFFFFF',
      minHeight: 'calc(100vh - 73px)',
      paddingTop: 'var(--spacing-3xl)',
      paddingBottom: 'var(--spacing-4xl)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    }}>
      {/* Container Responsivo Centralizado com Limites de Margem Segura */}
      <div style={{
        width: '100%',
        maxWidth: '1600px',
        margin: '0 auto',
        paddingLeft: 'clamp(16px, 2.5vw, 36px)',
        paddingRight: 'clamp(16px, 2.5vw, 36px)',
        boxSizing: 'border-box'
      }}>

        {/* 1. CABEÇALHO DIVIDIDO FORGEX */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--spacing-2xl)',
          alignItems: 'end',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <div>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#64748B',
              letterSpacing: '0.14em',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 'var(--spacing-xs)'
            }}>
              PORTFÓLIO & PROJETOS EXECUTIVOS
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              lineHeight: 1.12,
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em'
            }}>
              Soluções de Engenharia e Projetos Prontos para Fabricação.
            </h2>
          </div>

          <div>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#475569',
              maxWidth: '560px',
              marginBottom: 'var(--spacing-md)'
            }}>
              Projetos paramétricos tridimensionais integrados à nossa base de dados. Detalhamento executivo rigoroso para caldeiraria, estruturas, tubulações e elementos mecânicos.
            </p>
            <a
              href="#contato"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#0F172A',
                borderBottom: '2px solid #0F172A',
                paddingBottom: '2px'
              }}
            >
              Consultar Viabilidade Técnica
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        {/* 2. ABAS DE CATEGORIAS CENTRALIZADAS */}
        {availableCategories.length > 1 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center', // Centraliza as abas de categoria harmonicamente
            gap: '8px',
            marginBottom: 'var(--spacing-2xl)',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: 'var(--spacing-md)'
          }}>
            {availableCategories.map((catKey) => {
              const isActive = activeCategory === catKey;
              const label = catKey === 'all' ? 'Todos os Projetos' : (CATEGORY_LABELS[catKey] || catKey);
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#0F172A' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: `all ${CARD_TRANSITION_DURATION} ${CARD_TRANSITION_EASE}`
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. GRID DINÂMICO DOS PROJETOS (CENTRALIZADO E COM DIMENSÕES PADRÃO) */}
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '340px',
            color: '#64748B',
            gap: '12px'
          }}>
            <Loader2 size={26} className="spin-loader" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Carregando dados da tabela projects...</span>
          </div>
        ) : displayedProjects.length === 0 ? (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            color: '#64748B',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-card)',
            border: '1px dashed #CBD5E1'
          }}>
            Nenhum projeto encontrado nesta categoria.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            // Dimensões equilibradas e auto-fill com alinhamento rigorosamente centralizado
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 350px))',
            gap: '24px',
            marginBottom: 'var(--spacing-2xl)',
            justifyContent: 'center' // Centraliza os cards no meio da tela
          }}>
            {displayedProjects.map((project) => (
              <div
                key={project.id || project.slug}
                className="forgex-solution-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                  transition: `transform ${CARD_TRANSITION_DURATION} ${CARD_TRANSITION_EASE}, box-shadow ${CARD_TRANSITION_DURATION} ${CARD_TRANSITION_EASE}, border-color ${CARD_TRANSITION_DURATION} ${CARD_TRANSITION_EASE}`
                }}
              >
                {/* 1. IMAGEM DO BANCO (image_url) + BOTÃO DE VÍDEO (youtube_video_id) */}
                <div
                  style={{
                    height: '210px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#0F172A',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleOpenModal(project, 'gallery')}
                >
                  <img
                    src={project.image_url}
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: `transform 400ms ${CARD_TRANSITION_EASE}`
                    }}
                    className="card-project-img"
                    loading="lazy"
                  />

                  {/* Badge da Categoria lida da coluna 'category' */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(9, 14, 23, 0.88)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 10px',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}>
                    {CATEGORY_LABELS[project.category] || project.category}
                  </div>

                  {/* Botão de Simulação 3D: aciona o modal na aba de simulação tridimensional */}
                  {project.youtube_video_id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(project, 'video');
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(9, 14, 23, 0.92)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#FFFFFF',
                        fontSize: '0.74rem',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Assistir Simulação Mecânica 3D"
                      aria-label={`Ver simulação 3D de ${project.title}`}
                    >
                      <Play size={13} fill="#FFFFFF" />
                      <span>Simulação 3D</span>
                    </button>
                  )}
                </div>

                {/* 2. DADOS DO PROJETO COM ALTURAS PADRONIZADAS */}
                <div style={{
                  padding: '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      marginBottom: '8px',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '2.6em' // Garante altura padrão consistente no grid
                    }}>
                      {project.title}
                    </h3>
                    <p style={{
                      fontSize: '0.86rem',
                      color: '#475569',
                      lineHeight: 1.55,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: '3.9em' // Garante alinhamento visual idêntico para todos os cards
                    }}>
                      {project.description}
                    </p>
                  </div>

                  {/* 3. AÇÃO PARA MODAL DE DETALHAMENTO & GALERIA (SEM TAGS POLUINDO O CARD) */}
                  <div style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(project, 'gallery')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: '#0F172A',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)'
                      }}
                    >
                      Detalhamento
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenModal(project, 'gallery')}
                      className="solution-arrow-btn"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0F172A',
                        cursor: 'pointer',
                        transition: `all ${CARD_TRANSITION_DURATION} ${CARD_TRANSITION_EASE}`
                      }}
                      aria-label={`Ver detalhes de ${project.title}`}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. MODAL EXECUTIVO: CARROSSEL DE IMAGENS + SIMULAÇÃO MECÂNICA 3D */}
      {modalProject && (() => {
        // Coleta todas as imagens do projeto (capa principal + galeria adicional sem duplicatas)
        const galleryList = Array.isArray(modalProject.technical_specs?.gallery)
          ? modalProject.technical_specs.gallery
          : [];
        const allImages = Array.from(new Set([modalProject.image_url, ...galleryList].filter(Boolean)));
        const hasVideo = Boolean(modalProject.youtube_video_id);

        return (
          <div
            onClick={handleCloseModal}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(9, 14, 23, 0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '16px',
              backdropFilter: 'blur(6px)',
              transition: `opacity ${MODAL_FADE_DURATION} ${MODAL_FADE_EASE}`
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#090E17',
                border: '1px solid #1E293B',
                borderRadius: 'var(--radius-card)',
                width: '100%',
                maxWidth: '920px',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
              }}
            >
              {/* Topo do Modal: Título, Categoria e Abas de Mídia */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #1E293B',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' }}>
                    {CATEGORY_LABELS[modalProject.category] || modalProject.category}
                  </span>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0 0' }}>
                    {modalProject.title}
                  </h4>
                </div>

                {/* Abas para alternar entre Galeria de Fotos e Simulação 3D */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {allImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setModalMediaTab('gallery')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: modalMediaTab === 'gallery' ? '1px solid #FFFFFF' : '1px solid #1E293B',
                        backgroundColor: modalMediaTab === 'gallery' ? '#FFFFFF' : '#0F172A',
                        color: modalMediaTab === 'gallery' ? '#090E17' : '#94A3B8',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Images size={14} />
                      <span>Galeria ({allImages.length})</span>
                    </button>
                  )}

                  {hasVideo && (
                    <button
                      type="button"
                      onClick={() => setModalMediaTab('video')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: modalMediaTab === 'video' ? '1px solid #FFFFFF' : '1px solid #1E293B',
                        backgroundColor: modalMediaTab === 'video' ? '#FFFFFF' : '#0F172A',
                        color: modalMediaTab === 'video' ? '#090E17' : '#94A3B8',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Video size={14} />
                      <span>Simulação 3D</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label="Fechar"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Área Central de Visualização */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {modalMediaTab === 'video' && hasVideo ? (
                  // Player Turbo da Simulação 3D com Pré-carregamento e Capa Instantânea
                  <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#05080E', overflow: 'hidden' }}>
                    {/* Capa Instantânea em Alta Resolução (exibida em 0ms enquanto o player conecta) */}
                    <img 
                      src={`https://i.ytimg.com/vi/${modalProject.youtube_video_id}/hqdefault.jpg`}
                      alt="Prévia da Simulação"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: isVideoLoading ? 'brightness(0.5) blur(2px)' : 'none',
                        transition: 'filter 300ms ease'
                      }}
                    />

                    {/* Loader de Engenharia enquanto a conexão e o buffer são finalizados */}
                    {isVideoLoading && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        color: '#FFFFFF',
                        zIndex: 2,
                        backgroundColor: 'rgba(5, 8, 14, 0.45)'
                      }}>
                        <Loader2 size={30} className="spin-loader" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, fontFamily: 'var(--font-heading)', letterSpacing: '0.04em' }}>
                          Iniciando Simulação 3D...
                        </span>
                      </div>
                    )}

                    {/* Iframe com Prioridade Eager e Parâmetros de Redução de Latência */}
                    <iframe
                      src={`https://www.youtube.com/embed/${modalProject.youtube_video_id}?autoplay=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        border: 'none',
                        zIndex: isVideoLoading ? 1 : 3
                      }}
                      title={`Simulação 3D - ${modalProject.title}`}
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      loading="eager"
                      onLoad={() => setIsVideoLoading(false)}
                    />
                  </div>
                ) : (
                  // Carrossel Interativo de Fotos
                  <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#05080E' }}>
                    {/* Imagem Principal do Carrossel */}
                    <div style={{
                      position: 'relative',
                      height: 'clamp(280px, 48vh, 480px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={allImages[activeImageIndex]}
                        alt={`${modalProject.title} foto ${activeImageIndex + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          transition: `opacity ${CAROUSEL_SLIDE_DURATION} ${CAROUSEL_SLIDE_EASE}`
                        }}
                      />

                      {/* Contador de Fotos */}
                      {allImages.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          backgroundColor: 'rgba(9, 14, 23, 0.85)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          {activeImageIndex + 1} / {allImages.length}
                        </div>
                      )}

                      {/* Botão Anterior */}
                      {allImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(9, 14, 23, 0.8)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          aria-label="Imagem anterior"
                        >
                          <ChevronLeft size={22} />
                        </button>
                      )}

                      {/* Botão Próximo */}
                      {allImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(9, 14, 23, 0.8)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          aria-label="Próxima imagem"
                        >
                          <ChevronRight size={22} />
                        </button>
                      )}
                    </div>

                    {/* Faixa Inferior de Miniaturas Selecionáveis */}
                    {allImages.length > 1 && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        padding: '12px 16px',
                        backgroundColor: '#090E17',
                        borderTop: '1px solid #1E293B',
                        overflowX: 'auto'
                      }}>
                        {allImages.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImageIndex(idx)}
                            style={{
                              width: '68px',
                              height: '48px',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              padding: 0,
                              cursor: 'pointer',
                              border: activeImageIndex === idx ? '2px solid #FFFFFF' : '1px solid #1E293B',
                              opacity: activeImageIndex === idx ? 1 : 0.6,
                              backgroundColor: '#000000',
                              flexShrink: 0,
                              transition: `all ${CAROUSEL_SLIDE_DURATION} ${CAROUSEL_SLIDE_EASE}`
                            }}
                          >
                            <img src={imgUrl} alt={`Miniatura ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Detalhamento e Ação WhatsApp */}
                <div style={{ padding: '20px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h5 style={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Memorial Descritivo & Aplicação
                    </h5>
                    <p style={{ color: '#E2E8F0', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                      {modalProject.description || 'Nenhuma descrição técnica detalhada informada.'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
                    <a
                      href={`https://wa.me/5519995977417?text=${encodeURIComponent(`Olá, gostaria de solicitar um orçamento para o projeto: ${modalProject.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        backgroundColor: '#FFFFFF',
                        color: '#090E17',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none'
                      }}
                    >
                      <MessageCircle size={16} />
                      <span>Solicitar Orçamento Técnico ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        .spin-loader {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .forgex-solution-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
          border-color: #CBD5E1;
        }
        .forgex-solution-card:hover .card-project-img {
          transform: scale(1.05);
        }
        .forgex-solution-card:hover .solution-arrow-btn {
          background-color: #0F172A !important;
          border-color: #0F172A !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
