import type { AmenityType, NearbyAmenity } from "@/lib/types";

interface NearbyAmenitiesProps {
  amenities: NearbyAmenity[];
}

const amenityLabels: Record<AmenityType, string> = {
  mrt: "MRT Stations",
  bus_interchange: "Bus Interchanges",
  school: "Schools",
  mall: "Shopping Malls",
  park: "Parks & Recreation",
  hospital: "Healthcare",
};

const amenityOrder: AmenityType[] = [
  "mrt",
  "school",
  "mall",
  "park",
  "hospital",
  "bus_interchange",
];

export function NearbyAmenities({ amenities }: NearbyAmenitiesProps) {
  const grouped = amenityOrder
    .map((type) => ({
      type,
      label: amenityLabels[type],
      items: amenities.filter((a) => a.amenityType === type),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <section className="border-b-2 border-foreground px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <h2 className="uppercase font-bold tracking-wide text-lg">
          Nearby Amenities
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {grouped.map((group) => (
            <div
              key={group.type}
              className="border-2 border-foreground p-4 space-y-3"
            >
              <h3 className="uppercase font-bold tracking-wide text-[10px] text-muted-foreground">
                {group.label}
              </h3>
              <ul className="space-y-2">
                {group.items.map((amenity) => (
                  <li
                    key={amenity.id}
                    className="flex items-baseline justify-between gap-2"
                  >
                    <span className="text-sm">{amenity.name}</span>
                    <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {amenity.distanceMeters}m · {amenity.walkMinutes} min
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
