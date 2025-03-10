module.exports = (lang) => {
  const focus = lang?.toLowerCase() || "en";
  const result = language.filter((l) => {
    l.name.toLowerCase().include(focus) || l.value === focus;
  });
  return result;
};

const language = [
  {
    name: "Afrikaans",
    value: "af",
  },
  {
    name: "Albanian",
    value: "sq",
  },
  {
    name: "Amharic",
    value: "am",
  },
  {
    name: "Arabic",
    value: "ar",
  },
  {
    name: "Armenian",
    value: "hy",
  },
  {
    name: "Azerbaijani",
    value: "az",
  },
  {
    name: "Basque",
    value: "eu",
  },
  {
    name: "Belarusian",
    value: "be",
  },
  {
    name: "Bengali",
    value: "bn",
  },
  {
    name: "Bosnian",
    value: "bs",
  },
  {
    name: "Bulgarian",
    value: "bg",
  },
  {
    name: "Catalan",
    value: "ca",
  },
  {
    name: "Cebuano",
    value: "ceb",
  },
  {
    name: "Chichewa",
    value: "ny",
  },
  {
    name: "Chinese Simplified",
    value: "zh-cn",
  },
  {
    name: "Chinese Traditional",
    value: "zh-tw",
  },
  {
    name: "Corsican",
    value: "co",
  },
  {
    name: "Croatian",
    value: "hr",
  },
  {
    name: "Czech",
    value: "cs",
  },
  {
    name: "Danish",
    value: "da",
  },
  {
    name: "Dutch",
    value: "nl",
  },
  {
    name: "English",
    value: "en",
  },
  {
    name: "Esperanto",
    value: "eo",
  },
  {
    name: "Estonian",
    value: "et",
  },
  {
    name: "Filipino",
    value: "tl",
  },
  {
    name: "Finnish",
    value: "fi",
  },
  {
    name: "French",
    value: "fr",
  },
  {
    name: "Frisian",
    value: "fy",
  },
  {
    name: "Galician",
    value: "gl",
  },
  {
    name: "Georgian",
    value: "ka",
  },
  {
    name: "German",
    value: "de",
  },
  {
    name: "Greek",
    value: "el",
  },
  {
    name: "Gujarati",
    value: "gu",
  },
  {
    name: "Haitian Creole",
    value: "ht",
  },
  {
    name: "Hausa",
    value: "ha",
  },
  {
    name: "Hawaiian",
    value: "haw",
  },
  {
    name: "Hebrew",
    value: "iw",
  },
  {
    name: "Hindi",
    value: "hi",
  },
  {
    name: "Hmong",
    value: "hmn",
  },
  {
    name: "Hungarian",
    value: "hu",
  },
  {
    name: "Icelandic",
    value: "is",
  },
  {
    name: "Igbo",
    value: "ig",
  },
  {
    name: "Indonesian",
    value: "id",
  },
  {
    name: "Irish",
    value: "ga",
  },
  {
    name: "Italian",
    value: "it",
  },
  {
    name: "Japanese",
    value: "ja",
  },
  {
    name: "Javanese",
    value: "jw",
  },
  {
    name: "Kannada",
    value: "kn",
  },
  {
    name: "Kazakh",
    value: "kk",
  },
  {
    name: "Khmer",
    value: "km",
  },
  {
    name: "Korean",
    value: "ko",
  },
  {
    name: "Kurdish (Kurmanji)",
    value: "ku",
  },
  {
    name: "Kyrgyz",
    value: "ky",
  },
  {
    name: "Lao",
    value: "lo",
  },
  {
    name: "Latin",
    value: "la",
  },
  {
    name: "Latvian",
    value: "lv",
  },
  {
    name: "Lithuanian",
    value: "lt",
  },
  {
    name: "Luxembourgish",
    value: "lb",
  },
  {
    name: "Macedonian",
    value: "mk",
  },
  {
    name: "Malagasy",
    value: "mg",
  },
  {
    name: "Malay",
    value: "ms",
  },
  {
    name: "Malayalam",
    value: "ml",
  },
  {
    name: "Maltese",
    value: "mt",
  },
  {
    name: "Maori",
    value: "mi",
  },
  {
    name: "Marathi",
    value: "mr",
  },
  {
    name: "Mongolian",
    value: "mn",
  },
  {
    name: "Myanmar (Burmese)",
    value: "my",
  },
  {
    name: "Nepali",
    value: "ne",
  },
  {
    name: "Norwegian",
    value: "no",
  },
  {
    name: "Pashto",
    value: "ps",
  },
  {
    name: "Persian",
    value: "fa",
  },
  {
    name: "Polish",
    value: "pl",
  },
  {
    name: "Portuguese",
    value: "pt",
  },
  {
    name: "Punjabi",
    value: "ma",
  },
  {
    name: "Romanian",
    value: "ro",
  },
  {
    name: "Russian",
    value: "ru",
  },
  {
    name: "Samoan",
    value: "sm",
  },
  {
    name: "Scots Gaelic",
    value: "gd",
  },
  {
    name: "Serbian",
    value: "sr",
  },
  {
    name: "Sesotho",
    value: "st",
  },
  {
    name: "Shona",
    value: "sn",
  },
  {
    name: "Sindhi",
    value: "sd",
  },
  {
    name: "Sinhala",
    value: "si",
  },
  {
    name: "Slovak",
    value: "sk",
  },
  {
    name: "Slovenian",
    value: "sl",
  },
  {
    name: "Somali",
    value: "so",
  },
  {
    name: "Spanish",
    value: "es",
  },
  {
    name: "Sundanese",
    value: "su",
  },
  {
    name: "Swahili",
    value: "sw",
  },
  {
    name: "Swedish",
    value: "sv",
  },
  {
    name: "Tajik",
    value: "tg",
  },
  {
    name: "Tamil",
    value: "ta",
  },
  {
    name: "Telugu",
    value: "te",
  },
  {
    name: "Thai",
    value: "th",
  },
  {
    name: "Turkish",
    value: "tr",
  },
  {
    name: "Ukrainian",
    value: "uk",
  },
  {
    name: "Urdu",
    value: "ur",
  },
  {
    name: "Uzbek",
    value: "uz",
  },
  {
    name: "Vietnamese",
    value: "vi",
  },
  {
    name: "Welsh",
    value: "cy",
  },
  {
    name: "Xhosa",
    value: "xh",
  },
  {
    name: "Yiddish",
    value: "yi",
  },
  {
    name: "Yoruba",
    value: "yo",
  },
  {
    name: "Zulu",
    value: "zu",
  },
];
