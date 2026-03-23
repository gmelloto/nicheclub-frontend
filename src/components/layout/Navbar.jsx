import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../../context/index.jsx';

export default function Navbar() {
  const { items } = useCart();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(10,10,10,0.92)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 2rem', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <span style={{ color:'var(--gold)', fontSize:18 }}>◈</span>
          <span style={{ fontSize:13, fontWeight:500, letterSpacing:'0.2em', color:'var(--text)' }}>NICHE CLUB</span>
        </Link>

        <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
          {usuario ? (
            <>
              <Link to="/admin" style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text2)', textDecoration:'none' }}>Admin</Link>
              <button onClick={() => { logout(); navigate('/'); }} style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text2)', background:'none', border:'none', cursor:'pointer' }}>Sair</button>
            </>
          ) : (
            <Link to="/admin/login" style={{ fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text2)', textDecoration:'none' }}>Admin</Link>
          )}
          <Link to="/carrinho" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:2, color:'var(--text)', textDecoration:'none', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', position:'relative' }}>
            Carrinho
            {items.length > 0 && (
              <span style={{ position:'absolute', top:-8, right:-8, background:'var(--gold)', color:'#0a0a0a', width:18, height:18, borderRadius:'50%', fontSize:10, fontWeight:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {items.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
