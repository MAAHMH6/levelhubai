import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface SubjectRelatedBlogsProps {
  program: string;
  subject: string;
}

export function SubjectRelatedBlogs({ program, subject }: SubjectRelatedBlogsProps) {
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["subject-related-blogs", program, subject],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("slug, title, excerpt, category")
        .eq("published", true)
        .eq("featured_on_subject_page", true)
        .ilike("program", program)
        .ilike("subject", subject)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching related blogs:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!program && !!subject,
  });

  if (isLoading || blogs.length === 0) return null;

  // Group blogs into the requested categories
  const prepRevisionScoring = blogs.filter(b => ["Preparation", "Revision", "Scoring"].includes(b.category || ""));
  const topicGuides = blogs.filter(b => b.category === "Topic Guide");
  
  // If no categorization exists or they don't map cleanly, just fallback to whatever was fetched.
  const mainBlogs = prepRevisionScoring.length > 0 ? prepRevisionScoring.slice(0, 4) : blogs.slice(0, 4);
  const secondaryBlogs = topicGuides.length > 0 ? topicGuides.slice(0, 4) : blogs.slice(4, 8);

  return (
    <section className="py-16 mt-8 border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl font-bold font-display mb-2 text-foreground">Related Blogs</h2>
        <p className="text-muted-foreground mb-10">Read our latest guides and tips for {program} {subject}.</p>
        
        <div className="space-y-12">
          {mainBlogs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1.5 rounded-lg">📚</span> 
                Preparation & Revision
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainBlogs.map(blog => (
                  <Link key={blog.slug} to={`/blog/${blog.slug}`} className="group h-full">
                    <article className="h-full flex flex-col rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all">
                      <Badge variant="outline" className="w-fit mb-3 text-xs bg-background">
                        {blog.category || "Guide"}
                      </Badge>
                      <h4 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center text-primary text-sm font-medium mt-auto">
                        Read more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {secondaryBlogs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-accent/10 text-accent p-1.5 rounded-lg">🎯</span> 
                Topic Guides
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {secondaryBlogs.map(blog => (
                  <Link key={blog.slug} to={`/blog/${blog.slug}`} className="group h-full">
                    <article className="h-full flex flex-col rounded-xl border border-border bg-card p-5 hover:shadow-lg hover:border-accent/30 transition-all">
                      <Badge variant="outline" className="w-fit mb-3 text-xs bg-background">
                        {blog.category || "Topic Guide"}
                      </Badge>
                      <h4 className="font-display font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                        {blog.title}
                      </h4>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center text-accent text-sm font-medium mt-auto">
                        Read more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
