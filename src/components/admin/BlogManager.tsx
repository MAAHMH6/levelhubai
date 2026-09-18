import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { BulkBlogImport } from "./BulkBlogImport";

interface BlogForm {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  featured: boolean;
  featured_on_subject_page: boolean;
  published: boolean;
  keywords: string;
  program: string;
  subject: string;
  topic: string;
  author: string;
}

const emptyForm: BlogForm = {
  slug: "",
  title: "",
  meta_title: "",
  meta_description: "",
  excerpt: "",
  content: "",
  category: "Preparation",
  read_time: "5 min read",
  featured: false,
  featured_on_subject_page: false,
  published: true,
  keywords: "",
  program: "O Level",
  subject: "",
  topic: "",
  author: "Admin",
};

const BlogManager = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);

  // Filters state
  const [filterProgram, setFilterProgram] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPublished, setFilterPublished] = useState("All");
  const [filterFeatured, setFilterFeatured] = useState("All");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["admin-blog-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: dbSubjects = [] } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("subjects")
        .select("id, name, qualification")
        .order("name");
      return data || [];
    },
  });

  // Filter subjects based on the form's selected program
  const formSubjects = useMemo(() => {
    if (form.program === "A Level") {
      return dbSubjects.filter(s => s.qualification === "a_level");
    } else if (form.program === "O Level" || form.program === "IGCSE") {
      return dbSubjects.filter(s => s.qualification !== "a_level");
    }
    return dbSubjects;
  }, [form.program, dbSubjects]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowDialog(true);
  };

  const openEdit = (article: any) => {
    setForm({
      slug: article.slug,
      title: article.title,
      meta_title: article.meta_title || "",
      meta_description: article.meta_description || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      category: article.category || "Preparation",
      read_time: article.read_time || "5 min read",
      featured: article.featured || false,
      featured_on_subject_page: article.featured_on_subject_page || false,
      published: article.published ?? true,
      keywords: (article.keywords || []).join(", "),
      program: article.program || "O Level",
      subject: article.subject || "",
      topic: article.topic || "",
      author: article.author || "Admin",
    });
    setEditingId(article.id);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.title) {
      toast.error("Slug and title are required");
      return;
    }

    const payload = {
      slug: form.slug,
      title: form.title,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      excerpt: form.excerpt || null,
      content: form.content || null,
      category: form.category,
      read_time: form.read_time,
      featured: form.featured,
      featured_on_subject_page: form.featured_on_subject_page,
      published: form.published,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
      program: form.program,
      subject: form.subject || null,
      topic: form.topic || null,
      author: form.author || 'Admin',
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("blog_articles").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("blog_articles").insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? "Article updated" : "Article created");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-articles"] });
      setShowDialog(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("blog_articles").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-articles"] });
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    await supabase.from("blog_articles").update({ published: !published }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-blog-articles"] });
  };

  // Filtered articles
  const filteredArticles = articles.filter((a: any) => {
    if (filterProgram !== "All" && a.program !== filterProgram) return false;
    if (filterSubject !== "All" && a.subject !== filterSubject) return false;
    if (filterCategory !== "All" && a.category !== filterCategory) return false;
    if (filterPublished !== "All") {
      if (filterPublished === "Published" && !a.published) return false;
      if (filterPublished === "Draft" && a.published) return false;
    }
    if (filterFeatured !== "All") {
      if (filterFeatured === "Yes" && !a.featured_on_subject_page) return false;
      if (filterFeatured === "No" && a.featured_on_subject_page) return false;
    }
    return true;
  });

  // Unique lists for filters
  const allPrograms = Array.from(new Set(articles.map((a: any) => a.program).filter(Boolean)));
  const allSubjects = Array.from(new Set(articles.map((a: any) => a.subject).filter(Boolean)));
  const allCategories = Array.from(new Set(articles.map((a: any) => a.category).filter(Boolean)));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Articles ({filteredArticles.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <BulkBlogImport onSuccess={() => queryClient.invalidateQueries({ queryKey: ["admin-blog-articles"] })} />
                <Button onClick={openCreate} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> New Article
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
                <option value="All">All Programmes</option>
                {allPrograms.map((p: any) => <option key={p} value={p}>{p}</option>)}
              </select>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="All">All Subjects</option>
                {allSubjects.map((s: any) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">All Types</option>
                {allCategories.map((c: any) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={filterPublished} onChange={(e) => setFilterPublished(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={filterFeatured} onChange={(e) => setFilterFeatured(e.target.value)}>
                <option value="All">All Featured</option>
                <option value="Yes">Featured on Subject</option>
                <option value="No">Not Featured</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filteredArticles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No blog articles match your filters</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Programme</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Subj. Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredArticles.map((article: any) => (
                    <tr key={article.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]">{article.title}</td>
                      <td className="px-4 py-3">{article.program}</td>
                      <td className="px-4 py-3">{article.subject || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{article.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={article.published ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {article.featured_on_subject_page ? (
                          <Badge variant="secondary">Yes</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublished(article.id, article.published)}>
                            {article.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(article)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteArticle(article.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Article" : "Create Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-article-slug" />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Programme</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={form.program} 
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                >
                  <option value="O Level">O Level</option>
                  <option value="IGCSE">IGCSE</option>
                  <option value="A Level">A Level</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={form.subject} 
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                >
                  <option value="">-- Select Subject --</option>
                  {formSubjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Blog Category / Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={form.category} 
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Preparation">Preparation</option>
                  <option value="Revision">Revision</option>
                  <option value="Scoring">Scoring</option>
                  <option value="Topic Guide">Topic Guide</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Algebra" />
              </div>
              <div className="space-y-2">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} className="min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label>Content (HTML/Markdown)</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[200px] font-mono text-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Read Time</Label>
                <Input value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <Label>Featured (Main Blog Page)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured_on_subject_page} onCheckedChange={(v) => setForm({ ...form, featured_on_subject_page: v })} />
                <Label className="font-semibold text-primary">Featured on Subject Page</Label>
              </div>
            </div>
            
            <Button onClick={handleSave} className="w-full">
              {editingId ? "Update Article" : "Create Article"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogManager;
