# TEST CASES — Dub Priority TEST

Синтетические проверки регулярных выражений и логики, не анализ аудио и не end-to-end запуск приложений.

| № | Название | Ожидаемый результат |
|---:|---|---|
| 1 | `Doctor Dolittle 2 2001 WEB-DL 1080p Dub + AVO + Original Eng + Sub (Rus, Eng)` | 17-й fallback +10000; Dubbing +1000 |
| 2 | `Film 2025 RUS DUB 1080p WEB-DL` | RU fallback + Dubbing |
| 3 | `Film 2025 RUSSIAN AUDIO 1080p WEB-DL` | RU fallback |
| 4 | `Film 2025 French Dub 1080p WEB-DL` | Не проходит RU gate |
| 5 | `Film 2025 German Dub 1080p WEB-DL` / `Film 2025 French + Dub` | Не проходит RU gate |
| 6 | `Film 2025 WEB-DL Sub (Rus, Eng)` | Не проходит: только субтитры |
| 7 | `Star Trek Deep Space Nine S01E01 1080p WEB-DL` | DEEP не считается студией |
| 8 | `Film 2025 ProDyblaj 1080p WEB-DL` | RU gate + Dubbing + Studio Bonus |
| 9 | `Series S01E01 LostFilm 1080p WEB-DL` | RU fallback + voiceover team bonus |
| 10 | `Series S01E01 AniLibria 1080p WEB-DL` | Не проходит только по имени аниме-команды |
| 11 | `Film 2025 WEB-DL 1080p HDR` | Нет UHD HDR bonus |
| 12 | `Film 2025 WEB-DL 2160p HDR` | Есть UHD HDR bonus |

Для строки №1 в Interactive Search ожидается: 17-й fallback +10000, Dubbing +1000; языковой формат не должен совпадать из-за `Sub (Rus, Eng)`, обычный fallback не добавляет вторые +10000.

| 13 | `Film 2025 Movie Dubbing 2160p WEB-DL` | RU fallback + Dubbing + Studio Bonus |
| 14 | `Film 2025 CPI Films 1080p WEB-DL` / `Film 2025 CPIG 1080p WEB-DL` | RU fallback + Dubbing + Studio Bonus |
| 15 | `Film 2025 Flarrow Films 1080p WEB-DL` | RU fallback + Dubbing + Studio Bonus |
| 15a | `Film 2025 Flarrow Films MVO 1080p WEB-DL` | RU fallback + MVO; no Dubbing/Studio Bonus unless explicit `DUB` is also present |
| 16 | `Film 2025 Videofilm Int 1080p WEB-DL` | RU fallback + Dubbing + Studio Bonus |
| 17 | `Film 2025 Дубляж Ист-Вест 1080p WEB-DL` | RU fallback + Dubbing + Studio Bonus; bare `Ист-Вест` is not a match |
| 18 | `Film 2025 Dub (iTunes)` / `Film 2025 Dub + Blu-Ray` / `Film 2025 Dub + Blu-Ray CEE` / `Film 2025 Dub + BD CEE` / `Film 2025 Dub + Kinopoisk HD` | Source Hint +50; known foreign-language DUB is excluded |
| 19 | `Film 2025 Blu-Ray 1080p` / `Film 2025 iTunes` / `Film 2025 Kinopoisk HD` | No RU gate and no Source Hint |

## Проверка сохранения баллов после переименования

| Этап | Имя / метка | Ожидаемое совпадение |
|---|---|---|
| До переименования | Исходный релиз с распознанным Russian language | `RU - Russian Language` +10000 |
| После переименования | Имя содержит `RU - Russian Language` из токена `{[Custom Formats]}` | `RU - Russian Language Archive` +10000 |
| Повторная проверка | То же переименованное имя | Сумма не меняется; архивный CF не добавляет свою метку в имя |

Проверка на реальном файле обязательна: синтетические проверки не заменяют Radarr/Sonarr Parse и повторный импорт.

Duplicate audit: `Мосфильм-Мастер` уже покрывался `Мосфильм(?:[ ._-]?Мастер)?`; `Videofilm Int` явно записан как алиас; `Flarrow Films` не должен одновременно получать бонус дубляжа и голосовой команды.
