export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
}

export interface Photo {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  userId: string;
  user?: User;
  createdAt: Date;
  likes: number;
}

export interface Frame {
  id: string;
  originImageUrl: string;
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  userId: string;
  user?: User;
  createdAt: Date;
  likes: number;
}

export interface TutorialImage {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  optimalFrameX?: number;
  optimalFrameY?: number;
  optimalFrameWidth?: number;
  optimalFrameHeight?: number;
  frames?: Frame[];
} 