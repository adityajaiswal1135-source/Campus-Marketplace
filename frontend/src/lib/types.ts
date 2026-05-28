export interface User {
  _id:             string;
  studentID:       string;
  email:           string;
  displayName:     string;
  avatar:          string | null;
  role:            'user' | 'admin';
  isBanned:        boolean;
  banReason:       string | null;
  isEmailVerified: boolean;
  createdAt:       string;
}

export interface Listing {
  _id:         string;
  title:       string;
  description: string;
  price:       number;
  category:    'books' | 'electronics' | 'clothing' | 'furniture' | 'sports' | 'stationery' | 'other';
  condition:   'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images:      string[];
  seller:      User;
  isActive:    boolean;
  isSold:      boolean;
  views:       number;
  createdAt:   string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user:    User;
}

export interface ListingsResponse {
  success:    boolean;
  total:      number;
  page:       number;
  totalPages: number;
  listings:   Listing[];
}