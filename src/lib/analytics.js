const emptyLabel = "Не вказано";

export const countBy = (items, getValue) => {
  const counts = {};

  items.forEach((item) => {
    const rawValue = getValue(item);
    const value = rawValue ? String(rawValue) : emptyLabel;

    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.keys(counts)
    .map((label) => ({ label, value: counts[label] }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
};

export const topItems = (items, limit = 8) => items.slice(0, limit);

export const calculateAdminAnalytics = ({
  posts = [],
  forms = [],
  users = [],
} = {}) => {
  const adoptionPosts = posts.filter(
    (post) => (post.listingType || "adoption") === "adoption"
  );
  const lostFoundPosts = posts.filter((post) =>
    ["lost", "found"].includes(post.listingType)
  );
  const availablePosts = adoptionPosts.filter(
    (post) => (post.status || "available") === "available"
  );
  const reservedPosts = adoptionPosts.filter((post) => post.status === "reserved");
  const adoptedPosts = adoptionPosts.filter((post) => post.status === "adopted");
  const pendingLostFoundPosts = lostFoundPosts.filter(
    (post) => (post.moderationStatus || "approved") === "pending"
  );

  return {
    totals: {
      animals: posts.length,
      adoption: adoptionPosts.length,
      available: availablePosts.length,
      reserved: reservedPosts.length,
      adopted: adoptedPosts.length,
      lostFound: lostFoundPosts.length,
      pendingLostFound: pendingLostFoundPosts.length,
      users: users.length,
      adoptionForms: forms.length,
    },
    typeCounts: countBy(posts, (post) => post.type),
    ageCounts: countBy(posts, (post) => post.ageGroups),
    statusCounts: countBy(adoptionPosts, (post) => post.status || "available"),
    listingCounts: countBy(posts, (post) => post.listingType || "adoption"),
    breedCounts: topItems(countBy(posts, (post) => post.breed), 10),
    regionCounts: topItems(countBy(posts, (post) => post.city), 10),
    moderationCounts: countBy(lostFoundPosts, (post) => post.moderationStatus || "approved"),
    formStatusCounts: countBy(forms, (form) => form.status || "pending"),
  };
};
