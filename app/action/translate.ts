"use server";

import { jigsaw } from "../lib/jigsaw";
import { Language } from "../lib/languages";

export async function translateAndGetAudio(
  formData: FormData,
  targetLanguage: Language
) {
  try {
    const audioFile = formData.get("audio") as File;

    const uploadResult = await jigsaw.store.upload(audioFile, {
      filename: "audio.mp3",
      overwrite: true,
    });

    if (!uploadResult.url) {
      throw new Error("Failed to upload audio file");
    }

    const speechToTextResponse = await jigsaw.audio.speech_to_text({
      file_store_key: uploadResult.key,
    });

    if (!speechToTextResponse.success) {
      throw new Error("Failed to transcribe audio file");
    }

    const translateResponse = await jigsaw.translate({
      text: speechToTextResponse.text,
      target_language: targetLanguage.code,
    });

    // I get this error here depending on the language
    //     SyntaxError: Unexpected token 'A', "An error o"... is not valid JSON
    //     at JSON.parse (<anonymous>)
    //     at async translateAndGetAudio (app/action/translate.ts:35:30)
    //   33 |     });
    //   34 |
    // > 35 |     const translateResponse = await jigsaw.translate({
    //      |                              ^
    //   36 |       text: speechToTextResponse.text,
    //   37 |       target_language: targetLanguage.code,
    //   38 |     });

    if (!translateResponse.success) {
      throw new Error("Failed to translate audio file");
    }

    const audioResponse = await jigsaw.audio.text_to_speech({
      text: translateResponse.translated_text,
      // @ts-expect-error - SupportedAccents not found in jigsawstack because it's not exported
      accent: targetLanguage.accent,
    });

    if (!audioResponse.blob) {
      throw new Error("Failed to generate audio file");
    }

    const generatedAudioBlob = await audioResponse.blob();

    return generatedAudioBlob;
  } catch (error) {
    console.error(error);
    return null;
  }
}
