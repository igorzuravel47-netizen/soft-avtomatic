"""
Автоматичне обрізання зображень з детектуванням меж контенту.
Реалізація функцій для пошуку фактичних меж зображення та його обрізання.
"""

from typing import Tuple, Optional
import numpy as np
from PIL import Image
import logging

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageCropper:
    """
    Клас для автоматичного обрізання зображень з пошуком реальних меж контенту.
    """

    def __init__(self, pixel_tolerance: int = 0):
        """
        Ініціалізація обрізувача зображень.
        
        Args:
            pixel_tolerance: Допуск при пошуку непрозорих пікселів (за замовчуванням 0)
        """
        self.pixel_tolerance = pixel_tolerance

    def find_content_bounds(self, image: Image.Image) -> Optional[Tuple[int, int, int, int]]:
        """
        Пошук фактичних меж контенту на зображенні.
        
        Аналізує всі непрозорі пікселі та визначає:
        - крайню ліву координату
        - крайню праву координату
        - верхню координату
        - нижню координату
        
        Args:
            image: PIL Image об'єкт
            
        Returns:
            Кортеж (лева, верхня, права, нижня) або None якщо контенту не знайдено
        """
        # Конвертування зображення в RGBA для роботи з прозорістю
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        
        # Конвертування в numpy масив для швидкої обробки
        img_array = np.array(image)
        
        # Отримання альфа-канала (прозорість)
        alpha_channel = img_array[:, :, 3]
        
        # Пошук непрозорих пікселів
        non_transparent = alpha_channel > self.pixel_tolerance
        
        # Якщо немає непрозорих пікселів, повертаємо None
        if not np.any(non_transparent):
            logger.warning("Не знайдено непрозорих пікселів на зображенні")
            return None
        
        # Знаходження координат непрозорих пікселів
        rows = np.any(non_transparent, axis=1)
        cols = np.any(non_transparent, axis=0)
        
        # Отримання індексів перших та останніх True значень
        y_min, y_max = np.where(rows)[0][[0, -1]]
        x_min, x_max = np.where(cols)[0][[0, -1]]
        
        # Повертаємо межі (лева, верхня, права, нижня)
        # Додаємо 1 до максимальних значень, тому що PIL використовує екслюзивну праву/нижню межу
        return (int(x_min), int(y_min), int(x_max) + 1, int(y_max) + 1)

    def find_grid_bounds(self, image: Image.Image, cell_size: int) -> Optional[Tuple[int, int, int, int]]:
        """
        Пошук меж сітки GTO з дотриманням меж клітинок.
        
        Аналізує крайні клітинки сітки та вирівнює обрізання:
        - Крайні клітинки не пошкоджуються
        - Всі клітинки залишаються однакового розміру
        - Обрізання виконується по крайніх клітинках
        
        Args:
            image: PIL Image об'єкт
            cell_size: Розмір клітинки в пікселях
            
        Returns:
            Кортеж (лева, верхня, права, нижня) вирівняний до сітки
        """
        bounds = self.find_content_bounds(image)
        
        if bounds is None:
            logger.warning("Не вдалося знайти межи контенту для сітки")
            return None
        
        x_min, y_min, x_max, y_max = bounds
        
        # Вирівнювання до крайніх клітинок
        # Округлення вниз для мінімальних значень
        aligned_x_min = (x_min // cell_size) * cell_size
        aligned_y_min = (y_min // cell_size) * cell_size
        
        # Округлення вгору для максимальних значень
        aligned_x_max = ((x_max + cell_size - 1) // cell_size) * cell_size
        aligned_y_max = ((y_max + cell_size - 1) // cell_size) * cell_size
        
        logger.info(f"Оригінальні межи контенту: ({x_min}, {y_min}, {x_max}, {y_max})")
        logger.info(f"Вирівняні межи сітки (cell_size={cell_size}): ({aligned_x_min}, {aligned_y_min}, {aligned_x_max}, {aligned_y_max})")
        
        return (aligned_x_min, aligned_y_min, aligned_x_max, aligned_y_max)

    def crop_image(self, image: Image.Image, bounds: Optional[Tuple[int, int, int, int]] = None) -> Image.Image:
        """
        Обрізання зображення за вказаними межами.
        
        Параметри:
        - Не залишає зайвих білих або прозорих полів
        - Зберігає повністю весь малюнок без втрати пікселів
        - Результат максимально щільно обрізаний по фактичному контуру
        
        Args:
            image: PIL Image об'єкт
            bounds: Кортеж (лева, верхня, права, нижня) або None для автоматичного пошуку
            
        Returns:
            Обрізане зображення
        """
        if bounds is None:
            bounds = self.find_content_bounds(image)
        
        if bounds is None:
            logger.warning("Не вдалося визначити межи. Повертаємо оригінальне зображення")
            return image
        
        # Обрізання зображення
        cropped = image.crop(bounds)
        
        logger.info(f"Зображення обрізано до розміру: {cropped.size}")
        
        return cropped

    def crop_image_grid(self, image: Image.Image, cell_size: int) -> Image.Image:
        """
        Обрізання зображення з вирівнюванням до сітки GTO.
        
        Args:
            image: PIL Image об'єкт
            cell_size: Розмір клітинки в пікселях
            
        Returns:
            Обрізане і вирівняне до сітки зображення
        """
        bounds = self.find_grid_bounds(image, cell_size)
        
        if bounds is None:
            logger.warning("Не вдалося знайти межи сітки. Повертаємо оригінальне зображення")
            return image
        
        return self.crop_image(image, bounds)

    def export_pixel_perfect(
        self,
        image: Image.Image,
        output_path: str,
        crop: bool = True,
        use_grid: bool = False,
        cell_size: int = 1
    ) -> None:
        """
        Експорт зображення в PNG з режимом Pixel Perfect.
        
        Режим Pixel Perfect параметри:
        - Без масштабування
        - Без розмиття
        - Без антиаліасингу під час експорту
        - Збереження кожного пікселя один в один
        
        Експорт:
        - PNG формат
        - Прозорий фон
        - Без втрати якості
        - Збереження початкової роздільної здатності після обрізання
        
        Args:
            image: PIL Image об'єкт для експорту
            output_path: Шлях для збереження файлу
            crop: Чи обрізати зображення перед експортом
            use_grid: Чи використовувати вирівнювання до сітки GTO
            cell_size: Розмір клітинки для сітки (якщо use_grid=True)
        """
        # Конвертування в RGBA для збереження прозорості
        if image.mode != 'RGBA':
            export_image = image.convert('RGBA')
        else:
            export_image = image.copy()
        
        # Обрізання зображення якщо потрібно
        if crop:
            if use_grid:
                bounds = self.find_grid_bounds(export_image, cell_size)
            else:
                bounds = self.find_content_bounds(export_image)
            
            if bounds is not None:
                export_image = export_image.crop(bounds)
        
        # Експорт в PNG без обробки
        # optimize=False для збереження кожного пікселя один в один без стиснення
        export_image.save(
            output_path,
            'PNG',
            optimize=False
        )
        
        logger.info(f"Зображення експортовано в: {output_path}")
        logger.info(f"Параметри експорту:")
        logger.info(f"  - Режим: Pixel Perfect")
        logger.info(f"  - Розмір: {export_image.size}")
        logger.info(f"  - Мода: {export_image.mode}")
        logger.info(f"  - Формат: PNG з прозорим фоном")
        logger.info(f"  - Обрізання: {'Так' if crop else 'Ні'}")
        if use_grid:
            logger.info(f"  - Вирівнювання до сітки: Так (cell_size={cell_size})")


# Функції-помічники для використання API
def crop_image_auto(image_path: str, output_path: str) -> None:
    """
    Основна функція для автоматичного обрізання та експорту зображення.
    
    Args:
        image_path: Шлях до вихідного зображення
        output_path: Шлях для збереження обрізаного зображення
    """
    try:
        # Завантаження зображення
        image = Image.open(image_path)
        logger.info(f"Завантажено зображення: {image_path}")
        logger.info(f"  - Розмір: {image.size}")
        logger.info(f"  - Мода: {image.mode}")
        
        # Створення обрізувача
        cropper = ImageCropper()
        
        # Експорт з обрізанням
        cropper.export_pixel_perfect(image, output_path, crop=True, use_grid=False)
        
        logger.info("Операція завершена успішно")
    
    except Exception as e:
        logger.error(f"Помилка при обробці зображення: {str(e)}")
        raise


def crop_image_grid(image_path: str, output_path: str, cell_size: int = 16) -> None:
    """
    Обрізання зображення з вирівнюванням до сітки GTO.
    
    Args:
        image_path: Шлях до вихідного зображення
        output_path: Шлях для збереження обрізаного зображення
        cell_size: Розмір клітинки сітки в пікселях
    """
    try:
        # Завантаження зображення
        image = Image.open(image_path)
        logger.info(f"Завантажено зображення: {image_path}")
        logger.info(f"  - Розмір: {image.size}")
        logger.info(f"  - Мода: {image.mode}")
        logger.info(f"  - Розмір клітинки сітки: {cell_size} px")
        
        # Створення обрізувача
        cropper = ImageCropper()
        
        # Експорт з обрізанням та вирівнюванням до сітки
        cropper.export_pixel_perfect(image, output_path, crop=True, use_grid=True, cell_size=cell_size)
        
        logger.info("Операція завершена успішно")
    
    except Exception as e:
        logger.error(f"Помилка при обробці зображення: {str(e)}")
        raise


if __name__ == "__main__":
    print("Модуль для автоматичного обрізання зображень готовий до використання")
    print("")
    print("Можливості:")
    print("  1. Автоматичне детектування меж контенту")
    print("  2. Обрізання без фіксованих відступів")
    print("  3. Вирівнювання до сітки GTO з дотриманням меж клітинок")
    print("  4. Експорт в PNG з режимом Pixel Perfect")
    print("")
    print("Приклади використання:")
    print("  from image_cropper import crop_image_auto, crop_image_grid")
    print("  ")
    print("  # Звичайне автоматичне обрізання")
    print("  crop_image_auto('input.png', 'output.png')")
    print("  ")
    print("  # Обрізання з вирівнюванням до сітки (16x16)")
    print("  crop_image_grid('input.png', 'output.png', cell_size=16)")
