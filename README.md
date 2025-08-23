# PianoDB Voicings Web

A web application for browsing and analyzing over 14.7 million piano chord voicings, derived from real musical performances. 

## Features

- **Chords**: Explore *all* 2036 3+ note chords, and their relative frequencies
- **Advanced Search**: Find chords through a virtual keyboard
- **Statistical Analysis**: Filter voicings by frequency, duration, and usage patterns
- **Synonyms**: Convenient links to Forte number, standard musical notation, common names
- **Inversion**: Explore chord inversions and roots
- **Voicings**: For each chord, explore common voicings/realizations

## Tech Stack

- **Frontend**: React, TypeScript, Vite, CSS, VexFlow, React Router DOM
- **Data**: Static CSV files; full data accessible through [huggingface](https://huggingface.co/datasets/conjuncts/voicings-rel)

## Getting Started

### Installation

```bash
git clone https://github.com/pianodb/voicings-web.git
cd voicings-web
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

## Data Sources

The analysis is based on the [Aria-MIDI dataset (2025)](https://arxiv.org/abs/2504.15071), containing over one million MIDI files across multiple genres with a focus on classical piano repertoire.

**Datasets available on HuggingFace**:
- [conjuncts/voicings-rel](https://huggingface.co/datasets/conjuncts/voicings-rel)
- [conjuncts/voicings](https://huggingface.co/datasets/conjuncts/voicings)

## License

- Data released under [CC BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en)
- Code released under [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For bugs and feature requests, please open an issue on GitHub.

## Contact

- **Email**: contact@pianodb.org
- **Discord**: [Join our server](https://discord.gg/9BvE4khkqY)
- **GitHub**: [Report issues](https://github.com/pianodb/voicings-web)

## Acknowledgments

- Louis Bradshaw and Simon Colton for Aria-MIDI dataset
- [VexFlow](https://github.com/0xfe/vexflow) for music notation rendering
- Wikipedia for data on [set classes](https://en.wikipedia.org/wiki/List_of_set_classes)
- All musicians who contributed recordings for analysis

