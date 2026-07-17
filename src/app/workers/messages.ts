export interface SteganoRequest {
  id: number;
  type: 'encode' | 'decode';
  image: string;
  message?: string;
  password: string;
}

export interface SteganoResponse {
  id: number;
  ok: boolean;
  result?: string;
  error?: string;
}
