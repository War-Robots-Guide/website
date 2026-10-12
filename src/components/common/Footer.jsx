
export function Footer({ onDeveloperClick, onAdazahiClick }) {
  return (
    <footer style={{ 
      borderTop: '1px solid var(--border-light)', 
      padding: '24px', 
      textAlign: 'center', 
      marginTop: '48px', 
      fontSize: '12px', 
      color: 'var(--text-muted)',
      position: 'relative',
      zIndex: 10
    }}>
      <p>
        War Robots Guide Website. Compiled by{' '}
        <span 
          onClick={onAdazahiClick} 
          className="footer-credit-link"
        >
          Adazahi
        </span>
        , Spiritings, Tropical, Mistermath314, and Running Riot. Developed by{' '}
        <span 
          onClick={onDeveloperClick} 
          className="footer-credit-link"
        >
          CrimsonHawk
        </span>
        .
      </p>
      <p style={{ marginTop: '8px', fontSize: '11px', opacity: 0.85 }}>
        This site is developed with the assistance of AI technologies, but all testing and content are written manually by humans.
      </p>
    </footer>
  );
}
