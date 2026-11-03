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
