import { Link } from 'react-router-dom';
import './button-colorful.css';

/**
 * ButtonColorful — animated shimmer/glow button
 *
 * variant="primary"  cyan gradient + shimmer sweep (default)
 * variant="outline"  dark bg + animated cyan border glow
 *
 * Pass `to` for React Router links, `href` for external links,
 * or `onClick` for plain buttons.
 */
export function ButtonColorful({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  style = {},
  className = '',
}) {
  const cls = `btn-cf btn-cf--${variant} ${className}`.trim();
  const inner = <span className="btn-cf__label">{children}</span>;

  if (to)   return <Link to={to} className={cls} style={style}>{inner}</Link>;
  if (href)  return <a href={href} className={cls} style={style} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <button onClick={onClick} className={cls} style={style} type="button">{inner}</button>;
}
