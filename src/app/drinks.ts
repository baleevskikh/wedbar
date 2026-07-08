export type Drink = {
  id: string;
  name: string;
  description: string;
  ingredients: string;
  recipe?: string;
  imagePath: string;
  videoPath: string | null;
  position: number;
  isStopped?: boolean;
};

export function mediaUrl(path: string | null | undefined) {
  return path ? `/media/${path}` : "";
}
