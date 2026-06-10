export const resources = {
  uk: {
    translation: {
      app: {
        title: 'GTO PNG Grid Editor for Poker Range Charts',
        subtitle: 'Clean poker solver screenshots and PNG range grids',
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
      seo: {
        heading: 'GTO PNG Grid Editor for Poker Range Charts',
        description:
          'This tool helps poker players, coaches, and content creators clean PNG range charts exported from GTO solvers, poker trainers, or grid-based strategy tools. It automatically detects the chart area, trims unnecessary pixels, lets you select cells, and exports a clean PNG.'
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
        description: 'Автоматично знаходить межі чарту та привʼязує клітинки до цілих пікселів.',
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
      canvas: {
        empty: 'Відкрийте PNG із GTO або poker tool, щоб почати.',
        pixelPerfect: 'pixel perfect'
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
      firstVisit: {
        title: 'Локальні налаштування',
        message:
          'Ми зберігаємо лише локальні налаштування у вашому браузері: стан підказок, останні файли та параметри редактора. Жодних платіжних або особистих даних не обробляється.',
        gotIt: 'Зрозуміло',
        showTour: 'Показати інструкцію'
      },
      tour: {
        title: 'Інструкція',
        button: 'Інструкція',
        progress: '{{current}} з {{total}}',
        back: 'Назад',
        next: 'Далі',
        skip: 'Пропустити',
        done: 'Готово',
        steps: {
          open: {
            title: '1. Завантажте PNG',
            text: 'Натисніть «Відкрити» і завантажте PNG-файл. Найкраще використовувати не фото з телефона, а PNG, експортований із GTO, poker solver або іншої програми з готовою сіткою.'
          },
          crop: {
            title: '2. Додаток обрізає зайве',
            text: 'Після завантаження інструмент автоматично шукає межі сітки та обрізає зайві пікселі по боках. Синій контур показує робочу область, з якою працює редактор.'
          },
          grid: {
            title: '3. Перевірте сітку',
            text: 'Додаток визначає кількість рядків, колонок і розмір клітинки. Якщо сітка виглядає некоректно, перевірте якість PNG або відкрийте інший експорт із poker/GTO tool.'
          },
          selection: {
            title: '4. Оберіть клітинки',
            text: 'Клікніть на клітинку або виділіть діапазон. Обрані клітинки можна залити вибраним кольором, очистити або підготувати до фінального PNG.'
          },
          export: {
            title: '5. Збережіть PNG',
            text: 'Коли редагування готове, натисніть «Зберегти PNG». Ви отримаєте очищене зображення без зайвих пікселів і непотрібних клітинок.'
          }
        }
      },
      tooltips: {
        openFile: 'Upload PNG exported from GTO/poker tool',
        exportPng: 'Export cleaned PNG',
        gridDetector: 'Detects rows, columns and cell size',
        canvas: 'Click or drag to select cells'
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
        title: 'GTO PNG Grid Editor for Poker Range Charts',
        subtitle: 'Clean poker solver screenshots and PNG range grids',
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
      seo: {
        heading: 'GTO PNG Grid Editor for Poker Range Charts',
        description:
          'This tool helps poker players, coaches, and content creators clean PNG range charts exported from GTO solvers, poker trainers, or grid-based strategy tools. It automatically detects the chart area, trims unnecessary pixels, lets you select cells, and exports a clean PNG.'
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
      canvas: {
        empty: 'Open a PNG from a GTO or poker tool to begin.',
        pixelPerfect: 'pixel perfect'
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
      firstVisit: {
        title: 'Local settings',
        message:
          'We only store local settings in your browser: hint state, recent files, and editor preferences. No payment or personal data is processed.',
        gotIt: 'Got it',
        showTour: 'Show instructions'
      },
      tour: {
        title: 'Instructions',
        button: 'Instructions',
        progress: '{{current}} of {{total}}',
        back: 'Back',
        next: 'Next',
        skip: 'Skip',
        done: 'Done',
        steps: {
          open: {
            title: '1. Upload a PNG',
            text: 'Click Open and upload a PNG file. It is best to use a PNG exported from a GTO tool, poker solver, or another program with a ready-made grid, not a phone photo.'
          },
          crop: {
            title: '2. The app trims extra pixels',
            text: 'After upload, the tool automatically finds the chart bounds and trims unnecessary pixels around the sides. The blue outline shows the working area used by the editor.'
          },
          grid: {
            title: '3. Check the grid',
            text: 'The app detects rows, columns, and cell size. If the grid looks wrong, check the PNG quality or open another export from a poker/GTO tool.'
          },
          selection: {
            title: '4. Select cells',
            text: 'Click a cell or drag a range. Selected cells can be filled with the chosen color, cleaned up, or prepared for the final PNG.'
          },
          export: {
            title: '5. Save PNG',
            text: 'When editing is done, click Save PNG. You will get a cleaned image without extra pixels and unwanted cells.'
          }
        }
      },
      tooltips: {
        openFile: 'Upload PNG exported from GTO/poker tool',
        exportPng: 'Export cleaned PNG',
        gridDetector: 'Detects rows, columns and cell size',
        canvas: 'Click or drag to select cells'
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
