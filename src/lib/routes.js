export const routeToLegacyFile = {
  '/': 'index.html',
  '/atlas': 'atlas.html',
  '/rebiome': 'rebiome.html',
  '/novabiome': 'novabiome.html',
  '/team': 'team.html',
  '/careers': 'careers.html',
  '/contact': 'contact.html',
  '/evidence': 'evidence.html',
  '/privacy': 'privacy.html',
  '/terms': 'terms.html',
  '/refund': 'refund.html',
  '/signin': 'signin.html',
  '/signup': 'signup.html',
  '/account': 'account.html',
  '/admin-upload': 'admin-upload.html'
};

export const legacyHrefToRoute = {
  'index.html': '/',
  '/index.html': '/',
  'atlas.html': '/atlas',
  '/atlas.html': '/atlas',
  'rebiome.html': '/rebiome',
  '/rebiome.html': '/rebiome',
  'novabiome.html': '/novabiome',
  '/novabiome.html': '/novabiome',
  'team.html': '/team',
  '/team.html': '/team',
  'careers.html': '/careers',
  '/careers.html': '/careers',
  'contact.html': '/contact',
  '/contact.html': '/contact',
  'evidence.html': '/evidence',
  '/evidence.html': '/evidence',
  'privacy.html': '/privacy',
  '/privacy.html': '/privacy',
  'terms.html': '/terms',
  '/terms.html': '/terms',
  'refund.html': '/refund',
  '/refund.html': '/refund',
  'signin.html': '/signin',
  '/signin.html': '/signin',
  'signup.html': '/signup',
  '/signup.html': '/signup',
  'account.html': '/account',
  '/account.html': '/account',
  'admin-upload.html': '/admin-upload',
  '/admin-upload.html': '/admin-upload'
};

export function toSpaPath(rawHref) {
  if (!rawHref) return null;
  if (rawHref.startsWith('#')) return rawHref;
  if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return null;
  if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) return null;

  const [withoutHash, hashPart] = rawHref.split('#');
  const [pathPart, queryPart] = withoutHash.split('?');
  const mapped = legacyHrefToRoute[pathPart];

  if (!mapped) return null;

  let next = mapped;
  if (queryPart) next += `?${queryPart}`;
  if (hashPart) next += `#${hashPart}`;
  return next;
}
