import CategoryShop from "../CategoryShop";

const ELECTRONICS_CATEGORIES = [
  "smartphones",
  "laptops",
  "tablets",
  "mobile-accessories",
] as const;

const Electronics = () => (
  <CategoryShop
    title="Electronics"
    blurb="Phones, laptops, tablets & accessories"
    categories={ELECTRONICS_CATEGORIES}
    emptyMessage="No electronics in this catalog."
    skeletonTitleWidth="w-44"
  />
);

export default Electronics;
