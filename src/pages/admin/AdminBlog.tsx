import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminAuthError, adminFetch } from "@/lib/adminAuth";

const statusFilters = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
] as const;

interface AdminBlogPost {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published";
  author: string;
  updatedAt: string;
}

interface PostsResponse {
  posts: AdminBlogPost[];
  total: number;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });

const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: "100" });
      if (status) params.set("status", status);

      const data = await adminFetch<PostsResponse>(`/api/blog/admin?${params}`);
      setPosts(data.posts ?? []);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (post: AdminBlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    try {
      await adminFetch(`/api/blog/admin/${post.slug}`, { method: "DELETE" });
      toast.success("Post deleted.");
      void load();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and publish posts.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value || "all"}
                size="sm"
                variant={status === filter.value ? "secondary" : "ghost"}
                onClick={() => setStatus(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <Button size="sm" asChild>
            <Link to="/admin/blog/new">New post</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Blog posts</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="space-y-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button size="sm" variant="outline" onClick={() => void load()}>
                Retry
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post._id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>{post.category}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(post.updatedAt)}</TableCell>
                    <TableCell className="space-x-1 text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/admin/blog/${post.slug}`}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void remove(post)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBlog;
