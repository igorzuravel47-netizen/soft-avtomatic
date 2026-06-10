import unittest
import tempfile
import os
from PIL import Image
import numpy as np
from image_cropper import ImageCropper, crop_image_auto, crop_image_grid


class TestImageCropper(unittest.TestCase):
    """Тести для модуля image_cropper"""

    def setUp(self):
        """Підготовка тестового середовища"""
        self.cropper = ImageCropper()
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        """Очищення після тестів"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)

    def create_test_image(self, width=100, height=100, content_rect=None):
        """
        Створення тестового зображення з контентом.
        """
        img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        pixels = img.load()
        
        if content_rect:
            x_min, y_min, x_max, y_max = content_rect
        else:
            x_min, y_min = 40, 40
            x_max, y_max = 60, 60
        
        for y in range(y_min, y_max):
            for x in range(x_min, x_max):
                pixels[x, y] = (255, 0, 0, 255)
        
        return img

    def test_find_content_bounds_basic(self):
        """Тест базового пошуку меж контенту"""
        img = self.create_test_image(width=100, height=100, content_rect=(20, 20, 80, 80))
        bounds = self.cropper.find_content_bounds(img)
        
        self.assertIsNotNone(bounds)
        self.assertEqual(bounds, (20, 20, 80, 80))

    def test_find_content_bounds_small_content(self):
        """Тест пошуку меж маленького контенту"""
        img = self.create_test_image(width=200, height=200, content_rect=(50, 75, 60, 85))
        bounds = self.cropper.find_content_bounds(img)
        
        self.assertIsNotNone(bounds)
        self.assertEqual(bounds, (50, 75, 60, 85))

    def test_find_content_bounds_edge_pixels(self):
        """Тест пошуку меж контенту на краях зображення"""
        img = self.create_test_image(width=100, height=100, content_rect=(0, 0, 100, 100))
        bounds = self.cropper.find_content_bounds(img)
        
        self.assertIsNotNone(bounds)
        self.assertEqual(bounds, (0, 0, 100, 100))

    def test_find_content_bounds_empty_image(self):
        """Тест пошуку меж на повністю прозорому зображенні"""
        img = Image.new('RGBA', (100, 100), (0, 0, 0, 0))
        bounds = self.cropper.find_content_bounds(img)
        
        self.assertIsNone(bounds)

    def test_find_grid_bounds_alignment(self):
        """Тест вирівнювання до сітки"""
        img = self.create_test_image(width=100, height=100, content_rect=(15, 15, 85, 85))
        bounds = self.cropper.find_grid_bounds(img, cell_size=16)
        
        self.assertIsNotNone(bounds)
        x_min, y_min, x_max, y_max = bounds
        self.assertEqual(x_min % 16, 0)
        self.assertEqual(y_min % 16, 0)
        self.assertEqual(x_max % 16, 0)
        self.assertEqual(y_max % 16, 0)

    def test_find_grid_bounds_cell_size_8(self):
        """Тест вирівнювання до сітки 8x8"""
        img = self.create_test_image(width=100, height=100, content_rect=(10, 10, 90, 90))
        bounds = self.cropper.find_grid_bounds(img, cell_size=8)
        
        self.assertIsNotNone(bounds)
        x_min, y_min, x_max, y_max = bounds
        self.assertEqual(x_min % 8, 0)
        self.assertEqual(y_min % 8, 0)
        self.assertEqual(x_max % 8, 0)
        self.assertEqual(y_max % 8, 0)

    def test_crop_image_basic(self):
        """Тест базового обрізання"""
        img = self.create_test_image(width=100, height=100, content_rect=(20, 20, 80, 80))
        cropped = self.cropper.crop_image(img)
        
        self.assertIsNotNone(cropped)
        self.assertEqual(cropped.size, (60, 60))

    def test_crop_image_with_specific_bounds(self):
        """Тест обрізання з вказаними межами"""
        img = self.create_test_image(width=100, height=100)
        bounds = (10, 10, 90, 90)
        cropped = self.cropper.crop_image(img, bounds=bounds)
        
        self.assertEqual(cropped.size, (80, 80))

    def test_crop_image_empty_image(self):
        """Тест обрізання прозорого зображення"""
        img = Image.new('RGBA', (100, 100), (0, 0, 0, 0))
        cropped = self.cropper.crop_image(img)
        
        self.assertEqual(cropped.size, img.size)

    def test_crop_image_grid(self):
        """Тест обрізання з вирівнюванням до сітки"""
        img = self.create_test_image(width=100, height=100, content_rect=(15, 15, 85, 85))
        cropped = self.cropper.crop_image_grid(img, cell_size=16)
        
        self.assertIsNotNone(cropped)
        width, height = cropped.size
        self.assertEqual(width % 16, 0)
        self.assertEqual(height % 16, 0)

    def test_export_pixel_perfect_png(self):
        """Тест експорту в PNG"""
        img = self.create_test_image(width=100, height=100, content_rect=(20, 20, 80, 80))
        output_path = os.path.join(self.temp_dir, 'test_output.png')
        
        self.cropper.export_pixel_perfect(img, output_path, crop=True)
        
        self.assertTrue(os.path.exists(output_path))
        exported_img = Image.open(output_path)
        self.assertEqual(exported_img.mode, 'RGBA')
        self.assertEqual(exported_img.format, 'PNG')

    def test_export_pixel_perfect_without_crop(self):
        """Тест експорту без обрізання"""
        img = self.create_test_image(width=100, height=100)
        output_path = os.path.join(self.temp_dir, 'test_no_crop.png')
        
        self.cropper.export_pixel_perfect(img, output_path, crop=False)
        
        self.assertTrue(os.path.exists(output_path))
        exported_img = Image.open(output_path)
        self.assertEqual(exported_img.size, (100, 100))

    def test_export_pixel_perfect_with_grid(self):
        """Тест експорту з вирівнюванням до сітки"""
        img = self.create_test_image(width=100, height=100, content_rect=(15, 15, 85, 85))
        output_path = os.path.join(self.temp_dir, 'test_grid.png')
        
        self.cropper.export_pixel_perfect(
            img, 
            output_path, 
            crop=True, 
            use_grid=True, 
            cell_size=16
        )
        
        self.assertTrue(os.path.exists(output_path))
        exported_img = Image.open(output_path)
        width, height = exported_img.size
        self.assertEqual(width % 16, 0)
        self.assertEqual(height % 16, 0)

    def test_crop_image_auto_function(self):
        """Тест функції crop_image_auto"""
        img = self.create_test_image(width=100, height=100)
        input_path = os.path.join(self.temp_dir, 'input.png')
        output_path = os.path.join(self.temp_dir, 'output.png')
        
        img.save(input_path)
        crop_image_auto(input_path, output_path)
        
        self.assertTrue(os.path.exists(output_path))
        exported_img = Image.open(output_path)
        self.assertLess(exported_img.size[0] * exported_img.size[1], 100 * 100)

    def test_crop_image_grid_function(self):
        """Тест функції crop_image_grid"""
        img = self.create_test_image(width=100, height=100)
        input_path = os.path.join(self.temp_dir, 'input_grid.png')
        output_path = os.path.join(self.temp_dir, 'output_grid.png')
        
        img.save(input_path)
        crop_image_grid(input_path, output_path, cell_size=16)
        
        self.assertTrue(os.path.exists(output_path))
        exported_img = Image.open(output_path)
        width, height = exported_img.size
        self.assertEqual(width % 16, 0)
        self.assertEqual(height % 16, 0)

    def test_rgb_to_rgba_conversion(self):
        """Тест конвертування RGB в RGBA"""
        img = Image.new('RGB', (100, 100), (255, 0, 0))
        cropped = self.cropper.crop_image(img)
        
        self.assertEqual(cropped.mode, 'RGBA')

    def test_preserve_pixel_data(self):
        """Тест збереження даних пікселів після обрізання"""
        img = self.create_test_image(width=100, height=100, content_rect=(30, 30, 70, 70))
        cropped = self.cropper.crop_image(img)
        
        expected_width = 70 - 30
        expected_height = 70 - 30
        self.assertEqual(cropped.size, (expected_width, expected_height))


if __name__ == '__main__':
    unittest.main()
