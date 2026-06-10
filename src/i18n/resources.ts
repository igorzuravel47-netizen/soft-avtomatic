export const resources = {
  uk: {
    translation: {
      app: {
        title: 'PNG Grid Studio',
        subtitle: 'Професійний редактор PNG-сіток',
        open: 'Відкрити',
        save: 'Зберегти PNG',
        undo: 'Назад',
        redo: 'Вперед',
        crop: 'Обрізати',
        detectGrid: 'Знайти сітку',
        theme: 'Тема',
        language: 'Мова',
        help: 'Гарячі клавіші',
        fullscreen: 'Повний екран'
      },
      layout: {
        upload: 'Файл',
        analysis: 'Аналіз сітки',
        filters: 'Фільтри кольорів',
        canvas: 'Canvas Editor',
        layers: 'Шари',
        selection: 'Виділення',
        properties: 'Властивості',
        recent: 'Останні файли'
      },
      upload: {
        title: 'Завантажити PNG',
        hint: 'Перетягніть PNG сюди або виберіть файл',
        choose: 'Вибрати PNG',
        loading: 'Завантаження...'
      },
      grid: {
        auto: 'Автоматична сітка',
        description: 'Автоматично знаходить межі чарту та прив’язує клітинки до цілих пікселів.',
        analyze: 'Auto Detect',
        rows: 'Рядки',
        columns: 'Колонки',
        cell: 'Клітинка',
        bounds: 'Межі',
        lines: 'Лінії',
        confidence: 'Точність'
      },
      selection: {
        select: 'Select',
        pipette: 'Піпетка',
        wholeGrid: 'Вся сітка',
        whiteCells: 'Білі клітинки',
        showGrid: 'Показати службову сітку',
        hideGrid: 'Сховати службову сітку',
        clear: 'Зняти виділення',
        fillWhite: 'Залити #FFFFFF',
        removeEdges: 'Прибрати грані в білих',
        empty: 'Виділяйте клітинки вручну або піпеткою по кольору.',
        row: 'Рядок',
        column: 'Колонка',
        color: 'Колір',
        selected: '{{count}} клітинок виділено'
      },
      controls: {
        title: 'Керування',
        reset: 'Очистити зміни',
        downloadHint: 'Експорт видимих шарів у PNG без ресемплінгу.',
        zoomIn: 'Збільшити',
        zoomOut: 'Зменшити',
        fit: 'До екрана',
        actual: '100%'
      },
      status: {
        cursor: 'Курсор',
        zoom: 'Zoom',
        cell: 'Клітинка',
        image: 'Зображення',
        ready: 'Готово',
        autosaved: 'Автозбережено'
      },
      help: {
        title: 'Гарячі клавіші',
        close: 'Закрити',
        open: 'Відкрити файл',
        save: 'Зберегти PNG',
        undo: 'Назад',
        redo: 'Вперед',
        selectAll: 'Вибрати всі клітинки',
        delete: 'Залити вибране білим',
        escape: 'Зняти виділення',
        pan: 'Тимчасовий pan mode',
        zoom: 'Zoom до курсора',
        fullscreen: 'Повний екран',
        help: 'Показати довідку'
      },
      toast: {
        exported: 'PNG збережено',
        opened: 'Файл відкрито',
        autosaved: 'Автозбережено',
        selectedAll: 'Вибрано всю сітку',
        filled: 'Виділення залито білим'
      }
    }
  },
  en: {
    translation: {
      app: {
        title: 'PNG Grid Studio',
        subtitle: 'Professional PNG grid editor',
        open: 'Open',
        save: 'Save PNG',
        undo: 'Undo',
        redo: 'Redo',
        crop: 'Crop',
        detectGrid: 'Detect Grid',
        theme: 'Theme',
        language: 'Language',
        help: 'Hotkeys',
        fullscreen: 'Fullscreen'
      },
      layout: {
        upload: 'File',
        analysis: 'Grid Analysis',
        filters: 'Color Filters',
        canvas: 'Canvas Editor',
        layers: 'Layers',
        selection: 'Selection',
        properties: 'Properties',
        recent: 'Recent Files'
      },
      upload: {
        title: 'Upload PNG',
        hint: 'Drop a PNG here or choose a file',
        choose: 'Choose PNG',
        loading: 'Loading...'
      },
      grid: {
        auto: 'Automatic Grid',
        description: 'Detects chart bounds and snaps cells to whole pixels.',
        analyze: 'Auto Detect',
        rows: 'Rows',
        columns: 'Columns',
        cell: 'Cell',
        bounds: 'Bounds',
        lines: 'Lines',
        confidence: 'Confidence'
      },
      selection: {
        select: 'Select',
        pipette: 'Pipette',
        wholeGrid: 'Whole grid',
        whiteCells: 'White cells',
        showGrid: 'Show helper grid',
        hideGrid: 'Hide helper grid',
        clear: 'Clear selection',
        fillWhite: 'Fill #FFFFFF',
        removeEdges: 'Remove white-cell edges',
        empty: 'Select cells manually or use pipette by color.',
        row: 'Row',
        column: 'Column',
        color: 'Color',
        selected: '{{count}} selected cells'
      },
      controls: {
        title: 'Controls',
        reset: 'Reset edits',
        downloadHint: 'Exports visible layers as PNG without resampling.',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        fit: 'Fit to screen',
        actual: '100%'
      },
      status: {
        cursor: 'Cursor',
        zoom: 'Zoom',
        cell: 'Cell',
        image: 'Image',
        ready: 'Ready',
        autosaved: 'Autosaved'
      },
      help: {
        title: 'Hotkeys',
        close: 'Close',
        open: 'Open file',
        save: 'Save PNG',
        undo: 'Undo',
        redo: 'Redo',
        selectAll: 'Select all cells',
        delete: 'Fill selected white',
        escape: 'Clear selection',
        pan: 'Temporary pan mode',
        zoom: 'Zoom to cursor',
        fullscreen: 'Fullscreen',
        help: 'Show help'
      },
      toast: {
        exported: 'PNG exported',
        opened: 'File opened',
        autosaved: 'Autosaved',
        selectedAll: 'Whole grid selected',
        filled: 'Selection filled white'
      }
    }
  }
} as const;
