
export function Footer({ onDeveloperClick }) {
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
        War Robots Guide Website. Compiled by Adazahi, Spiritings, Tropical, mistermaths, and Running Riot. Developed by{' '}
        <span 
          onClick={onDeveloperClick} 
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          CrimsonHawk
        </span>
        .
      </p>
    </footer>
  );
}
