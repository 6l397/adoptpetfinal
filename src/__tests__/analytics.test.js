import { calculateAdminAnalytics } from "@/lib/analytics";

describe("calculateAdminAnalytics", () => {
  test("builds summary counts for admin dashboard", () => {
    const analytics = calculateAdminAnalytics({
      posts: [
        {
          title: "Luna",
          type: "Коти",
          breed: "British",
          ageGroups: "До 1 року",
          city: "Чернівці",
          status: "available",
          listingType: "adoption",
        },
        {
          title: "Rex",
          type: "Собаки",
          breed: "Labrador",
          ageGroups: "1-3 роки",
          city: "Львів",
          status: "adopted",
          listingType: "adoption",
        },
        {
          title: "Lost cat",
          type: "Коти",
          breed: "",
          ageGroups: "1-3 роки",
          city: "Чернівці",
          listingType: "lost",
          moderationStatus: "pending",
        },
      ],
      forms: [{ status: "pending" }, { status: "approved" }],
      users: [{}, {}],
    });

    expect(analytics.totals).toEqual({
      animals: 3,
      adoption: 2,
      available: 1,
      reserved: 0,
      adopted: 1,
      lostFound: 1,
      pendingLostFound: 1,
      users: 2,
      adoptionForms: 2,
    });
    expect(analytics.typeCounts).toEqual([
      { label: "Коти", value: 2 },
      { label: "Собаки", value: 1 },
    ]);
    expect(analytics.regionCounts[0]).toEqual({
      label: "Чернівці",
      value: 2,
    });
    expect(analytics.statusCounts).toEqual([
      { label: "adopted", value: 1 },
      { label: "available", value: 1 },
    ]);
  });
});
