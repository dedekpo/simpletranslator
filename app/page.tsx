"use client";

import { translateAndGetAudio } from "./action/translate";
import {
  AudioIcon,
  CloseIcon,
  DownloadIcon,
  MicrophoneIcon,
  SpeakerIcon,
} from "./lib/icons";
import { Language, languages } from "./lib/languages";
import { useRef, useState } from "react";

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function handleLanguageSelect(language: Language) {
    setSelectedLanguage(language);
  }

  async function startRecording() {
    try {
      // Reset any previous recordings
      setRecordedBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/mp3" });
        setRecordedBlob(audioBlob);

        // Stop all tracks of the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      setIsRecording(true);
      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function handleTranslate() {
    if (!selectedLanguage) {
      alert("Please select a language");
      return;
    }

    let file: File | null = null;

    if (recordedBlob) {
      file = new File([recordedBlob], "recorded-audio.mp3", {
        type: "audio/mp3",
      });
    } else {
      file = inputRef.current?.files?.[0] || null;
    }

    if (!file) {
      alert("Please select or record an audio file");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("File size must be less than 3MB");
      return;
    }

    setIsTranslating(true);
    const formData = new FormData();
    formData.append("audio", file);
    const blob = await translateAndGetAudio(formData, selectedLanguage);
    setIsTranslating(false);

    if (!blob) {
      return;
    }

    setAudioUrl(URL.createObjectURL(blob));
  }

  return (
    <>
      {isTranslating && <Loading />}
      {audioUrl && <Result audioUrl={audioUrl} setAudioUrl={setAudioUrl} />}
      <div className="flex flex-col gap-6 items-center justify-center min-h-screen py-10 max-w-[90%] lg:max-w-xl mx-auto">
        <div className="text-center">
          <h1 className="text-6xl font-bold">Simple Translator</h1>
          <p className="text-gray-500 text-lg mt-1">
            Convert any audio to a specific language
          </p>
        </div>

        <div className="flex flex-col w-full gap-2">
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer h-12 border border-pink-400 active:bg-pink-100 shadow-md flex items-center justify-center gap-2"
            >
              <AudioIcon />
              <span>Select Audio</span>
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`cursor-pointer h-12 border ${
                isRecording ? "border-red-500 bg-red-100" : "border-pink-400"
              } active:bg-pink-100 shadow-md flex items-center justify-center gap-2`}
            >
              <MicrophoneIcon />
              <span>{isRecording ? "Stop Recording" : "Record Audio"}</span>
            </button>
          </div>
          {recordedBlob && (
            <div className="w-full p-2 border border-pink-400/20 flex items-center justify-center">
              <audio
                src={URL.createObjectURL(recordedBlob)}
                controls
                className="w-full"
              />
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="audio/mp3"
            className="hidden"
          />
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          <span>Translate to</span>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto border border-pink-400 p-4 shadow-md">
            {languages.map((language, index) => (
              <button
                key={language.code + index}
                className={`cursor-pointer border border-pink-300 rounded-md px-2 h-[30px] truncate ${
                  selectedLanguage?.code === language.code
                    ? "bg-pink-700 text-white shadow-lg"
                    : ""
                }`}
                onClick={() => handleLanguageSelect(language)}
              >
                {language.flag} {language.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleTranslate}
          disabled={isTranslating || isRecording}
          className="cursor-pointer active:bg-pink-800 w-full h-12 border border-pink-700 shadow-md bg-pink-700 text-white font-bold disabled:opacity-90"
        >
          {isTranslating ? "Translating..." : "Translate"}
        </button>
      </div>
    </>
  );
}

function Result({
  audioUrl,
  setAudioUrl,
}: {
  audioUrl: string;
  setAudioUrl: (audioUrl: string | null) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="animate-fadeIn relative w-full max-w-[90%] lg:max-w-lg py-10 text-center flex flex-col gap-4 items-center justify-center border border-pink-400 p-4 rounded-md bg-white shadow-lg">
        <button
          className="cursor-pointer absolute top-2 right-2"
          onClick={() => setAudioUrl(null)}
        >
          <CloseIcon />
        </button>
        <div className="flex items-center gap-2 font-bold text-2xl mb-4">
          <SpeakerIcon />
          <p>Here&apos;s your result!</p>
        </div>
        <div className="w-full flex items-center justify-center p-4 border border-pink-400/20">
          <audio src={audioUrl} controls />
        </div>
        <button
          className="cursor-pointer active:bg-pink-800 w-full flex items-center gap-2 justify-center h-12 border border-pink-700 shadow-md bg-pink-700 text-white font-bold disabled:opacity-90"
          onClick={() => {
            const a = document.createElement("a");
            a.href = audioUrl;
            a.download = "translated.mp3";
            a.click();
          }}
        >
          <DownloadIcon />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin" />
    </div>
  );
}
