export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const apiPath = url.pathname.replace(/^\/api\/met\/?/, '');
  const metUrl = new URL(`https://api.met.gov.my/v2.1/${apiPath}`);
  metUrl.search = url.search;

  try {
    const metResponse = await fetch(metUrl.toString(), {
      headers: { Authorization: `METToken ${process.env.MET_TOKEN ?? ''}` },
    });
    const body = await metResponse.text();
    return new Response(body, {
      status: metResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Upstream fetch failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
