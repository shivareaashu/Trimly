const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Resolves the tenant slug dynamically from the hostname, URL query parameters, or local storage fallback.
 * E.g., royalsalon.trimly.app -> 'royalsalon'
 */
export function getTenantSlug() {
  if (typeof window === 'undefined') return '';
  
  const urlParams = new URLSearchParams(window.location.search);
  const querySlug = urlParams.get('tenant');
  if (querySlug) return querySlug;

  const host = window.location.hostname;
  if (host.includes('.trimly.app')) {
    return host.split('.trimly.app')[0];
  }
  
  // Localhost development fallback
  return localStorage.getItem('trimly_public_slug') || 'luxury-salon';
}

/**
 * Common fetch wrapper that automatically appends tenant context headers.
 */
async function fetchWithTenant(url, options = {}) {
  const slug = getTenantSlug();
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-slug': slug,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

/**
 * API client methods for the public booking portal.
 */
export const bookingApi = {
  getConfig: () => {
    return fetchWithTenant('/api/public/bookings/config');
  },

  getServices: () => {
    return fetchWithTenant('/api/public/bookings/services');
  },

  getStaff: (serviceId) => {
    return fetchWithTenant(`/api/public/bookings/staff?serviceId=${serviceId}`);
  },

  getSlots: (date, serviceId, staffId) => {
    let url = `/api/public/bookings/slots?date=${date}&serviceId=${serviceId}`;
    if (staffId) {
      url += `&staffId=${staffId}`;
    }
    return fetchWithTenant(url);
  },

  holdSlot: (serviceId, staffId, startTime) => {
    return fetchWithTenant('/api/public/bookings/hold', {
      method: 'POST',
      body: JSON.stringify({ serviceId, staffId, startTime }),
    });
  },

  createBooking: (payload) => {
    return fetchWithTenant('/api/public/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
