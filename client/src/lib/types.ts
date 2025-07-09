export interface Kid {
  id: number;
  userId: number;
  name: string;
  age: number;
  description?: string;
  hairColor?: string;
  eyeColor?: string;
  hairLength?: string;
  skinTone?: string;
  createdAt?: Date;
}

export interface Character {
  id: number;
  userId: number;
  name: string;
  type: string;
  description?: string;
  createdAt?: Date;
}

export interface Story {
  id: number;
  userId: number;
  title: string;
  kidIds: number[];
  characterIds: number[];
  storyPart1: string;
  storyPart2: string;
  storyPart3: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  tone: string;
  createdAt?: Date;
}

export interface GenerateStoryRequest {
  kidIds: number[];
  characterIds: number[];
  storyIdea: string;
  tone: string;
}
