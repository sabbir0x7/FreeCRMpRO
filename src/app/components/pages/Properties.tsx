import { Bed, Bath, Maximize, MapPin, Plus, Building2, Trash2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { PropertyDialog, EmptyState } from "../forms";
import { useStore, currency } from "../../store";
import { cn } from "../ui/utils";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Listed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  "Under Offer": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Sold: "bg-muted text-muted-foreground",
};

export function Properties() {
  const { properties, dispatch } = useStore();

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Property Listings</h1>
          <p className="text-sm text-muted-foreground">{properties.length} {properties.length === 1 ? "listing" : "listings"}</p>
        </div>
        <PropertyDialog trigger={<Button><Plus className="size-4" /> Add property</Button>} />
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="No properties listed"
          description="Add your listings with price, size and status to manage them alongside your contacts and deals."
          action={<PropertyDialog trigger={<Button><Plus className="size-4" /> Add your first listing</Button>} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <div key={p.id} className="glass-surface group overflow-hidden rounded-xl border border-white/10 dark:border-white/5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="relative">
                <ImageWithFallback src={p.image} alt={p.title} className="h-44 w-full object-cover" />
                <span className={cn("absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs", statusColors[p.status])} style={{ fontWeight: 500 }}>{p.status}</span>
                <button
                  onClick={() => { dispatch({ type: "property/delete", id: p.id }); toast.success("Property removed"); }}
                  className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="p-4">
                <h3>{p.title}</h3>
                {p.address && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {p.address}
                  </div>
                )}
                <div className="mt-3 text-xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{currency(p.price)}</div>
                <div className="mt-3 flex items-center gap-4 border-t border-white/10 dark:border-white/5 pt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Bed className="size-4" /> {p.beds}</span>
                  <span className="flex items-center gap-1"><Bath className="size-4" /> {p.baths}</span>
                  <span className="flex items-center gap-1"><Maximize className="size-4" /> {p.sqft.toLocaleString()} ft²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
