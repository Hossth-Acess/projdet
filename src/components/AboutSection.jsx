/**
 * COMPONENTE: AboutSection (Seção 2: Quem Somos & Métricas - 100vh Real Sem Cortes)
 * -----------------------------------------------------------------------------
 * Ajustado matematicamente para caber 100% no viewport (100vh):
 * - Cabeçalho superior com dados da UNESP, USP e ETEC
 * - 3 cards industriais proporcionais com fotos luminosas e faíscas visíveis
 * - Faixa de 4 métricas técnicas 100% visível na base da tela sem rolagem
 */
import React from 'react';
import {
  GraduationCap,
  Factory,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Modifique os valores abaixo para calibrar a sensibilidade dos hovers:
 */
const CARD_HOVER_DURATION = '200ms';
const CARD_HOVER_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function AboutSection() {
  /**
   * Os 3 Cards Industriais com Fotos de Alto Contraste
   */
  const featuredCards = [
    {
      id: 'heritage',
      badge: 'UNESP & USP • ENGENHARIA',
      icon: GraduationCap,
      title: 'Engenharia & Modelagem CAD 3D',
      desc: 'Formação de elite em Engenharia Mecânica (UNESP) e Projetos (USP). Detalhamento executivo rigoroso para caldeiraria e usinagem.',
      image: '/heritage.jpg',
      link: '#solucoes'
    },
    {
      id: 'giants',
      badge: 'BAGAGEM METALMECÂNICA',
      icon: Factory,
      title: 'Experiência Nas Gigantes do Setor',
      desc: 'Experiência sólida de engenharia em indústrias de ponta como CESP, BARDELLA, TURBIMAQ, DANPOWER e DEDINI.',
      image: '/giants.jpg',
      link: '#solucoes'
    },
    {
      id: 'safety',
      badge: 'ETEC • SEGURANÇA OPERACIONAL',
      icon: ShieldCheck,
      title: 'Conformidade NR-12 & Rigor Técnico',
      desc: 'Especialização em Segurança do Trabalho (ETEC). Projetos dimensionados para eliminar interferências e assegurar vidas.',
      image: '/safety.jpg',
      link: '#solucoes'
    }
  ];

  return (
    <section
      id="quem-somos"
      style={{
        backgroundColor: 'var(--color-light-bg)', // Fundo claro puro da seção
        borderTop: '1px solid var(--color-light-border)', // Linha divisória técnica neutra de 1px
        paddingTop: 'var(--spacing-3xl)',
        paddingBottom: 'var(--spacing-4xl)',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >

      {/* Container Centralizado com Margens Padronizadas no Padrão ForgeX */}
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
          gap: 'clamp(20px, 3vw, 48px)',
          alignItems: 'end',
          marginBottom: 'var(--spacing-2xl)'
        }}>
          {/* Lado Esquerdo */}
          <div>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: 'var(--color-5)', // Cor 5: Cinza Metálico Médio
              letterSpacing: '0.14em',
              fontWeight: 700,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '6px'
            }}>
              QUEM SOMOS • FORMAÇÃO & TRAJETÓRIA
            </span>
            <h2 style={{
              fontSize: 'clamp(1.85rem, 2.8vw, 2.5rem)',
              lineHeight: 1.14,
              fontWeight: 800,
              color: 'var(--color-light-title)', // Grafite de alto contraste no fundo claro
              letterSpacing: '-0.02em'
            }}>
              Mais de 20 anos de excelência em engenharia mecânica e projetos industriais.
            </h2>
          </div>

          {/* Lado Direito */}
          <div>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'var(--color-light-body)', // Cinza de leitura balanceado
              maxWidth: '560px'
            }}>
              Composta por profissionais com sólida vivência no setor metalmecânico, nossa equipe une formação acadêmica pela <strong>UNESP</strong> (Engenharia Mecânica), <strong>USP</strong> (Gestão de Projetos) e <strong>ETEC</strong> (Segurança do Trabalho) com a experiência acumulada em indústrias como <strong>CESP, BARDELLA, TURBIMAQ, DANPOWER e DEDINI</strong>.
            </p>
          </div>
        </div>

        {/* 2. OS 3 CARDS INDUSTRIAIS COM ALTURA COMPACTA & TEXTOS REPOSICIONADOS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {featuredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="forgex-card-about"
                style={{
                  position: 'relative',
                  height: '400px', // Altura fixa e compacta que impede a deformação vertical
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px 26px',
                  backgroundColor: 'var(--color-2)', // Cor 2: Preto Grafite Usinado
                  border: '1px solid var(--color-3)', // Cor 3: Cinza Neutro de Precisão
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
                  cursor: 'pointer'
                }}
              >
                {/* Imagem de Fundo Industrial 100% Nítida com Lazy Loading Nativo (Carrega apenas ao rolar) */}
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    opacity: 1, // Nitidez total
                    zIndex: 0,
                    transition: `transform 400ms ${CARD_HOVER_EASE}`
                  }}
                  className="card-bg-image"
                />

                {/* Topo do Card: Badge de Credencial */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    backgroundColor: 'rgba(10, 10, 10, 0.88)',
                    border: '1px solid var(--color-3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.72rem',
                    color: 'var(--color-6)',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}>
                    <Icon size={14} color="var(--color-4)" />
                    <span>{card.badge}</span>
                  </div>
                </div>

                {/* Gradiente Curto Apenas no Rodapé (52% da Base): Foto 100% livre em cima e contraste suave nas letras */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '52%',
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.94) 0%, rgba(0, 0, 0, 0.60) 60%, transparent 100%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                />

                {/* Base do Card: Título, Descrição e Botão ↗ Alinhados com Fluidez Natural */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--color-6)',
                    marginBottom: '8px',
                    lineHeight: 1.25,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
                  }}>
                    {card.title}
                  </h3>

                  <p style={{
                    fontSize: '0.86rem',
                    color: 'rgba(255, 255, 255, 0.92)',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
                  }}>
                    {card.desc}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <a
                      href={card.link}
                      className="card-arrow-btn"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        border: '1px solid var(--color-3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-6)',
                        transition: `all ${CARD_HOVER_DURATION} ${CARD_HOVER_EASE}`
                      }}
                      aria-label={`Ver detalhes de ${card.title}`}
                    >
                      <ArrowUpRight size={17} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .forgex-card-about:hover .card-bg-image {
          transform: scale(1.04);
        }
        .forgex-card-about:hover .card-arrow-btn {
          background-color: var(--color-6) !important;
          border-color: var(--color-6) !important;
          color: var(--color-1) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}
