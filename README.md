# Simple Translator

A web application that translates audio files from one language to another using the JigsawStack API. Users can upload audio files, select a target language, and receive the translated audio with the ability to play and download it.

## Features

- Upload audio files (MP3 format)
- Select from a wide range of target languages
- Convert speech to text
- Translate text to the selected language
- Convert translated text back to speech
- Play translated audio directly in the browser
- Download translated audio files

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- JigsawStack API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/jigsawstack-search.git
cd jigsawstack-search
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your JigsawStack API key:

```
JIG_KEY=your_jigsawstack_api_key_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Click on "Select Audio" to upload an audio file (must be less than 3MB)
2. Select the target language for translation
3. Click "Translate" to process the audio
4. Once translation is complete, you can play the translated audio directly in the browser
5. Use the "Download" button to save the translated audio file

## Limitations

- Audio files must be less than 3MB
- Currently only supports MP3 format
- Translation accuracy depends on the JigsawStack API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [JigsawStack](https://jigsawstack.com/) for providing the translation API
- All contributors to this project
