import { createClient } from "@supabase/supabase-js";

// Supabase initialized in handler to prevent top-level crashes

export default async function handler(req: any, res: any) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://yqvqdellxgazgkpzsxpo.supabase.co";
    // Try service role key first to bypass RLS, otherwise fallback to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdnFkZWxseGdhemdrcHpzeHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MTk3OTcsImV4cCI6MjA4MzA5NTc5N30.c8N_37h5M6ao-NLKKMSZn3AbOI2O7_R1kO4tJ4cnT-Y";
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).send("Missing Supabase URL or Key");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine domain
    const host = req.headers.host || "olevel.com.pk";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${protocol}://${host}`;
    
    // Determine if it's igcse or olevel to filter articles
    const isIgcse = host.toLowerCase().includes("igcse");
  
  const { data: articles, error } = await supabase
    .from("blog_articles")
    .select("slug, updated_at, published_at, program")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles for sitemap:", error);
    return res.status(500).json({ error: "Failed to fetch articles", details: error });
  }

  // Filter articles for the specific domain if needed
  // If program is "Both", include in both.
  const filteredArticles = (articles || []).filter(article => {
    if (!article.program) return true; // Include legacy if no program
    if (isIgcse && (article.program === "IGCSE" || article.program === "Both")) return true;
    if (!isIgcse && (article.program === "O Level" || article.program === "Both")) return true;
    return false;
  });

  const staticPages = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${baseUrl}/subjects`, priority: "0.9", changefreq: "weekly" },
    { loc: `${baseUrl}/blog`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/features`, priority: "0.8", changefreq: "monthly" },
    { loc: `${baseUrl}/pricing`, priority: "0.8", changefreq: "monthly" },
    { loc: `${baseUrl}/about`, priority: "0.7", changefreq: "monthly" },
    { loc: `${baseUrl}/privacy-policy`, priority: "0.3", changefreq: "yearly" },
    { loc: `${baseUrl}/terms-of-service`, priority: "0.3", changefreq: "yearly" },
    { loc: `${baseUrl}/cookie-policy`, priority: "0.3", changefreq: "yearly" },
  ];

  // Dynamic subjects based on program
  if (isIgcse) {
    staticPages.push({ loc: `${baseUrl}/subjects/mathematics`, priority: "0.8", changefreq: "monthly" });
  } else {
    staticPages.push({ loc: `${baseUrl}/subjects/mathematics`, priority: "0.8", changefreq: "monthly" });
    staticPages.push({ loc: `${baseUrl}/subjects/physics`, priority: "0.8", changefreq: "monthly" });
    staticPages.push({ loc: `${baseUrl}/subjects/chemistry`, priority: "0.8", changefreq: "monthly" });
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("")}
${filteredArticles.map(article => `
  <url>
    <loc>${baseUrl}/blog/${article.slug}</loc>
    <lastmod>${article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : new Date(article.published_at || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>
`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemap.trim());
  } catch (err: any) {
    console.error("Function error:", err);
    res.status(500).send(err.message || "Internal Server Error");
  }
}
