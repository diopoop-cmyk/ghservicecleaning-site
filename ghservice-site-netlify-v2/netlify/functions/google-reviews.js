// Netlify Function: /.netlify/functions/google-reviews
// Requires env vars:
// - GOOGLE_PLACES_API_KEY
// - GOOGLE_PLACE_ID
//
// Returns: { rating, user_ratings_total, reviews: [...] }

export default async (request, context) => {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if(!key || !placeId){
    return new Response(JSON.stringify({error:"Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID"}), {
      status: 400,
      headers: {"content-type":"application/json"}
    });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "rating,user_ratings_total,reviews");
  url.searchParams.set("reviews_sort", "newest");
  url.searchParams.set("key", key);

  try{
    const res = await fetch(url.toString(), {headers: {"accept":"application/json"}});
    const data = await res.json();

    if(data.status !== "OK"){
      return new Response(JSON.stringify({error:data.status, details:data.error_message || null}), {
        status: 502,
        headers: {"content-type":"application/json"}
      });
    }

    return new Response(JSON.stringify(data.result), {
      status: 200,
      headers: {"content-type":"application/json", "cache-control":"public, max-age=900"}
    });
  }catch(e){
    return new Response(JSON.stringify({error:"fetch_failed"}), {
      status: 500,
      headers: {"content-type":"application/json"}
    });
  }
};
