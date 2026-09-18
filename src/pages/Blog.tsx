import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const { data: blogArticles = [], isLoading } = useQuery({
    queryKey: ["published-blog-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const baseUrl = window.location.origin;

  const subjects = useMemo(() => {
    const subs = new Set<string>();
    blogArticles.forEach(a => {
      if (a.subject) subs.add(a.subject);
    });
    return ["All", ...Array.from(subs).sort()];
  }, [blogArticles]);

  const filteredArticles = useMemo(() => {
    if (selectedSubject === "All") return blogArticles;
    return blogArticles.filter(a => a.subject === selectedSubject);
  }, [blogArticles, selectedSubject]);

  const featured = filteredArticles.find((a) => a.featured);
  const igcseArticles = filteredArticles.filter((a) => !a.featured && (a.program === "IGCSE" || a.program === "Both"));
  const olevelArticles = filteredArticles.filter((a) => !a.featured && (a.program === "O Level" || a.program === "Both"));

  return (
    <>
      <Helmet>
        <title>O-Level & IGCSE Blog | Study Tips, Past Papers & Exam Guides | LevelHubAI</title>
        <meta name="description" content="Expert O-Level study guides, exam tips, past paper strategies, and subject guides for Cambridge students in Pakistan. Free resources to help you ace your exams." />
        <meta property="og:title" content="O-Level & IGCSE Blog | Study Tips & Exam Guides | LevelHubAI" />
        <meta property="og:description" content="Expert O-Level study guides, exam tips, and strategies for Cambridge students in Pakistan." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/blog`} />
        <link rel="canonical" href={`${baseUrl}/blog`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "LevelHubAI O-Level & IGCSE Blog",
          "description": "Expert study guides and exam tips for Cambridge O-Level & IGCSE students in Pakistan",
          "url": `${baseUrl}/blog`,
          "publisher": {
            "@type": "Organization",
            "name": "LevelHubAI",
            "url": baseUrl
          }
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <section className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
              O-Level & IGCSE Resources
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              O-Level & IGCSE Study Blog
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Expert guides, exam strategies, and study tips to help Cambridge O-Level & IGCSE students in Pakistan achieve top grades.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
            Loading articles...
          </div>
        ) : (
          <>
            {/* Filters */}
            {subjects.length > 1 && (
              <section className="py-4 border-b">
                <div className="container mx-auto px-4 flex items-center gap-4 overflow-x-auto pb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap">
                    <Filter className="w-4 h-4" /> Filter by Subject:
                  </div>
                  {subjects.map(sub => (
                    <Button 
                      key={sub} 
                      variant={selectedSubject === sub ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubject(sub)}
                      className="rounded-full whitespace-nowrap"
                    >
                      {sub}
                    </Button>
                  ))}
                </div>
              </section>
            )}

            {/* Featured Article */}
            {featured && (
              <section className="py-8">
                <div className="container mx-auto px-4">
                  <Link to={`/blog/${featured.slug}`} className="group block">
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8 md:p-12 flex items-center">
                          <div className="w-full text-center md:text-left">
                            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Featured</Badge>
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                              {featured.title}
                            </h2>
                            <p className="text-muted-foreground mb-6 line-clamp-3">{featured.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(featured.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{featured.read_time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-12">
                          <div className="text-8xl">📚</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </section>
            )}

            {/* O-Level Articles */}
            {olevelArticles.length > 0 && (
              <section className="py-12">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-2xl font-bold text-foreground">O-Level Articles</h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20">O Level</Badge>
                  </div>
                  <p className="text-muted-foreground mb-8">Cambridge O-Level study guides, past papers and subject tips.</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {olevelArticles.map((article) => (
                      <Link key={article.slug} to={`/blog/${article.slug}`} className="group">
                        <article className="rounded-xl border border-border bg-card p-6 h-full flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                          <Badge variant="outline" className="w-fit mb-3 text-xs">{article.category}</Badge>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">{article.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_time}</span>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* IGCSE Articles */}
            {igcseArticles.length > 0 && (
              <section className="py-12 bg-secondary/30">
                <div className="container mx-auto px-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-2xl font-bold text-foreground">Cambridge IGCSE Articles</h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20">IGCSE</Badge>
                  </div>
                  <p className="text-muted-foreground mb-8">IGCSE preparation guides, past paper strategies and subject-specific tips for Cambridge IGCSE students.</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {igcseArticles.map((article) => (
                      <Link key={article.slug} to={`/blog/${article.slug}`} className="group">
                        <article className="rounded-xl border border-border bg-card p-6 h-full flex flex-col hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                          <Badge variant="outline" className="w-fit mb-3 text-xs">{article.category}</Badge>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">{article.excerpt}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.read_time}</span>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Start Practicing O-Level & IGCSE Questions for Free
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join thousands of students using LevelHubAI to prepare for their Cambridge exams.
              </p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Create Free Account <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Blog;
