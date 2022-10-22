export interface IUploadedPortrait {
  id: string;
  file: File;
  src: string;
  original: string;
  tags: string[];
  styles: string[];
  colors: string[];
  quality: number;
}

export type TOpenEditorDialog = (
  key: string,
  entries: [string, { image: string; name: string }][],
  selected: string[],
  onSubmit: (newSelected: string[]) => void
) => void;

export type TOpenOriginalsDialog = (
  selected: string,
  onSubmit: (newOriginal: string) => void
) => void;

export const changeableKeys = ['original', 'quality', 'styles', 'colors', 'tags'] as const;

export interface IEditorData {
  original: string;
  tags: string[];
  styles: string[];
  colors: string[];
  quality: number;
}

export interface IChange {
  key: keyof IEditorData;
  operation: 'update' | 'add' | 'remove';
  value: string | number;
}

export type TPatchHandler = (changes: IChange[]) => Promise<void>;

export type TPostHandler = (editorData: IEditorData) => Promise<void>;

export type TDeleteHandler = () => Promise<void>;