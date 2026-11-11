# Автосервис

Учебный сайт автосервиса. В разделе «Запись» можно выбрать услугу, сохранить заявку, посмотреть её после перезагрузки и удалить.

[Открыть сайт](https://ovodukolga-spec.github.io/avtoservis/) · [Открыть запись](https://ovodukolga-spec.github.io/avtoservis/booking.html) · [Документация проекта](docs/project.md)

## Локальный запуск

1. Клонируйте репозиторий или скачайте ZIP из меню **Code** на GitHub.
2. При установленном Python выполните команду в папке с `index.html`.

   ```sh
   python -m http.server 8000 --bind 127.0.0.1
   ```

3. Откройте страницу и выберите «Запись». [Локальный сайт](http://127.0.0.1:8000/)

## Хранение данных

Сайт работает на HTML, CSS и JavaScript. GitHub Actions публикует сайт на GitHub Pages после обновления ветки `main`. IndexedDB хранит справочник услуг и заявки в профиле браузера. Используйте вымышленные данные для демонстрации.

Исходный шаблон AutoRepair предоставлен Colorlib по лицензии CC BY 3.0. [Colorlib](https://colorlib.com/) · [Лицензия CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)
