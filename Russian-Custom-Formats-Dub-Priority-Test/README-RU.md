# Russian Custom Formats — Dub Priority TEST

**Отдельная тестовая версия. Основная папка `Russian-Custom-Formats-Dub-Priority` не изменена.**

Цель — исправить ложные совпадения и сохранить поддержку заголовка RuTracker вида `Dub + AVO + Original Eng + Sub (Rus, Eng)`.

## Что изменено

1. `RU - Russian Language` требует Language=Russian и исключает явные подписи `Sub (Rus, Eng)`, `Rus Sub`, `Russian Subtitles`.
2. Обычный fallback работает, если язык не распознан как Russian, но есть русский аудиомаркер, известная русская студия или отдельное слово `DUB`. Самостоятельный `RUS` не считается аудио.
3. Новый 17-й формат обрабатывает `Dub + AVO + Original Eng + Sub (Rus, Eng)`: требует DUB или известную русскую студию вместе с русским субтитровым тегом; AVO как условие не используется.
4. Известные подписи French Dub, German Dub, Spanish Dub, Italian Dub и ряд других блокируются в русском fallback. Список иностранных языков не исчерпывающий.
5. Самостоятельный `DEEP` удалён; оставлены только `Studio DEEP` / `DEEP Studio`, чтобы не совпадать с `Deep Space Nine`.
6. Аниме-команды удалены из студийного fallback. Если язык действительно распознан как Russian, языковой формат всё ещё может принять релиз; отдельного аниме-бонуса нет.
7. Убраны неоднозначные короткие алиасы bare `RHS` и `Nota`. Сохранены MovieDalen, ProDyblaj, CineLab SoundMix, The Kitchen Russia и другие более точные названия.
8. HDR, Dolby Vision и HDR10+ получают UHD-бонусы только при наличии `2160p` в названии.

## Компромисс одиночного DUB

Отдельное слово `DUB` сохранено по твоей просьбе для RuTracker. Явные French/German/Spanish Dub блокируются, но неизвестный язык рядом с DUB всё ещё может пройти. Надёжнее всего `RUS DUB`, `DUB RUS`, `RUSSIAN AUDIO` или имя известной российской студии.

## Оценки

Используй [scores.csv](./scores.csv):
- Minimum Custom Format Score: `10000`
- Upgrade Until Custom Format Score: `11000`
- Allow Upgrades: включено
- Radarr Preferred Language: `Any`

Три русских проходных формата задуманы как альтернативные пути: распознанный язык, обычный fallback и отдельный subtitle-parser bypass.

## Импорт

- Radarr: JSON из `Radarr/`
- Sonarr: JSON из `Sonarr/`
- Баллы: [scores.csv](./scores.csv)

**Не импортируй тестовый и основной наборы одновременно в один профиль.** Создай отдельный тестовый профиль или используй отдельный экземпляр. Основной каталог не удаляй.

## Ограничения

Custom Formats не прослушивают аудиодорожки и не читают полный текст темы RuTracker. Они анализируют название релиза и данные индексера. После загрузки дорожки проверяй MediaInfo.

Сценарии тестирования: [TEST-CASES.md](./TEST-CASES.md).
