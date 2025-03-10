import React, {
  useState,
  useContext,
  createContext,
  useCallback,
  useEffect,
} from "react";
import { useBoardStore } from "../store/board-store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  content: string;
  timestamp: number;
}

interface ChatContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

interface BoardContext {
  dashboardName: string;
  columns: {
    id: string;
    title: string;
    tasks: {
      id: string;
      title: string;
      description: string;
      date?: string;
      labels: string[];
      checklist: {
        total: number;
        completed: number;
      };
      createdAt: number;
    }[];
  }[];
  stats: {
    totalTasks: number;
    tasksPerColumn: Record<string, number>;
    completedTasks: number;
    upcomingDeadlines: {
      task: string;
      date: string;
    }[];
  };
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

function generateBoardContext(): BoardContext {
  const { boards, selectedDashboard, dashboardNames } =
    useBoardStore.getState();

  const currentBoard = boards[selectedDashboard];
  const dashboardName = dashboardNames[selectedDashboard];

  const columns = currentBoard.columns.map((column) => {
    const columnTasks = currentBoard.tasks
      .filter((task) => task.columnId === column.id)
      .map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        date: task.date,
        labels: task.labels,
        checklist: {
          total: task.checklist.length,
          completed: task.checklist.filter((item) => item.completed).length,
        },
        createdAt: task.createdAt,
      }));

    return {
      id: column.id,
      title: column.title,
      tasks: columnTasks,
    };
  });

  const totalTasks = currentBoard.tasks.length;
  const tasksPerColumn = columns.reduce(
    (acc, col) => {
      acc[col.title] = col.tasks.length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const completedTasks =
    columns.find((col) => col.title.toLowerCase().includes("completado"))?.tasks
      .length || 0;

  const upcomingDeadlines = currentBoard.tasks
    .filter((task) => task.date && new Date(task.date) > new Date())
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 5)
    .map((task) => ({
      task: task.title,
      date: task.date!,
    }));

  return {
    dashboardName,
    columns,
    stats: {
      totalTasks,
      tasksPerColumn,
      completedTasks,
      upcomingDeadlines,
    },
  };
}

export function FloatingChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sendMessage = useCallback(
    async (message: string) => {
      setIsLoading(true);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "user",
        content: message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        const boardContext = generateBoardContext();

        const prompt = {
          context: boardContext,
          userMessage: message,
          previousMessages: messages.slice(-5),
        };

        const response = await fetch(
          "https://api.llama-api.com/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer 5cfd1923-0c68-4b7f-be86-ecf748c708c4",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "system",
                  content:
                    "Usted es un asistente útil que puede acceder a las tareas del usuario y comprenderlas, y proporcionarle información y sugerencias pertinentes, debes hablar SIEMPRE en español, te llamas Reb y respondes a ese nombre y debes ser directo y responder con la personalidad de Alfred de batman.",
                },
                {
                  role: "assistant",
                  content: JSON.stringify(prompt),
                },
                {
                  role: "user",
                  content: message,
                },
              ],
              model: "llama3-8b",
              stream: false,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Error en la respuesta de la API");
        }

        const data = await response.json();

        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: "ai",
          content: data.choices[0].message.content,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error al procesar mensaje:", error);

        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          sender: "ai",
          content: `Lo siento, no pude entender tu pregunta.`,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages],
  );

  return (
    <ChatContext.Provider
      value={{ open, setOpen, messages, sendMessage, isLoading }}
    >
      {children}
      <div
        className={`fixed z-50 ${isMobile ? "inset-0" : "bottom-4 right-4"}`}
      >
        {open ? (
          <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col border dark:border-gray-700
            ${isMobile ? "h-full w-full" : "w-96 h-[32rem]"}`}
          >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">
                Asistente del Tablero
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white ml-4"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-4"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {msg.content}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === "user"
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            <form
              className="p-4 border-t dark:border-gray-700"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.elements.namedItem(
                  "message",
                ) as HTMLInputElement;
                if (input.value.trim()) {
                  sendMessage(input.value.trim());
                  input.value = "";
                }
              }}
            >
              <div className="flex gap-2">
                <Input
                  name="message"
                  placeholder="Escribe tu mensaje..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  Enviar
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className={`shadow-lg ${isMobile ? "fixed bottom-4 right-4 w-12 h-12" : "w-12 h-12"} rounded-full`}
            onClick={() => setOpen(true)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </Button>
        )}
      </div>
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat debe usarse dentro de FloatingChatProvider");
  }
  return context;
};
