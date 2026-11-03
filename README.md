# Russian Custom Formats for Radarr & Sonarr

Два отдельных набора Custom Formats с поддержкой русской озвучки и 4K/UHD.

## Russian Custom Formats 2026
Полный универсальный набор: русский язык, маркеры релизов, студии сериалов и дубляжа (включая MovieDalen, The Kitchen Russia, CineLab SoundMix и ПроДубляж), аниме, классические переводы, HDR, Dolby Vision, HDR10+, Atmos и DTS.

- [Инструкция](./Russian-Custom-Formats-2026/README-RU.md)
- [Оценки](./Russian-Custom-Formats-2026/scores.csv)
- [Radarr JSON](./Russian-Custom-Formats-2026/Radarr/)
- [Sonarr JSON](./Russian-Custom-Formats-2026/Sonarr/)

## Russian Custom Formats — Dub Priority
Альтернативный набор без аниме, включающий MovieDalen, The Kitchen Russia, CineLab SoundMix и ПроДубляж, с приоритетом: дубляж → профессиональный MVO → профессиональный DVO → обычный MVO → обычный DVO → одноголосый/авторский перевод.

- [Инструкция](./Russian-Custom-Formats-Dub-Priority/README-RU.md)
- [Оценки](./Russian-Custom-Formats-Dub-Priority/scores.csv)
- [Radarr JSON](./Russian-Custom-Formats-Dub-Priority/Radarr/)
- [Sonarr JSON](./Russian-Custom-Formats-Dub-Priority/Sonarr/)

**Импортируйте только один набор в каждое приложение.** Оба набора — альтернативы, одновременный импорт может складывать дублирующиеся оценки.

## Примечание по Bravo Records
Bravo Records намеренно не включён в русские дубляжные маркеры: официальный сайт описывает работу Bravo Dubbing по дубляжу иностранных фильмов на грузинский язык.

## Установка и 4K
Radarr/Sonarr: `Settings → Custom Formats → Import`, затем назначьте оценки из CSV в Quality Profile. 2160p включается отдельно в Quality Profile (например, WEB-DL 2160p и UHD Blu-ray 2160p).

В актуальных исходниках Servarr Language ID русского языка — `11`:
- [Radarr Language.cs](https://github.com/Radarr/Radarr/blob/develop/src/NzbDrone.Core/Languages/Language.cs)
- [Sonarr Language.cs](https://github.com/Sonarr/Sonarr/blob/develop/src/NzbDrone.Core/Languages/Language.cs)
