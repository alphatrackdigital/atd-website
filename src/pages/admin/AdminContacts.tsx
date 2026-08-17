import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PAGE_SIZE = 25;

const sourceFilters = [
  { value: "", label: "All sources" },
  { value: "contact_form", label: "Contact form" },
  { value: "tracking_audit_offer", label: "Tracking audit" },
] as const;

const sourceLabels: Record<string, string> = {
  contact_form: "Contact form",
  tracking_audit_offer: "Tracking audit",
  newsletter: "Newsletter",
};

interface AdminContact {
  _id: string;
  source: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  message?: string;
  websiteUrl?: string;
  monthlyAdSpend?: string;
  adPlatforms?: string;
  serviceInterest?: string[];
  monthlyBudget?: string;
  read: boolean;
  createdAt: string;
}

interface ContactsResponse {
  contacts: AdminContact[];
  total: number;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

const AdminContacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (source) params.set("source", source);

      const data = await adminFetch<ContactsResponse>(`/api/contacts/admin?${params}`);
      setContacts(data.contacts ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, page, source]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (contact: AdminContact) => {
    if (contact.read) return;

    try {
      await adminFetch(`/api/contacts/admin/read/${contact._id}`, { method: "PUT" });
      setContacts((current) =>
        current.map((item) => (item._id === contact._id ? { ...item, read: true } : item)),
      );
    } catch (err) {
      handleError(err);
    }
  };

  const remove = async (contact: AdminContact) => {
    if (!window.confirm(`Delete the submission from ${contact.email}? This cannot be undone.`)) {
      return;
    }

    try {
      await adminFetch(`/api/contacts/admin/${contact._id}`, { method: "DELETE" });
      toast.success("Submission deleted.");
      void load();
    } catch (err) {
      handleError(err);
    }
  };

  const toggleExpanded = (contact: AdminContact) => {
    const next = expandedId === contact._id ? null : contact._id;
    setExpandedId(next);
    if (next) void markRead(contact);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            {total} submission{total === 1 ? "" : "s"} archived from the website forms.
          </p>
        </div>

        <div className="flex gap-1">
          {sourceFilters.map((filter) => (
            <Button
              key={filter.value || "all"}
              size="sm"
              variant={source === filter.value ? "secondary" : "ghost"}
              onClick={() => {
                setSource(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="sr-only">
          <CardTitle>Contact submissions</CardTitle>
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
          ) : contacts.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No submissions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {contacts.map((contact) => (
                  <Fragment key={contact._id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(contact)}
                    >
                      <TableCell className={contact.read ? "" : "font-semibold"}>
                        {`${contact.firstName} ${contact.lastName}`.trim() || "—"}
                        {!contact.read && (
                          <Badge variant="secondary" className="ml-2">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{sourceLabels[contact.source] ?? contact.source}</TableCell>
                      <TableCell>{formatDate(contact.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            void remove(contact);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>

                    {expandedId === contact._id && (
                      <TableRow className="bg-muted/40">
                        <TableCell colSpan={5}>
                          <dl className="grid gap-x-8 gap-y-2 py-2 text-sm sm:grid-cols-2">
                            {contact.company && (
                              <Detail label="Company" value={contact.company} />
                            )}
                            {contact.websiteUrl && (
                              <Detail label="Website" value={contact.websiteUrl} />
                            )}
                            {contact.monthlyAdSpend && (
                              <Detail label="Monthly ad spend" value={contact.monthlyAdSpend} />
                            )}
                            {contact.monthlyBudget && (
                              <Detail label="Monthly budget" value={contact.monthlyBudget} />
                            )}
                            {contact.adPlatforms && (
                              <Detail label="Ad platforms" value={contact.adPlatforms} />
                            )}
                            {contact.serviceInterest && contact.serviceInterest.length > 0 && (
                              <Detail
                                label="Service interest"
                                value={contact.serviceInterest.join(", ")}
                              />
                            )}
                            {contact.message && (
                              <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Message</dt>
                                <dd className="whitespace-pre-wrap">{contact.message}</dd>
                              </div>
                            )}
                          </dl>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-muted-foreground">{label}</dt>
    <dd>{value}</dd>
  </div>
);

export default AdminContacts;
