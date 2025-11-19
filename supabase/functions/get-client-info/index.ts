import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';

    // Get user agent and hostname
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const hostname = new URL(req.url).hostname;

    // Parse device info from user agent with more details
    const deviceInfo = {
      userAgent,
      hostname,
      platform: getUserAgentPlatform(userAgent),
      browser: getUserAgentBrowser(userAgent),
      isMobile: /mobile|android|iphone|ipad/i.test(userAgent),
      language: req.headers.get('accept-language')?.split(',')[0] || 'Unknown'
    };

    // Get geolocation and ISP from IP using ipapi.co (free tier: 1000 requests/day)
    let geolocation = {};
    try {
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        geolocation = {
          city: geoData.city || 'Unknown',
          region: geoData.region || 'Unknown',
          country: geoData.country_name || 'Unknown',
          isp: geoData.org || 'Unknown',
          latitude: geoData.latitude || null,
          longitude: geoData.longitude || null,
          timezone: geoData.timezone || 'Unknown',
          postal: geoData.postal || 'Unknown'
        };
      }
    } catch (error) {
      console.error('Error fetching geolocation:', error);
    }

    return new Response(
      JSON.stringify({
        ip_address: ip,
        device_info: deviceInfo,
        geolocation,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getUserAgentPlatform(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'Mac';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

function getUserAgentBrowser(userAgent: string): string {
  if (/edg/i.test(userAgent)) return 'Edge';
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/opera/i.test(userAgent)) return 'Opera';
  return 'Unknown';
}
