import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AdminAuthError, adminFetch } from "@/lib/adminAuth";

interface BlogPostForm {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  status: "draft" | "published";
}

const emptyForm: BlogPostForm = {
  title: "",
  excerpt: "",
  content: "",
  image: "",
  category: "",
  readTime: "5 min read",
  author: "Alphatrack Team",
  status: "draft",
};

const AdminBlogEditor = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isNew = !slug || slug === "new";

  const [form, setForm] = useState<BlogPostForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof AdminAuthError) {
        navigate("/admin/login", { replace: true });
        return;
      }
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    },
    [navigate],
  );

  useEffect(() => {
    if (isNew) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await adminFetch<{ post: BlogPostForm }>(`/api/blog/admin/${slug}`);
        if (!cancelled) setForm({ ...emptyForm, ...data.post });
      } catch (err) {
        if (!cancelled) handleError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [handleError, isNew, slug]);

  const update = <K extends keyof BlogPostForm>(key: K, value: BlogPostForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      if (isNew) {
        await adminFetch("/api/blog/admin", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("Post created.");
      } else {
        await adminFetch(`/api/blog/admin/${slug}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        toast.success("Post saved.");
      }
      navigate("/admin/blog");
    } catch (err) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "New post" : "Edit post"}
        </h1>
        {!isNew && <p className="text-sm text-muted-foreground">/blog/{slug}</p>}
      </div>

      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-title">Title</Label>
              <Input
                id="post-title"
                required
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
              />
              {isNew && (
                <p className="text-xs text-muted-foreground">
                  The URL slug is generated from the title and cannot be changed afterwards.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Input
                  id="post-category"
                  required
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-author">Author</Label>
                <Input
                  id="post-author"
                  value={form.author}
                  onChange={(event) => update("author", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-read-time">Read time</Label>
                <Input
                  id="post-read-time"
                  value={form.readTime}
                  onChange={(event) => update("readTime", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-status">Status</Label>
                <select
                  id="post-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.status}
                  onChange={(event) =>
                    update("status", event.target.value as BlogPostForm["status"])
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-image">Image URL</Label>
              <Input
                id="post-image"
                value={form.image}
                onChange={(event) => update("image", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-excerpt">Excerpt</Label>
              <Textarea
                id="post-excerpt"
                required
                rows={3}
                value={form.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="post-content" className="sr-only">
                Content
              </Label>
              <Textarea
                id="post-content"
                required
                rows={20}
                className="font-mono text-sm"
                value={form.content}
                onChange={(event) => update("content", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : isNew ? "Create post" : "Save changes"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate("/admin/blog")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogEditor;
