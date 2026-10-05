import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Hash, User, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "@/components/DatePicker";
import PageBar from "@/components/PageBar";
import { CLIENT_OPTIONS } from "@/data/clients";
import { LAST_LIST_KEY, RECORD_TYPE_LABEL, listRecords, type RecordType } from "@/lib/records";

const TYPE_BADGE: Record<RecordType, string> = {
  service: "bg-blue-50 text-blue-700 border-blue-200",
  breakdown: "bg-orange-50 text-orange-700 border-orange-200",
  voucher: "bg-green-50 text-green-700 border-green-200",
};

const RECORD_TYPES = Object.keys(RECORD_TYPE_LABEL) as RecordType[];
const isRecordType = (v: string): v is RecordType => (RECORD_TYPES as string[]).includes(v);

const FILTER_KEYS = ["client", "number", "type", "from", "to"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

/** yyyy-MM-dd → dd/MM/yyyy */
const showDate = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");

/** Debounces a text value so the list is not re-fetched on every keystroke. */
function useDebounced(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const SavedListPage = () => {
  // Filters live in the URL, so "back" from a record returns to the same list.
  const [params, setParams] = useSearchParams();
  const get = (key: FilterKey) => params.get(key) ?? "";
  const set = (key: FilterKey, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const typeParam = get("type");
  const recordType: RecordType | "all" = isRecordType(typeParam) ? typeParam : "all";
  const client = useDebounced(get("client"));
  const number = useDebounced(get("number"));
  const dateFrom = get("from");
  const dateTo = get("to");
  const hasFilters = FILTER_KEYS.some((k) => params.get(k));

  // Remember the current filters for the back button on a record.
  useEffect(() => {
    sessionStorage.setItem(LAST_LIST_KEY, params.toString());
  }, [params]);

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ["records", { client, number, recordType, dateFrom, dateTo }],
    queryFn: () => listRecords({ client, number, recordType, dateFrom, dateTo }),
  });

  return (
    <div className="min-h-screen bg-muted/50">
      <PageBar title="Saved Reports & Vouchers" fallback="/" />
      <div className="max-w-3xl mx-auto space-y-3 py-4 px-4">
        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="f-client" className="text-xs">
                  Client name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="f-client"
                    list="client-options"
                    value={get("client")}
                    onChange={(e) => set("client", e.target.value)}
                    placeholder="Type or pick a client"
                    className="pl-9"
                  />
                  <datalist id="client-options">
                    {CLIENT_OPTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-number" className="text-xs">
                  Report No. / Voucher No.
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="f-number"
                    value={get("number")}
                    onChange={(e) => set("number", e.target.value)}
                    placeholder="e.g. 810"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs">Type</Label>
                <Select value={recordType} onValueChange={(v) => set("type", v === "all" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {RECORD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {RECORD_TYPE_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">From date</Label>
                <DatePicker value={dateFrom} onChange={(v) => set("from", v)} placeholder="Any" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To date</Label>
                <DatePicker value={dateTo} onChange={(v) => set("to", v)} placeholder="Any" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isLoading ? "Searching…" : `${records.length} found`}
              </span>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={() => setParams({}, { replace: true })}>
                  <X className="h-4 w-4" /> Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[84px] w-full rounded-lg" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-center text-destructive py-8">Could not load records. Please check the internet connection.</p>
        )}
        {!isLoading && !error && records.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nothing found.</p>
        )}

        <div className="space-y-2">
          {records.map((r) => (
            <Link key={r.id} to={`/saved/${r.id}`} className="block">
              <Card className="hover:shadow-md hover:border-primary/50 transition">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{r.ref_no ? `No. ${r.ref_no}` : "No number"}</span>
                      <Badge variant="outline" className={TYPE_BADGE[r.record_type]}>
                        {RECORD_TYPE_LABEL[r.record_type]}
                      </Badge>
                    </div>
                    <div className="text-sm truncate mt-0.5">{r.client || "—"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {showDate(r.record_date)}
                      {r.person && <> · {r.person}</>}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedListPage;
