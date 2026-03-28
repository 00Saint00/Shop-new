import CategoryShop from "../CategoryShop";

const WOMEN_CATEGORIES = [
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
] as const;

const Women = () => (
  <CategoryShop
    title="Women"
    blurb="Dresses, jewellery & shoes"
    categories={WOMEN_CATEGORIES}
    emptyMessage="No women's products in this catalog."
    skeletonTitleWidth="w-40"
  />
);

export default Women;
