/**
 * COMPONENTE: Footer (Rodapé Industrial Técnico - Padrão ForgeX)
 * -----------------------------------------------------------------------------
 * Bloco escuro estruturado (#090E17) de ancoragem e fechamento da plataforma:
 * - Dados cadastrais, polo metalmecânico de Piracicaba e formação UNESP/USP
 * - Links rápidos de navegação interna e especialidades técnicas
 * - Canal de suporte direto B2B e atalho seguro para o Painel Administrativo
 * - Constantes comentadas no topo para ajuste fino de hover e transições
 */
import React from 'react';
import { 
  ArrowUpRight, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

/**
 * CONSTANTES DE ANIMAÇÃO E TRANSIÇÃO (AJUSTES FINOS MANUAIS)
 * -----------------------------------------------------------------------------
 * Modifique os valores abaixo para calibrar a sensibilidade dos links do rodapé:
 */
const FOOTER_TRANSITION_DURATION = '160ms'; // Tempo de resposta no hover dos links
const FOOTER_TRANSITION_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // Curva suave e precisa

export default function Footer({ onOpenPrivacy }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      style={{
        backgroundColor: 'var(--color-1)', // Cor 1: Preto Carbono Profundo (continuidade sem corte visual)
        borderTop: '1px solid var(--color-3)', // Cor 3: Borda técnica industrial de 1px
        color: 'var(--color-4)', // Cor 4: Cinza Neutro de Leitura
        paddingTop: 'var(--spacing-3xl)',
        paddingBottom: 'var(--spacing-xl)',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          width: '100%',
          paddingLeft: 'clamp(12px, 1.5vw, 24px)',
          paddingRight: 'clamp(12px, 1.5vw, 24px)',
          boxSizing: 'border-box'
        }}
      >
        {/* GRID PRINCIPAL DO RODAPÉ (4 COLUNAS TÉCNICAS) */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'clamp(24px, 3vw, 48px)',
            paddingBottom: 'var(--spacing-2xl)',
            borderBottom: '1px solid var(--color-3)'
          }}
        >
          {/* COLUNA 1: IDENTIDADE & FORMAÇÃO TÉCNICA */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img 
                src="/logo.png" 
                alt="PROJDET" 
                style={{ height: '34px', width: 'auto', filter: 'brightness(0) invert(1)' }} 
              />
              <span 
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  color: 'var(--color-6)'
                }}
              >
                PROJDET
              </span>
            </div>

            <p style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--color-4)', marginBottom: '16px' }}>
              Engenharia mecânica, projetos industriais paramétricos e detalhamento executivo de alta precisão. Formação de ponta (<strong>UNESP / USP</strong>) com mais de 20 anos de bagagem em gigantes do setor metalmecânico.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-5)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              <MapPin size={15} />
              <span>PIRACICABA - SP • BRASIL</span>
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
          <div>
            <h4 style={{ color: 'var(--color-6)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Início', href: '#inicio' },
                { label: 'Quem Somos', href: '#quem-somos' },
                { label: 'Soluções & Projetos', href: '#solucoes' },
                { label: 'Contato & Orçamentos', href: '#contato' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="footer-nav-link">
                    <ChevronRight size={14} style={{ color: 'var(--color-5)' }} />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUNA 3: ESPECIALIDADES & NORMAS */}
          <div>
            <h4 style={{ color: 'var(--color-6)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Especialidades
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Caldeiraria Pesada & Tanques (API 650)',
                'Estruturas Metálicas & Torres (NBR 8800)',
                'Tubulações Industriais & Racks (ASME B31.3)',
                'Adequação & Proteção Operacional (NR-12)',
                'Modelagem Paramétrica & Simulação 3D'
              ].map((spec, idx) => (
                <li key={idx} style={{ fontSize: '0.84rem', color: 'var(--color-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-5)' }} />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUNA 4: CONTATO DIRETO & SUPORTE */}
          <div>
            <h4 style={{ color: 'var(--color-6)', fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Engenharia Direta
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
              <a 
                href="https://wa.me/5519995977417" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-contact-link"
              >
                <Phone size={15} color="var(--color-4)" />
                <span>+55 (19) 99597-7417</span>
              </a>

              <a 
                href="mailto:contato@projdet.com.br" 
                className="footer-contact-link"
              >
                <Mail size={15} color="var(--color-4)" />
                <span>contato@projdet.com.br</span>
              </a>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '0.78rem', marginTop: '6px' }}>
                <ShieldCheck size={16} />
                <span>Projetos com ART e Rastreabilidade</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAIXA INFERIOR DE DIREITOS, CRÉDITOS E LGPD */}
        <div 
          style={{
            paddingTop: 'var(--spacing-lg)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.78rem',
            color: 'var(--color-5)'
          }}
        >
          <div>
            © {currentYear} PROJDET - Engenharia & Detalhamentos Mecânicos. Todos os direitos reservados.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <a
              href="/politica-de-privacidade"
              onClick={(e) => {
                if (onOpenPrivacy) {
                  e.preventDefault();
                  onOpenPrivacy();
                }
              }}
              style={{
                color: 'var(--color-4)',
                fontSize: '0.78rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                transition: `color ${FOOTER_TRANSITION_DURATION} ${FOOTER_TRANSITION_EASE}`
              }}
              className="footer-privacy-link"
            >
              Política de Privacidade & LGPD
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-4);
          font-size: 0.86rem;
          transition: color ${FOOTER_TRANSITION_DURATION} ${FOOTER_TRANSITION_EASE}, transform ${FOOTER_TRANSITION_DURATION} ${FOOTER_TRANSITION_EASE};
        }
        .footer-nav-link:hover {
          color: var(--color-6) !important;
          transform: translateX(3px);
        }
        .footer-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--color-4);
          transition: color ${FOOTER_TRANSITION_DURATION} ${FOOTER_TRANSITION_EASE};
        }
        .footer-contact-link:hover {
          color: var(--color-6) !important;
        }
      `}</style>
    </footer>
  );
}
