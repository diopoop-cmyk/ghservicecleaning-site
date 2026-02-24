/**
 * Netlify Function: Google reviews + photos via Places API.
 *
 * Required env vars in Netlify:
 *  - GOOGLE_API_KEY   (Google Maps Platform key with Places API enabled)
 *  - GOOGLE_PLACE_ID  (Your GBP Place ID)
 */

const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Cache on the edge for a bit (reviews/photos don’t change every minute)
      'cache-control': 'public, max-age=300, s-maxage=1800',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function toStars(rating) {
  const r = Number(rating || 0);
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return { rating: r, full, half };
}

exports.handler = async () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return json(200, {
      ok: false,
      message: 'Missing GOOGLE_API_KEY or GOOGLE_PLACE_ID env vars.',
      data: null,
    });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    // Classic Places Details fields
    fields: 'name,rating,user_ratings_total,reviews,photos,url',
    key: apiKey,
  });

  try {
    const res = await fetch(`${DETAILS_URL}?${params.toString()}`);
    const data = await res.json();

    if (data.status !== 'OK') {
      return json(200, {
        ok: false,
        message: `Google Places API status: ${data.status}${data.error_message ? ` — ${data.error_message}` : ''}`,
        data: null,
      });
    }

    const result = data.result || {};
    const reviews = Array.isArray(result.reviews) ? result.reviews : [];
    const photos = Array.isArray(result.photos) ? result.photos : [];

    const topReviews = reviews
      .slice()
      .sort((a, b) => (b.time || 0) - (a.time || 0))
      .slice(0, 8)
      .map((r) => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
        relative_time_description: r.relative_time_description,
      }));

    const topPhotos = photos
      .slice(0, 12)
      .map((p) => {
        const urlParams = new URLSearchParams({
          maxwidth: '1200',
          photo_reference: p.photo_reference,
          key: apiKey,
        });
        return {
          photo_reference: p.photo_reference,
          width: p.width,
          height: p.height,
          url: `${PHOTO_URL}?${urlParams.toString()}`,
        };
      });

    return json(200, {
      ok: true,
      data: {
        name: result.name,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total,
        stars: toStars(result.rating),
        google_url: result.url || null,
        reviews: topReviews,
        photos: topPhotos,
      },
    });
  } catch (e) {
    return json(200, { ok: false, message: String(e?.message || e), data: null });
  }
};
