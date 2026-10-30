/**
 * COMPONENTE: AdminProducts.jsx (Catálogo de Projetos & Controle de Ordem por Setas)
 * -----------------------------------------------------------------------------
 * Módulo isolado do catálogo administrativo:
 * - Busca de projetos em tempo real por título ou categoria
 * - Botão de destaque para cadastro de "+ Novo Projeto"
 * - Reordenação visual instantânea via SETAS (Subir / Descer)
 * - Salvamento automático em lote no Supabase + Botão "Salvar Ordem" manual
 * - Tabela de alto contraste para Desktop
 * - Cards individuais otimizados para Mobile
 * - Exclusão com limpeza física de mídias no Supabase Storage
 */
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Package, 
  Video, 
  VideoOff, 
  Tag,
  ChevronUp,
  ChevronDown,
  Save,
  Check,
  Loader2
} from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Altere os valores abaixo para calibrar a velocidade das transições e feedback:
 */
const PRODUCTS_TRANSITION_DURATION = '180ms'; // Velocidade geral de transição
const PRODUCTS_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva de aceleração suave
const ARROW_BUTTON_HOVER_SCALE = 'scale(1.08)'; // Efeito de expansão ao passar o mouse na seta
const FEEDBACK_BADGE_DURATION = 2500; // Tempo em milissegundos que o aviso de "Salvo" fica visível

export default function AdminProducts({
  projects = [],
  onNewProject,
  onEditProject,
  onDeleteProject,
  onSaveOrder, // Função que recebe a nova lista ordenada e persiste no Supabase
  onUpdateVideo, // Atualização rápida do link/ID do vídeo 3D diretamente na listagem
  loading = false
}) {
  // Estado local da lista de projetos para permitir reordenação instantânea na interface
  const [localProjects, setLocalProjects] = useState(projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSavedSuccess, setOrderSavedSuccess] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Sincroniza o estado local quando os dados externos mudam (exceto durante reordenação manual pendente)
  useEffect(() => {
    if (!hasPendingChanges) {
      setLocalProjects(projects);
    }
  }, [projects, hasPendingChanges]);

  // Função para mover o projeto para cima ou para baixo
  const handleMove = async (currentIndex, direction) => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Validação de limites
    if (targetIndex < 0 || targetIndex >= localProjects.length) return;

    // Troca de posição no array
    const updated = [...localProjects];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Atualiza o display_order de cada item (1-indexed)
    const reorderedList = updated.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    setLocalProjects(reorderedList);
    setHasPendingChanges(true);

    // Dispara o salvamento automático imediato
    await autoPersistOrder(reorderedList);
  };

  // Salvamento automático no banco com feedback visual
  const autoPersistOrder = async (newList) => {
    if (!onSaveOrder) return;
    setIsSavingOrder(true);
    setOrderSavedSuccess(false);

    try {
      await onSaveOrder(newList);
      setOrderSavedSuccess(true);
      setHasPendingChanges(false);

      // Remove a mensagem de sucesso após o tempo definido na constante
      setTimeout(() => {
        setOrderSavedSuccess(false);
      }, FEEDBACK_BADGE_DURATION);
    } catch (err) {
      console.error('[ORDEM] Falha ao salvar ordem automaticamente:', err);
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Confirmação preventiva antes da exclusão definitiva para evitar toques acidentais
  const handleConfirmDelete = (project) => {
    if (!project) return;
    const confirmMessage = `Tem certeza que deseja excluir o projeto "${project.title || 'Sem título'}"?\n\nTodas as imagens vinculadas serão excluídas permanentemente do Supabase Storage.`;
    if (window.confirm(confirmMessage)) {
      if (onDeleteProject) onDeleteProject(project);
    }
  };

  // Filtra projetos em tempo real por título ou categoria
  const filteredProjects = localProjects.filter(p => {
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title ? p.title.toLowerCase().includes(term) : false;
    const categoryMatch = p.category ? p.category.toLowerCase().includes(term) : false;
    return titleMatch || categoryMatch;
  });

  const isSearching = searchTerm.trim().length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. BARRA SUPERIOR: BUSCA, STATUS DE ORDEM E BOTÃO NOVO PROJETO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Campo de Busca */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <label htmlFor="admin-search-input" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
            Buscar projetos
          </label>
          <Search 
            size={18} 
            color="#64748B" 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
          <input 
            id="admin-search-input"
            type="text" 
            placeholder="Buscar por título ou categoria..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            style={{
              width: '100%',
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px 10px 38px',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: `border-color ${PRODUCTS_TRANSITION_DURATION} ${PRODUCTS_TRANSITION_EASE}`
            }}
            className="search-input-focus"
          />
        </div>

        {/* Ações da Direita: Indicador/Botão de Salvar Ordem e Botão Novo Projeto */}
        <div className="admin-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Botão / Indicador de Salvamento da Ordem */}
          <button
            type="button"
            onClick={() => autoPersistOrder(localProjects)}
            disabled={isSavingOrder || isSearching}
            title={isSearching ? "Limpe o filtro de busca para salvar a ordem geral" : "Clique para salvar a ordem das posições"}
            className="btn-action-mobile-flex"
            style={{
              backgroundColor: orderSavedSuccess ? 'rgba(16, 185, 129, 0.15)' : '#0F172A',
              border: orderSavedSuccess ? '1px solid #10B981' : '1px solid #1E293B',
              color: orderSavedSuccess ? '#34D399' : '#94A3B8',
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: isSearching ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: `all ${PRODUCTS_TRANSITION_DURATION} ${PRODUCTS_TRANSITION_EASE}`
            }}
          >
            {isSavingOrder ? (
              <>
                <Loader2 size={14} className="spin-loader" color="#0066FF" />
                <span>Salvando...</span>
              </>
            ) : orderSavedSuccess ? (
              <>
                <Check size={14} color="#34D399" />
                <span>Ordem Salva!</span>
              </>
            ) : (
              <>
                <Save size={14} color="#94A3B8" />
                <span>Salvar Ordem</span>
              </>
            )}
          </button>

          {/* Botão Novo Projeto */}
          <button 
            type="button"
            onClick={onNewProject} 
            className="btn-industrial btn-action-mobile-flex" 
            style={{
              backgroundColor: '#0066FF',
              color: '#FFFFFF',
              padding: '10px 18px',
              fontWeight: 700,
              fontSize: '0.88rem',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 102, 255, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* 2. FEEDBACK QUANDO VAZIO */}
      {filteredProjects.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#0F172A',
          border: '1px dashed #1E293B',
          borderRadius: 'var(--radius-card)',
          color: '#64748B'
        }}>
          <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94A3B8' }}>
            Nenhum projeto encontrado.
          </p>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            Tente outro termo de busca ou cadastre um novo projeto técnico.
          </p>
        </div>
      )}

      {/* 3. 🖥️ VISUAL DESKTOP: TABELA COM CONTROLE DE ORDEM POR SETAS */}
      <div className="admin-desktop-table" style={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead style={{ backgroundColor: '#090E17', borderBottom: '1px solid #1E293B', color: '#94A3B8', textTransform: 'uppercase', fontSize: '0.74rem', letterSpacing: '0.05em' }}>
            <tr>
              <th style={{ padding: '14px 16px', width: '110px' }}>Ordem</th>
              <th style={{ padding: '14px 20px' }}>Projeto</th>
              <th style={{ padding: '14px 20px' }}>Categoria</th>
              <th style={{ padding: '14px 20px' }}>Simulação 3D</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p) => {
              // Localiza o índice real na lista completa para evitar conflito se houver busca
              const realIndex = localProjects.findIndex(item => item.id === p.id);
              const isFirst = realIndex === 0;
              const isLast = realIndex === localProjects.length - 1;

              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #1E293B' }} className="project-row-hover">
                  
                  {/* CONTROLE DE ORDEM POR SETAS (▲ e ▼) */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* Posição numérica visual */}
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#38BDF8',
                        fontFamily: 'monospace',
                        minWidth: '22px',
                        textAlign: 'center'
                      }}>
                        #{realIndex + 1}
                      </span>

                      {/* Botões de Setas Subir / Descer */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => handleMove(realIndex, 'up')}
                          disabled={isFirst || isSavingOrder || isSearching}
                          title={isFirst ? "Primeira posição" : "Mover para cima"}
                          className="btn-order-arrow"
                          style={{
                            backgroundColor: '#090E17',
                            border: '1px solid #1E293B',
                            borderRadius: '3px',
                            padding: '3px 4px',
                            cursor: (isFirst || isSavingOrder || isSearching) ? 'not-allowed' : 'pointer',
                            opacity: (isFirst || isSearching) ? 0.3 : 1,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 0
                          }}
                        >
                          <ChevronUp size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMove(realIndex, 'down')}
                          disabled={isLast || isSavingOrder || isSearching}
                          title={isLast ? "Última posição" : "Mover para baixo"}
                          className="btn-order-arrow"
                          style={{
                            backgroundColor: '#090E17',
                            border: '1px solid #1E293B',
                            borderRadius: '3px',
                            padding: '3px 4px',
                            cursor: (isLast || isSavingOrder || isSearching) ? 'not-allowed' : 'pointer',
                            opacity: (isLast || isSearching) ? 0.3 : 1,
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 0
                          }}
                        >
                          <ChevronDown size={13} />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* IMAGEM E NOME DO PROJETO */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#090E17',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid #1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {p.image_url ? (
                          <img 
                            src={p.image_url} 
                            alt={p.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <Package size={20} color="#475569" />
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#FFFFFF', margin: 0, fontSize: '0.92rem' }}>
                          {p.title}
                        </p>
                        {p.technical_specs?.gallery?.length > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            +{p.technical_specs.gallery.length} fotos na galeria
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* CATEGORIA */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#090E17',
                      border: '1px solid #1E293B',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      color: '#94A3B8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Tag size={11} color="#64748B" />
                      <span>{p.category || 'Geral'}</span>
                    </span>
                  </td>

                  {/* CAMPO DIRETO PARA COLAR O VÍDEO DE SIMULAÇÃO 3D NA LISTAGEM */}
                  <td style={{ padding: '12px 16px', minWidth: '190px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="text"
                        placeholder="Cole o link ou ID..."
                        defaultValue={p.youtube_video_id || ''}
                        onBlur={(e) => onUpdateVideo && onUpdateVideo(p.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                        }}
                        style={{
                          width: '100%',
                          maxWidth: '160px',
                          backgroundColor: '#090E17',
                          border: p.youtube_video_id ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #1E293B',
                          borderRadius: '4px',
                          color: p.youtube_video_id ? '#34D399' : '#94A3B8',
                          padding: '6px 8px',
                          fontSize: '0.78rem',
                          fontFamily: 'monospace',
                          outline: 'none'
                        }}
                        title={p.youtube_video_id ? `ID ativo: ${p.youtube_video_id}. Cole outro link para alterar.` : "Cole a URL do YouTube e saia do campo para salvar"}
                      />
                      {p.youtube_video_id && (
                        <a 
                          href={`https://youtube.com/watch?v=${p.youtube_video_id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#10B981', display: 'flex', alignItems: 'center' }}
                          title="Testar vídeo no YouTube"
                        >
                          <Video size={14} />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* BOTÕES DE AÇÃO */}
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        type="button"
                        onClick={() => onEditProject(p)} 
                        className="btn-action-icon" 
                        title="Editar Projeto"
                        aria-label={`Editar ${p.title}`}
                        style={{
                          backgroundColor: '#090E17',
                          border: '1px solid #1E293B',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38BDF8'
                        }}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleConfirmDelete(p)} 
                        className="btn-action-icon" 
                        title="Excluir Projeto"
                        aria-label={`Excluir ${p.title}`}
                        style={{
                          backgroundColor: '#090E17',
                          border: '1px solid #1E293B',
                          borderRadius: '6px',
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#F87171'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. 📱 VISUAL MOBILE: LISTA DE CARDS RESPONSIVOS COM SETAS */}
      <div className="admin-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
        {filteredProjects.map((p) => {
          const realIndex = localProjects.findIndex(item => item.id === p.id);
          const isFirst = realIndex === 0;
          const isLast = realIndex === localProjects.length - 1;

          return (
            <div key={p.id} style={{
              backgroundColor: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: 'var(--radius-card)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {/* Topo do Card Mobile: Capa e Dados */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#090E17',
                  border: '1px solid #1E293B',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={24} color="#475569" />
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </p>
                  <span style={{
                    fontSize: '0.72rem',
                    backgroundColor: '#090E17',
                    border: '1px solid #1E293B',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#94A3B8',
                    display: 'inline-block'
                  }}>
                    {p.category || 'Geral'}
                  </span>
                </div>
              </div>

              {/* Campo Direto de Vídeo 3D no Card Mobile */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#090E17',
                border: '1px solid #1E293B',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px'
              }}>
                <span style={{ fontSize: '0.70rem', color: '#64748B', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  VÍDEO 3D:
                </span>
                <input 
                  type="text"
                  placeholder="Cole link ou ID do YouTube..."
                  defaultValue={p.youtube_video_id || ''}
                  onBlur={(e) => onUpdateVideo && onUpdateVideo(p.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: p.youtube_video_id ? '#34D399' : '#94A3B8',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                  title="Cole o link do YouTube e toque fora para salvar no banco"
                />
                {p.youtube_video_id && (
                  <span style={{ color: '#10B981', fontSize: '0.72rem', fontWeight: 700 }}>✓</span>
                )}
              </div>

              {/* Base do Card Mobile: Ergonomia Completa com Botões Maiores */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderTop: '1px solid #1E293B',
                paddingTop: '12px'
              }}>
                {/* Linha 1: Controle de Ordem com Setas Maiores (42px x 36px) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#090E17',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #1E293B'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em' }}>ORDEM:</span>
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: '#38BDF8',
                      fontFamily: 'monospace'
                    }}>
                      #{realIndex + 1}
                    </span>
                  </div>
                  
                  {/* Botões de Setas Ampliados para Touch Screen */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleMove(realIndex, 'up')}
                      disabled={isFirst || isSavingOrder || isSearching}
                      className="btn-order-arrow"
                      style={{
                        backgroundColor: isFirst ? 'transparent' : '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: '6px',
                        width: '42px',
                        height: '36px',
                        cursor: (isFirst || isSavingOrder || isSearching) ? 'not-allowed' : 'pointer',
                        opacity: (isFirst || isSearching) ? 0.3 : 1,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all ${PRODUCTS_TRANSITION_DURATION} ${PRODUCTS_TRANSITION_EASE}`
                      }}
                      title="Mover para cima"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(realIndex, 'down')}
                      disabled={isLast || isSavingOrder || isSearching}
                      className="btn-order-arrow"
                      style={{
                        backgroundColor: isLast ? 'transparent' : '#0F172A',
                        border: '1px solid #1E293B',
                        borderRadius: '6px',
                        width: '42px',
                        height: '36px',
                        cursor: (isLast || isSavingOrder || isSearching) ? 'not-allowed' : 'pointer',
                        opacity: (isLast || isSearching) ? 0.3 : 1,
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: `all ${PRODUCTS_TRANSITION_DURATION} ${PRODUCTS_TRANSITION_EASE}`
                      }}
                      title="Mover para baixo"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>

                {/* Linha 2: Botões Editar e Excluir com flex: 1 e altura ergonômica de 40px */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => onEditProject(p)} 
                    style={{
                      flex: 1,
                      height: '40px',
                      backgroundColor: '#090E17',
                      border: '1px solid #1E293B',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: '#38BDF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      transition: `all ${PRODUCTS_TRANSITION_DURATION} ${PRODUCTS_TRANSITION_EASE}`
                    }}
                  >
                    <Edit3 size={15} /> Editar
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleConfirmDelete(p)} 
                    style={{
                      flex: 1,
                      height: '40px',
                      backgroundColor: '#090E17',
                      border: '1px solid #1E293B',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      color: '#F87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      transition: `all ${PRODUCTS_TRANSITION_DURATION} ${PRODUCTS_TRANSITION_EASE}`
                    }}
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .search-input-focus:focus {
          border-color: #0066FF !important;
        }
        .project-row-hover:hover {
          background-color: rgba(30, 41, 59, 0.4);
        }
        .btn-action-icon:hover, .btn-order-arrow:hover:not(:disabled) {
          background-color: #1E293B !important;
          transform: ${ARROW_BUTTON_HOVER_SCALE};
        }
        @media (max-width: 640px) {
          .admin-actions-group {
            width: 100% !important;
            display: flex !important;
          }
          .btn-action-mobile-flex {
            flex: 1 !important;
          }
        }
        @media (max-width: 860px) {
          .admin-desktop-table {
            display: none !important;
          }
          .admin-mobile-cards {
            display: flex !important;
          }
        }
        @media (min-width: 861px) {
          .admin-desktop-table {
            display: block !important;
          }
          .admin-mobile-cards {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
