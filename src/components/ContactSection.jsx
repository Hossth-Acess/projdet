/**
 * COMPONENTE: ContactSection (Seção 5: Contato & CTA Final - Padrão ForgeX)
 * -----------------------------------------------------------------------------
 * Bloco escuro flutuante (#090E17) idêntico à base do layout de referência ForgeX:
 * - Chamada de alto impacto ("Tem um desafio de engenharia? Vamos desenvolver a Solução.")
 * - Canais diretos B2B (WhatsApp de Engenharia e E-mail corporativo)
 * - Formulário técnico de especificação que envia os dados formatados diretamente ao WhatsApp
 * - Conformidade com acessibilidade, foco visível e respeito a movimento reduzido
 */
import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  MessageSquare,
  Mail,
  MapPin,
  ShieldCheck,
  Send,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Modifique os valores abaixo para calibrar a sensibilidade dos botões e formulário:
 */
const CONTACT_TRANSITION_DURATION = '180ms'; // Duração das transições de botões e inputs
const CONTACT_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva suave e precisa
const FULLSCREEN_MODAL_DURATION = '220ms'; // Velocidade de transição da tela cheia
const CONTACT_BUTTON_HOVER_Y = '-2px'; // Deslocamento no hover dos botões de ação

/**
 * CONSTANTES DE LIMITES E SEGURANÇA (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Calibre os limites máximos de caracteres e palavras:
 */
const MAX_LENGTH_NAME = 100;          // Nome Completo (permite nomes compostos com espaços)
const MAX_LENGTH_COMPANY = 120;       // Empresa / Razão Social
const MAX_LENGTH_PROJECT_TYPE = 100;  // Segmento Industrial
const MAX_WORDS_MESSAGE = 5000;       // Limite estrito de 5.000 palavras no Memorial Técnico
const MAX_CHARS_MESSAGE = 40000;      // Teto de caracteres seguro (~40.000) para comportar 5.000 palavras

/**
 * FUNÇÃO DE HIGIENIZAÇÃO CONTRA INJEÇÃO DE SCRIPTS E TAGS HTML
 * Neutraliza qualquer tentativa de script malicioso, tags <script>, <iframe> ou payloads XSS,
 * PRESERVANDO integralmente espaços, quebras de linha (\n), acentuação e pontuação normal de texto.
 */
const sanitizeTechnicalText = (text) => {
  if (!text || typeof text !== 'string') return '';
  // 1. Remove qualquer estrutura de tags HTML/XML (<...>)
  const strippedTags = text.replace(/<[^>]*>?/gm, '');
  // 2. Remove apenas caracteres de injeção de código (<, >, {, }, $, `, \, ^), preservando espaços e pontuações normais
  return strippedTags.replace(/[<>{}$`\\^]/g, '');
};

// Helper universal para contagem precisa de palavras em tempo real
const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function ContactSection() {
  // Estado local do formulário para coleta de dados técnicos B2B
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    projectType: '',
    message: ''
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  // Estado para controle do modo de redação em tela cheia
  const [isFullscreenMessage, setIsFullscreenMessage] = useState(false);

  // Fecha o modo tela cheia ao pressionar ESC e bloqueia rolagem do fundo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreenMessage) {
        setIsFullscreenMessage(false);
      }
    };
    if (isFullscreenMessage) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreenMessage]);

  // Manipulador de alteração com blindagem ativa por tipo de dado, bloqueio de scripts e preservação de espaços
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 1. WHATSAPP: Apenas dígitos numéricos com máscara dinâmica (99) 99999-9999
    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 11);
      let formatted = onlyDigits;
      if (onlyDigits.length > 2) formatted = `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(2)}`;
      if (onlyDigits.length > 7) formatted = `(${onlyDigits.slice(0, 2)}) ${onlyDigits.slice(2, 7)}-${onlyDigits.slice(7)}`;
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // 2. NOME COMPLETO: Letras com acentos, pontuações de nome e ESPAÇOS LIVRES (sem scripts nem números)
    if (name === 'name') {
      const cleanName = value.replace(/[^a-zA-ZÀ-ÿ\s.'-]/g, '').slice(0, MAX_LENGTH_NAME);
      setFormData((prev) => ({ ...prev, [name]: cleanName }));
      return;
    }

    // 3. EMPRESA / INDÚSTRIA: Letras, números, caracteres comerciais (&, /, -, .) e ESPAÇOS LIVRES
    if (name === 'company') {
      const cleanCompany = value.replace(/[^a-zA-Z0-9À-ÿ\s.&/'\-]/g, '').slice(0, MAX_LENGTH_COMPANY);
      setFormData((prev) => ({ ...prev, [name]: cleanCompany }));
      return;
    }

    // 4. SEGMENTO INDUSTRIAL: Letras, números, acentos, hífens, barras e ESPAÇOS LIVRES
    if (name === 'projectType') {
      const cleanType = value.replace(/[^a-zA-Z0-9À-ÿ\s.,/'\-]/g, '').slice(0, MAX_LENGTH_PROJECT_TYPE);
      setFormData((prev) => ({ ...prev, [name]: cleanType }));
      return;
    }

    // 5. RESUMO TÉCNICO (Formulário e Tela Cheia): Até 5.000 palavras, preservando quebras de linha e espaços
    if (name === 'message') {
      const cleanText = sanitizeTechnicalText(value).slice(0, MAX_CHARS_MESSAGE);
      const words = cleanText.trim().split(/\s+/).filter(Boolean);

      // Trava estrita quando atinge 5.000 palavras caso esteja digitando além da cota
      if (words.length > MAX_WORDS_MESSAGE) {
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: cleanText }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Disparo do formulário direto para o WhatsApp oficial com dupla higienização contra scripts
  const handleSubmit = (e) => {
    e.preventDefault();

    // Dupla higienização defensiva antes do envio
    const safeName = sanitizeTechnicalText(formData.name).slice(0, MAX_LENGTH_NAME);
    const safeCompany = sanitizeTechnicalText(formData.company).slice(0, MAX_LENGTH_COMPANY);
    const safePhone = formData.phone.replace(/[^\d() -]/g, '').slice(0, 15);
    const safeProjectType = sanitizeTechnicalText(formData.projectType).slice(0, MAX_LENGTH_PROJECT_TYPE);
    const safeMessage = sanitizeTechnicalText(formData.message).slice(0, MAX_CHARS_MESSAGE);

    // Mensagem técnica pré-formatada para engenharia
    const technicalMessage =
      `*SOLICITAÇÃO DE ORÇAMENTO / VIABILIDADE TÉCNICA - PROJDET*\n\n` +
      `*Nome:* ${safeName}\n` +
      `*Empresa:* ${safeCompany || 'Não informada'}\n` +
      `*WhatsApp:* ${safePhone}\n` +
      `*Segmento do Projeto:* ${safeProjectType || 'Geral'}\n` +
      `*Descrição do Desafio:* ${safeMessage}\n\n` +
      `_Enviado via plataforma institucional PROJDET_`;

    const encodedMessage = encodeURIComponent(technicalMessage);
    const whatsappUrl = `https://wa.me/5519995977417?text=${encodedMessage}`;

    // Abre o WhatsApp corporativo em nova aba
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setFormSubmitted(true);
  };

  return (
    <section
      id="contato"
      style={{
        backgroundColor: '#FFFFFF',
        paddingTop: 'var(--spacing-3xl)',
        paddingBottom: 'var(--spacing-4xl)',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* Container Centralizado com Limite Seguro */}
      <div
        style={{
          width: '100%',
          maxWidth: '1600px',
          margin: '0 auto',
          paddingLeft: 'clamp(16px, 2.5vw, 36px)',
          paddingRight: 'clamp(16px, 2.5vw, 36px)',
          boxSizing: 'border-box'
        }}
      >
        {/* CARD PRINCIPAL ESCURO FORGEX (IDÊNTICO À REFERÊNCIA VISUAL) */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#090E17',
            borderRadius: 'var(--radius-hero)',
            border: '1px solid #1E293B',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            padding: 'clamp(28px, 4vw, 56px)'
          }}
        >
          {/* Fundo com textura industrial sutil e gradiente de profundidade */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 85% 15%, rgba(0, 102, 255, 0.08) 0%, transparent 60%), linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(9, 14, 23, 0.95) 100%)',
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* 1. CABEÇALHO DO BLOCO CTA (PADRÃO FORGEX) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'clamp(20px, 3vw, 48px)',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                paddingBottom: 'clamp(24px, 3vh, 36px)',
                marginBottom: 'clamp(28px, 3.5vh, 44px)'
              }}
            >
              {/* Lado Esquerdo: Chamada Forte */}
              <div>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '0.78rem',
                    color: '#94A3B8',
                    letterSpacing: '0.14em',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '8px'
                  }}
                >
                  ENGENHARIA SOB DEMANDA • CONTATO DIRETO
                </span>
                <h2
                  style={{
                    fontSize: 'clamp(1.9rem, 3.2vw, 2.75rem)',
                    lineHeight: 1.12,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Tem um Desafio de Engenharia? <br />
                  Vamos Desenvolver a <span style={{ color: '#0066FF' }}>Solução.</span>
                </h2>
              </div>

              {/* Lado Direito: Parágrafo Técnico */}
              <div>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    color: '#CBD5E1',
                    maxWidth: '540px'
                  }}
                >
                  Diga-nos o que você precisa fabricar ou calcular. Nossa equipe técnica (formada na <strong>UNESP</strong> e <strong>USP</strong>) transformará suas especificações em modelos CAD 3D executivos prontos para chão de fábrica.
                </p>
              </div>
            </div>

            {/* 2. ÁREA DE INTERAÇÃO DIVIDIDA: DADOS TÉCNICOS & FORMULÁRIO B2B */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'clamp(24px, 3vw, 48px)',
                alignItems: 'start'
              }}
            >
              {/* COLUNA ESQUERDA: CANAIS DIRETOS & GARANTIAS TÉCNICAS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

                {/* Card WhatsApp de Engenharia Rápida */}
                <a
                  href="https://wa.me/5519995977417?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20diretamente%20com%20a%20engenharia%20da%20PROJDET."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-channel-card"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-card)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: `transform ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}, border-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}, background-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(0, 102, 255, 0.15)',
                        border: '1px solid rgba(0, 102, 255, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38BDF8'
                      }}
                    >
                      <MessageSquare size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                        ATENDIMENTO IMEDIATO
                      </span>
                      <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700 }}>
                        WhatsApp Engenharia
                      </h4>
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        +55 (19) 99597-7417
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={20} color="#CBD5E1" />
                </a>

                {/* Card E-mail Técnico de Projetos */}
                <a
                  href="mailto:contato@projdet.com.br?subject=Solicita%C3%A7%C3%A3o%20de%20Projeto%20T%C3%A9cnico%20PROJDET"
                  className="contact-channel-card"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-card)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: `transform ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}, border-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}, background-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <Mail size={22} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                        ENVIO DE MEMORIAIS & DESENHOS
                      </span>
                      <h4 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700 }}>
                        E-mail de Projetos
                      </h4>
                      <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                        contato@projdet.com.br
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight size={20} color="#CBD5E1" />
                </a>

                {/* Bloco de Informações Corporativas e Sigilo Técnico */}
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} color="#38BDF8" />
                    <span style={{ color: '#E2E8F0', fontSize: '0.88rem' }}>
                      Piracicaba - SP
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={18} color="#94A3B8" />
                    <span style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                      Segunda a Sexta: 07h30 às 17h30
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <ShieldCheck size={18} color="#10B981" />
                    <span style={{ color: '#CBD5E1', fontSize: '0.82rem' }}>
                      Garantia de Acordo de Confidencialidade (NDA) para patentes e projetos proprietários.
                    </span>
                  </div>
                </div>

              </div>

              {/* COLUNA DIREITA: FORMULÁRIO B2B DIRETO E LIMPO */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'clamp(20px, 2.5vw, 32px)'
                }}
              >
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
                    Solicitar Estudo de Viabilidade
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
                    Preencha os dados abaixo para receber uma estimativa técnica preliminar.
                  </p>
                </div>

                {formSubmitted ? (
                  <div
                    style={{
                      padding: '24px',
                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'center',
                      color: '#FFFFFF'
                    }}
                  >
                    <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 12px' }} />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                      Solicitação Aberta com Sucesso!
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginBottom: '16px' }}>
                      Você foi redirecionado ao WhatsApp da nossa engenharia com todos os dados preenchidos.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Enviar Nova Mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Linha Dupla: Nome & Empresa */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label
                          htmlFor="name"
                          style={{ display: 'block', color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}
                        >
                          Nome Completo *
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          maxLength={MAX_LENGTH_NAME}
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ex: Carlos Silva"
                          className="contact-input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="company"
                          style={{ display: 'block', color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}
                        >
                          Empresa / Indústria
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          maxLength={MAX_LENGTH_COMPANY}
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Ex: Usina ou Metalúrgica"
                          className="contact-input"
                        />
                      </div>
                    </div>

                    {/* Linha Dupla: Telefone / WhatsApp & Segmento (Bug de Binding Corrigido) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                      <div>
                        <label
                          htmlFor="phone"
                          style={{ display: 'block', color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}
                        >
                          WhatsApp com DDD *
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          maxLength={15}
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(19) 99999-9999"
                          className="contact-input"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="projectType"
                          style={{ display: 'block', color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}
                        >
                          Segmento Industrial / Aplicação
                        </label>
                        <input
                          id="projectType"
                          name="projectType"
                          type="text"
                          maxLength={MAX_LENGTH_PROJECT_TYPE}
                          value={formData.projectType}
                          onChange={handleChange}
                          placeholder="Ex: Sucroalcooleiro, Caldeiraria, etc."
                          className="contact-input"
                        />
                      </div>
                    </div>

                    {/* Descrição do Projeto com Acesso a Redação em Tela Cheia */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label
                          htmlFor="message"
                          style={{ color: '#CBD5E1', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                          Resumo Técnico do Desafio *
                        </label>

                        {/* Botão para Acionar Escrita em Tela Cheia */}
                        <button
                          type="button"
                          onClick={() => setIsFullscreenMessage(true)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#94A3B8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: `all ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}`
                          }}
                          className="fullscreen-toggle-btn"
                          title="Abrir editor amplo em tela cheia"
                        >
                          <Maximize2 size={12} />
                          <span>Escrever em tela cheia</span>
                        </button>
                      </div>

                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={4}
                        maxLength={MAX_CHARS_MESSAGE}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Ex: Precisamos de projeto de tanque com escada conforme NR-12 e memorial de cálculo..."
                        className="contact-input"
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    {/* Botão de Envio Direto (Padrão ForgeX) */}
                    <button
                      type="submit"
                      className="btn-industrial btn-blue-forgex"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontSize: '0.94rem',
                        fontWeight: 700,
                        marginTop: '6px'
                      }}
                    >
                      <span>Iniciar Atendimento de Engenharia</span>
                      <ArrowUpRight size={18} />
                    </button>
                  </form>
                )}

              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 5. MODAL DE REDAÇÃO TÉCNICA EM TELA CHEIA (MODO FOCO DISTRACTION-FREE) */}
      {isFullscreenMessage && (
        <div
          onClick={() => setIsFullscreenMessage(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(9, 14, 23, 0.94)',
            backdropFilter: 'blur(8px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
            animation: `fadeInFullscreen ${FULLSCREEN_MODAL_DURATION} ${CONTACT_TRANSITION_EASE}`
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
              height: '82vh',
              maxHeight: '740px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden'
            }}
          >
            {/* Topo do Modal de Tela Cheia */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid #1E293B',
              backgroundColor: '#0F172A'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Maximize2 size={18} color="#0066FF" />
                <div>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Especificação Técnica do Desafio
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                    MODO FOCO EM TELA CHEIA
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFullscreenMessage(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
                aria-label="Fechar tela cheia"
              >
                <X size={22} />
              </button>
            </div>

            {/* Área Ampla de Texto */}
            <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
              <textarea
                autoFocus
                value={formData.message}
                name="message"
                maxLength={MAX_CHARS_MESSAGE}
                onChange={handleChange}
                placeholder="Descreva detalhadamente o desafio técnico da sua indústria:&#10;&#10;• Tipo de equipamento ou estrutura (ex: Tanque, Moenda, Tubulação, Dispositivo)&#10;• Normas técnicas requeridas (ex: NR-12, ASME VIII, API 650, NBR 8800)&#10;• Materiais preferenciais (ex: Aço Carbono ASTM A36, Inox 304/316)&#10;• Prazos de fabricação e tolerâncias estimadas"
                style={{
                  width: '100%',
                  flex: 1,
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FFFFFF',
                  padding: '18px',
                  fontSize: '0.98rem',
                  lineHeight: 1.65,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'var(--font-body)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Rodapé com Contador de Palavras (Até 5.000) e Botão de Conclusão */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 24px',
              borderTop: '1px solid #1E293B',
              backgroundColor: '#05080E'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                <strong style={{ color: countWords(formData.message) > 4800 ? '#F59E0B' : '#38BDF8' }}>
                  {countWords(formData.message)}
                </strong> / 5.000 palavras ({formData.message.length} caracteres) • Pressione ESC para fechar
              </span>

              <button
                type="button"
                onClick={() => setIsFullscreenMessage(false)}
                className="btn-industrial btn-blue-forgex"
                style={{
                  padding: '9px 20px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                <span>Concluir Redação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTILOS ESPECÍFICOS & ACESSIBILIDADE */}
      <style>{`
        .contact-input {
          width: 100%;
          background-color: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: var(--radius-sm);
          padding: 10px 14px;
          color: #FFFFFF;
          font-family: var(--font-body);
          font-size: 0.88rem;
          outline: none;
          transition: border-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}, background-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE};
          box-sizing: border-box;
        }

        .contact-input:focus {
          border-color: #0066FF;
          background-color: rgba(15, 23, 42, 0.95);
          box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.25);
        }

        .contact-channel-card:hover {
          transform: translateY(${CONTACT_BUTTON_HOVER_Y});
          border-color: rgba(255, 255, 255, 0.35);
          background-color: rgba(255, 255, 255, 0.06);
        }

        .btn-blue-forgex {
          background-color: #0066FF;
          color: #FFFFFF !important;
          border-color: #0066FF;
          border-radius: var(--radius-sm);
          transition: transform ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE}, background-color ${CONTACT_TRANSITION_DURATION} ${CONTACT_TRANSITION_EASE};
        }

        .btn-blue-forgex:hover {
          background-color: #0052CC;
          border-color: #0052CC;
          transform: translateY(${CONTACT_BUTTON_HOVER_Y});
        }
        .fullscreen-toggle-btn:hover {
          background-color: rgba(255, 255, 255, 0.12) !important;
          color: #FFFFFF !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        @keyframes fadeInFullscreen {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
