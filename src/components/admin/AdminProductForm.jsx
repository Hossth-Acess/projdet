/**
 * COMPONENTE: AdminProductForm.jsx (Formulário Modular de Projetos com Abas)
 * -----------------------------------------------------------------------------
 * Módulo isolado baseado fielmente na mecânica do AdminProductForm:
 * - Ações Rápidas no Topo: Voltar, Excluir (se editando) e Salvar Projeto (sem rolagem)
 * - Aba "Informações Gerais": Título, Categorias Dinâmicas com Salvar/Apagar e Memorial Descritivo
 * - Aba "Mídias & Arquivos" (Layout em 2 Colunas Lado a Lado no Desktop / Empilhado no Mobile):
 *   * Capa Principal: Dropzone limpo com input oculto, compressor WebP 200KB e botão "Remover Capa"
 *   * Galeria Adicional: Grade 3 colunas com botões de reordenação (◀/▶) e exclusão física individual (X)
 *   * Vídeo do YouTube: Simulação 3D com extrator inteligente de ID
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  Tag, 
  Youtube, 
  Plus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { compressImageNative, deleteFileFromStorage, deleteFilesFromStorage } from '../../lib/imageUtils';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Calibre a velocidade dos hovers e trocas de abas:
 */
const FORM_TRANSITION_DURATION = '180ms';
const FORM_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const FULLSCREEN_MODAL_TRANSITION = '200ms cubic-bezier(0.16, 1, 0.3, 1)'; // Velocidade de abertura do editor em tela cheia
const STORAGE_BUCKET = 'project-images';

// Estilo base para manter todos os campos no padrão escuro industrial sem falhas de autofill
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

export default function AdminProductForm({
  initialData = null,
  editingId = null,
  onSave,
  onDelete,
  onCancel,
  supabase
}) {
  // Controle de Abas Internas ('geral' ou 'midia')
  const [activeTab, setActiveTab] = useState('geral');
  const [saving, setSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isFullscreenDesc, setIsFullscreenDesc] = useState(false); // Controle do modo tela cheia para redação do memorial

  // Rastreia imagens enviadas nesta sessão que ainda não foram persistidas (limpeza anti-órfãos em caso de cancelamento)
  const sessionUploadedUrls = useRef(new Set());
  // Rastreia imagens antigas marcadas para exclusão definitiva do Supabase Storage somente após salvar com sucesso
  const urlsToDeleteOnSave = useRef(new Set());

  // Limpeza de contingência na desmontagem do componente:
  // Se o usuário fechar o painel administrativo pelo "X" superior ou trocar de aba no topo
  // sem ter salvo o formulário, purga automaticamente as imagens enviadas nesta sessão
  useEffect(() => {
    return () => {
      if (sessionUploadedUrls.current.size > 0) {
        deleteFilesFromStorage(Array.from(sessionUploadedUrls.current), STORAGE_BUCKET);
        sessionUploadedUrls.current.clear();
      }
    };
  }, []);

  // Estado do Projeto
  const [productForm, setProductForm] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    category: initialData?.category || 'Caldeiraria & Tanques',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    youtube_video_id: initialData?.youtube_video_id || '',
    gallery: initialData?.technical_specs?.gallery || []
  });

  // Lista dinâmica de categorias salvas (persiste no LocalStorage)
  const [categoriesList, setCategoriesList] = useState(() => {
    try {
      const saved = localStorage.getItem('projdet_categories_list');
      return saved ? JSON.parse(saved) : [
        'Caldeiraria & Tanques',
        'Estruturas Metálicas',
        'Tubulações & PipeRacks',
        'Usinagem & Dispositivos',
        'Implementos Agrícolas',
        'Tratamento de Superfícies'
      ];
    } catch (e) {
      return ['Caldeiraria & Tanques', 'Estruturas Metálicas', 'Tubulações & PipeRacks', 'Usinagem & Dispositivos'];
    }
  });

  // --- 1. GESTÃO DE CATEGORIAS (ADICIONAR & APAGAR BADGES) ---
  const handleAddCategory = () => {
    const newCat = productForm.category.trim();
    if (!newCat || categoriesList.includes(newCat)) return;
    const updated = [...categoriesList, newCat].sort();
    setCategoriesList(updated);
    try { localStorage.setItem('projdet_categories_list', JSON.stringify(updated)); } catch (e) {}
  };

  const handleRemoveCategory = (catToRemove) => {
    if (!window.confirm(`Excluir permanentemente a categoria "${catToRemove}" do sistema?`)) return;
    const updated = categoriesList.filter(c => c !== catToRemove);
    setCategoriesList(updated);
    try { localStorage.setItem('projdet_categories_list', JSON.stringify(updated)); } catch (e) {}
    if (productForm.category === catToRemove) {
      setProductForm(prev => ({ ...prev, category: '' }));
    }
  };

  // --- 2. UPLOAD INTELIGENTE COM COMPRESSOR NATIVO WEBP 200KB ---
  const handleImageUpload = async (e, target = 'main') => {
    const file = e.target.files[0];
    if (!file || !supabase) return;

    try {
      setIsCompressing(true);
      // Comprime a imagem em Canvas nativo para WebP leve
      const compressedBlob = await compressImageNative(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, compressedBlob, { contentType: 'image/webp', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      if (target === 'main') {
        // Se já existia uma capa anterior:
        if (productForm.image_url) {
          // Se foi enviada nesta mesma sessão e substituída antes de salvar, exclui imediatamente
          if (sessionUploadedUrls.current.has(productForm.image_url)) {
            await deleteFileFromStorage(productForm.image_url, STORAGE_BUCKET);
            sessionUploadedUrls.current.delete(productForm.image_url);
          } else {
            // Se já pertencia ao projeto salvo no banco, agenda para exclusão física ao salvar
            urlsToDeleteOnSave.current.add(productForm.image_url);
          }
        }
        // Registra a nova URL como enviada nesta sessão
        sessionUploadedUrls.current.add(publicUrl);
        setProductForm(prev => ({ ...prev, image_url: publicUrl }));
      } else {
        // Registra a nova foto da galeria nesta sessão
        sessionUploadedUrls.current.add(publicUrl);
        setProductForm(prev => ({ ...prev, gallery: [...(prev.gallery || []), publicUrl] }));
      }
    } catch (err) {
      console.error('[UPLOAD_ERROR]', err);
      alert('Falha ao processar ou enviar a imagem.');
    } finally {
      setIsCompressing(false);
      e.target.value = ''; // Limpa o input
    }
  };

  // --- 3. REMOÇÃO DA CAPA PRINCIPAL ---
  const handleRemoveCoverImage = async () => {
    if (!productForm.image_url) return;
    if (!window.confirm('Remover a imagem de capa deste projeto?')) return;
    
    // Se a imagem foi subida nesta sessão e ainda não foi salva, apaga imediatamente do bucket
    if (sessionUploadedUrls.current.has(productForm.image_url)) {
      await deleteFileFromStorage(productForm.image_url, STORAGE_BUCKET);
      sessionUploadedUrls.current.delete(productForm.image_url);
    } else {
      // Se era imagem original do banco, agenda a exclusão definitiva para o momento de salvar
      urlsToDeleteOnSave.current.add(productForm.image_url);
    }
    setProductForm(prev => ({ ...prev, image_url: '' }));
  };

  // --- 4. REORDENAÇÃO DA GALERIA (MOVER PARA ESQUERDA OU DIREITA) ---
  const handleMoveGalleryImage = (index, direction) => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= productForm.gallery.length) return;
    const updated = [...productForm.gallery];
    const item = updated.splice(index, 1)[0];
    updated.splice(newIndex, 0, item);
    setProductForm(prev => ({ ...prev, gallery: updated }));
  };

  // --- 5. REMOÇÃO DE IMAGEM DA GALERIA ---
  const handleRemoveGalleryImage = async (indexToRemove) => {
    if (!window.confirm('Excluir esta foto da galeria?')) return;
    const imageUrl = productForm.gallery[indexToRemove];
    if (imageUrl) {
      // Se foi enviada nesta sessão, apaga imediatamente do bucket
      if (sessionUploadedUrls.current.has(imageUrl)) {
        await deleteFileFromStorage(imageUrl, STORAGE_BUCKET);
        sessionUploadedUrls.current.delete(imageUrl);
      } else {
        // Se já pertencia ao projeto salvo no banco, agenda para excluir ao salvar
        urlsToDeleteOnSave.current.add(imageUrl);
      }
    }
    setProductForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // --- 6. SUBMISSÃO FINAL COM PERSISTÊNCIA E LIMPEZA DE MÍDIAS ---
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!productForm.title.trim()) {
      alert('O título do projeto técnico é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      // Passa explicitamente os parâmetros: formData, isEditing e editingId
      await onSave({
        title: productForm.title.trim(),
        slug: productForm.slug || productForm.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        category: productForm.category.trim() || 'Geral',
        description: productForm.description,
        image_url: productForm.image_url,
        youtube_video_id: productForm.youtube_video_id || null,
        technical_specs: { gallery: productForm.gallery || [] }
      }, Boolean(editingId), editingId);

      // Com a persistência confirmada no banco, remove do Storage as imagens substituídas/excluídas
      if (urlsToDeleteOnSave.current.size > 0) {
        await deleteFilesFromStorage(Array.from(urlsToDeleteOnSave.current), STORAGE_BUCKET);
        urlsToDeleteOnSave.current.clear();
      }

      // Limpa a lista de uploads da sessão, pois agora são mídias definitivas do projeto
      sessionUploadedUrls.current.clear();
    } catch (err) {
      console.error('[SAVE_ERROR]', err);
    } finally {
      setSaving(false);
    }
  };

  // --- 7. CANCELAR / VOLTAR COM LIMPEZA PREVENTIVA DE ARQUIVOS ÓRFÃOS ---
  const handleCancelForm = async () => {
    // Se o operador fez upload de imagens mas desistiu antes de salvar, limpa os arquivos órfãos do storage
    if (sessionUploadedUrls.current.size > 0) {
      await deleteFilesFromStorage(Array.from(sessionUploadedUrls.current), STORAGE_BUCKET);
      sessionUploadedUrls.current.clear();
    }
    if (onCancel) onCancel();
  };

  // --- 8. CONFIRMAÇÃO PREVENTIVA DE EXCLUSÃO DO PROJETO ---
  const handleConfirmDeleteCurrent = () => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o projeto "${productForm.title || 'este projeto'}"?\n\nTodas as fotos vinculadas serão apagadas do servidor.`)) return;
    // Agrupa tanto as fotos da galeria atual quanto as fotos que estavam na fila de espera para exclusão
    const allGalleryUrls = [...(productForm.gallery || []), ...Array.from(urlsToDeleteOnSave.current)];
    if (onDelete) onDelete(editingId, productForm.image_url, allGalleryUrls);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. HEADER DE AÇÕES: COMPACTO, RESPONSIVO E COM AÇÕES PRINCIPAIS NO TOPO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: 'var(--radius-card)',
        padding: '12px 18px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button"
            onClick={handleCancelForm} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
            {editingId ? 'Editar Projeto' : 'Novo Projeto Técnico'}
          </span>
        </div>

        {/* Botões de Ação Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {editingId && (
            <button
              type="button"
              onClick={handleConfirmDeleteCurrent}
              className="btn-industrial"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={14} /> Excluir
            </button>
          )}  

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving} 
            className="btn-industrial" 
            style={{
              padding: '8px 20px',
              fontSize: '0.85rem',
              backgroundColor: '#0066FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)'
            }}
          >
            {saving ? <Loader2 size={15} className="spin-loader" /> : <Save size={15} />}
            <span>Salvar Projeto</span>
          </button>
        </div>
      </div>

      {/* 2. SELETOR DE ABAS INTERNAS */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #1E293B',
        gap: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button 
          type="button" 
          onClick={() => setActiveTab('geral')} 
          style={{
            paddingBottom: '12px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'geral' ? '2px solid #0066FF' : '2px solid transparent',
            color: activeTab === 'geral' ? '#FFFFFF' : '#64748B',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: `all ${FORM_TRANSITION_DURATION} ${FORM_TRANSITION_EASE}`
          }}
        >
          Informações Gerais
        </button>
        <button 
          type="button" 
          onClick={() => setActiveTab('midia')} 
          style={{
            paddingBottom: '12px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'midia' ? '2px solid #0066FF' : '2px solid transparent',
            color: activeTab === 'midia' ? '#FFFFFF' : '#64748B',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: `all ${FORM_TRANSITION_DURATION} ${FORM_TRANSITION_EASE}`
          }}
        >
          Mídias & Arquivos {(productForm.gallery?.length > 0 || productForm.image_url) && `(${productForm.gallery.length + (productForm.image_url ? 1 : 0)})`}
        </button>
      </div>

      {/* 3. CORPO DO FORMULÁRIO */}
      <div style={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: 'var(--radius-card)',
        padding: 'clamp(16px, 3vw, 28px)'
      }}>

        {/* ============================================================== */}
        {/* ABA 1: INFORMAÇÕES GERAIS                                      */}
        {/* ============================================================== */}
        {activeTab === 'geral' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            
            {/* Título do Projeto */}
            <div>
              <label 
                htmlFor="form-project-title" 
                style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}
              >
                Título do Projeto Técnico *
              </label>
              <input 
                id="form-project-title"
                type="text" 
                required 
                value={productForm.title} 
                onChange={e => setProductForm({ ...productForm, title: e.target.value })} 
                style={inputBaseStyle}
                placeholder="Ex: Tanque Cilíndrico Vertical API 650" 
              />
            </div>

            {/* Categorias Dinâmicas (Mecânica AdminProductForm original) */}
            <div>
              <label 
                htmlFor="form-project-category" 
                style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}
              >
                Categoria Industrial
              </label>
              
              {/* Campo para digitar ou selecionar categoria, com botão Salvar para novas */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input 
                  id="form-project-category"
                  type="text" 
                  value={productForm.category} 
                  onChange={e => setProductForm({ ...productForm, category: e.target.value })} 
                  style={inputBaseStyle}
                  placeholder="Digite ou selecione uma categoria técnica..." 
                />
                {productForm.category && !categoriesList.includes(productForm.category.trim()) && (
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="btn-industrial"
                    style={{
                      backgroundColor: '#0066FF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 16px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    title="Salvar categoria para reuso"
                  >
                    <Plus size={14} style={{ marginRight: '4px' }} /> Salvar Categoria
                  </button>
                )}
              </div>

              {/* Lista de Badges de Categorias com botão (X) para apagar do catálogo */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categoriesList.map(cat => (
                  <div key={cat} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, category: cat })}
                      style={{
                        padding: '6px 14px',
                        paddingRight: '28px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        border: productForm.category === cat ? '1px solid #0066FF' : '1px solid #1E293B',
                        backgroundColor: productForm.category === cat ? 'rgba(0,102,255,0.2)' : '#090E17',
                        color: productForm.category === cat ? '#38BDF8' : '#94A3B8',
                        transition: `all ${FORM_TRANSITION_DURATION} ${FORM_TRANSITION_EASE}`
                      }}
                    >
                      <Tag size={11} style={{ marginRight: '6px' }} />
                      <span>{cat}</span>
                    </button>
                    {/* Botão X para apagar a categoria do sistema */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveCategory(cat); }}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={`Excluir categoria "${cat}" do catálogo`}
                      aria-label={`Excluir categoria ${cat}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Memorial Descritivo & Dados Técnicos com Botão de Tela Cheia */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <label 
                  htmlFor="form-project-desc" 
                  style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  Memorial Descritivo & Dados Técnicos
                </label>

                {/* Botão de Redação em Tela Cheia */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenDesc(true)}
                  style={{
                    backgroundColor: 'rgba(0, 102, 255, 0.12)',
                    border: '1px solid rgba(0, 102, 255, 0.3)',
                    color: '#38BDF8',
                    borderRadius: 'var(--radius-sm)',
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: `all ${FORM_TRANSITION_DURATION} ${FORM_TRANSITION_EASE}`
                  }}
                  title="Abrir editor em tela cheia para redação detalhada"
                >
                  <Maximize2 size={13} />
                  <span>Escrever em Tela Cheia</span>
                </button>
              </div>

              <textarea 
                id="form-project-desc"
                rows={6} 
                value={productForm.description} 
                onChange={e => setProductForm({ ...productForm, description: e.target.value })} 
                style={{ ...inputBaseStyle, resize: 'vertical', lineHeight: 1.6 }}
                placeholder="Insira detalhes de engenharia, materiais (ex: Aço Carbono ASTM A36 / Inox 316L), normas técnicas (ASME, API) e capacidade de processamento..." 
              />
            </div>

            {/* MODAL FULLSCREEN: REDAÇÃO DO MEMORIAL DESCRITIVO & DADOS TÉCNICOS */}
            {isFullscreenDesc && (
              <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: '#090E17',
                zIndex: 4000,
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(14px, 3vw, 24px)',
                boxSizing: 'border-box',
                gap: '14px'
              }}>
                {/* Header Superior do Modo Tela Cheia */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #1E293B',
                  paddingBottom: '14px',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.02em' }}>
                      Memorial Descritivo & Dados Técnicos
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px', display: 'block' }}>
                      {productForm.description?.length || 0} caracteres • {productForm.description ? productForm.description.trim().split(/\s+/).filter(Boolean).length : 0} palavras
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenDesc(false)}
                    className="btn-industrial"
                    style={{
                      backgroundColor: '#0066FF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '9px 18px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(0, 102, 255, 0.3)'
                    }}
                  >
                    <Minimize2 size={15} />
                    <span>Concluir & Minimizar</span>
                  </button>
                </div>

                {/* Editor Amplo de Texto */}
                <textarea
                  autoFocus
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  style={{
                    flex: 1,
                    width: '100%',
                    backgroundColor: '#05070B',
                    color: '#FFFFFF',
                    border: '1px solid #1E293B',
                    borderRadius: 'var(--radius-card)',
                    padding: '20px',
                    fontSize: '1rem',
                    lineHeight: 1.75,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Redija com detalhes todas as especificações técnicas, tolerâncias, normas de fabricação e diferenciais do projeto..."
                />
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 2: MÍDIAS & ARQUIVOS (Layout 2 Colunas AdminProductForm)   */}
        {/* ============================================================== */}
        {activeTab === 'midia' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* GRID 2 COLUNAS: CAPA À ESQUERDA & GALERIA À DIREITA */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              
              {/* COLUNA 1: Imagem Principal (Capa) com Dropzone Limpo */}
              <div style={{
                backgroundColor: '#090E17',
                border: '1px solid #1E293B',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} /> Imagem Principal (Capa)
                </span>

                {/* Dropzone Clicável com Input Oculto (Sem botão cinza nativo do navegador) */}
                <div style={{
                  width: '100%',
                  height: '240px',
                  backgroundColor: '#05070B',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px dashed #1E293B',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isCompressing ? 'not-allowed' : 'pointer'
                }}>
                  {isCompressing ? (
                    <div style={{ textAlign: 'center', color: '#38BDF8' }}>
                      <Loader2 size={28} className="spin-loader" style={{ margin: '0 auto 8px' }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Otimizando em WebP...</span>
                    </div>
                  ) : productForm.image_url ? (
                    <>
                      <img 
                        src={productForm.image_url} 
                        alt="Capa do projeto" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} 
                      />
                      {/* Botão de Remover Capa do Servidor */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveCoverImage(); }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: 'rgba(239, 68, 68, 0.92)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          zIndex: 5,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
                        }}
                        title="Remover foto de capa"
                      >
                        <Trash2 size={13} /> Remover Capa
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#64748B', padding: '16px' }}>
                      <Upload size={32} style={{ margin: '0 auto 10px', opacity: 0.6 }} />
                      <span style={{ fontSize: '0.85rem', display: 'block', fontWeight: 600, color: '#94A3B8' }}>
                        Clique ou arraste a imagem de capa aqui
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px', display: 'block' }}>
                        Conversão automática WebP calibrada até 200KB
                      </span>
                    </div>
                  )}

                  {/* Input de arquivo invisível sobre toda a área */}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'main')}
                    disabled={isCompressing}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 2 }}
                    aria-label="Upload da imagem de capa"
                  />
                </div>
              </div>

              {/* COLUNA 2: Galeria Adicional com Reordenação e Exclusão */}
              <div style={{
                backgroundColor: '#090E17',
                border: '1px solid #1E293B',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                  Galeria Adicional de Detalhes ({productForm.gallery?.length || 0})
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {productForm.gallery?.map((imgUrl, idx) => (
                    <div key={idx} style={{
                      position: 'relative',
                      aspectRatio: '1',
                      backgroundColor: '#05070B',
                      border: '1px solid #1E293B',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <img src={imgUrl} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      
                      {/* Botão de Excluir Miniatura do Servidor */}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 4
                        }}
                        title="Remover foto da galeria"
                      >
                        <X size={12} />
                      </button>

                      {/* Controles de Reordenação (Mover para esquerda / direita) */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        insetInline: 0,
                        backgroundColor: 'rgba(9, 14, 23, 0.88)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '3px 6px',
                        zIndex: 3
                      }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveGalleryImage(idx, 'left')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: idx === 0 ? '#334155' : '#FFFFFF',
                            cursor: idx === 0 ? 'default' : 'pointer',
                            fontSize: '0.75rem',
                            padding: '2px 4px'
                          }}
                          title="Mover para a esquerda"
                        >
                          ◀
                        </button>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', alignSelf: 'center', fontFamily: 'monospace' }}>
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          disabled={idx === productForm.gallery.length - 1}
                          onClick={() => handleMoveGalleryImage(idx, 'right')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: idx === productForm.gallery.length - 1 ? '#334155' : '#FFFFFF',
                            cursor: idx === productForm.gallery.length - 1 ? 'default' : 'pointer',
                            fontSize: '0.75rem',
                            padding: '2px 4px'
                          }}
                          title="Mover para a direita"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Slot de Adicionar Foto à Galeria */}
                  {(productForm.gallery?.length || 0) < 12 && (
                    <div style={{
                      aspectRatio: '1',
                      border: '2px dashed #1E293B',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#05070B',
                      position: 'relative',
                      cursor: isCompressing ? 'not-allowed' : 'pointer',
                      color: '#64748B'
                    }}>
                      <Plus size={22} />
                      <span style={{ fontSize: '0.68rem', marginTop: '4px', fontWeight: 600 }}>Adicionar</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'gallery')}
                        disabled={isCompressing}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        aria-label="Adicionar foto à galeria"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* VÍDEO DO YOUTUBE PARA SIMULAÇÃO MECÂNICA 3D COM EXTRATOR UNIVERSAL */}
            <div style={{ backgroundColor: '#090E17', border: '1px solid #1E293B', borderRadius: 'var(--radius-sm)', padding: '20px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Youtube size={15} color="#EF4444" /> Vídeo de Simulação Mecânica 3D (Link ou ID do YouTube)
              </span>
              <input 
                type="text" 
                value={productForm.youtube_video_id || ''} 
                onChange={e => {
                  const raw = e.target.value;
                  // Expressão Regular Universal para qualquer formato do YouTube
                  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
                  const match = raw.match(regExp);
                  const finalId = match ? match[1] : raw.trim();
                  setProductForm({ ...productForm, youtube_video_id: finalId });
                }} 
                style={inputBaseStyle}
                placeholder="Cole qualquer URL do YouTube (ex: https://youtube.com/shorts/... ou https://youtu.be/...)" 
              />
              <p style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px', margin: '6px 0 0' }}>
                Aceita qualquer link completo: Shorts, vídeos de computador ou compartilhamentos de smartphone. O ID de 11 caracteres é extraído automaticamente.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

