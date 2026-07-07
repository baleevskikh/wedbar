import "server-only";

export async function getExamplePageData() {
  return {
    title: "WedBar",
    description:
      "Эта страница лежит в app, а данные для неё приходят из server.",
  };
}
