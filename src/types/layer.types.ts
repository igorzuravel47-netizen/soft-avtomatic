export type LayerKind = 'original' | 'mask' | 'editing';

export interface EditorLayer {
  id: string;
  name: string;
  kind: LayerKind;
  visible: boolean;
  locked: boolean;
  opacity: number;
  imageData: ImageData | null;
  deletable: boolean;
}
