const BASE = import.meta.env.BASE_URL;

/** URL for an icon file under public/icons. */
export function iconUrl(icon) {
  if (icon.source === 'openmoji') return `${BASE}icons/openmoji/${icon.key}.svg`;
  return `${BASE}icons/phosphor/${icon.key}.svg`;
}

/**
 * Phosphor icons are rendered via CSS mask so they can be tinted with
 * background-color (the raw SVGs have a fixed black fill).
 * OpenMoji icons are full-color, rendered as <img>.
 */
export function iconEl(icon, className = '') {
  if (icon.source === 'openmoji') {
    const img = document.createElement('img');
    img.src = iconUrl(icon);
    img.alt = '';
    img.draggable = false;
    img.className = `icon icon--img ${className}`;
    return img;
  }
  const span = document.createElement('span');
  span.className = `icon icon--mask ${className}`;
  const url = `url("${iconUrl(icon)}")`;
  span.style.maskImage = url;
  span.style.webkitMaskImage = url;
  return span;
}
