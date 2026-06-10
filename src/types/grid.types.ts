export interface GridLine {
  index: number;
  position: number;
  strength: number;
}

export interface GridDefinition {
  rows: number;
  columns: number;
  cellWidth: number;
  cellHeight: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  verticalLines: GridLine[];
  horizontalLines: GridLine[];
  confidence: number;
}

export interface CellCoordinate {
  row: number;
  column: number;
}

export interface CellSelection extends CellCoordinate {
  id: string;
  color: string;
}
