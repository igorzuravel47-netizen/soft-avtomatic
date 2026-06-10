export const resources = {
  uk: {
    translation: {
      app: {
        title: 'PNG GTO Studio',

        open: 'Відкрити',
        save: 'Зберегти PNG',
        undo: 'Назад',
        redo: 'Вперед',
        crop: 'Обрізати',
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
        recent: 'Останні файли',
        leftSidebar: 'Підготовка',
        leftSidebarHint: 'Файл, сітка та превʼю',
        collapseSidebar: 'Згорнути ліву панель',
        expandSidebar: 'Розгорнути ліву панель'
      },
      upload: {
        title: 'Завантажити PNG',
        hint: 'Перетягніть PNG сюди або виберіть файл',
        choose: 'Вибрати PNG',
        loading: 'Завантаження...'
      },
      preview: {
        pixels: 'Пікселі',
        trim: 'Обрізано'
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
        scopeCell: 'Клітинка',
        scopeFragment: 'Фрагмент',
        showGrid: 'Показати службову сітку',
        hideGrid: 'Сховати службову сітку',
        clear: 'Зняти виділення',
        fill: 'Залити',
        fillColor: 'Колір заливки',
        fillWhite: 'Залити #FFFFFF',
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
      history: {
        title: 'Історія дій',
        empty: 'Після роботи з клітинками тут буде детальний журнал.',
        count: '{{count}} клітинок',
        detail: 'Деталь:',
        actions: {
          'select-cell': 'Вибрано клітинку',
          'select-cells': 'Вибрано клітинки',
          'clear-selection': 'Знято виділення',
          'fill-white': 'Залито кольором',
          'reset-edits': 'Очищено зміни',
          undo: 'Скасовано дію',
          redo: 'Повторено дію'
        }
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
        delete: 'Залити вибране кольором',
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
        filled: 'Виділення залито кольором'
      }
    }
  },
  en: {
    translation: {
      app: {
     title: 'PNG GTO Studio',
        open: 'Open',
        save: 'Save PNG',
        undo: 'Undo',
        redo: 'Redo',
        crop: 'Crop',
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
        recent: 'Recent Files',
        leftSidebar: 'Preparation',
        leftSidebarHint: 'File, grid and preview',
        collapseSidebar: 'Collapse left sidebar',
        expandSidebar: 'Expand left sidebar'
      },
      upload: {
        title: 'Upload PNG',
        hint: 'Drop a PNG here or choose a file',
        choose: 'Choose PNG',
        loading: 'Loading...'
      },
      preview: {
        pixels: 'Pixels',
        trim: 'Trim'
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
        scopeCell: 'Cell',
        scopeFragment: 'Fragment',
        showGrid: 'Show helper grid',
        hideGrid: 'Hide helper grid',
        clear: 'Clear selection',
        fill: 'Fill',
        fillColor: 'Fill color',
        fillWhite: 'Fill #FFFFFF',
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
      history: {
        title: 'Action History',
        empty: 'Detailed cell actions will appear here.',
        count: '{{count}} cells',
        detail: 'Detail:',
        actions: {
          'select-cell': 'Selected cell',
          'select-cells': 'Selected cells',
          'clear-selection': 'Cleared selection',
          'fill-white': 'Filled color',
          'reset-edits': 'Reset edits',
          undo: 'Undid action',
          redo: 'Redid action'
        }
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
        delete: 'Fill selected color',
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
        filled: 'Selection filled with color'
      }
    }
  }
} as const;
