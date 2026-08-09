export type Role = 'ADMIN' | 'USER';
export type Visibility = 'PUBLIC' | 'PRIVATE';

export interface User {
  id: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  order: number;
  listId: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  name: string;
  visibility: Visibility;
  ownerId: string;
  owner?: Pick<User, 'id' | 'username'>;
  items?: Item[];
  _count?: { items: number };
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  token: string;
  reference?: string;
  used: boolean;
  expiresAt: string;
  createdAt: string;
  invitationUrl?: string;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}
