export interface CategoryWithChildren {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: Date;
  children: CategoryWithChildren[];
}
