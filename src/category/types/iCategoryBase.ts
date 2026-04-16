export interface CategoryBase {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: Date;
}
