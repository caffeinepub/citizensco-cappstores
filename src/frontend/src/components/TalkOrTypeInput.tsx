import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TalkOrTypeInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export default function TalkOrTypeInput({
  onSubmit,
  placeholder = "Type or speak your message...",
}: TalkOrTypeInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Failed to recognize speech");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleVoiceInput}
        disabled={isListening}
        className={isListening ? "animate-pulse" : ""}
      >
        <Mic className={`h-4 w-4 ${isListening ? "text-red-500" : ""}`} />
      </Button>
      <Button onClick={handleSubmit} disabled={!input.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
