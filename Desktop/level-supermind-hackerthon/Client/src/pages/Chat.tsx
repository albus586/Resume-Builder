import axios from "axios";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true); // Start loading

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/run`,
        {
          params: { query: input },
        }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response || "Sorry, I couldn't understand that.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      const botErrorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "Sorry, there was an error processing your request.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  const formatMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <p key={index} className="text-sm">
        {line}
      </p>
    ));
  };
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Chat Assistant</h1>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {message.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">
                  {" "}
                  {formatMessageContent(message.content)}
                </p>
                <span className="block mt-1 text-xs opacity-50">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg p-3 max-w-[80%] bg-muted">
                <p className="text-sm">Bot typing...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="dark:bg-gray-600 dark:text-white font-bold p-4 w-[100px]"
            disabled={isLoading}
          >
            SEND
          </Button>
        </form>
      </div>
    </div>
  );
}
