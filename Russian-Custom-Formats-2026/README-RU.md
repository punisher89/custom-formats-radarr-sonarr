# Russian Custom Formats 2026

Универсальный набор Custom Formats для Radarr и Sonarr.

## Включено
- Русский язык по метаданным Servarr и явные RUS/RUSSIAN/RU AUDIO маркеры.
- Сериальные/стриминговые команды: LostFilm, NewStudio, AlexFilm, TVShows, BaibaKo, Jaskier, ColdFilm, HDRezka Studio, ViruseProject, NewComers, RuDub, LE-Production, Novamedia, Ultradox, WestFilm, Dragon Money Studio и другие.
- Студии дубляжа: Red Head Sound, Невафильм, Пифагор, SDI Media, VSI Moscow, Мосфильм и другие.
- Аниме-озвучка: AniLibria, AniDub, AniMaunt, AniLiberty, SHIZA Project и другие.
- Классические и авторские переводы.
- Дубляж, профессиональный MVO/DVO, обычный MVO/DVO, одноголосый.
- HDR, Dolby Vision, HDR10+, TrueHD Atmos, DTS:X, DTS-HD MA.

## Оценки и установка
Оценки находятся в [scores.csv](./scores.csv). Рекомендуемый Minimum Custom Format Score: `10000`.

Импортируйте JSON из папки `Radarr` в Radarr, из `Sonarr` — в Sonarr через `Settings → Custom Formats → Import`. Затем назначьте оценки из CSV в Quality Profile. В Radarr при использовании Language Custom Format поставьте Preferred Language = `Any`.

## 4K
2160p WEB-DL и UHD Blu-ray включаются отдельно в Quality Profile. При необходимости добавьте Remux-2160p.

## Ограничения
Распознавание основано на метаданных и названии релиза. Форматы не анализируют реальную аудиодорожку до загрузки; название студии — подсказка, но не гарантия состава дорожек. Проверяйте первые загрузки через MediaInfo.
