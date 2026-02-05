/**
 * Category Entity Interface (Optional but recommended for CMS)
 */
export interface ICategory {
  id: string;
  name: string;
  slug: string; // URL-friendly name
  description?: string;
  parentId?: string; // For nested categories
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category creation payload
 */
export interface ICreateCategory {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
}

/**
 * Category update payload
 */
export interface IUpdateCategory {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string;
}

/**
 * Category with post count
 */
export interface ICategoryResponse extends ICategory {
  postCount: number;
  children?: ICategoryResponse[]; // Nested subcategories
}
