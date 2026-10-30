/**
 * PÁGINA: PrivacyPolicyPage.jsx (Política de Privacidade & Sigilo Industrial - LGPD)
 * -----------------------------------------------------------------------------
 * Página dedicada e indexável para conformidade com a Lei Federal nº 13.709/2018 (LGPD)
 * e exigências técnicas de indexação do Googlebot, Google Ads e Google Search Console.
 * 
 * - Rota canônica: /politica-de-privacidade
 * - Estrutura legal e técnica completa para contratos de engenharia mecânica B2B
 * - Cláusula pétrea de Não Divulgação (NDA) e proteção de arquivos CAD 3D / patentes
 * - Identidade visual oficial ForgeX baseada no sistema de variáveis --color-1 a --color-6
 * - Constantes comentadas no topo para ajustes finos de transições
 */
import React, { useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Clock
} from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Modifique os valores abaixo para calibrar a sensibilidade dos botões e transições:
 */
const PRIVACY_TRANSITION_DURATION = '180ms'; // Duração das transições de hover
const PRIVACY_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva suave e precisa

export default function PrivacyPolicyPage({ onBackToHome }) {
  // Garante que a página abra sempre no topo com título otimizado para o Google
  useEffect(() => {
    window.scrollTo(0, 0);
    const previousTitle = document.title;
    document.title = 'Política de Privacidade & Sigilo Industrial | PROJDET';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-1)', // Cor 1: Fundo escuro contínuo (#0A0A0A)
      color: 'var(--color-4)', // Cor 4: Cinza Neutro de Leitura
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. CABEÇALHO DEDICADO DA PÁGINA DE POLÍTICA */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(10, 10, 10, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-3)',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '16px clamp(16px, 3vw, 36px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logotipo Oficial */}
          <a
            href="/"
            onClick={(e) => {
              if (onBackToHome) {
                e.preventDefault();
                onBackToHome();
              }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <img
              src="/logo.png"
              alt="PROJDET"
              style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '0.04em',
                color: 'var(--color-6)',
                lineHeight: 1
              }}>
                PROJDET
              </span>
              <span style={{
                fontSize: '0.62rem',
                color: 'var(--color-5)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: '2px'
              }}>
                Engenharia & Projetos
              </span>
            </div>
          </a>

          {/* Botão de Retorno ao Início */}
          <button
            type="button"
            onClick={onBackToHome}
            className="privacy-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-2)',
              border: '1px solid var(--color-3)',
              color: 'var(--color-6)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: `all ${PRIVACY_TRANSITION_DURATION} ${PRIVACY_TRANSITION_EASE}`
            }}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Início</span>
          </button>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL INSTITUCIONAL */}
      <main style={{ flex: 1, padding: 'clamp(28px, 4vh, 60px) clamp(16px, 3vw, 36px)' }}>
        <article style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Identificador de Seção & Título */}
          <div style={{ marginBottom: 'clamp(24px, 3vh, 40px)' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              backgroundColor: 'var(--color-2)',
              border: '1px solid var(--color-3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-5)',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.12em',
              marginBottom: '16px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-6)' }} />
              SEC_LEGAL // CONFORMIDADE LGPD & SIGILO B2B
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--color-6)',
              letterSpacing: '-0.02em',
              marginBottom: '14px'
            }}>
              Política de Privacidade & Proteção de Dados
            </h1>

            <p style={{
              fontSize: 'clamp(0.95rem, 1.3vw, 1.08rem)',
              lineHeight: 1.65,
              color: 'var(--color-4)',
              maxWidth: '820px'
            }}>
              A <strong>PROJDET Engenharia & Detalhamentos Mecânicos</strong> preza pelo absoluto sigilo técnico, proteção de propriedade intelectual e conformidade estrita com a <strong>Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018 - LGPD)</strong>. Este documento esclarece de maneira transparente como tratamos dados cadastrais corporativos e salvaguardamos projetos industriais proprietários.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '16px',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              color: 'var(--color-5)'
            }}>
              <span>VIGÊNCIA: OUTUBRO DE 2026</span>
              <span>•</span>
              <span>VERSÃO 2.1 (CONFORME LGPD)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* SEÇÃO 1: CONTROLADORA DOS DADOS */}
            <section className="privacy-card-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Building2 size={20} color="var(--color-6)" />
                <h2 style={{ color: 'var(--color-6)', fontSize: '1.28rem', fontWeight: 700 }}>
                  1. Identificação da Controladora
                </h2>
              </div>
              <p style={{ lineHeight: 1.65, marginBottom: '12px' }}>
                A controladora responsável pelas decisões de tratamento dos dados regulados por esta Política é a:
              </p>
              <div style={{
                backgroundColor: 'var(--color-1)',
                border: '1px solid var(--color-3)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                fontSize: '0.88rem'
              }}>
                <div>
                  <strong style={{ color: 'var(--color-6)', display: 'block' }}>Razão Social:</strong>
                  <span>PROJDET SERVICOS DE PROJETOS E DETALHAMENTOS TECNICOS LTDA</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-6)', display: 'block' }}>Classificação Nacional de Atividades (CNAE):</strong>
                  <span><strong>Principal:</strong> 7112-0/00 - Serviços de engenharia</span>
                  <br />
                  <span><strong>Secundário:</strong> 7119-7/03 - Serviços de desenho técnico relacionados à arquitetura e engenharia</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-6)', display: 'block' }}>Polo Operacional:</strong>
                  <span>Piracicaba - SP • Atendimento Nacional</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--color-6)', display: 'block' }}>Canal Oficial do Encarregado (DPO):</strong>
                  <a href="mailto:contato@projdet.com.br" style={{ color: 'var(--color-6)', textDecoration: 'underline' }}>
                    contato@projdet.com.br
                  </a>
                </div>
              </div>

              {/* BLOCO DE DESTAQUE: ARQUITETURA SEM ARMAZENAMENTO EM BANCO */}
              <div style={{
                marginTop: '16px',
                padding: '14px 18px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--color-3)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.88rem',
                lineHeight: 1.6
              }}>
                <strong style={{ color: 'var(--color-6)' }}>Arquitetura de Privacidade por Design (Zero Retenção no Site):</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-4)' }}>
                  Este website <strong>não armazena nem mantém banco de dados de visitantes ou dados pessoais submetidos</strong>. As interações iniciadas pelo formulário são transmitidas de ponta a ponta e direcionadas exclusivamente aos canais de comunicação declarados da empresa (E-mail corporativo institucional e API oficial do WhatsApp da engenharia).
                </p>
              </div>
            </section>

            {/* SEÇÃO 2: DADOS COLETADOS E FINALIDADES */}
            <section className="privacy-card-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FileText size={20} color="var(--color-6)" />
                <h2 style={{ color: 'var(--color-6)', fontSize: '1.28rem', fontWeight: 700 }}>
                  2. Dados Coletados & Finalidade Técnica
                </h2>
              </div>
              <p style={{ lineHeight: 1.65, marginBottom: '14px' }}>
                Coletamos exclusivamente dados fornecidos de forma voluntária pelo usuário através do nosso formulário de contato ou canais oficiais de WhatsApp e E-mail. Tais dados têm natureza estritamente comercial e B2B:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    title: 'Nome Completo e Telefone/WhatsApp:',
                    desc: 'Utilizados para contato técnico direto, esclarecimento de premissas de projeto e retorno ágil sobre orçamentos solicitados.'
                  },
                  {
                    title: 'Empresa / Indústria e Segmento:',
                    desc: 'Necessários para calibração das normas industriais aplicáveis (ex: ASME VIII, API 650, NBR 8800, NR-12) e dimensionamento de processos.'
                  },
                  {
                    title: 'Memorial Descritivo e Especificações:',
                    desc: 'Dados descritivos sobre equipamentos, tolerâncias, cargas e prazos fornecidos para formulação do escopo da proposta técnica.'
                  }
                ].map((item, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-3)'
                  }}>
                    <CheckCircle2 size={18} color="var(--color-6)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
                      <strong style={{ color: 'var(--color-6)' }}>{item.title} </strong>
                      {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* SEÇÃO 3: CLÁUSULA PÉTREA DE SIGILO INDUSTRIAL (NDA) */}
            <section className="privacy-card-section" style={{ borderLeft: '4px solid var(--color-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Lock size={20} color="var(--color-6)" />
                <h2 style={{ color: 'var(--color-6)', fontSize: '1.28rem', fontWeight: 700 }}>
                  3. Cláusula de Sigilo Industrial & Acordos de Não Divulgação (NDA)
                </h2>
              </div>
              <p style={{ lineHeight: 1.65, marginBottom: '12px' }}>
                Reconhecemos o valor estratégico e confidencial dos memoriais de cálculo, modelos 3D em CAD e plantas de processo de cada cliente:
              </p>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-3)',
                lineHeight: 1.6,
                fontSize: '0.90rem'
              }}>
                <strong style={{ color: 'var(--color-6)', display: 'block', marginBottom: '6px' }}>
                  Garantia Formal de Confidencialidade:
                </strong>
                Todos os arquivos, projetos executivos, croquis e plantas recebidos são protegidos sob compromisso de segredo industrial. A PROJDET firma formalmente <strong>Acordos de Não Divulgação (NDA)</strong> antes do envio de arquivos sensíveis principalmente quando exigido pelo cliente, garantindo que suas inovações e processos fabris jamais sejam expostos ou compartilhados com terceiros.
              </div>
            </section>

            {/* SEÇÃO 4: COOKIES E ARMAZENAMENTO LOCAL */}
            <section className="privacy-card-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Clock size={20} color="var(--color-6)" />
                <h2 style={{ color: 'var(--color-6)', fontSize: '1.28rem', fontWeight: 700 }}>
                  4. Cookies e Tecnologias de Sessão
                </h2>
              </div>
              <p style={{ lineHeight: 1.65, marginBottom: '10px' }}>
                Nosso site não utiliza cookies invasivos de rastreamento para comercialização de perfis ou anúncios intrusivos. Empregamos apenas:
              </p>
              <ul style={{ listStyle: 'disc', paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <li>
                  <strong style={{ color: 'var(--color-6)' }}>Cookies Estritamente Necessários:</strong> Garantem a estabilidade da navegação, carregamento acelerado de vídeos e integridade da sessão.
                </li>
                <li>
                  <strong style={{ color: 'var(--color-6)' }}>Armazenamento Local (localStorage):</strong> Registra exclusivamente sua opção de aceite do aviso de cookies para que o banner não seja exibido repetidamente a cada visita.
                </li>
              </ul>
            </section>

            {/* SEÇÃO 5: DIREITOS DO TITULAR (ART. 18 LGPD) */}
            <section className="privacy-card-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <ShieldCheck size={20} color="var(--color-6)" />
                <h2 style={{ color: 'var(--color-6)', fontSize: '1.28rem', fontWeight: 700 }}>
                  5. Seus Direitos como Titular (Art. 18 da LGPD)
                </h2>
              </div>
              <p style={{ lineHeight: 1.65, marginBottom: '12px' }}>
                A LGPD assegura a você os seguintes direitos mediante requisição simplificada e gratuita ao nosso Encarregado de Dados:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '12px'
              }}>
                {[
                  'Confirmação da existência de tratamento dos seus dados de contato',
                  'Acesso facilitado aos dados corporativos armazenados',
                  'Correção imediata de dados incompletos, inexatos ou desatualizados',
                  'Eliminação e expurgo de dados coletados após conclusão do orçamento',
                  'Revogação do consentimento para recebimento de comunicações futuras'
                ].map((text, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--color-1)',
                    border: '1px solid var(--color-3)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--color-6)', flexShrink: 0 }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SEÇÃO 6: CANAL DE COMUNICAÇÃO OFICIAL */}
            <section className="privacy-card-section">
              <h2 style={{ color: 'var(--color-6)', fontSize: '1.28rem', fontWeight: 700, marginBottom: '12px' }}>
                6. Canal de Atendimento de Privacidade
              </h2>
              <p style={{ lineHeight: 1.65, marginBottom: '16px' }}>
                Para exercer qualquer direito previsto na LGPD, solicitar certidões ou assinar um Acordo de Não Divulgação (NDA) prévio ao envio de desenhos industriais, entre em contato diretamente com nossa equipe:
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <a
                  href="mailto:contato@projdet.com.br?subject=Requisi%C3%A7%C3%A3o%20LGPD%20-%20PROJDET"
                  className="privacy-action-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-2)',
                    border: '1px solid var(--color-3)',
                    color: 'var(--color-6)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={18} />
                  <span>contato@projdet.com.br</span>
                </a>

                <a
                  href="https://wa.me/5519995977417?text=Ol%C3%A1%2C%20gostaria%20de%20tratar%20sobre%20privacidade%20e%20acordo%20de%20confidencialidade."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="privacy-action-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-2)',
                    border: '1px solid var(--color-3)',
                    color: 'var(--color-6)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={18} />
                  <span>+55 (19) 99597-7417</span>
                </a>
              </div>
            </section>

          </div>
        </article>
      </main>

      {/* 3. RODAPÉ DA PÁGINA DE POLÍTICA */}
      <footer style={{
        borderTop: '1px solid var(--color-3)',
        backgroundColor: 'var(--color-1)',
        padding: '24px clamp(16px, 3vw, 36px)',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--color-5)'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>© {new Date().getFullYear()} PROJDET Engenharia & Detalhamento Mecânico. Todos os direitos reservados.</span>
          <button
            type="button"
            onClick={onBackToHome}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-6)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ← Voltar à Página Inicial
          </button>
        </div>
      </footer>

      {/* ESTILOS DE HOVER E ELEVAÇÃO */}
      <style>{`
        .privacy-card-section {
          background-color: var(--color-2);
          border: 1px solid var(--color-3);
          border-radius: var(--radius-card);
          padding: clamp(20px, 3vw, 32px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }

        .privacy-back-btn:hover {
          background-color: var(--color-3) !important;
          border-color: #404040 !important;
          transform: translateY(-1px);
        }

        .privacy-action-link {
          transition: transform ${PRIVACY_TRANSITION_DURATION} ${PRIVACY_TRANSITION_EASE},
                      border-color ${PRIVACY_TRANSITION_DURATION} ${PRIVACY_TRANSITION_EASE},
                      background-color ${PRIVACY_TRANSITION_DURATION} ${PRIVACY_TRANSITION_EASE};
        }

        .privacy-action-link:hover {
          background-color: var(--color-3) !important;
          border-color: var(--color-6) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

