// src/interfaces/types.ts
export interface Friend {
    id: string;
    name: string;
    avatar: string;
  }
  
  export interface Message {
    sender: string;
    content?: string; 
    images?: string[];
  }