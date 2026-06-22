'use client';

import { ArrowUp, Headphones, Home, PackageSearch, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GlobalUIShell() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <nav className="global-quick-dock" aria-label="Quick actions">
        <a href="/" aria-label="Home"><Home size={18} /><span>Home</span></a>
        <a href="/products" aria-label="Products"><PackageSearch size={18} /><span>Shop</span></a>
        <a href="/cart" aria-label="Cart"><ShoppingCart size={18} /><span>Cart</span></a>
        <a href="/help-center" aria-label="Help"><Headphones size={18} /><span>Help</span></a>
      </nav>
      <button type="button" className={`scroll-top-btn ${visible ? 'show' : ''}`} onClick={goTop} aria-label="Scroll to top">
        <ArrowUp size={18} />
      </button>
    </>
  );
}
